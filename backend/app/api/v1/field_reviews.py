from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.field_review import (
    FieldReviewCreate,
    FieldReviewResponse,
    FieldReviewSummary,
    FieldReviewUpdate,
)
from app.services.field_review_service import (
    create_field_review,
    delete_field_review,
    get_field_review_summary,
    get_review_by_id,
    get_review_by_user_and_field,
    get_reviews_by_field,
    update_field_review,
)
from app.services.field_service import get_field_by_id

router = APIRouter()


@router.post(
    "/fields/{field_id}/reviews",
    response_model=FieldReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_review(
    field_id: int,
    review_data: FieldReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    field = get_field_by_id(db=db, field_id=field_id)

    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Field not found",
        )

    existing_review = get_review_by_user_and_field(
        db=db,
        user_id=current_user.id,
        field_id=field_id,
    )

    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this field",
        )

    return create_field_review(
        db=db,
        user_id=current_user.id,
        field_id=field_id,
        review_data=review_data,
    )


@router.get(
    "/fields/{field_id}/reviews",
    response_model=list[FieldReviewResponse],
)
def list_field_reviews(
    field_id: int,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
    db: Session = Depends(get_db),
):
    field = get_field_by_id(db=db, field_id=field_id)

    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Field not found",
        )

    return get_reviews_by_field(
        db=db,
        field_id=field_id,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/fields/{field_id}/reviews/summary",
    response_model=FieldReviewSummary,
)
def field_review_summary(
    field_id: int,
    db: Session = Depends(get_db),
):
    field = get_field_by_id(db=db, field_id=field_id)

    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Field not found",
        )

    return get_field_review_summary(
        db=db,
        field_id=field_id,
    )


@router.put(
    "/field-reviews/{review_id}",
    response_model=FieldReviewResponse,
)
def update_review(
    review_id: int,
    review_data: FieldReviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    review = get_review_by_id(
        db=db,
        review_id=review_id,
    )

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    if review.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this review",
        )

    return update_field_review(
        db=db,
        review=review,
        review_data=review_data,
    )


@router.delete("/field-reviews/{review_id}")
def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    review = get_review_by_id(
        db=db,
        review_id=review_id,
    )

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    if review.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this review",
        )

    delete_field_review(
        db=db,
        review=review,
    )

    return {
        "message": "Review deleted successfully",
    }