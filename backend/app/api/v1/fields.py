from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_field_owner_or_admin
from app.core.roles import ROLE_ADMIN
from app.db.session import get_db
from app.models.user import User
from app.schemas.football_field import (
    FootballFieldCreate,
    FootballFieldResponse,
    FootballFieldUpdate,
)
from app.services.field_service import (
    create_field,
    delete_field,
    get_field_by_id,
    get_fields,
    update_field,
)

router = APIRouter()


@router.get("", response_model=list[FootballFieldResponse])
def list_fields(
    skip: int = 0,
    limit: int = Query(default=100, le=100),
    db: Session = Depends(get_db),
):
    return get_fields(db=db, skip=skip, limit=limit)


@router.get("/{field_id}", response_model=FootballFieldResponse)
def get_field_detail(
    field_id: int,
    db: Session = Depends(get_db),
):
    field = get_field_by_id(db=db, field_id=field_id)

    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Football field not found",
        )

    return field


@router.post("", response_model=FootballFieldResponse, status_code=status.HTTP_201_CREATED)
def create_new_field(
    field_data: FootballFieldCreate,
    current_user: User = Depends(get_current_field_owner_or_admin),
    db: Session = Depends(get_db),
):
    return create_field(
        db=db,
        field_data=field_data,
        owner_id=current_user.id,
    )


@router.put("/{field_id}", response_model=FootballFieldResponse)
def update_existing_field(
    field_id: int,
    field_data: FootballFieldUpdate,
    current_user: User = Depends(get_current_field_owner_or_admin),
    db: Session = Depends(get_db),
):
    field = get_field_by_id(db=db, field_id=field_id)

    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Football field not found",
        )

    if current_user.role != ROLE_ADMIN and field.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own football field",
        )

    return update_field(
        db=db,
        field=field,
        field_data=field_data,
    )


@router.delete("/{field_id}")
def delete_existing_field(
    field_id: int,
    current_user: User = Depends(get_current_field_owner_or_admin),
    db: Session = Depends(get_db),
):
    field = get_field_by_id(db=db, field_id=field_id)

    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Football field not found",
        )

    if current_user.role != ROLE_ADMIN and field.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own football field",
        )

    delete_field(db=db, field=field)

    return {
        "message": "Football field deleted successfully",
    }