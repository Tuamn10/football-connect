from pydantic import BaseModel, Field
from datetime import datetime
from typing import Any
from app.schemas.post import PostResponse, PostType, FieldType, LevelType

class AssistantSearchFilters(BaseModel):
    area: str | None = None
    field_type: FieldType | None = None
    required_level: LevelType | None = None
    match_from: datetime | None = None
    match_to: datetime | None = None
    max_cost: float | None = None
    post_type: PostType | None = None
    keyword: str | None = None

class AssistantSearchContext(BaseModel):
    filters: AssistantSearchFilters | None = None
    offset: int = 0
    limit: int = 5
    shown_post_ids: list[int] = []

class AssistantSearchRequest(BaseModel):
    message: str = Field(..., max_length=500)
    conversation_context: AssistantSearchContext | dict | None = None
    limit: int = Field(default=5, le=20)

class AssistantSearchResponse(BaseModel):
    reply: str
    intent: str
    parser_source: str
    llm_provider: str | None = None
    llm_model: str | None = None
    filters: AssistantSearchFilters
    posts: list[PostResponse]
    total: int
    context: AssistantSearchContext
    suggestions: list[str] = []
