from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.base import Base


class MatchParticipant(Base):
    __tablename__ = "match_participants"
    __table_args__ = (UniqueConstraint("user_id", "post_id", name="uq_match_participants_user_post"),)

    id = Column(Integer, primary_key=True, index=True)

    post_id = Column(
        Integer,
        ForeignKey("posts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    note = Column(Text, nullable=True)

    status = Column(String(50), nullable=False, default="pending")
    # pending, approved, rejected, cancelled

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    user = relationship("User")
    post = relationship("Post")