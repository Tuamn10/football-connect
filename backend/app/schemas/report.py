from typing import Literal

from pydantic import BaseModel, ConfigDict


ReportReason = Literal[
    "false_information",
    "scam",
    "spam",
    "inappropriate",
    "other",
]

ReportStatus = Literal[
    "pending",
    "resolved",
    "rejected",
]


class ReportCreate(BaseModel):
    reason: ReportReason
    description: str | None = None


class ReportUpdateStatus(BaseModel):
    status: Literal["resolved", "rejected"]


class ReportResponse(BaseModel):
    id: int
    user_id: int
    post_id: int
    reason: str
    description: str | None = None
    status: str

    model_config = ConfigDict(from_attributes=True)