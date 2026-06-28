import smtplib
from email.message import EmailMessage
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

def send_password_reset_email(to_email: str, otp: str) -> bool:
    """
    Gửi email chứa mã OTP đặt lại mật khẩu.
    """
    if settings.PASSWORD_RESET_DEBUG:
        print("\n" + "=" * 60)
        print("FOOTBALL CONNECT - PASSWORD RESET OTP")
        print(f"Email: {to_email}")
        print(f"OTP: {otp}")
        print(
            f"OTP có hiệu lực trong "
            f"{settings.PASSWORD_RESET_OTP_EXPIRE_MINUTES} phút."
        )
        print("=" * 60 + "\n")
        return True

    required_config = {
        "SMTP_HOST": settings.SMTP_HOST,
        "SMTP_USERNAME": settings.SMTP_USERNAME,
        "SMTP_PASSWORD": settings.SMTP_PASSWORD,
        "SMTP_FROM_EMAIL": settings.SMTP_FROM_EMAIL,
    }

    missing = [
        name
        for name, value in required_config.items()
        if not value
    ]

    if missing:
        print(
            "Cannot send password reset email. "
            f"Missing SMTP settings: {', '.join(missing)}"
        )
        return False

    message = EmailMessage()
    message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    message["To"] = to_email
    message["Subject"] = "Mã xác nhận đặt lại mật khẩu Football Connect"

    text_content = f"""Xin chào,

Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Football Connect.

Mã OTP của bạn là: {otp}

Mã này có hiệu lực trong {settings.PASSWORD_RESET_OTP_EXPIRE_MINUTES} phút và chỉ được sử dụng một lần.
Không chia sẻ mã OTP này với bất kỳ ai.

Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.
"""
    message.set_content(text_content, charset="utf-8")

    try:
        with smtplib.SMTP(
            settings.SMTP_HOST,
            settings.SMTP_PORT,
            timeout=20,
        ) as server:
            server.ehlo()
            
            if settings.SMTP_USE_TLS:
                server.starttls()
                server.ehlo()
                
            server.login(
                settings.SMTP_USERNAME,
                settings.SMTP_PASSWORD,
            )
            
            server.send_message(message)
        return True

    except smtplib.SMTPAuthenticationError:
        logger.error(
            "Gmail SMTP authentication failed. "
            "Check SMTP_USERNAME and Gmail App Password."
        )
        return False
    except smtplib.SMTPConnectError:
        logger.error("Failed to connect to the SMTP server.")
        return False
    except smtplib.SMTPServerDisconnected:
        logger.error("SMTP server disconnected unexpectedly.")
        return False
    except smtplib.SMTPRecipientsRefused:
        logger.error(f"SMTP server refused the recipient: {to_email}")
        return False
    except TimeoutError:
        logger.error("Timeout while trying to connect to the SMTP server.")
        return False
    except OSError as e:
        logger.error(f"OS error occurred while connecting to SMTP: {e}")
        return False
    except Exception as e:
        logger.error(f"An unexpected error occurred while sending email.")
        return False
