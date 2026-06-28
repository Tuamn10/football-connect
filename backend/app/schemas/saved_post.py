from pydantic import BaseModel, ConfigDict
from app.schemas.post import PostResponse


class SavedPostResponse(BaseModel):
    id: int
    user_id: int
    post_id: int
    post: PostResponse

    model_config = ConfigDict(from_attributes=True)