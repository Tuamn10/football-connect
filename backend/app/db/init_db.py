from app.db.base import Base
from app.db.session import engine

# Import models để SQLAlchemy biết cần tạo bảng nào
from app.models.user import User  # noqa: F401


def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")


if __name__ == "__main__":
    init_db()