from sqlalchemy.orm import Session

from app.models.report import Report
from app.schemas.report import ReportCreate


def create_report(
    db: Session,
    user_id: int,
    post_id: int,
    report_data: ReportCreate,
) -> Report:
    report = Report(
        user_id=user_id,
        post_id=post_id,
        reason=report_data.reason,
        description=report_data.description,
        status="pending",
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return report


def get_reports(
    db: Session,
    status: str | None = None,
    skip: int = 0,
    limit: int = 100,
):
    query = db.query(Report)

    if status:
        query = query.filter(Report.status == status)

    return (
        query.order_by(Report.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_report_by_id(
    db: Session,
    report_id: int,
) -> Report | None:
    return db.query(Report).filter(Report.id == report_id).first()


def update_report_status(
    db: Session,
    report: Report,
    new_status: str,
) -> Report:
    report.status = new_status

    db.commit()
    db.refresh(report)

    return report