from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


FieldType = Literal["5", "7", "11"]
FieldStatus = Literal["active", "inactive"]


class FootballFieldBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    address: str = Field(..., min_length=3)
    area: str | None = None
    phone: str | None = None

    field_type: FieldType = "7"
    price_per_hour: float | None = None

    open_time: str | None = None
    close_time: str | None = None

    latitude: float | None = None
    longitude: float | None = None

    image: str | None = None
    description: str | None = None
    status: FieldStatus = "active"


class FootballFieldCreate(FootballFieldBase):
    pass


class FootballFieldUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    address: str | None = None
    area: str | None = None
    phone: str | None = None

    field_type: FieldType | None = None
    price_per_hour: float | None = None

    open_time: str | None = None
    close_time: str | None = None

    latitude: float | None = None
    longitude: float | None = None

    image: str | None = None
    description: str | None = None
    status: FieldStatus | None = None


class FootballFieldResponse(FootballFieldBase):
    id: int
    owner_id: int | None = None

    model_config = ConfigDict(from_attributes=True)