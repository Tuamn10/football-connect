from sqlalchemy import Column, DateTime, Integer, String, func

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    phone = Column(String(20), nullable=True)
    avatar = Column(String(255), nullable=True)

    role = Column(String(50), nullable=False, default="user")
    area = Column(String(255), nullable=True)
    position = Column(String(50), nullable=True)
    level = Column(String(50), nullable=False, default="average")
    status = Column(String(50), nullable=False, default="active")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )