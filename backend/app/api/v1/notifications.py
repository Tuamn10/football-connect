from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.services.notification_service import get_my_notifications, mark_notification_as_read

router = APIRouter()

@router.get("", response_model=list[NotificationResponse])
def list_my_notifications(
    skip: int = 0,
    limit: int = Query(default=50, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_my_notifications(db=db, user_id=current_user.id, skip=skip, limit=limit)


@router.put("/{notif_id}/read", response_model=NotificationResponse)
def read_notification(
    notif_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notif = mark_notification_as_read(db=db, notification_id=notif_id, user_id=current_user.id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif