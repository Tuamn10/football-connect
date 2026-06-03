from typing import Literal

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


class MatchParticipantResponse(BaseModel):
    id: int
    post_id: int
    user_id: int
    note: str | None = None
    status: str

    model_config = ConfigDict(from_attributes=True)