from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.report import ReportCreate, ReportResponse, ReportUpdateStatus
from app.services.post_service import get_post_by_id
from app.services.report_service import (
    create_report,
    get_report_by_id,
    get_reports,
    update_report_status,
)

router = APIRouter()


@router.post(
    "/posts/{post_id}/reports",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
)
def report_post(
    post_id: int,
    report_data: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = get_post_by_id(db=db, post_id=post_id)

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    return create_report(
        db=db,
        user_id=current_user.id,
        post_id=post_id,
        report_data=report_data,
    )


@router.get(
    "/reports",
    response_model=list[ReportResponse],
)
def list_reports(
    report_status: str | None = Query(default=None),
    skip: int = 0,
    limit: int = Query(default=100, le=100),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return get_reports(
        db=db,
        status=report_status,
        skip=skip,
        limit=limit,
    )


@router.put(
    "/reports/{report_id}/status",
    response_model=ReportResponse,
)
def update_report(
    report_id: int,
    status_data: ReportUpdateStatus,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    report = get_report_by_id(
        db=db,
        report_id=report_id,
    )

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    return update_report_status(
        db=db,
        report=report,
        new_status=status_data.status,
    )