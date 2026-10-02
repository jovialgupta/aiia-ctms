from datetime import date, datetime, UTC

from typing import Any



from fastapi import Depends, FastAPI, HTTPException, Query, status

from fastapi.middleware.cors import CORSMiddleware

from fastapi.security import OAuth2PasswordBearer

from sqlalchemy import func, or_

from sqlalchemy.orm import Session



from app.config import get_settings

from app.database import Base, engine, get_db

from app.dependencies import get_current_user, require_roles

from app.models import (

    Alert,

    AuditLog,

    Milestone,

    Recruitment,

    Site,

    Study,

    User,

)

from app.schemas import (

    AlertOut,

    AlertUpdate,

    AlertWrite,

    AuditLogOut,

    DashboardSummary,

    LoginRequest,

    MilestoneOut,

    MilestoneUpdate,

    MilestoneWrite,

    RecruitmentOut,

    RecruitmentWrite,

    SiteOut,

    SiteUpdate,

    SiteWrite,

    StudyOut,

    StudyUpdate,

    StudyWrite,

    UserOut,

    UserUpdate,

)

from app.services.access import (

    assigned_study_query,


    refresh_site_count,

    user_can_access_study,

    user_can_manage_operations,

    user_study_codes,

    write_audit,

)

from app.services.dashboard import (

    dashboard_summary,

    portfolio_recruitment,

    study_status_slices,

)

from app.services.serializers import (

    to_alert_out,

    to_audit_out,

    to_milestone_out,

    to_recruitment_out,

    to_site_out,

    to_study_out,

    to_user_out,

)

from app.utils.security import (

    create_access_token,

    hash_password,

    verify_password,

)





settings = get_settings()


def get_study_for_user(db: Session, user: User, study_key: str) -> Study:
    """Resolve a study by either its internal UUID or human-readable study code."""
    study = None

    # Human-readable IDs such as AIIA-CT-003 must be matched against
    # Study.study_id, not the UUID primary-key column.
    if study_key.startswith("AIIA-CT-"):
        study = (
            db.query(Study)
            .filter(Study.study_id == study_key)
            .first()
        )
    else:
        study = (
            db.query(Study)
            .filter(Study.id == study_key)
            .first()
        )

    if study is None:
        raise HTTPException(status_code=404, detail="Study not found")

    if not user_can_access_study(user, study):
        raise HTTPException(status_code=403, detail="Not permitted for this study")

    return study



app = FastAPI(

    title="AIIA Clinical Trial Management System API",

    description="Phase 1 API for the AIIA Clinical Research Management Platform",

    version="1.0.0",

)



app.add_middleware(

    CORSMiddleware,

    allow_origins=["https://aiia-ctms-eta.vercel.app"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)





# ============================================================

# DATABASE

# ============================================================



@app.on_event("startup")

def startup() -> None:

    Base.metadata.create_all(bind=engine)





# ============================================================

# HEALTH

# ============================================================



@app.get("/api/health")

def health():

    return {

        "status": "ok",

        "service": "AIIA CTMS API",

        "version": "1.0.0",

    }





# ============================================================

# AUTHENTICATION

# ============================================================



@app.post("/api/auth/login")

def login(

    payload: LoginRequest,

    db: Session = Depends(get_db),

):

    user = (

        db.query(User)

        .filter(func.lower(User.email) == payload.email.lower())

        .first()

    )



    if user is None or not verify_password(payload.password, user.password_hash):

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="Invalid email or password",

        )



    if not user.is_active:

        raise HTTPException(

            status_code=status.HTTP_403_FORBIDDEN,

            detail="User account is inactive",

        )



    user.last_active = datetime.now(UTC)

    db.commit()



    token = create_access_token(user.id, user.role)



    return {

        "access_token": token,

        "token_type": "bearer",

    }





@app.get("/api/auth/me", response_model=UserOut)

def me(

    user: User = Depends(get_current_user),

    db: Session = Depends(get_db),

):

    return to_user_out(

        user,

        user_study_codes(db, user),

    )





# ============================================================

# DASHBOARD

# ============================================================



@app.get("/api/dashboard/summary", response_model=DashboardSummary)

def dashboard(

    range_key: str = Query("today"),

    user: User = Depends(get_current_user),

    db: Session = Depends(get_db),

):

    return dashboard_summary(db, user, range_key)





@app.get("/api/dashboard/study-status")

def dashboard_status(

    user: User = Depends(get_current_user),

    db: Session = Depends(get_db),

):

    return study_status_slices(db, user)





@app.get("/api/dashboard/recruitment")

def dashboard_recruitment(

    user: User = Depends(get_current_user),

    db: Session = Depends(get_db),

):

    return portfolio_recruitment(db, user)





# ============================================================

# STUDIES

# ============================================================



@app.get("/api/studies", response_model=list[StudyOut])

def list_studies(

    search: str | None = None,

    status_filter: str | None = None,

    phase: str | None = None,

    study_type: str | None = None,

    user: User = Depends(get_current_user),

    db: Session = Depends(get_db),

):

    query = assigned_study_query(db, user)



    if search:

        term = f"%{search.strip()}%"

        query = query.filter(

            or_(

                Study.study_id.ilike(term),

                Study.title.ilike(term),

                Study.therapeutic_area.ilike(term),

            )

        )



    if status_filter:

        query = query.filter(Study.status == status_filter)



    if phase:

        query = query.filter(Study.phase == phase)



    if study_type:

        query = query.filter(Study.study_type == study_type)



    studies = query.order_by(Study.created_at.desc()).all()



    return [to_study_out(study) for study in studies]





@app.post(

    "/api/studies",

    response_model=StudyOut,

    status_code=status.HTTP_201_CREATED,

)

def create_study(

    payload: StudyWrite,

    user: User = Depends(require_roles("administrator")),

    db: Session = Depends(get_db),

):

    study_code = payload.study_id



    if not study_code:

        count = db.query(Study).count() + 1

        study_code = f"AIIA-CT-{count:03d}"



    if db.query(Study).filter(Study.study_id == study_code).first():

        raise HTTPException(

            status_code=409,

            detail="Study ID already exists",

        )



    study = Study(

        study_id=study_code,

        title=payload.title,

        description=payload.description,

        principal_investigator_id=payload.principal_investigator_id,

        coordinator_id=payload.coordinator_id,

        study_type=payload.study_type,

        phase=payload.phase,

        status=payload.status,

        target_participants=payload.target_participants,

        enrolled_participants=payload.enrolled_participants,

        screened_participants=payload.screened_participants,

        randomized_participants=payload.randomized_participants,

        withdrawn_participants=payload.withdrawn_participants,

        site_count=payload.site_count,

        iec_status=payload.iec_status,

        ctri_status=payload.ctri_status,

        start_date=payload.start_date,

        expected_end_date=payload.expected_end_date,

        therapeutic_area=payload.therapeutic_area,

    )



    db.add(study)

    db.flush()



    write_audit(

        db,

        user,

        "Created study",

        "Studies",

        study=study,

        record_id=study.study_id,

    )



    db.commit()

    db.refresh(study)



    return to_study_out(study)





@app.get("/api/studies/{study_key}", response_model=StudyOut)

def get_study(

    study_key: str,

    user: User = Depends(get_current_user),

    db: Session = Depends(get_db),

):

    study = get_study_for_user(db, user, study_key)

    return to_study_out(study)





@app.patch("/api/studies/{study_key}", response_model=StudyOut)

def update_study(

    study_key: str,

    payload: StudyUpdate,

    user: User = Depends(get_current_user),

    db: Session = Depends(get_db),

):

    study = get_study_for_user(db, user, study_key)



    if not user_can_manage_operations(user, study):

        raise HTTPException(

            status_code=403,

            detail="You do not have permission to modify this study",

        )



    values = payload.model_dump(exclude_unset=True)



    for key, value in values.items():

        setattr(study, key, value)



    write_audit(

        db,

        user,

        "Updated study",

        "Studies",

        study=study,

        record_id=study.study_id,

    )



    db.commit()

    db.refresh(study)



    return to_study_out(study)





@app.delete("/api/studies/{study_key}")

def delete_study(

    study_key: str,

    user: User = Depends(require_roles("administrator")),

    db: Session = Depends(get_db),

):

    study = get_study_for_user(db, user, study_key)



    write_audit(

        db,

        user,

        "Deleted study",

        "Studies",

        study=study,

        record_id=study.study_id,

    )



    db.delete(study)

    db.commit()



    return {"message": "Study deleted successfully"}





# ============================================================

# SITES

# ============================================================



@app.get("/api/studies/{study_key}/sites", response_model=list[SiteOut])

def list_sites(

    study_key: str,

    user: User = Depends(get_current_user),

    db: Session = Depends(get_db),

):

    study = get_study_for_user(db, user, study_key)



    sites = (

        db.query(Site)

        .filter(Site.study_id == study.id)

        .order_by(Site.created_at.desc())

        .all()

    )



    return [to_site_out(site, study.study_id) for site in sites]





@app.post(

    "/api/studies/{study_key}/sites",

    response_model=SiteOut,

    status_code=status.HTTP_201_CREATED,

)

def create_site(

    study_key: str,

    payload: SiteWrite,

    user: User = Depends(get_current_user),

    db: Session = Depends(get_db),

):

    study = get_study_for_user(db, user, study_key)



    if not user_can_manage_operations(user, study):

        raise HTTPException(status_code=403, detail="Not permitted")



    site = Site(

        study_id=study.id,

        name=payload.name,

        location=payload.location,

        target_participants=payload.target_participants,

        enrolled_participants=payload.enrolled_participants,

        status=payload.status,

    )



    db.add(site)

    db.flush()



    refresh_site_count(db, study)



    write_audit(

        db,

        user,

        "Created site",

        "Sites",

        study=study,

        record_id=site.id,

    )



    db.commit()

    db.refresh(site)



    return to_site_out(site, study.study_id)





@app.patch("/api/sites/{site_id}", response_model=SiteOut)

def update_site(

    site_id: str,

    payload: SiteUpdate,

    user: User = Depends(get_current_user),

    db: Session = Depends(get_db),

):

    site = db.get(Site, site_id)



    if not site:

        raise HTTPException(status_code=404, detail="Site not found")



    study = get_study_for_user(db, user, site.study_id)



    if not user_can_manage_operations(user, study):

        raise HTTPException(status_code=403, detail="Not permitted")



    for key, value in payload.model_dump(exclude_unset=True).items():

        setattr(site, key, value)



    write_audit(

        db,

        user,

        "Updated site",

        "Sites",

        study=study,

        record_id=site.id,

    )



    db.commit()

    db.refresh(site)



    return to_site_out(site, study.study_id)





@app.delete("/api/sites/{site_id}")

def delete_site(

    site_id: str,

    user: User = Depends(get_current_user),

    db: Session = Depends(get_db),

):

    site = db.get(Site, site_id)



    if not site:

        raise HTTPException(status_code=404, detail="Site not found")



    study = get_study_for_user(db, user, site.study_id)



    if not user_can_manage_operations(user, study):

        raise HTTPException(status_code=403, detail="Not permitted")



    db.delete(site)

    refresh_site_count(db, study)



    write_audit(

        db,

        user,

        "Deleted site",

        "Sites",

        study=study,

        record_id=site.id,

    )



    db.commit()



    return {"message": "Site deleted successfully"}





# ============================================================

# RECRUITMENT

# ============================================================



@app.get(

    "/api/studies/{study_key}/recruitment",

    response_model=list[RecruitmentOut],

)

def list_recruitment(

    study_key: str,

    user: User = Depends(get_current_user),

    db: Session = Depends(get_db),

):

    study = get_study_for_user(db, user, study_key)



    rows = (

        db.query(Recruitment)

        .filter(Recruitment.study_id == study.id)

        .order_by(Recruitment.id)

        .all()

    )



    return [

        to_recruitment_out(row, study.study_id)

        for row in rows

    ]





@app.post(

    "/api/studies/{study_key}/recruitment",

    response_model=RecruitmentOut,

    status_code=status.HTTP_201_CREATED,

)

def create_recruitment(

    study_key: str,

    payload: RecruitmentWrite,

    user: User = Depends(get_current_user),

    db: Session = Depends(get_db),

):

    study = get_study_for_user(db, user, study_key)



    if not user_can_manage_operations(user, study):

        raise HTTPException(status_code=403, detail="Not permitted")



    existing = (

        db.query(Recruitment)

        .filter(

            Recruitment.study_id == study.id,

            Recruitment.month == payload.month,

        )

        .first()

    )



    if existing:

        raise HTTPException(

            status_code=409,

            detail="Recruitment data already exists for this month",

        )



    row = Recruitment(

        study_id=study.id,

        month=payload.month,

        planned=payload.planned,

        actual=payload.actual,

    )



    db.add(row)



    write_audit(

        db,

        user,

        "Added recruitment data",

        "Recruitment",

        study=study,

        record_id=payload.month,

    )



    db.commit()

    db.refresh(row)



    return to_recruitment_out(row, study.study_id)





@app.patch("/api/recruitment/{recruitment_id}")

def update_recruitment(

    recruitment_id: str,

    payload: RecruitmentWrite,

    user: User = Depends(get_current_user),

    db: Session = Depends(get_db),

):

    row = db.get(Recruitment, recruitment_id)



    if not row:

        raise HTTPException(status_code=404, detail="Recruitment record not found")



    study = get_study_for_user(db, user, row.study_id)



    if not user_can_manage_operations(user, study):

        raise HTTPException(status_code=403, detail="Not permitted")



    row.month = payload.month

    row.planned = payload.planned

    row.actual = payload.actual



    write_audit(

        db,

        user,

        "Updated recruitment data",

        "Recruitment",

        study=study,

        record_id=row.id,

    )



    db.commit()

    db.refresh(row)



    return to_recruitment_out(row, study.study_id)





# ============================================================

# MILESTONES

# ============================================================



@app.get(

    "/api/studies/{study_key}/milestones",

    response_model=list[MilestoneOut],

)

def list_milestones(

    study_key: str,

    user: User = Depends(get_current_user),

    db: Session = Depends(get_db),

):

    study = get_study_for_user(db, user, study_key)



    rows = (

        db.query(Milestone)

        .filter(Milestone.study_id == study.id)

        .order_by(Milestone.due_date.asc())

        .all()

    )



    return [

        to_milestone_out(row, study.study_id)

        for row in rows

    ]





@app.post(

    "/api/studies/{study_key}/milestones",

    response_model=MilestoneOut,

    status_code=status.HTTP_201_CREATED,

)

def create_milestone(

    study_key: str,

    payload: MilestoneWrite,

    user: User = Depends(get_current_user),

    db: Session = Depends(get_db),

):

    study = get_study_for_user(db, user, study_key)



    if not user_can_manage_operations(user, study):

        raise HTTPException(status_code=403, detail="Not permitted")



    row = Milestone(

        study_id=study.id,

        name=payload.name,

        description=payload.description,

        status=payload.status,

        due_date=payload.due_date,

        completed_date=payload.completed_date,

        responsible_person=payload.responsible_person,

    )



    db.add(row)



    write_audit(

        db,

        user,

        "Created milestone",

        "Milestones",

        study=study,

        record_id=payload.name,

    )



    db.commit()

    db.refresh(row)



    return to_milestone_out(row, study.study_id)





@app.patch("/api/milestones/{milestone_id}")

def update_milestone(

    milestone_id: str,

    payload: MilestoneUpdate,

    user: User = Depends(get_current_user),

    db: Session = Depends(get_db),

):

    row = db.get(Milestone, milestone_id)



    if not row:

        raise HTTPException(status_code=404, detail="Milestone not found")



    study = get_study_for_user(db, user, row.study_id)



    if not user_can_manage_operations(user, study):

        raise HTTPException(status_code=403, detail="Not permitted")



    for key, value in payload.model_dump(exclude_unset=True).items():

        setattr(row, key, value)



    write_audit(

        db,

        user,

        "Updated milestone",

        "Milestones",

        study=study,

        record_id=row.id,

    )



    db.commit()

    db.refresh(row)



    return to_milestone_out(row, study.study_id)





@app.delete("/api/milestones/{milestone_id}")

def delete_milestone(

    milestone_id: str,

    user: User = Depends(get_current_user),

    db: Session = Depends(get_db),

):

    row = db.get(Milestone, milestone_id)



    if not row:

        raise HTTPException(status_code=404, detail="Milestone not found")



    study = get_study_for_user(db, user, row.study_id)



    if not user_can_manage_operations(user, study):

        raise HTTPException(status_code=403, detail="Not permitted")



    db.delete(row)



    write_audit(

        db,

        user,

        "Deleted milestone",

        "Milestones",

        study=study,

        record_id=row.id,

    )



    db.commit()



    return {"message": "Milestone deleted successfully"}





# ============================================================

# ALERTS

# ============================================================



@app.get("/api/alerts", response_model=list[AlertOut])

def list_alerts(

    status_filter: str | None = None,

    severity: str | None = None,

    user: User = Depends(get_current_user),

    db: Session = Depends(get_db),

):

    query = db.query(Alert)



    if user.role != "administrator":

        studies = assigned_study_query(db, user).all()

        study_ids = [study.id for study in studies]

        query = query.filter(

            Alert.study_id.in_(

                study_ids or ["00000000-0000-0000-0000-000000000000"]

            )

        )



    if status_filter:

        query = query.filter(Alert.status == status_filter)



    if severity:

        query = query.filter(Alert.severity == severity)



    rows = query.order_by(Alert.created_at.desc()).all()



    return [

        to_alert_out(

            row,

            row.study.study_id if row.study else None,

        )

        for row in rows

    ]





@app.post(

    "/api/alerts",

    response_model=AlertOut,

    status_code=status.HTTP_201_CREATED,

)

def create_alert(

    payload: AlertWrite,

    user: User = Depends(get_current_user),

    db: Session = Depends(get_db),

):

    study = None



    if payload.study_id:

        study = get_study_for_user(db, user, payload.study_id)



        if not user_can_manage_operations(user, study):

            raise HTTPException(status_code=403, detail="Not permitted")



    row = Alert(

        study_id=study.id if study else None,

        title=payload.title,

        description=payload.description,

        severity=payload.severity,

        status=payload.status,

        due_date=payload.due_date,

        category=payload.category,

    )



    db.add(row)



    write_audit(

        db,

        user,

        "Created alert",

        "Alerts",

        study=study,

        record_id=row.title,

    )



    db.commit()

    db.refresh(row)



    return to_alert_out(

        row,

        study.study_id if study else None,

    )





@app.patch("/api/alerts/{alert_id}")

def update_alert(

    alert_id: str,

    payload: AlertUpdate,

    user: User = Depends(get_current_user),

    db: Session = Depends(get_db),

):

    row = db.get(Alert, alert_id)



    if not row:

        raise HTTPException(status_code=404, detail="Alert not found")



    study = None



    if row.study_id:

        study = get_study_for_user(db, user, row.study_id)



        if not user_can_manage_operations(user, study):

            raise HTTPException(status_code=403, detail="Not permitted")



    for key, value in payload.model_dump(exclude_unset=True).items():

        setattr(row, key, value)



    write_audit(

        db,

        user,

        "Updated alert",

        "Alerts",

        study=study,

        record_id=row.id,

    )



    db.commit()

    db.refresh(row)



    return to_alert_out(

        row,

        study.study_id if study else None,

    )





# ============================================================

# AUDIT TRAIL

# ============================================================



@app.get("/api/audit", response_model=list[AuditLogOut])

def audit_logs(

    module: str | None = None,

    limit: int = Query(100, ge=1, le=500),

    user: User = Depends(get_current_user),

    db: Session = Depends(get_db),

):

    query = db.query(AuditLog)



    if user.role != "administrator":

        studies = assigned_study_query(db, user).all()

        study_ids = [study.id for study in studies]



        query = query.filter(

            or_(

                AuditLog.user_id == user.id,

                AuditLog.study_id.in_(

                    study_ids or ["00000000-0000-0000-0000-000000000000"]

                ),

            )

        )



    if module:

        query = query.filter(AuditLog.module == module)



    rows = (

        query

        .order_by(AuditLog.timestamp.desc())

        .limit(limit)

        .all()

    )



    return [to_audit_out(row) for row in rows]





# ============================================================

# USERS

# ============================================================



@app.get("/api/users", response_model=list[UserOut])

def list_users(

    user: User = Depends(require_roles("administrator")),

    db: Session = Depends(get_db),

):

    users = db.query(User).order_by(User.name.asc()).all()



    return [

        to_user_out(

            item,

            user_study_codes(db, item),

        )

        for item in users

    ]





@app.patch("/api/users/{user_id}", response_model=UserOut)

def update_user(

    user_id: str,

    payload: UserUpdate,

    user: User = Depends(require_roles("administrator")),

    db: Session = Depends(get_db),

):

    target = db.get(User, user_id)



    if not target:

        raise HTTPException(status_code=404, detail="User not found")



    values = payload.model_dump(exclude_unset=True)



    if "role" in values and values["role"] not in {

        "administrator",

        "principal_investigator",

        "study_coordinator",

        "Administrator",

        "Principal Investigator",

        "Study Coordinator",

    }:

        raise HTTPException(status_code=400, detail="Invalid role")



    role_map = {

        "Administrator": "administrator",

        "Principal Investigator": "principal_investigator",

        "Study Coordinator": "study_coordinator",

    }



    for key, value in values.items():

        if key == "role":

            value = role_map.get(value, value)

        setattr(target, key, value)



    write_audit(

        db,

        user,

        "Updated user",

        "Users",

        record_id=target.id,

    )



    db.commit()

    db.refresh(target)



    return to_user_out(

        target,

        user_study_codes(db, target),

    )





# ============================================================

# ROOT

# ============================================================



@app.get("/")

def root():

    return {

        "name": "AIIA Clinical Trial Management System API",

        "version": "1.0.0",

        "docs": "/docs",

        "health": "/api/health",

    }