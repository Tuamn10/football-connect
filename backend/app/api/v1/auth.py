from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import create_access_token
from app.db.session import get_db
from app.schemas.auth import TokenResponse, UserLogin, UserRegister, UserResponse, ForgotPasswordRequest, ResetPasswordRequest
from app.services.auth_service import (
    authenticate_user,
    create_user,
    get_user_by_email,
    create_password_reset_otp,
    get_latest_active_otp,
    reset_password
)
from app.services.email_service import send_password_reset_email
from app.core.security import verify_password
from app.core.config import settings
from datetime import datetime, timezone
import math
import re

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    user_data.phone = user_data.phone.strip()
    if not re.match(r"^0\d{9}$", user_data.phone):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số bắt đầu bằng 0."
        )

    existing_user = get_user_by_email(db, user_data.email)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = create_user(db, user_data)
    access_token = create_access_token(subject=str(user.id))

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(
        db=db,
        email=login_data.email,
        password=login_data.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị khóa hoặc ngừng hoạt động",
        )

    access_token = create_access_token(subject=str(user.id))

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user=Depends(get_current_user)):
    return current_user


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    user = get_user_by_email(db, email)
    
    # Do not leak whether the email exists, just return a generic success message
    if not user or user.status != "active":
        return {"message": "Nếu email tồn tại trong hệ thống, mã OTP đã được gửi."}
        
    latest_otp = get_latest_active_otp(db, user.id)
    if latest_otp:
        time_elapsed = (datetime.now(timezone.utc) - latest_otp.created_at).total_seconds()
        if time_elapsed < settings.PASSWORD_RESET_RESEND_SECONDS:
            # We don't want to throw an error to leak user existence, just return success
            # Or we could return a 429 Too Many Requests, but for security, generic is better.
            return {"message": "Nếu email tồn tại trong hệ thống, mã OTP đã được gửi."}

    otp_record, otp = create_password_reset_otp(db, user, commit=False)
    
    try:
        success = send_password_reset_email(email, otp)
        if success:
            db.commit()
        else:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Lỗi hệ thống: Không thể gửi email (Thiếu cấu hình SMTP)."
            )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error sending email: {e}")
        db.rollback()
        # Ignore generic email sending errors to the client to not leak details
        pass
        
    return {"message": "Nếu email tồn tại trong hệ thống, mã OTP đã được gửi."}


@router.post("/reset-password")
def reset_password_api(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    
    if req.new_password != req.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu xác nhận không khớp"
        )
        
    user = get_user_by_email(db, email)
    if not user or user.status != "active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP không hợp lệ hoặc đã hết hạn")
        
    otp_record = get_latest_active_otp(db, user.id)
    if not otp_record:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP không hợp lệ hoặc đã hết hạn")
        
    if otp_record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP đã hết hạn")
        
    if otp_record.attempt_count >= settings.PASSWORD_RESET_OTP_MAX_ATTEMPTS:
        otp_record.is_used = True
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã OTP mới.")
        
    if not verify_password(req.otp, otp_record.otp_hash):
        otp_record.attempt_count += 1
        db.commit()
        remaining = settings.PASSWORD_RESET_OTP_MAX_ATTEMPTS - otp_record.attempt_count
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Mã OTP không chính xác. Bạn còn {remaining} lần thử."
        )
        
    if verify_password(req.new_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu mới không được trùng với mật khẩu cũ"
        )
        
    reset_password(db, user, otp_record, req.new_password)
    
    return {"message": "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại."}