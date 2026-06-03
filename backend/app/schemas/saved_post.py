from pydantic import BaseModel, ConfigDict


class SavedPostResponse(BaseModel):
    id: int
    user_id: int
    post_id: int

    model_config = ConfigDict(from_attributes=True)