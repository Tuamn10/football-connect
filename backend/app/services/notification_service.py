from sqlalchemy.orm import Session
from app.models.notification import Notification

def get_my_notifications(db: Session, user_id: int, skip: int = 0, limit: int = 50):
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def mark_notification_as_read(db: Session, notification_id: int, user_id: int):
    notification = db.query(Notification).filter(
        Notification.id == notification_id, 
        Notification.user_id == user_id
    ).first()
    
    if notification:
        notification.is_read = True
        db.commit()
        db.refresh(notification)
    return notification

def create_system_notification(db: Session, user_id: int, title: str, content: str):
    new_notif = Notification(user_id=user_id, title=title, content=content)
    db.add(new_notif)
    db.flush()
    return new_notif