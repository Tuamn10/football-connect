from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.health import router as health_router
from app.api.v1.database import router as database_router
from app.api.v1.auth import router as auth_router
from app.api.v1.permissions import router as permissions_router
from app.api.v1.profile import router as profile_router
from app.api.v1.fields import router as fields_router
from app.api.v1.posts import router as posts_router

app = FastAPI(
    title="Football Connect API",
    description="Backend RESTful API cho ứng dụng kết nối cộng đồng bóng đá phong trào.",
    version="1.0.0",
)

origins = [
    "http://localhost:19006",
    "http://localhost:8081",
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Football Connect API is running",
        "status": "success",
    }


app.include_router(health_router, prefix="/api/v1", tags=["Health"])
app.include_router(database_router, prefix="/api/v1", tags=["Database"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(
    permissions_router,
    prefix="/api/v1/permissions",
    tags=["Permissions"],
)
app.include_router(
    profile_router,
    prefix="/api/v1/profile",
    tags=["Profile"],
)
app.include_router(
    fields_router,
    prefix="/api/v1/fields",
    tags=["Football Fields"],
)
app.include_router(
    posts_router,
    prefix="/api/v1/posts",
    tags=["Posts"],
)