from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.roles import ROLE_ADMIN
from app.db.session import get_db
from app.models.user import User
from app.schemas.match_participant import (
    JoinMatchRequest,
    MatchParticipantResponse,
    UpdateParticipantStatus,
)
from app.services.participant_service import (
    cancel_join_match,
    get_my_participations,
    get_participant_by_id,
    get_participant_by_post_and_user,
    get_participants_by_post,
    join_match,
    update_participant_status,
)
from app.services.post_service import get_post_by_id

router = APIRouter()


@router.post(
    "/posts/{post_id}/join",
    response_model=MatchParticipantResponse,
    status_code=status.HTTP_201_CREATED,
)
def join_post_match(
    post_id: int,
    join_data: JoinMatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = get_post_by_id(db=db, post_id=post_id)

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    if post.status != "open":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This match is not open for joining",
        )

    if post.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot join your own post",
        )

    existing_participant = get_participant_by_post_and_user(
        db=db,
        post_id=post_id,
        user_id=current_user.id,
    )

    if existing_participant and existing_participant.status not in ("cancelled", "rejected"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already joined this match",
        )

    if existing_participant and existing_participant.status in ("cancelled", "rejected"):
        existing_participant.status = "pending"
        existing_participant.note = join_data.note
        db.commit()
        db.refresh(existing_participant)
        return existing_participant

    return join_match(
        db=db,
        post_id=post_id,
        user_id=current_user.id,
        note=join_data.note,
    )


@router.delete(
    "/posts/{post_id}/join",
    response_model=MatchParticipantResponse,
)
def cancel_join_post_match(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = get_post_by_id(db=db, post_id=post_id)

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    participant = get_participant_by_post_and_user(
        db=db,
        post_id=post_id,
        user_id=current_user.id,
    )

    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You have not joined this match",
        )

    return cancel_join_match(
        db=db,
        participant=participant,
        post=post,
    )


@router.get(
    "/posts/{post_id}/participants",
    response_model=list[MatchParticipantResponse],
)
def list_post_participants(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = get_post_by_id(db=db, post_id=post_id)

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    if current_user.role != ROLE_ADMIN and post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only post owner or admin can view participants",
        )

    return get_participants_by_post(
        db=db,
        post_id=post_id,
    )


@router.put(
    "/participants/{participant_id}/status",
    response_model=MatchParticipantResponse,
)
def update_join_status(
    participant_id: int,
    status_data: UpdateParticipantStatus,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    participant = get_participant_by_id(
        db=db,
        participant_id=participant_id,
    )

    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not found",
        )

    post = get_post_by_id(db=db, post_id=participant.post_id)

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    if current_user.role != ROLE_ADMIN and post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only post owner or admin can update participant status",
        )

    if status_data.status == "approved" and participant.status != "approved":
        if post.needed_players > 0 and post.current_players >= post.needed_players:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Match is already full",
            )

    return update_participant_status(
        db=db,
        participant=participant,
        post=post,
        new_status=status_data.status,
    )


@router.get(
    "/participants/my",
    response_model=list[MatchParticipantResponse],
)
def list_my_joined_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_my_participations(
        db=db,
        user_id=current_user.id,
    )