from sqlalchemy.orm import Session

from app.models.match_participant import MatchParticipant
from app.models.post import Post


def get_my_schedule(
    db: Session,
    user_id: int,
):
    schedule_items = []

    # Các bài/trận do chính user tạo
    my_created_posts = (
        db.query(Post)
        .filter(Post.user_id == user_id)
        .order_by(Post.match_time.asc())
        .all()
    )

    added_post_ids = set()

    for post in my_created_posts:
        added_post_ids.add(post.id)
        schedule_items.append(
            {
                "post_id": post.id,
                "title": post.title,
                "post_type": post.post_type,
                "match_time": post.match_time,
                "area": post.area,
                "field_type": post.field_type,
                "required_level": post.required_level,
                "cost": post.cost,
                "post_status": post.status,
                "role_in_match": "owner",
                "participation_status": None,
            }
        )

    # Các bài/trận user đã tham gia
    my_participations = (
        db.query(MatchParticipant, Post)
        .join(Post, MatchParticipant.post_id == Post.id)
        .filter(MatchParticipant.user_id == user_id)
        .filter(MatchParticipant.status.in_(["pending", "approved"]))
        .order_by(Post.match_time.asc())
        .all()
    )

    for participant, post in my_participations:
        if post.id in added_post_ids:
            continue
            
        schedule_items.append(
            {
                "post_id": post.id,
                "title": post.title,
                "post_type": post.post_type,
                "match_time": post.match_time,
                "area": post.area,
                "field_type": post.field_type,
                "required_level": post.required_level,
                "cost": post.cost,
                "post_status": post.status,
                "role_in_match": "participant",
                "participation_status": participant.status,
            }
        )

    schedule_items.sort(key=lambda item: item["match_time"])

    return schedule_items