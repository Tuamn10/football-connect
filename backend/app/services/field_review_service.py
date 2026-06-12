from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.field_review import FieldReview
from app.schemas.field_review import FieldReviewCreate, FieldReviewUpdate


def get_review_by_id(
    db: Session,
    review_id: int,
) -> FieldReview | None:
    return db.query(FieldReview).filter(FieldReview.id == review_id).first()


def get_review_by_user_and_field(
    db: Session,
    user_id: int,
    field_id: int,
) -> FieldReview | None:
    return (
        db.query(FieldReview)
        .filter(
            FieldReview.user_id == user_id,
            FieldReview.field_id == field_id,
        )
        .first()
    )


def create_field_review(
    db: Session,
    user_id: int,
    field_id: int,
    review_data: FieldReviewCreate,
) -> FieldReview:
    review = FieldReview(
        user_id=user_id,
        field_id=field_id,
        rating=review_data.rating,
        comment=review_data.comment,
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return review


def get_reviews_by_field(
    db: Session,
    field_id: int,
    skip: int = 0,
    limit: int = 100,
):
    return (
        db.query(FieldReview)
        .filter(FieldReview.field_id == field_id)
        .order_by(FieldReview.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_field_review_summary(
    db: Session,
    field_id: int,
):
    result = (
        db.query(
            func.avg(FieldReview.rating),
            func.count(FieldReview.id),
        )
        .filter(FieldReview.field_id == field_id)
        .first()
    )

    average_rating = result[0] or 0
    total_reviews = result[1] or 0

    return {
        "field_id": field_id,
        "average_rating": round(float(average_rating), 1),
        "total_reviews": int(total_reviews),
    }


def update_field_review(
    db: Session,
    review: FieldReview,
    review_data: FieldReviewUpdate,
) -> FieldReview:
    update_data = review_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(review, key, value)

    db.commit()
    db.refresh(review)

    return review


def delete_field_review(
    db: Session,
    review: FieldReview,
):
    db.delete(review)
    db.commit()