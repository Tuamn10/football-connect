from pydantic import BaseModel, ConfigDict, Field


class FieldReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


class FieldReviewUpdate(BaseModel):
    rating: int | None = Field(default=None, ge=1, le=5)
    comment: str | None = None


class FieldReviewResponse(BaseModel):
    id: int
    field_id: int
    user_id: int
    rating: int
    comment: str | None = None

    model_config = ConfigDict(from_attributes=True)


class FieldReviewSummary(BaseModel):
    field_id: int
    average_rating: float
    total_reviews: int