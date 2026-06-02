from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User


def create_user_if_not_exists(
    db,
    name: str,
    email: str,
    password: str,
    role: str,
    phone: str | None = None,
    area: str | None = None,
):
    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        print(f"User already exists: {email}")
        return existing_user

    user = User(
        name=name,
        email=email,
        hashed_password=hash_password(password),
        phone=phone,
        area=area,
        role=role,
        position=None,
        level="average",
        status="active",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    print(f"Created user: {email} - role: {role}")
    return user


def seed_users():
    db = SessionLocal()

    try:
        create_user_if_not_exists(
            db=db,
            name="Admin Football Connect",
            email="admin@gmail.com",
            password="123456",
            role="admin",
            phone="0900000001",
            area="Ha Noi",
        )

        create_user_if_not_exists(
            db=db,
            name="Chu San Bong",
            email="owner@gmail.com",
            password="123456",
            role="field_owner",
            phone="0900000002",
            area="Cau Giay",
        )

        create_user_if_not_exists(
            db=db,
            name="Nguoi Choi Bong Da",
            email="player@gmail.com",
            password="123456",
            role="user",
            phone="0900000003",
            area="Nam Tu Liem",
        )

    finally:
        db.close()


if __name__ == "__main__":
    seed_users()