from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

# 🔴 1. IMPORT THÊM KHUÔN CỦA POST
from app.schemas.post import PostResponse 


ParticipantStatus = Literal[
    "pending",
    "approved",
    "rejected",
    "cancelled",
]

class JoinMatchRequest(BaseModel):
    note: str | None = None

class UpdateParticipantStatus(BaseModel):
    status: Literal["approved", "rejected"]

class ParticipantUser(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)

class MatchParticipantResponse(BaseModel):
    id: int
    post_id: int
    user_id: int
    note: str | None = None
    status: str
    
    user: ParticipantUser | None = None
    
    # 🔴 2. THÊM DÒNG NÀY ĐỂ PYDANTIC CHO PHÉP XUẤT DATA BÀI ĐĂNG
    post: Optional[PostResponse] = None

    model_config = ConfigDict(from_attributes=True)