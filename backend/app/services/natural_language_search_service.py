import re
import json
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from pydantic import BaseModel, Field
from openai import OpenAI
from app.core.config import settings
from app.schemas.post import PostType, FieldType, LevelType

# System prompt cho LLM
SYSTEM_PROMPT = """Bạn là bộ phân tích truy vấn tìm kiếm kèo bóng đá trong ứng dụng Football Connect.
Nhiệm vụ của bạn là nhận câu hỏi bằng tiếng Việt, trích xuất ý định (intent) và các bộ lọc tìm kiếm (filters).
Chỉ trích xuất intent và bộ lọc.
Không tạo bài đăng. Không tạo SQL. Không trả lời ngoài phạm vi.
Chỉ trả JSON hợp lệ theo schema.
Nếu câu hỏi không liên quan đến bóng đá hoặc hệ thống, đặt intent là "out_of_scope".

CÁC Ý ĐỊNH (INTENT) HỢP LỆ:
- search_posts: Tìm kiếm kèo/bài đăng mới
- refine_search: Lọc thêm điều kiện từ kết quả trước
- show_more: Yêu cầu xem thêm kết quả
- reset_search: Xóa điều kiện, tìm lại từ đầu
- help: Hỏi cách sử dụng
- out_of_scope: Câu hỏi không liên quan

CÁC BỘ LỌC (FILTERS):
- area: Tên khu vực (VD: Cầu Giấy, Hà Đông...)
- field_type: Chỉ chấp nhận "5", "7", hoặc "11"
- required_level: Chỉ chấp nhận "beginner" (mới chơi), "average" (trung bình), "good" (khá), "advanced" (nâng cao)
- post_type: Chỉ chấp nhận "find_opponent", "find_player", "pass_field", "find_field"
- match_from / match_to: ISO8601 string có múi giờ (VD: 2026-06-23T17:00:00+07:00). Sử dụng múi giờ +07:00 (Asia/Ho_Chi_Minh). Quy ước: sáng (06:00-11:59), chiều (12:00-17:59), tối (18:00-23:59).
- max_cost: Giá tiền tối đa (VND) (VD: 100k -> 100000)
- keyword: Từ khóa khác (tên sân, nội dung)

Dựa vào 'current_time' (thời gian hiện tại) do user cung cấp ở prompt để tính toán ngày giờ tương đối (hôm nay, ngày mai).
"""

class ExtractedQuery(BaseModel):
    intent: str = Field(description="Ý định của người dùng")
    area: str | None = Field(None, description="Khu vực")
    field_type: str | None = Field(None, description="Loại sân (5, 7, 11)")
    required_level: str | None = Field(None, description="Trình độ: beginner, average, good, advanced")
    post_type: str | None = Field(None, description="Loại bài đăng: find_opponent, find_player, pass_field, find_field")
    match_from: str | None = Field(None, description="Thời gian bắt đầu (ISO8601 +07:00)")
    match_to: str | None = Field(None, description="Thời gian kết thúc (ISO8601 +07:00)")
    max_cost: float | None = Field(None, description="Giá tối đa (VND)")
    keyword: str | None = Field(None, description="Từ khóa khác")

class NaturalLanguageSearchService:
    def __init__(self):
        self.enabled = settings.ASSISTANT_ENABLED and bool(settings.ASSISTANT_API_KEY)
        if self.enabled:
            kwargs = {
                "api_key": settings.ASSISTANT_API_KEY,
                "timeout": 3.0,
                "max_retries": 0
            }
            if settings.ASSISTANT_BASE_URL:
                kwargs["base_url"] = settings.ASSISTANT_BASE_URL
            self.client = OpenAI(**kwargs)
        else:
            self.client = None

    def parse_query(self, message: str) -> dict:
        """Parse natural language query into intent and filters"""
        if self.enabled:
            try:
                return self._parse_with_llm(message)
            except Exception as e:
                print(f"LLM parse failed, falling back to regex: {e}")
                return self._parse_with_fallback(message)
        return self._parse_with_fallback(message)

    def _parse_with_llm(self, message: str) -> dict:
        now = datetime.now(ZoneInfo("Asia/Ho_Chi_Minh"))
        current_time_str = now.isoformat()
        
        user_prompt = f"[current_time: {current_time_str}]\n{message}"
        
        response = self.client.beta.chat.completions.parse(
            model=settings.ASSISTANT_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            response_format=ExtractedQuery,
            temperature=0.0
        )
        
        extracted = response.choices[0].message.parsed
        return self._format_extracted(extracted)

    def _parse_with_fallback(self, message: str) -> dict:
        """Fallback parser bằng Regex cơ bản"""
        msg_lower = message.lower()
        now = datetime.now(ZoneInfo("Asia/Ho_Chi_Minh"))
        
        # Check prompt injection and out of scope first
        injection_keywords = ["email", "mật khẩu", "user", "người dùng", "system prompt", "api key", "xóa", "sql", "thời tiết", "thơ", "tổng thống"]
        for kw in injection_keywords:
            if kw in msg_lower:
                return {
                    "intent": "out_of_scope",
                    "parser_source": "fallback",
                    "filters": {}
                }

        intent = "search_posts"
        if "thêm" in msg_lower and "hiển thị" in msg_lower:
            intent = "show_more"
        elif "từ đầu" in msg_lower or "tìm lại" in msg_lower or "xóa điều kiện" in msg_lower:
            intent = "reset_search"
        elif any(kw in msg_lower for kw in ["tìm kèo", "tìm sân", "tìm đối thủ", "tìm người", "tìm thủ môn", "có kèo nào", "kèo sân 7", "kèo ở", "giúp tôi tìm", "tìm giúp tôi", "muốn tìm"]):
            intent = "search_posts"
        elif "tìm" not in msg_lower and "kiếm" not in msg_lower and "ở " not in msg_lower and "tại " not in msg_lower:
            if any(kw in msg_lower for kw in ["hỏi gì", "hỏi những gì", "giúp gì", "hướng dẫn", "hỗ trợ chức năng", "giúp đỡ", "có thể giúp"]):
                intent = "help"
            else:
                intent = "refine_search"
        elif any(kw in msg_lower for kw in ["hỏi gì", "hỏi những gì", "giúp gì", "hướng dẫn", "có thể giúp"]):
            intent = "help"
        
        filters = {}
        
        # Field type
        if "sân 5" in msg_lower: filters["field_type"] = "5"
        elif "sân 7" in msg_lower: filters["field_type"] = "7"
        elif "sân 11" in msg_lower: filters["field_type"] = "11"
            
        # Required level
        if "mới chơi" in msg_lower or "gà" in msg_lower: filters["required_level"] = "beginner"
        elif "trung bình" in msg_lower: filters["required_level"] = "average"
        elif "khá" in msg_lower or "biết đá" in msg_lower: filters["required_level"] = "good"
        elif "nâng cao" in msg_lower or "giỏi" in msg_lower: filters["required_level"] = "advanced"
            
        # Post type
        if "thủ môn" in msg_lower or "người" in msg_lower or "cầu thủ" in msg_lower or "thành viên" in msg_lower: filters["post_type"] = "find_player"
        elif "đối thủ" in msg_lower or "giao lưu" in msg_lower: filters["post_type"] = "find_opponent"
        elif "pass sân" in msg_lower or "nhượng sân" in msg_lower: filters["post_type"] = "pass_field"
        elif "tìm sân" in msg_lower or "cần sân" in msg_lower: filters["post_type"] = "find_field"
            
        # Area (Simple matching)
        areas = ["cầu giấy", "hà đông", "thanh xuân", "đống đa", "hai bà trưng", "hoàn kiếm", "ba đình", "tây hồ", "hoàng mai", "long biên", "nam từ liêm", "bắc từ liêm"]
        for a in areas:
            if a in msg_lower:
                filters["area"] = a.title()
                break
                
        # Time parsing
        target_date = now.date()
        if "ngày mai" in msg_lower or "tối mai" in msg_lower or "sáng mai" in msg_lower or "chiều mai" in msg_lower:
            target_date = target_date + timedelta(days=1)
            
        if "sáng" in msg_lower:
            filters["match_from"] = datetime.combine(target_date, datetime.strptime("06:00:00", "%H:%M:%S").time(), tzinfo=ZoneInfo("Asia/Ho_Chi_Minh"))
            filters["match_to"] = datetime.combine(target_date, datetime.strptime("11:59:59", "%H:%M:%S").time(), tzinfo=ZoneInfo("Asia/Ho_Chi_Minh"))
        elif "chiều" in msg_lower:
            filters["match_from"] = datetime.combine(target_date, datetime.strptime("12:00:00", "%H:%M:%S").time(), tzinfo=ZoneInfo("Asia/Ho_Chi_Minh"))
            filters["match_to"] = datetime.combine(target_date, datetime.strptime("17:59:59", "%H:%M:%S").time(), tzinfo=ZoneInfo("Asia/Ho_Chi_Minh"))
        elif "tối" in msg_lower:
            filters["match_from"] = datetime.combine(target_date, datetime.strptime("18:00:00", "%H:%M:%S").time(), tzinfo=ZoneInfo("Asia/Ho_Chi_Minh"))
            filters["match_to"] = datetime.combine(target_date, datetime.strptime("23:59:59", "%H:%M:%S").time(), tzinfo=ZoneInfo("Asia/Ho_Chi_Minh"))
        elif "hôm nay" in msg_lower or "ngày mai" in msg_lower:
            filters["match_from"] = datetime.combine(target_date, datetime.strptime("00:00:00", "%H:%M:%S").time(), tzinfo=ZoneInfo("Asia/Ho_Chi_Minh"))
            filters["match_to"] = datetime.combine(target_date, datetime.strptime("23:59:59", "%H:%M:%S").time(), tzinfo=ZoneInfo("Asia/Ho_Chi_Minh"))

        # Cost
        cost_match = re.search(r'dưới (\d+)\s*(k|nghìn|ngàn)', msg_lower)
        if cost_match:
            val = int(cost_match.group(1))
            filters["max_cost"] = float(val * 1000)
            
        return {
            "intent": intent,
            "parser_source": "fallback",
            "filters": filters
        }

    def _format_extracted(self, extracted: ExtractedQuery) -> dict:
        filters = {}
        if extracted.area: filters["area"] = extracted.area
        if extracted.field_type: filters["field_type"] = extracted.field_type
        if extracted.required_level: filters["required_level"] = extracted.required_level
        if extracted.post_type: filters["post_type"] = extracted.post_type
        if extracted.max_cost is not None: filters["max_cost"] = extracted.max_cost
        if extracted.keyword: filters["keyword"] = extracted.keyword
        
        try:
            if extracted.match_from:
                filters["match_from"] = datetime.fromisoformat(extracted.match_from)
            if extracted.match_to:
                filters["match_to"] = datetime.fromisoformat(extracted.match_to)
        except Exception:
            pass

        return {
            "intent": extracted.intent,
            "parser_source": "llm",
            "llm_provider": settings.ASSISTANT_PROVIDER,
            "llm_model": settings.ASSISTANT_MODEL,
            "filters": filters
        }
