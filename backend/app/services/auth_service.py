from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.auth import UserRegister


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user_data: UserRegister) -> User:
    user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        phone=user_data.phone,
        area=user_data.area,
        position=user_data.position,
        level=user_data.level,
        role="user",
        status="active",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)

    if not user:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user


import secrets
from datetime import datetime, timezone, timedelta
from app.models.password_reset_otp import PasswordResetOTP
from app.core.config import settings

def create_password_reset_otp(db: Session, user: User, commit: bool = True) -> tuple[PasswordResetOTP, str]:
    # Vô hiệu hóa tất cả OTP cũ chưa sử dụng
    db.query(PasswordResetOTP).filter(
        PasswordResetOTP.user_id == user.id,
        PasswordResetOTP.is_used == False
    ).update({"is_used": True})
    
    otp = "".join([str(secrets.randbelow(10)) for _ in range(6)])
    otp_hash = hash_password(otp)
    
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.PASSWORD_RESET_OTP_EXPIRE_MINUTES)
    
    otp_record = PasswordResetOTP(
        user_id=user.id,
        otp_hash=otp_hash,
        expires_at=expires_at,
        attempt_count=0,
        is_used=False
    )
    
    db.add(otp_record)
    
    if commit:
        db.commit()
    
    return otp_record, otp

def get_latest_active_otp(db: Session, user_id: int) -> PasswordResetOTP | None:
    return db.query(PasswordResetOTP).filter(
        PasswordResetOTP.user_id == user_id,
        PasswordResetOTP.is_used == False
    ).order_by(PasswordResetOTP.created_at.desc()).first()

def reset_password(db: Session, user: User, otp_record: PasswordResetOTP, new_password: str):
    user.hashed_password = hash_password(new_password)
    
    otp_record.is_used = True
    otp_record.used_at = datetime.now(timezone.utc)
    
    # Disable all other active OTPs
    db.query(PasswordResetOTP).filter(
        PasswordResetOTP.user_id == user.id,
        PasswordResetOTP.is_used == False
    ).update({"is_used": True})
    
    db.commit()
    db.refresh(user)