from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models.football_field import FootballField
from app.models.post import Post
from app.models.report import Report
from app.models.user import User
from app.schemas.admin import (
    AdminOverviewResponse,
    AdminUpdateFieldStatus,
    AdminUpdatePostStatus,
    AdminUpdateReportStatus,
    AdminUpdateUserRole,
    AdminUpdateUserStatus,
    AdminUserResponse,
)
from app.schemas.football_field import FootballFieldResponse
from app.schemas.post import PostResponse
from app.schemas.report import ReportResponse

router = APIRouter()


@router.get("/overview", response_model=AdminOverviewResponse)
def admin_overview(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    total_users = db.query(User).count()
    total_fields = db.query(FootballField).count()
    total_posts = db.query(Post).count()
    total_reports = db.query(Report).count()

    pending_reports = db.query(Report).filter(Report.status == "pending").count()
    open_posts = db.query(Post).filter(Post.status == "open").count()
    active_fields = db.query(FootballField).filter(FootballField.status == "active").count()

    return {
        "total_users": total_users,
        "total_fields": total_fields,
        "total_posts": total_posts,
        "total_reports": total_reports,
        "pending_reports": pending_reports,
        "open_posts": open_posts,
        "active_fields": active_fields,
    }


# =========================
# ADMIN - USERS
# =========================

@router.get("/users", response_model=list[AdminUserResponse])
def admin_list_users(
    keyword: str | None = None,
    role: str | None = None,
    user_status: str | None = Query(default=None),
    skip: int = 0,
    limit: int = Query(default=100, le=100),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    query = db.query(User)

    if keyword:
        search_keyword = f"%{keyword}%"
        query = query.filter(
            (User.name.ilike(search_keyword))
            | (User.email.ilike(search_keyword))
            | (User.phone.ilike(search_keyword))
        )

    if role:
        query = query.filter(User.role == role)

    if user_status:
        query = query.filter(User.status == user_status)

    return (
        query.order_by(User.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.put("/users/{user_id}/status", response_model=AdminUserResponse)
def admin_update_user_status(
    user_id: int,
    status_data: AdminUpdateUserStatus,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.id == current_user.id and status_data.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin cannot ban or deactivate own account",
        )

    user.status = status_data.status

    db.commit()
    db.refresh(user)

    return user


@router.put("/users/{user_id}/role", response_model=AdminUserResponse)
def admin_update_user_role(
    user_id: int,
    role_data: AdminUpdateUserRole,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.id == current_user.id and role_data.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin cannot remove own admin role",
        )

    user.role = role_data.role

    db.commit()
    db.refresh(user)

    return user


# =========================
# ADMIN - POSTS
# =========================

@router.get("/posts", response_model=list[PostResponse])
def admin_list_posts(
    keyword: str | None = None,
    post_status: str | None = Query(default=None),
    post_type: str | None = None,
    area: str | None = None,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Post)

    if keyword:
        search_keyword = f"%{keyword}%"
        query = query.filter(
            (Post.title.ilike(search_keyword))
            | (Post.description.ilike(search_keyword))
        )

    if post_status:
        query = query.filter(Post.status == post_status)

    if post_type:
        query = query.filter(Post.post_type == post_type)

    if area:
        query = query.filter(Post.area.ilike(f"%{area}%"))

    return (
        query.order_by(Post.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.put("/posts/{post_id}/status", response_model=PostResponse)
def admin_update_post_status(
    post_id: int,
    status_data: AdminUpdatePostStatus,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    post.status = status_data.status

    db.commit()
    db.refresh(post)

    return post


@router.delete("/posts/{post_id}")
def admin_delete_post(
    post_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    db.delete(post)
    db.commit()

    return {
        "message": "Post deleted successfully",
    }


# =========================
# ADMIN - FIELDS
# =========================

@router.get("/fields", response_model=list[FootballFieldResponse])
def admin_list_fields(
    keyword: str | None = None,
    field_status: str | None = Query(default=None),
    area: str | None = None,
    field_type: str | None = None,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    query = db.query(FootballField)

    if keyword:
        search_keyword = f"%{keyword}%"
        query = query.filter(
            (FootballField.name.ilike(search_keyword))
            | (FootballField.address.ilike(search_keyword))
            | (FootballField.phone.ilike(search_keyword))
        )

    if field_status:
        query = query.filter(FootballField.status == field_status)

    if area:
        query = query.filter(FootballField.area.ilike(f"%{area}%"))

    if field_type:
        query = query.filter(FootballField.field_type == field_type)

    return (
        query.order_by(FootballField.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.put("/fields/{field_id}/status", response_model=FootballFieldResponse)
def admin_update_field_status(
    field_id: int,
    status_data: AdminUpdateFieldStatus,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    field = db.query(FootballField).filter(FootballField.id == field_id).first()

    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Field not found",
        )

    field.status = status_data.status

    db.commit()
    db.refresh(field)

    return field


@router.delete("/fields/{field_id}")
def admin_delete_field(
    field_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    field = db.query(FootballField).filter(FootballField.id == field_id).first()

    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Field not found",
        )

    db.delete(field)
    db.commit()

    return {
        "message": "Field deleted successfully",
    }


# =========================
# ADMIN - REPORTS
# =========================

@router.get("/reports", response_model=list[ReportResponse])
def admin_list_reports(
    report_status: str | None = Query(default=None),
    skip: int = 0,
    limit: int = Query(default=100, le=100),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Report)

    if report_status:
        query = query.filter(Report.status == report_status)

    return (
        query.order_by(Report.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.put("/reports/{report_id}/status", response_model=ReportResponse)
def admin_update_report_status(
    report_id: int,
    status_data: AdminUpdateReportStatus,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    report = db.query(Report).filter(Report.id == report_id).first()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    report.status = status_data.status

    db.commit()
    db.refresh(report)

    return report