from sqlalchemy.orm import Session

from app.models.football_field import FootballField
from app.schemas.football_field import FootballFieldCreate, FootballFieldUpdate


def get_fields(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(FootballField)
        .order_by(FootballField.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_fields_by_owner(db: Session, owner_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(FootballField)
        .filter(FootballField.owner_id == owner_id)
        .order_by(FootballField.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_field_by_id(db: Session, field_id: int) -> FootballField | None:
    return db.query(FootballField).filter(FootballField.id == field_id).first()


def create_field(
    db: Session,
    field_data: FootballFieldCreate,
    owner_id: int,
) -> FootballField:
    field = FootballField(
        **field_data.model_dump(),
        owner_id=owner_id,
    )

    db.add(field)
    db.commit()
    db.refresh(field)

    return field


def update_field(
    db: Session,
    field: FootballField,
    field_data: FootballFieldUpdate,
) -> FootballField:
    update_data = field_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(field, key, value)

    db.commit()
    db.refresh(field)

    return field


def delete_field(db: Session, field: FootballField):
    db.delete(field)
    db.commit()