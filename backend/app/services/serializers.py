from app.models import Alert, AuditLog, Milestone, Recruitment, Site, Study, User
from app.schemas import AlertOut, AuditLogOut, MilestoneOut, RecruitmentOut, SiteOut, StudyOut, UserOut
from app.utils.security import ROLE_TO_LABEL, format_date, format_dt, initials_for


def to_user_out(user: User, study_codes: list[str]) -> UserOut:
    return UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        role=ROLE_TO_LABEL.get(user.role, user.role),
        is_active=user.is_active,
        studies=study_codes,
        status="Active" if user.is_active else "Inactive",
        last_active=format_dt(user.last_active) or format_dt(user.updated_at),
        initials=initials_for(user.name),
    )


def to_study_out(study: Study) -> StudyOut:
    pi = study.principal_investigator
    coord = study.coordinator
    return StudyOut(
        id=study.id,
        study_id=study.study_id,
        title=study.title,
        description=study.description,
        principal_investigator=pi.name if pi else "Unassigned",
        pi_id=study.principal_investigator_id,
        coordinator_id=study.coordinator_id,
        coordinator_name=coord.name if coord else None,
        type=study.study_type,
        phase=study.phase,
        status=study.status,
        sites=study.site_count,
        target=study.target_participants,
        enrolled=study.enrolled_participants,
        screened=study.screened_participants,
        randomized=study.randomized_participants,
        withdrawn=study.withdrawn_participants,
        iec_status=study.iec_status,
        ctri_status=study.ctri_status,
        start_date=format_date(study.start_date),
        therapeutic_area=study.therapeutic_area,
    )


def to_site_out(site: Site, study_code: str) -> SiteOut:
    progress = 0
    if site.target_participants:
        progress = round(site.enrolled_participants / site.target_participants * 100)
    return SiteOut(
        id=site.id,
        study_id=study_code,
        name=site.name,
        location=site.location,
        target=site.target_participants,
        enrolled=site.enrolled_participants,
        status=site.status,
        progress=progress,
    )


def to_recruitment_out(row: Recruitment, study_code: str) -> RecruitmentOut:
    return RecruitmentOut(
        id=row.id,
        study_id=study_code,
        month=row.month,
        planned=row.planned,
        actual=row.actual,
    )


def to_milestone_out(row: Milestone, study_code: str) -> MilestoneOut:
    return MilestoneOut(
        id=row.id,
        study_id=study_code,
        name=row.name,
        description=row.description,
        status=row.status,
        date=row.completed_date or row.due_date,
        due_date=row.due_date,
        completed_date=row.completed_date,
        responsible=row.responsible_person,
    )


def to_alert_out(row: Alert, study_code: str | None) -> AlertOut:
    created = row.created_at.date().isoformat() if row.created_at else None
    return AlertOut(
        id=row.id,
        study_id=row.study_id,
        study_code=study_code,
        title=row.title,
        description=row.description,
        severity=row.severity,
        status=row.status,
        due_date=row.due_date,
        date=row.due_date or created,
        category=row.category,
    )


def to_audit_out(row: AuditLog) -> AuditLogOut:
    user_name = row.user.name if row.user else "System"
    role = ROLE_TO_LABEL.get(row.user.role, row.user.role) if row.user else "Administrator"
    study_code = row.study.study_id if row.study else "Portfolio"
    extra = row.extra_data or {}
    return AuditLogOut(
        id=row.id,
        timestamp=row.timestamp.strftime("%d %b %Y %H:%M"),
        user=user_name,
        role=role,
        action=row.action,
        study_id=study_code,
        record=str(extra.get("record") or row.record_id or row.module),
        status=str(extra.get("status") or "Success"),
        module=row.module,
    )
