from pydantic import BaseModel
from typing import List
from app.schemas.post import PostResponse

class RecommendationResponse(BaseModel):
    post: PostResponse
    similarity_score: float
    match_percentage: float
    reasons: List[str]
