from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text, func

from app.db.base import Base


class FieldReview(Base):
    __tablename__ = "field_reviews"

    id = Column(Integer, primary_key=True, index=True)

    field_id = Column(
        Integer,
        ForeignKey("football_fields.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )