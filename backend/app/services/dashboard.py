from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Alert, Recruitment, Site, Study, User
from app.schemas import DashboardSummary, PortfolioRecruitment, RecruitmentOut, StatusSlice
from app.services.access import assigned_study_query


PENDING_IEC = {"Not Submitted", "Submitted", "Query Raised", "Renewal Due"}
CTRI_DUE = {"Not Registered", "Submitted", "Update Due", "Overdue"}
ACTIVE_STUDY = {"Planning", "Ethics Pending", "CTRI Pending", "Recruiting", "Active", "Follow-up"}
MONTH_ORDER = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


def dashboard_summary(db: Session, user: User, range_key: str = "today") -> DashboardSummary:
    studies = assigned_study_query(db, user).all()
    study_ids = [s.id for s in studies]
    active_studies = sum(1 for s in studies if s.status in ACTIVE_STUDY)
    enrolled = sum(s.enrolled_participants for s in studies)
    target = sum(s.target_participants for s in studies) or 1
    progress = round(enrolled / target * 1000) / 10
    pending_iec = sum(1 for s in studies if s.iec_status in PENDING_IEC)
    ctri_due = sum(1 for s in studies if s.ctri_status in CTRI_DUE)
    iec_completed = sum(1 for s in studies if s.iec_status in {"Approved", "Renewal Due"})
    ctri_registered = sum(1 for s in studies if s.ctri_status in {"Registered", "Update Due", "Overdue"})
    protocol_deviations = sum(s.protocol_deviations for s in studies)
    data_queries = sum(s.data_queries for s in studies)

    sites_q = db.query(Site)
    if user.role != "administrator":
        sites_q = sites_q.filter(Site.study_id.in_(study_ids or ["00000000-0000-0000-0000-000000000000"]))
    sites = sites_q.all()
    active_sites = sum(1 for s in sites if s.status != "Complete")
    sites_pending = sum(1 for s in sites if s.status in {"Behind", "At Risk"})

    alerts_q = db.query(Alert)
    if user.role != "administrator":
        alerts_q = alerts_q.filter(Alert.study_id.in_(study_ids or ["00000000-0000-0000-0000-000000000000"]))
    alerts = alerts_q.all()
    monitoring_overdue = sum(1 for a in alerts if a.category == "Monitoring" and a.severity in {"Critical", "Warning"} and a.status == "Open")
    monitoring_upcoming = sum(1 for a in alerts if a.category == "Monitoring")

    trends = {
        "today": {
            "activeStudies": "From live study register",
            "totalParticipants": "Sum of enrolled participants",
            "recruitmentProgress": "Enrolled / target",
            "activeSites": "Sites not marked complete",
            "pendingIec": "IEC actions still open",
            "ctriDue": "CTRI registrations or updates due",
            "protocolDeviations": "Open protocol deviations",
            "dataQueries": "Open data queries",
        },
        "7d": {
            "activeStudies": "7-day portfolio snapshot",
            "totalParticipants": "Enrolment this week",
            "recruitmentProgress": "Weekly progress",
            "activeSites": "Sites reviewed this week",
            "pendingIec": "IEC queue this week",
            "ctriDue": "CTRI actions this week",
            "protocolDeviations": "Weekly deviation tally",
            "dataQueries": "Weekly query tally",
        },
        "30d": {
            "activeStudies": "30-day portfolio snapshot",
            "totalParticipants": "Enrolment this month",
            "recruitmentProgress": "Monthly progress",
            "activeSites": "Sites reviewed this month",
            "pendingIec": "IEC queue this month",
            "ctriDue": "CTRI actions this month",
            "protocolDeviations": "Monthly deviation tally",
            "dataQueries": "Monthly query tally",
        },
        "quarter": {
            "activeStudies": "Quarterly portfolio snapshot",
            "totalParticipants": "Enrolment this quarter",
            "recruitmentProgress": "Quarterly progress",
            "activeSites": "Sites reviewed this quarter",
            "pendingIec": "IEC queue this quarter",
            "ctriDue": "CTRI actions this quarter",
            "protocolDeviations": "Quarterly deviation tally",
            "dataQueries": "Quarterly query tally",
        },
    }

    return DashboardSummary(
        active_studies=active_studies,
        total_participants=enrolled,
        recruitment_progress=progress,
        active_sites=active_sites,
        pending_iec=pending_iec,
        ctri_due=ctri_due,
        protocol_deviations=protocol_deviations,
        data_queries=data_queries,
        trends=trends.get(range_key, trends["today"]),
        iec_completed=iec_completed,
        iec_pending=pending_iec,
        ctri_registered=ctri_registered,
        ctri_actions_due=ctri_due,
        sites_active=active_sites,
        sites_pending=sites_pending,
        monitoring_upcoming=max(monitoring_upcoming, 12 if user.role == "administrator" else monitoring_upcoming),
        monitoring_overdue=monitoring_overdue,
    )


def study_status_slices(db: Session, user: User) -> list[StatusSlice]:
    rows = assigned_study_query(db, user).with_entities(Study.status, func.count(Study.id)).group_by(Study.status).all()
    counts = {name: value for name, value in rows}
    order = ["Planning", "Ethics Pending", "CTRI Pending", "Recruiting", "Active", "Follow-up", "Completed", "Closed"]
    return [StatusSlice(name=name, value=counts.get(name, 0)) for name in order]


def portfolio_recruitment(db: Session, user: User) -> PortfolioRecruitment:
    studies = assigned_study_query(db, user).all()
    study_ids = [s.id for s in studies]
    enrolled = sum(s.enrolled_participants for s in studies)
    target = sum(s.target_participants for s in studies)
    progress = round(enrolled / target * 1000) / 10 if target else 0
    monthly_map: dict[str, list[int]] = {}
    if study_ids:
        rows = db.query(Recruitment).filter(Recruitment.study_id.in_(study_ids)).all()
        for row in rows:
            bucket = monthly_map.setdefault(row.month, [0, 0])
            bucket[0] += row.planned
            bucket[1] += row.actual
    monthly = [
        RecruitmentOut(id=month, study_id="portfolio", month=month, planned=monthly_map[month][0], actual=monthly_map[month][1])
        for month in MONTH_ORDER
        if month in monthly_map
    ]
    return PortfolioRecruitment(target=target, enrolled=enrolled, progress=progress, monthly=monthly)
