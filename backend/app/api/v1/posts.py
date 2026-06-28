from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import re

from app.api.deps import get_current_user
from app.core.roles import ROLE_ADMIN
from app.db.session import get_db
from app.models.user import User
from app.schemas.post import PostCreate, PostResponse, PostUpdate

VALID_POST_TYPES = {"find_player", "find_opponent", "pass_field", "find_field"}

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
    keyword: str | None = None,
    area: str | None = None,
    post_type: str | None = None,
    field_type: str | None = None,
    required_level: str | None = None,
    status: str | None = "open",
    match_from: datetime | None = None,
    match_to: datetime | None = None,
    db: Session = Depends(get_db),
):
    return get_feed_posts(
        db=db,
        skip=skip,
        limit=limit,
        keyword=keyword,
        area=area,
        post_type=post_type,
        field_type=field_type,
        required_level=required_level,
        status=status,
        match_from=match_from,
        match_to=match_to,
    )
    
    
@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_new_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if post_data.post_type not in VALID_POST_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Loại bài đăng không hợp lệ.",
        )

    if post_data.match_time <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Thời gian thi đấu phải lớn hơn thời gian hiện tại",
        )

    if not post_data.field_type or str(post_data.field_type).strip() not in ("5", "7", "11"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Loại sân không hợp lệ.",
        )

    if not post_data.contact_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Số điện thoại liên hệ không hợp lệ. Vui lòng nhập 10 chữ số bắt đầu bằng 0.",
        )
    phone = post_data.contact_phone.strip()
    if not re.match(r"^0\d{9}$", phone):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Số điện thoại liên hệ không hợp lệ. Vui lòng nhập 10 chữ số bắt đầu bằng 0.",
        )
    post_data.contact_phone = phone

    if post_data.field_id is not None:
        field = get_field_by_id(db=db, field_id=post_data.field_id)

        if not field:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Football field not found",
            )

    if post_data.post_type == "find_opponent":
        post_data.needed_players = 1
    elif post_data.post_type in ("pass_field", "find_field"):
        post_data.needed_players = 0
        post_data.required_level = "average"

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

@router.get("/{post_id}", response_model=PostResponse)
def get_post_detail(
    post_id: int,
    db: Session = Depends(get_db),
):
    post = get_post_by_id(db=db, post_id=post_id)

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    return post

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

    if post_data.post_type is not None and post_data.post_type not in VALID_POST_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Loại bài đăng không hợp lệ.",
        )

    if post_data.match_time and post_data.match_time <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Thời gian thi đấu phải lớn hơn thời gian hiện tại",
        )

    if post_data.field_type is not None and str(post_data.field_type).strip() not in ("5", "7", "11"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Loại sân không hợp lệ.",
        )

    if not post_data.contact_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Số điện thoại liên hệ không hợp lệ. Vui lòng nhập 10 chữ số bắt đầu bằng 0.",
        )
    phone = post_data.contact_phone.strip()
    if not re.match(r"^0\d{9}$", phone):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Số điện thoại liên hệ không hợp lệ. Vui lòng nhập 10 chữ số bắt đầu bằng 0.",
        )
    post_data.contact_phone = phone
    if post_data.field_id is not None:
        field = get_field_by_id(db=db, field_id=post_data.field_id)

        if not field:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Football field not found",
            )

    if post_data.post_type == "find_opponent":
        post_data.needed_players = 1
    elif post_data.post_type in ("pass_field", "find_field"):
        post_data.needed_players = 0
        post_data.required_level = "average"

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