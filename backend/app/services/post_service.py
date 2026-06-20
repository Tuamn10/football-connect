from sqlalchemy.orm import Session

from app.models.post import Post
from app.schemas.post import PostCreate, PostUpdate
from datetime import datetime


def create_post(
    db: Session,
    post_data: PostCreate,
    user_id: int,
) -> Post:
    post_dict = post_data.model_dump()
    post_dict["status"] = "open"
    post_dict["current_players"] = 0

    post = Post(
        **post_dict,
        user_id=user_id,
    )

    db.add(post)
    db.commit()
    db.refresh(post)

    return post


def get_post_by_id(db: Session, post_id: int) -> Post | None:
    return db.query(Post).filter(Post.id == post_id).first()


def get_my_posts(db: Session, user_id: int):
    return (
        db.query(Post)
        .filter(Post.user_id == user_id)
        .order_by(Post.id.desc())
        .all()
    )


def update_post(
    db: Session,
    post: Post,
    post_data: PostUpdate,
) -> Post:
    update_data = post_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(post, key, value)

    db.commit()
    db.refresh(post)

    return post


def delete_post(db: Session, post: Post):
    db.delete(post)
    db.commit()
 
    
def get_feed_posts(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    keyword: str | None = None,
    area: str | None = None,
    post_type: str | None = None,
    field_type: str | None = None,
    required_level: str | None = None,
    status: str | None = "open",
    match_from: datetime | None = None,
    match_to: datetime | None = None,
):
    query = db.query(Post)

    if status:
        query = query.filter(Post.status == status)

    if keyword:
        search_keyword = f"%{keyword}%"
        query = query.filter(
            (Post.title.ilike(search_keyword))
            | (Post.description.ilike(search_keyword))
        )

    if area:
        query = query.filter(Post.area.ilike(f"%{area}%"))

    if post_type:
        query = query.filter(Post.post_type == post_type)

    if field_type:
        query = query.filter(Post.field_type == field_type)

    if required_level:
        query = query.filter(Post.required_level == required_level)

    if match_from:
        query = query.filter(Post.match_time >= match_from)

    if match_to:
        query = query.filter(Post.match_time <= match_to)

    return (
        query.order_by(Post.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )