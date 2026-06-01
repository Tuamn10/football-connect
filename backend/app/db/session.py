from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def test_database_connection():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
        postgis_version = connection.execute(
            text("SELECT PostGIS_Version()")
        ).scalar()

        return {
            "database": "connected",
            "postgis_version": postgis_version,
        }