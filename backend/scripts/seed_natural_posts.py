# -*- coding: utf-8 -*-
import sys, os, random
from datetime import datetime, timedelta, timezone
sys.path.append('d:/DATN/football-connect/backend')
from app.core.config import settings
from sqlalchemy import create_engine, text

engine = create_engine(str(settings.DATABASE_URL))

# Ensure reproducible random for these titles
random.seed(2026)

# Data pools
AREAS = [
    "Cầu Giấy", "Nam Từ Liêm", "Bắc Từ Liêm", "Hà Đông", 
    "Thanh Xuân", "Đống Đa", "Hoàng Mai", "Hai Bà Trưng", 
    "Long Biên", "Tây Hồ", "Ba Đình"
]
HOURS = ["17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"]
LEVELS = ["beginner", "average", "good"]

TITLES_FIND_PLAYER = [
    "Tối nay thiếu 1 thủ môn sân 7", "Kèo thứ 5 thiếu 2 anh em đá vui",
    "Tìm thêm hậu vệ đá sân 7 khu Mỹ Đình", "Đội mình thiếu 1 bạn đá cánh",
    "Kèo cuối tuần cần thêm 3 người", "Thiếu người ghép kèo tối mai",
    "Tìm anh em đá giao lưu sân 5", "Gấp: Cần 2 bạn bọc lót tối nay",
    "Tìm 1 tiền đạo bén đá sân 7", "Đội văn phòng thiếu người tối nay",
    "Tìm người đá cố định thứ 3 hàng tuần", "Kèo mồ hôi cần thêm 2 bạn",
    "Giao hữu dưỡng sinh cần người đá cùng", "Đội Cầu Giấy cần 1 thủ môn",
    "Sân 5 thiếu 1 bạn chạy cánh", "Tuyển anh em đá vui vẻ, không quạu",
    "Cần 2 người chia tiền sân đều", "Kèo sinh viên cần thêm người",
    "Tìm người đá thay vị trí nghỉ đột xuất", "Thiếu người đá vòng bảng"
]
DESC_FIND_PLAYER = [
    "Đội mình đá vui, không nặng thắng thua. Anh em đến đúng giờ giúp mình nhé.",
    "Kèo cố định tối thứ 4, hiện đang thiếu một bạn bắt gôn.",
    "Trình độ trung bình, ưu tiên anh em gần khu vực Cầu Giấy.",
    "Đã có sân và bóng, chia đều tiền sân sau trận.",
    "Đội văn phòng, đá mồ hôi là chính, không đá rắn.",
    "Anh em thân thiện, có trà đá sau trận.",
    "Chi phí khoảng 50k/người, bao nước.",
    "Sân 7 đá 3 đội, cần người thay ra vào.",
    "Ai có giày lên sân luôn nhé, đang thiếu 1.",
    "Đá vui vẻ dưỡng sinh, không cay cú."
]

TITLES_FIND_OPPONENT = [
    "Tìm đối giao hữu tối thứ 6", "Đội sân 7 tìm đối trình độ trung bình",
    "Tìm đội đá giao lưu cuối tuần", "Kèo đã có sân, cần đội đối tác",
    "Tìm đối đá sân 5 khu Hà Đông", "Giao hữu nhẹ nhàng thứ 7",
    "Đội Cầu Giấy tìm đối tác sân 7", "Mời các đội quanh Thanh Xuân giao lưu",
    "Cần đối sân 11 cuối tuần", "Tìm đối tác cố định hàng tuần"
]
DESC_FIND_OPPONENT = [
    "Đội mình đã đủ người, cần tìm đội bạn đá giao hữu.",
    "Trình độ khá, đá fair-play. Sân chia đôi.",
    "Kèo 19h tối nay, đội nào rảnh qua giao lưu.",
    "Đội sinh viên, trình độ trung bình, tìm đối cọ xát.",
    "Chúng tôi đài thọ tiền nước, tiền sân chia 50-50.",
    "Tìm đối tác mềm, đội mình toàn anh em bụng bia.",
    "Sân đẹp, ánh sáng tốt, mời đội bạn đến giao lưu.",
    "Không đá xấu, vui vẻ hòa đồng, giao lưu học hỏi."
]

TITLES_PASS_FIELD = [
    "Pass sân 7 lúc 20h tối nay", "Nhượng lại ca sân 5 tối thứ 4",
    "Đội bận đột xuất cần pass sân", "Pass ca sân 7 khu Mỹ Đình",
    "Nhượng sân tối mai giá gốc", "Pass lại sân giờ vàng",
    "Cần pass sân khu Cầu Giấy", "Sân trống cần người lấy lại",
    "Nhượng ca sân 11 chủ nhật", "Pass sân giá rẻ hơn gốc"
]
DESC_PASS_FIELD = [
    "Đội mình có việc đột xuất nên không đá được, pass lại đúng giá đặt.",
    "Ca 19h30–21h, đã cọc sân. Anh em cần liên hệ giúp mình.",
    "Sân đẹp, có chỗ gửi xe, mình nhượng lại giá gốc.",
    "Giá gốc 600k, pass lại 400k cho đội nào cần.",
    "Liên hệ số điện thoại để lấy sân, không qua trung gian.",
    "Mình đã cọc 300k, anh em lấy sân gửi lại mình tiền cọc là được.",
    "Sân mới làm cỏ, đá rất êm, nhượng lại do đội nghỉ.",
    "Trống sân tối nay, cần nhượng gấp."
]

TITLES_FIND_FIELD = [
    "Tìm sân 7 tối thứ 6", "Cần sân 5 khu Cầu Giấy",
    "Tìm sân đá cuối tuần quanh Hà Đông", "Cần thuê sân 7 khung giờ 19h",
    "Tìm sân giao lưu tối mai", "Cần gấp sân cho tối nay",
    "Đội đang tìm sân dài hạn", "Tìm sân 11 cho chủ nhật",
    "Cần thuê ca tối khu Đống Đa", "Ai pass sân liên hệ mình"
]
DESC_FIND_FIELD = [
    "Mình đang cần tìm sân 7 đá tối thứ 6, quanh khu vực Cầu Giấy hoặc Nam Từ Liêm.",
    "Đội đang cần thuê sân cố định, chủ sân nào có liên hệ.",
    "Cần 1 sân gấp cho tối nay, ai pass sân gọi ngay nhé.",
    "Giá tầm 500k-700k là ô kê. Cần sân có đèn sáng.",
    "Yêu cầu sân cỏ đẹp, bãi xe rộng rãi.",
    "Đội 15 người cần sân 7 khu Hà Đông.",
    "Mình tìm sân gần trung tâm cho tiện đi lại.",
    "Khung giờ 19h hoặc 20h, ai có báo giá mình."
]

def generate_random_date():
    tz = timezone(timedelta(hours=7)) # GMT+7
    now = datetime.now(tz)
    rand = random.random()
    if rand < 0.15:
        # Past (1 to 14 days ago)
        dt = now - timedelta(days=random.randint(1, 14))
    elif rand < 0.30:
        # Today / Tomorrow
        dt = now + timedelta(days=random.randint(0, 1))
    else:
        # Future (2 to 14 days)
        dt = now + timedelta(days=random.randint(2, 14))
    
    hour_str = random.choice(HOURS)
    h, m = map(int, hour_str.split(':'))
    return dt.replace(hour=h, minute=m, second=0, microsecond=0)

with engine.begin() as conn:
    print("Xóa các bài test cũ (ID >= 10)...")
    # Delete related first
    conn.execute(text("DELETE FROM match_participants WHERE post_id >= 10"))
    conn.execute(text("DELETE FROM saved_posts WHERE post_id >= 10"))
    # Delete posts
    res = conn.execute(text("DELETE FROM posts WHERE id >= 10"))
    print(f"Đã xóa {res.rowcount} bài rác.")

    # Get valid users
    users = conn.execute(text("SELECT id, phone FROM users LIMIT 30")).fetchall()
    
    # Update phone for users missing it
    for u in users:
        if not u[1] or len(u[1]) < 10:
            fake_phone = f"09{random.randint(10000000, 99999999)}"
            conn.execute(text("UPDATE users SET phone = :phone WHERE id = :uid"), {"phone": fake_phone, "uid": u[0]})
    
    # Reload users
    users = conn.execute(text("SELECT id, phone FROM users WHERE phone IS NOT NULL AND length(phone)=10 LIMIT 25")).fetchall()
    if not users:
        print("Không có user hợp lệ!")
        sys.exit(1)

    # Get fields
    fields = conn.execute(text("SELECT id, name, area FROM football_fields")).fetchall()

    print("Đang tạo 100 bài đăng tự nhiên...")
    posts_data = []

    # Helper
    def create_post_data(ptype, num, titles_pool, desc_pool):
        for _ in range(num):
            u = random.choice(users)
            user_id = u[0]
            contact_phone = u[1]
            
            title = random.choice(titles_pool)
            description = random.choice(desc_pool)
            
            match_time = generate_random_date()
            status = "open"
            if match_time < datetime.now(timezone(timedelta(hours=7))):
                status = random.choice(["closed", "expired", "full"])

            field_type = random.choices(["5", "7", "11"], weights=[35, 55, 10])[0]
            
            f = random.choice(fields) if ptype != "find_field" or random.random() < 0.5 else None
            field_id = f[0] if f else None
            area = f[2] if f else random.choice(AREAS)
            
            cost = random.choice([0, 50000, 70000, 80000, 100000, 120000, 400000, 500000, 600000, 800000, None])
            
            needed_players = 0
            if ptype == "find_player":
                needed_players = random.choices([1, 2, 3, 4], weights=[50, 30, 15, 5])[0]
            elif ptype == "find_opponent":
                needed_players = 1
                
            required_level = random.choice(LEVELS) if ptype in ["find_player", "find_opponent"] else "average"

            posts_data.append({
                "user_id": user_id,
                "field_id": field_id,
                "title": f"{title} {random.randint(1,1000)}", 
                "post_type": ptype,
                "match_time": match_time,
                "area": area,
                "field_type": field_type,
                "needed_players": needed_players,
                "current_players": 0,
                "required_level": required_level,
                "cost": cost,
                "contact_phone": contact_phone,
                "description": description,
                "status": status,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            })

    create_post_data("find_player", 45, TITLES_FIND_PLAYER, DESC_FIND_PLAYER)
    create_post_data("find_opponent", 20, TITLES_FIND_OPPONENT, DESC_FIND_OPPONENT)
    create_post_data("pass_field", 18, TITLES_PASS_FIELD, DESC_PASS_FIELD)
    create_post_data("find_field", 17, TITLES_FIND_FIELD, DESC_FIND_FIELD)

    random.shuffle(posts_data)

    inserted_post_ids = []
    # Insert posts
    insert_stmt = text('''
        INSERT INTO posts (user_id, field_id, title, post_type, match_time, area, field_type, needed_players, current_players, required_level, cost, contact_phone, description, status, created_at, updated_at)
        VALUES (:user_id, :field_id, :title, :post_type, :match_time, :area, :field_type, :needed_players, :current_players, :required_level, :cost, :contact_phone, :description, :status, :created_at, :updated_at)
        RETURNING id
    ''')
    for p in posts_data:
        p["title"] = p["title"].rsplit(' ', 1)[0] # Remove variance number for cleaner look, actually lets keep it without number but rely on shuffle? No, wait, if I remove variance it could duplicate. Let's keep it clean by removing it but relying on randomness of date and user to distinguish.
        res = conn.execute(insert_stmt, p)
        inserted_post_ids.append(res.fetchone()[0])
        
    print(f"Đã tạo {len(inserted_post_ids)} bài đăng mới.")

    # Create participants
    print("Đang tạo người tham gia ngẫu nhiên...")
    participant_count = 0
    for pid in inserted_post_ids:
        p_row = conn.execute(text("SELECT post_type, user_id, needed_players FROM posts WHERE id = :id"), {"id": pid}).fetchone()
        ptype, owner_id, needed = p_row
        
        if ptype in ["find_player", "find_opponent"]:
            if random.random() < 0.6: # 60% chance to have requests
                req_num = random.randint(1, 3)
                if ptype == "find_opponent": req_num = 1
                
                # pick random users not owner
                candidates = [u[0] for u in users if u[0] != owner_id]
                random.shuffle(candidates)
                selected = candidates[:req_num]
                
                for uid in selected:
                    status_p = random.choice(["pending", "approved", "rejected"])
                    conn.execute(text('''
                        INSERT INTO match_participants (post_id, user_id, status, created_at)
                        VALUES (:post_id, :user_id, :status, :created_at)
                    '''), {
                        "post_id": pid,
                        "user_id": uid,
                        "status": status_p,
                        "created_at": datetime.now(timezone.utc)
                    })
                    participant_count += 1
                    
    print(f"Đã tạo {participant_count} request tham gia.")
    
    # Create saved posts
    print("Đang tạo dữ liệu lưu bài...")
    saved_count = 0
    for u in users:
        uid = u[0]
        # user saves 1 to 5 random posts
        num_saves = random.randint(1, 5)
        saved_pids = random.sample(inserted_post_ids, num_saves)
        for sp in saved_pids:
            conn.execute(text('''
                INSERT INTO saved_posts (user_id, post_id, created_at)
                VALUES (:user_id, :post_id, :created_at) ON CONFLICT DO NOTHING
            '''), {
                "user_id": uid,
                "post_id": sp,
                "created_at": datetime.now(timezone.utc)
            })
            saved_count += 1
            
    print(f"Đã tạo {saved_count} lượt lưu bài.")
    print("Giao dịch thành công!")
