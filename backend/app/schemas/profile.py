from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


PositionType = Literal[
    "goalkeeper",
    "defender",
    "midfielder",
    "forward",
]

LevelType = Literal[
    "beginner",
    "average",
    "good",
    "advanced",
]


class ProfileResponse(BaseModel):
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


class ProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    phone: str | None = Field(default=None, max_length=20)
    avatar: str | None = Field(default=None, max_length=255)
    area: str | None = Field(default=None, max_length=255)
    position: PositionType | None = None
    level: LevelType | None = None