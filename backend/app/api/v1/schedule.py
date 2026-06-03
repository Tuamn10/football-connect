from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.schedule import MyScheduleItem
from app.services.schedule_service import get_my_schedule

router = APIRouter()


@router.get("/my", response_model=list[MyScheduleItem])
def my_schedule(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_my_schedule(
        db=db,
        user_id=current_user.id,
    )