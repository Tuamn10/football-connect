from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


UserStatus = Literal["active", "inactive", "banned"]
UserRole = Literal["user", "field_owner", "admin"]

PostStatus = Literal["open", "full", "cancelled", "expired"]
FieldStatus = Literal["active", "inactive"]
ReportStatus = Literal["pending", "resolved", "rejected"]


class AdminOverviewResponse(BaseModel):
    total_users: int
    total_fields: int
    total_posts: int
    total_reports: int
    pending_reports: int
    open_posts: int
    active_fields: int
    total_reviews: int


class AdminUpdateUserStatus(BaseModel):
    status: UserStatus


class AdminUpdateUserRole(BaseModel):
    role: UserRole


class AdminUpdatePostStatus(BaseModel):
    status: PostStatus


class AdminUpdateFieldStatus(BaseModel):
    status: FieldStatus


class AdminUpdateReportStatus(BaseModel):
    status: Literal["resolved", "rejected"]


class AdminUserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None = None
    avatar: str | None = None
    role: str
    area: str | None = None
    position: str | None = None
    level: str
    status: str

    model_config = ConfigDict(from_attributes=True)


class AdminFieldReviewResponse(BaseModel):
    id: int
    field_id: int
    user_id: int
    rating: int
    comment: str | None = None
    created_at: datetime
    
    # Nested info
    user_name: str | None = None
    field_name: str | None = None

    model_config = ConfigDict(from_attributes=True)