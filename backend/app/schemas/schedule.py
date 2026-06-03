from datetime import datetime

from pydantic import BaseModel


class MyScheduleItem(BaseModel):
    post_id: int
    title: str
    post_type: str
    match_time: datetime
    area: str | None = None
    field_type: str
    required_level: str
    cost: float | None = None
    post_status: str

    role_in_match: str
    participation_status: str | None = None