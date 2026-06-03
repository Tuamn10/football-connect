from sqlalchemy.orm import Session

from app.models.match_participant import MatchParticipant
from app.models.post import Post


def get_participant_by_id(
    db: Session,
    participant_id: int,
) -> MatchParticipant | None:
    return (
        db.query(MatchParticipant)
        .filter(MatchParticipant.id == participant_id)
        .first()
    )


def get_participant_by_post_and_user(
    db: Session,
    post_id: int,
    user_id: int,
) -> MatchParticipant | None:
    return (
        db.query(MatchParticipant)
        .filter(
            MatchParticipant.post_id == post_id,
            MatchParticipant.user_id == user_id,
        )
        .first()
    )


def join_match(
    db: Session,
    post_id: int,
    user_id: int,
    note: str | None = None,
) -> MatchParticipant:
    participant = MatchParticipant(
        post_id=post_id,
        user_id=user_id,
        note=note,
        status="pending",
    )

    db.add(participant)
    db.commit()
    db.refresh(participant)

    return participant


def cancel_join_match(
    db: Session,
    participant: MatchParticipant,
    post: Post,
):
    if participant.status == "approved" and post.current_players > 0:
        post.current_players -= 1

    participant.status = "cancelled"

    db.commit()
    db.refresh(participant)

    return participant


def get_participants_by_post(
    db: Session,
    post_id: int,
):
    return (
        db.query(MatchParticipant)
        .filter(MatchParticipant.post_id == post_id)
        .order_by(MatchParticipant.id.desc())
        .all()
    )


def get_my_participations(
    db: Session,
    user_id: int,
):
    return (
        db.query(MatchParticipant)
        .filter(MatchParticipant.user_id == user_id)
        .order_by(MatchParticipant.id.desc())
        .all()
    )


def update_participant_status(
    db: Session,
    participant: MatchParticipant,
    post: Post,
    new_status: str,
) -> MatchParticipant:
    old_status = participant.status

    participant.status = new_status

    if old_status != "approved" and new_status == "approved":
        post.current_players += 1

    if old_status == "approved" and new_status != "approved":
        if post.current_players > 0:
            post.current_players -= 1

    if post.needed_players > 0 and post.current_players >= post.needed_players:
        post.status = "full"

    db.commit()
    db.refresh(participant)

    return participant