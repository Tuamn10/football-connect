from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, func

from app.db.base import Base


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    field_id = Column(
        Integer,
        ForeignKey("football_fields.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    title = Column(String(255), nullable=False)
    post_type = Column(String(50), nullable=False)

    match_time = Column(DateTime(timezone=True), nullable=False)

    area = Column(String(255), nullable=True)
    field_type = Column(String(20), nullable=False, default="7")

    needed_players = Column(Integer, nullable=False, default=0)
    current_players = Column(Integer, nullable=False, default=0)

    required_level = Column(String(50), nullable=False, default="average")
    cost = Column(Float, nullable=True)

    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="open")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )