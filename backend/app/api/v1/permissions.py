from fastapi import APIRouter, Depends

from app.api.deps import (
    get_current_admin,
    get_current_field_owner_or_admin,
    get_current_user,
)
from app.models.user import User

router = APIRouter()


@router.get("/user")
def user_area(current_user: User = Depends(get_current_user)):
    return {
        "message": "User permission verified",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role,
        },
    }


@router.get("/field-owner")
def field_owner_area(
    current_user: User = Depends(get_current_field_owner_or_admin),
):
    return {
        "message": "Field owner permission verified",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role,
        },
    }


@router.get("/admin")
def admin_area(current_user: User = Depends(get_current_admin)):
    return {
        "message": "Admin permission verified",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role,
        },
    }