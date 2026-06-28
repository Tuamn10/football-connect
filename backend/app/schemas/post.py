from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


PostType = Literal[
    "find_player",
    "find_opponent",
    "pass_field",
    "find_field",
]

FieldType = Literal["5", "7", "11"]

LevelType = Literal[
    "beginner",
    "average",
    "good",
    "advanced",
]

PostStatus = Literal[
    "open",
    "full",
    "cancelled",
    "expired",
]


class PostBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    post_type: PostType

    field_id: int | None = None
    match_time: datetime

    area: str | None = None
    field_type: str

    needed_players: int = Field(default=0, ge=0)

    required_level: LevelType = "average"
    cost: float | None = Field(default=None, ge=0)

    contact_phone: str | None = None
    description: str | None = None


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=255)
    post_type: PostType | None = None

    field_id: int | None = None
    match_time: datetime | None = None

    area: str | None = None
    field_type: str | None = None

    needed_players: int | None = Field(default=None, ge=0)

    required_level: LevelType | None = None
    cost: float | None = Field(default=None, ge=0)

    contact_phone: str | None = None
    description: str | None = None
    status: PostStatus | None = None


class PostResponse(PostBase):
    id: int
    user_id: int
    current_players: int = Field(default=0, ge=0)
    status: PostStatus = "open"
    owner_name: str | None = None
    owner_avatar: str | None = None

    model_config = ConfigDict(from_attributes=True)