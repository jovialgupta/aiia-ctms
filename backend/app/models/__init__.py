from datetime import UTC, datetime
from enum import Enum
from uuid import uuid4

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(UTC)


class UserRole(str, Enum):
    ADMINISTRATOR = "administrator"
    PRINCIPAL_INVESTIGATOR = "principal_investigator"
    STUDY_COORDINATOR = "study_coordinator"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(64), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_active: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    studies_as_pi: Mapped[list["Study"]] = relationship(back_populates="principal_investigator", foreign_keys="Study.principal_investigator_id")
    studies_as_coordinator: Mapped[list["Study"]] = relationship(back_populates="coordinator", foreign_keys="Study.coordinator_id")
    audit_logs: Mapped[list["AuditLog"]] = relationship(back_populates="user")


class Study(Base):
    __tablename__ = "studies"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    study_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(400), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    principal_investigator_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    coordinator_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    study_type: Mapped[str] = mapped_column(String(64), nullable=False)
    phase: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(64), nullable=False)
    target_participants: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    enrolled_participants: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    screened_participants: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    randomized_participants: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    withdrawn_participants: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    site_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    iec_status: Mapped[str] = mapped_column(String(64), nullable=False)
    iec_approval_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    ctri_status: Mapped[str] = mapped_column(String(64), nullable=False)
    ctri_registration_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    start_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    expected_end_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    therapeutic_area: Mapped[str | None] = mapped_column(String(160), nullable=True)
    protocol_deviations: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    data_queries: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    principal_investigator: Mapped[User | None] = relationship(foreign_keys=[principal_investigator_id], back_populates="studies_as_pi")
    coordinator: Mapped[User | None] = relationship(foreign_keys=[coordinator_id], back_populates="studies_as_coordinator")
    sites: Mapped[list["Site"]] = relationship(back_populates="study", cascade="all, delete-orphan")
    recruitment: Mapped[list["Recruitment"]] = relationship(back_populates="study", cascade="all, delete-orphan")
    milestones: Mapped[list["Milestone"]] = relationship(back_populates="study", cascade="all, delete-orphan")
    alerts: Mapped[list["Alert"]] = relationship(back_populates="study")


class Site(Base):
    __tablename__ = "sites"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    study_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("studies.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    target_participants: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    enrolled_participants: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    study: Mapped[Study] = relationship(back_populates="sites")


class Recruitment(Base):
    __tablename__ = "recruitment"
    __table_args__ = (UniqueConstraint("study_id", "month", name="uq_recruitment_study_month"),)

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    study_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("studies.id", ondelete="CASCADE"), nullable=False, index=True)
    month: Mapped[str] = mapped_column(String(32), nullable=False)
    planned: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    actual: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    study: Mapped[Study] = relationship(back_populates="recruitment")


class Milestone(Base):
    __tablename__ = "milestones"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    study_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("studies.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    due_date: Mapped[str | None] = mapped_column(String(64), nullable=True)
    completed_date: Mapped[str | None] = mapped_column(String(64), nullable=True)
    responsible_person: Mapped[str | None] = mapped_column(String(160), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    study: Mapped[Study] = relationship(back_populates="milestones")


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    study_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("studies.id", ondelete="SET NULL"), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(400), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    severity: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    due_date: Mapped[str | None] = mapped_column(String(64), nullable=True)
    category: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    study: Mapped[Study | None] = relationship(back_populates="alerts")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    study_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("studies.id", ondelete="SET NULL"), nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    module: Mapped[str] = mapped_column(String(64), nullable=False)
    record_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    extra_data: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)

    user: Mapped[User | None] = relationship(back_populates="audit_logs")
    study: Mapped[Study | None] = relationship()
