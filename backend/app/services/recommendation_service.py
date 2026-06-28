from sqlalchemy.orm import Session, joinedload
from app.models.post import Post
from app.models.user import User
from app.models.match_participant import MatchParticipant
from app.ml.post_recommender import PostRecommender
from datetime import datetime, timezone

class RecommendationService:
    def __init__(self):
        # Cache nhẹ nếu cần, nhưng với đồ án nhỏ có thể tạo mới mỗi lần
        self.recommender = PostRecommender()

    def get_recommended_posts(self, db: Session, current_user: User, limit: int = 10):
        # Lấy tất cả bài đang open và chưa diễn ra
        now = datetime.now(timezone.utc)
        open_posts = db.query(Post).options(joinedload(Post.user)).filter(
            Post.status == "open",
            Post.match_time > now
        ).all()
        
        # Loại bỏ các bài của chính user
        filtered_posts = [p for p in open_posts if p.user_id != current_user.id]
        
        # Lấy danh sách post user đã tham gia (hoặc bị reject) để loại bỏ
        participants = db.query(MatchParticipant).filter(
            MatchParticipant.user_id == current_user.id
        ).all()
        participated_post_ids = {p.post_id for p in participants}
        
        filtered_posts = [p for p in filtered_posts if p.id not in participated_post_ids]
        
        # Nếu ít bài quá thì không cần ml filter
        if len(filtered_posts) == 0:
            return []
            
        # Fit model
        self.recommender.fit(filtered_posts)
        
        # Recommend
        recommendations = self.recommender.recommend(current_user, filtered_posts, top_k=limit)
        
        return recommendations

recommendation_service = RecommendationService()
