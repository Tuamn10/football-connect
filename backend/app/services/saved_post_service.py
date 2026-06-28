from sqlalchemy.orm import Session, joinedload

from app.models.saved_post import SavedPost


def get_saved_post_by_user_and_post(
    db: Session,
    user_id: int,
    post_id: int,
) -> SavedPost | None:
    return (
        db.query(SavedPost)
        .filter(
            SavedPost.user_id == user_id,
            SavedPost.post_id == post_id,
        )
        .first()
    )


def save_post(
    db: Session,
    user_id: int,
    post_id: int,
) -> SavedPost:
    saved_post = SavedPost(
        user_id=user_id,
        post_id=post_id,
    )

    db.add(saved_post)
    db.commit()
    db.refresh(saved_post)

    return saved_post


def remove_saved_post(
    db: Session,
    saved_post: SavedPost,
):
    db.delete(saved_post)
    db.commit()


def get_my_saved_posts(
    db: Session,
    user_id: int,
):
    return (
        db.query(SavedPost)
        .filter(SavedPost.user_id == user_id)
        .options(joinedload(SavedPost.post))
        .order_by(SavedPost.id.desc())
        .all()
    )