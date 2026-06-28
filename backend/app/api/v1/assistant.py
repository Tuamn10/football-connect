from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.assistant import AssistantSearchRequest, AssistantSearchResponse
from app.services.assistant_service import AssistantService

router = APIRouter()
assistant_service = AssistantService()

@router.post("/search", response_model=AssistantSearchResponse)
def search_posts_via_assistant(
    request: AssistantSearchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not request.message or not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty."
        )
        
    return assistant_service.handle_search(db=db, current_user=current_user, request=request)
