from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.assistant import AssistantSearchRequest, AssistantSearchResponse, AssistantSearchFilters, AssistantSearchContext
from app.services.natural_language_search_service import NaturalLanguageSearchService
from app.services.post_service import get_feed_posts
from app.ml.post_recommender import PostRecommender

class AssistantService:
    def __init__(self):
        self.nlp_service = NaturalLanguageSearchService()
        self.recommender = PostRecommender()

    def handle_search(self, db: Session, current_user: User, request: AssistantSearchRequest) -> AssistantSearchResponse:
        parsed = self.nlp_service.parse_query(request.message)
        intent = parsed.get("intent", "search_posts")
        new_filters = parsed.get("filters", {})
        parser_source = parsed.get("parser_source", "unknown")
        
        # Parse context
        context = request.conversation_context
        if isinstance(context, dict):
            context = AssistantSearchContext(**context)
        elif not context:
            context = AssistantSearchContext()
            
        if intent == "out_of_scope":
            return AssistantSearchResponse(
                reply="Tôi chỉ hỗ trợ tìm kiếm và gợi ý kèo bóng đá trong Football Connect.",
                intent=intent,
                parser_source=parser_source,
                filters=AssistantSearchFilters(),
                posts=[],
                total=0,
                context=context,
                suggestions=["Tìm kèo sân 7", "Hôm nay có kèo nào không?"]
            )
            
        if intent == "help":
            return AssistantSearchResponse(
                reply="Tôi có thể giúp bạn tìm kiếm kèo bóng đá. Hãy thử nói: 'Tìm sân 7 ở Cầu Giấy tối mai' hoặc 'Có kèo nào giá dưới 100k không?'.",
                intent=intent,
                parser_source=parser_source,
                filters=AssistantSearchFilters(),
                posts=[],
                total=0,
                context=context,
                suggestions=["Tìm kèo sân 7 ở Cầu Giấy", "Chỉ lấy trình độ trung bình"]
            )
            
        if intent == "reset_search":
            new_context = AssistantSearchContext()
            return AssistantSearchResponse(
                reply="Tôi đã xóa các điều kiện tìm kiếm trước đó. Bạn muốn tìm kèo như thế nào?",
                intent=intent,
                parser_source=parser_source,
                filters=AssistantSearchFilters(),
                posts=[],
                total=0,
                context=new_context,
                suggestions=["Tìm kèo hôm nay", "Tìm kèo sân 7", "Kèo dưới 100k"]
            )

        # Merge filters
        final_filters_dict = {}
        if intent in ["refine_search", "show_more"] and context.filters:
            final_filters_dict.update(context.filters.model_dump(exclude_none=True))
        
        # Add new filters, overwriting old ones
        final_filters_dict.update(new_filters)
        filters_obj = AssistantSearchFilters(**final_filters_dict)
        
        # Pagination handling
        if intent == "show_more":
            context.offset += context.limit
        else:
            context.offset = 0
            context.shown_post_ids = []
            
        # Update context
        context.filters = filters_obj
        
        # Query DB using Post Service
        candidate_posts = get_feed_posts(
            db=db,
            skip=0, # We fetch all candidates and paginate manually after filtering
            limit=100,
            keyword=filters_obj.keyword,
            area=filters_obj.area,
            post_type=filters_obj.post_type,
            field_type=filters_obj.field_type,
            required_level=filters_obj.required_level,
            status="open",
            match_from=filters_obj.match_from,
            match_to=filters_obj.match_to
        )
        
        # Filter cost and self-posts manually
        candidate_posts = [p for p in candidate_posts if p.user_id != current_user.id]
        if filters_obj.max_cost is not None:
            candidate_posts = [p for p in candidate_posts if p.cost is None or p.cost <= filters_obj.max_cost]
            
        # Filter out already shown posts for pagination
        candidate_posts = [p for p in candidate_posts if p.id not in context.shown_post_ids]
        
        total_found = len(candidate_posts)
        
        # Rerank using ML Model
        final_posts = candidate_posts
        if len(candidate_posts) > 1:
            try:
                from app.models.post import Post
                db_posts = [db.query(Post).filter(Post.id == p.id).first() for p in candidate_posts]
                self.recommender.fit(db_posts)
                recs = self.recommender.recommend(current_user, db_posts, top_k=context.limit)
                
                reranked_ids = [r['post'].id for r in recs]
                
                post_map = {p.id: p for p in candidate_posts}
                final_posts = [post_map[pid] for pid in reranked_ids]
            except Exception as e:
                print(f"Reranking failed: {e}")
                final_posts = candidate_posts[:context.limit]
        else:
            final_posts = candidate_posts[:context.limit]
            
        # Record shown IDs
        for p in final_posts:
            context.shown_post_ids.append(p.id)
            
        # Formulate reply
        suggestions = []
        if total_found > 0:
            if intent == "show_more":
                reply = f"Đã hiển thị thêm {len(final_posts)} kèo."
            else:
                reply = f"Tôi tìm thấy {total_found} kèo phù hợp với yêu cầu của bạn."
                
            if total_found > len(final_posts):
                if intent != "show_more":
                    reply += " Dưới đây là các kết quả phù hợp nhất."
                suggestions.append("Hiển thị thêm")
            
            if filters_obj.area:
                suggestions.append(f"Mở rộng khu vực")
            if filters_obj.max_cost is not None:
                suggestions.append(f"Bỏ giới hạn giá")
            if filters_obj.field_type:
                suggestions.append(f"Bỏ giới hạn loại sân")
        else:
            reply = "Không còn kèo nào phù hợp với các điều kiện này. Bạn có thể thử điều chỉnh lại điều kiện hoặc tìm lại từ đầu."
            if filters_obj.area: suggestions.append("Mở rộng khu vực")
            if filters_obj.field_type: suggestions.append("Bỏ giới hạn loại sân")
            if filters_obj.required_level: suggestions.append("Bỏ giới hạn trình độ")
            if filters_obj.match_from or filters_obj.match_to: suggestions.append("Mở rộng thời gian")
            if filters_obj.max_cost is not None: suggestions.append("Bỏ giới hạn giá")
            if any(v is not None for v in filters_obj.model_dump().values()):
                suggestions.append("Tìm lại từ đầu")
            
        return AssistantSearchResponse(
            reply=reply,
            intent=intent,
            parser_source=parser_source,
            llm_provider=parsed.get("llm_provider"),
            llm_model=parsed.get("llm_model"),
            filters=filters_obj,
            posts=final_posts,
            total=total_found,
            context=context,
            suggestions=suggestions[:3]
        )
