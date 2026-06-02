from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, func

from app.db.base import Base


class FootballField(Base):
    __tablename__ = "football_fields"

    id = Column(Integer, primary_key=True, index=True)

    owner_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    name = Column(String(255), nullable=False)
    address = Column(Text, nullable=False)
    area = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)

    field_type = Column(String(20), nullable=False, default="7")
    price_per_hour = Column(Float, nullable=True)

    open_time = Column(String(20), nullable=True)
    close_time = Column(String(20), nullable=True)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    image = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)

    status = Column(String(50), nullable=False, default="active")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )