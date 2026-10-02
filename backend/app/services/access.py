from sqlalchemy.orm import Session

from app.models import Alert, AuditLog, Milestone, Recruitment, Site, Study, User


def assigned_study_query(db: Session, user: User):
    query = db.query(Study)
    if user.role == "administrator":
        return query
    return query.filter((Study.principal_investigator_id == user.id) | (Study.coordinator_id == user.id))


def user_can_access_study(user: User, study: Study) -> bool:
    if user.role == "administrator":
        return True
    return study.principal_investigator_id == user.id or study.coordinator_id == user.id


def user_can_manage_operations(user: User, study: Study) -> bool:
    if user.role == "administrator":
        return True
    if user.role == "study_coordinator":
        return study.coordinator_id == user.id
    if user.role == "principal_investigator":
        return study.principal_investigator_id == user.id
    return False


def get_study_for_user(db: Session, user: User, study_key: str) -> Study:
    study = db.query(Study).filter((Study.id == study_key) | (Study.study_id == study_key)).first()
    if study is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Study not found")
    if not user_can_access_study(user, study):
        from fastapi import HTTPException

        raise HTTPException(status_code=403, detail="Not permitted for this study")
    return study


def refresh_site_count(db: Session, study: Study) -> None:
    study.site_count = db.query(Site).filter(Site.study_id == study.id).count()


def write_audit(
    db: Session,
    user: User | None,
    action: str,
    module: str,
    study: Study | None = None,
    record_id: str | None = None,
    extra: dict | None = None,
) -> None:
    db.add(
        AuditLog(
            user_id=user.id if user else None,
            study_id=study.id if study else None,
            action=action,
            module=module,
            record_id=record_id,
            extra_data=extra or {},
        )
    )


def user_study_codes(db: Session, user: User) -> list[str]:
    rows = assigned_study_query(db, user).all()
    return [row.study_id for row in rows]
