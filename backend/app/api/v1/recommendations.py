from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.schemas.recommendation import RecommendationResponse
from app.services.recommendation_service import recommendation_service

router = APIRouter()

@router.get("/posts", response_model=list[RecommendationResponse])
def get_recommended_posts(
    limit: int = 10,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    recommendations = recommendation_service.get_recommended_posts(
        db=db,
        current_user=current_user,
        limit=limit
    )
    
    # Map raw dictionary/object from service to Pydantic model
    result = []
    for rec in recommendations:
        result.append({
            "post": rec["post"],
            "similarity_score": rec["similarity_score"],
            "match_percentage": rec["match_percentage"],
            "reasons": rec["reasons"]
        })
    return result
