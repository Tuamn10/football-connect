from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.profile import ProfileUpdate


def update_user_profile(
    db: Session,
    user: User,
    profile_data: ProfileUpdate,
) -> User:
    update_data = profile_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)

    return user