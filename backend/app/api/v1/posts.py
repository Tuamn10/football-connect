from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.roles import ROLE_ADMIN
from app.db.session import get_db
from app.models.user import User
from app.schemas.post import PostCreate, PostResponse, PostUpdate
from app.services.field_service import get_field_by_id
from app.services.post_service import (
    create_post,
    delete_post,
    get_feed_posts,
    get_my_posts,
    get_post_by_id,
    update_post,
)

router = APIRouter()


@router.get("", response_model=list[PostResponse])
def list_feed_posts(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    return get_feed_posts(
        db=db,
        skip=skip,
        limit=limit,
    )
    
    
@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_new_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if post_data.field_id is not None:
        field = get_field_by_id(db=db, field_id=post_data.field_id)

        if not field:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Football field not found",
            )

    return create_post(
        db=db,
        post_data=post_data,
        user_id=current_user.id,
    )


@router.get("/my", response_model=list[PostResponse])
def list_my_posts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_my_posts(db=db, user_id=current_user.id)


@router.put("/{post_id}", response_model=PostResponse)
def update_existing_post(
    post_id: int,
    post_data: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = get_post_by_id(db=db, post_id=post_id)

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    if current_user.role != ROLE_ADMIN and post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own post",
        )

    if post_data.field_id is not None:
        field = get_field_by_id(db=db, field_id=post_data.field_id)

        if not field:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Football field not found",
            )

    return update_post(
        db=db,
        post=post,
        post_data=post_data,
    )


@router.delete("/{post_id}")
def delete_existing_post(
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

    if current_user.role != ROLE_ADMIN and post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own post",
        )

    delete_post(db=db, post=post)

    return {
        "message": "Post deleted successfully",
    }