from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.saved_post import SavedPostResponse
from app.services.post_service import get_post_by_id
from app.services.saved_post_service import (
    get_my_saved_posts,
    get_saved_post_by_user_and_post,
    remove_saved_post,
    save_post,
)

router = APIRouter()


@router.post(
    "/posts/{post_id}/save",
    response_model=SavedPostResponse,
    status_code=status.HTTP_201_CREATED,
)
def save_interested_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = get_post_by_id(db=db, post_id=post_id)

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    existing_saved_post = get_saved_post_by_user_and_post(
        db=db,
        user_id=current_user.id,
        post_id=post_id,
    )

    if existing_saved_post:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already saved this post",
        )

    return save_post(
        db=db,
        user_id=current_user.id,
        post_id=post_id,
    )


@router.delete("/posts/{post_id}/save")
def unsave_interested_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    saved_post = get_saved_post_by_user_and_post(
        db=db,
        user_id=current_user.id,
        post_id=post_id,
    )

    if not saved_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved post not found",
        )

    remove_saved_post(
        db=db,
        saved_post=saved_post,
    )

    return {
        "message": "Post removed from saved list successfully",
    }


@router.get(
    "/saved-posts",
    response_model=list[SavedPostResponse],
)
def list_my_saved_posts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_my_saved_posts(
        db=db,
        user_id=current_user.id,
    )