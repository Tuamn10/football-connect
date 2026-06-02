from sqlalchemy.orm import Session

from app.models.post import Post
from app.schemas.post import PostCreate, PostUpdate


def create_post(
    db: Session,
    post_data: PostCreate,
    user_id: int,
) -> Post:
    post = Post(
        **post_data.model_dump(),
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
):
    return (
        db.query(Post)
        .filter(Post.status == "open")
        .order_by(Post.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )