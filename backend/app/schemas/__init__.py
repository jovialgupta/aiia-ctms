from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: str
    password: str


class UserOut(ORMModel):
    id: str
    name: str
    email: str
    role: str
    is_active: bool
    studies: list[str] = []
    status: str
    last_active: str | None = None
    initials: str


class StudyOut(ORMModel):
    id: str
    study_id: str
    title: str
    description: str | None = None
    principal_investigator: str
    pi_id: str | None = None
    coordinator_id: str | None = None
    coordinator_name: str | None = None
    type: str
    phase: str
    status: str
    sites: int
    target: int
    enrolled: int
    screened: int
    randomized: int
    withdrawn: int
    iec_status: str
    ctri_status: str
    start_date: str | None = None
    therapeutic_area: str | None = None


class StudyWrite(BaseModel):
    study_id: str | None = None
    title: str
    description: str | None = None
    principal_investigator_id: str | None = None
    coordinator_id: str | None = None
    study_type: str
    phase: str
    status: str
    target_participants: int = 0
    enrolled_participants: int = 0
    screened_participants: int = 0
    randomized_participants: int = 0
    withdrawn_participants: int = 0
    site_count: int = 0
    iec_status: str
    ctri_status: str
    start_date: date | None = None
    expected_end_date: date | None = None
    therapeutic_area: str | None = None


class StudyUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    principal_investigator_id: str | None = None
    coordinator_id: str | None = None
    study_type: str | None = None
    phase: str | None = None
    status: str | None = None
    target_participants: int | None = None
    enrolled_participants: int | None = None
    screened_participants: int | None = None
    randomized_participants: int | None = None
    withdrawn_participants: int | None = None
    site_count: int | None = None
    iec_status: str | None = None
    ctri_status: str | None = None
    start_date: date | None = None
    expected_end_date: date | None = None
    therapeutic_area: str | None = None


class SiteOut(ORMModel):
    id: str
    study_id: str
    name: str
    location: str | None = None
    target: int
    enrolled: int
    status: str
    progress: int


class SiteWrite(BaseModel):
    name: str
    location: str | None = None
    target_participants: int = 0
    enrolled_participants: int = 0
    status: str = "On Track"


class SiteUpdate(BaseModel):
    name: str | None = None
    location: str | None = None
    target_participants: int | None = None
    enrolled_participants: int | None = None
    status: str | None = None


class RecruitmentOut(ORMModel):
    id: str
    study_id: str
    month: str
    planned: int
    actual: int


class RecruitmentWrite(BaseModel):
    month: str
    planned: int
    actual: int


class MilestoneOut(ORMModel):
    id: str
    study_id: str
    name: str
    description: str | None = None
    status: str
    date: str | None = None
    due_date: str | None = None
    completed_date: str | None = None
    responsible: str | None = None


class MilestoneWrite(BaseModel):
    name: str
    description: str | None = None
    status: str = "upcoming"
    due_date: str | None = None
    completed_date: str | None = None
    responsible_person: str | None = None


class MilestoneUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    status: str | None = None
    due_date: str | None = None
    completed_date: str | None = None
    responsible_person: str | None = None


class AlertOut(ORMModel):
    id: str
    study_id: str | None = None
    study_code: str | None = None
    title: str
    description: str | None = None
    severity: str
    status: str
    due_date: str | None = None
    date: str | None = None
    category: str | None = None


class AlertWrite(BaseModel):
    study_id: str | None = None
    title: str
    description: str | None = None
    severity: str
    status: str = "Open"
    due_date: str | None = None
    category: str | None = None


class AlertUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    severity: str | None = None
    status: str | None = None
    due_date: str | None = None
    category: str | None = None


class AuditLogOut(ORMModel):
    id: str
    timestamp: str
    user: str
    role: str
    action: str
    study_id: str
    record: str
    status: str = "Success"
    module: str


class UserUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    is_active: bool | None = None


class DashboardSummary(BaseModel):
    active_studies: int
    total_participants: int
    recruitment_progress: float
    active_sites: int
    pending_iec: int
    ctri_due: int
    protocol_deviations: int
    data_queries: int
    trends: dict[str, str]
    iec_completed: int
    iec_pending: int
    ctri_registered: int
    ctri_actions_due: int
    sites_active: int
    sites_pending: int
    monitoring_upcoming: int
    monitoring_overdue: int


class StatusSlice(BaseModel):
    name: str
    value: int


class PortfolioRecruitment(BaseModel):
    target: int
    enrolled: int
    progress: float
    monthly: list[RecruitmentOut] = Field(default_factory=list)


class SearchHit(BaseModel):
    id: str
    type: str
    title: str
    subtitle: str
    href: str
