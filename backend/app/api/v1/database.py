from fastapi import APIRouter, HTTPException

from app.db.session import test_database_connection

router = APIRouter()


@router.get("/db-health")
def db_health():
    try:
        result = test_database_connection()

        return {
            "status": "ok",
            "message": "Database connection successful",
            "data": result,
        }
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )