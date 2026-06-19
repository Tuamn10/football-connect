from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict


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


# THÊM KHUÔN NÀY ĐỂ HỨNG THÔNG TIN NGƯỜI DÙNG
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
    
    # NHÉT THÊM TRƯỜNG "user" VÀO ĐÂY ĐỂ TRẢ VỀ FRONTEND
    user: ParticipantUser | None = None

    model_config = ConfigDict(from_attributes=True)