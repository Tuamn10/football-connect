from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func

from app.db.base import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    post_id = Column(
        Integer,
        ForeignKey("posts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    reason = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

    status = Column(String(50), nullable=False, default="pending")
    # pending, resolved, rejected

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )