from app.db.base import Base
from app.db.session import engine

# Import models để SQLAlchemy biết cần tạo bảng nào
from app.models.user import User  # noqa: F401
from app.models.football_field import FootballField  # noqa: F401
from app.models.post import Post  # noqa: F401
from app.models.match_participant import MatchParticipant  # noqa: F401
from app.models.saved_post import SavedPost  # noqa: F401


def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")


if __name__ == "__main__":
    init_db()