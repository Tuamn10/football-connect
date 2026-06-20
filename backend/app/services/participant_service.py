from sqlalchemy.orm import Session, joinedload

from app.models.match_participant import MatchParticipant
from app.models.post import Post
from app.services.notification_service import create_system_notification


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

    if post.needed_players > 0 and post.current_players < post.needed_players and post.status == "full":
        post.status = "open"

    db.commit()
    db.refresh(participant)

    return participant


def get_participants_by_post(
    db: Session,
    post_id: int,
):
    return (
        db.query(MatchParticipant)
        .options(joinedload(MatchParticipant.user))
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
        .options(joinedload(MatchParticipant.post))
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
    elif post.needed_players > 0 and post.current_players < post.needed_players and post.status == "full":
        post.status = "open"

    try:
        post_title = post.title if post.title else "không xác định"
        
        if new_status == "approved" and old_status != "approved":
            create_system_notification(
                db=db,
                user_id=participant.user_id,
                title="Yêu cầu tham gia đã được duyệt",
                content=f'Yêu cầu tham gia kèo "{post_title}" của bạn đã được chủ bài đăng chấp nhận.'
            )
        elif new_status == "rejected" and old_status != "rejected":
            create_system_notification(
                db=db,
                user_id=participant.user_id,
                title="Yêu cầu tham gia bị từ chối",
                content=f'Yêu cầu tham gia kèo "{post_title}" của bạn đã bị chủ bài đăng từ chối.'
            )

        db.commit()
        db.refresh(participant)
    except Exception as e:
        db.rollback()
        raise e

    return participant