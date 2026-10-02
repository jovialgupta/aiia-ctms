from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Study, User

router = APIRouter(prefix="/studies", tags=["studies"])


@router.get("")
def get_studies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Study)

    # Administrators can see all studies.
    # Investigators and coordinators only see their assigned studies.
    if current_user.role == "principal_investigator":
        query = query.filter(
            Study.principal_investigator_id == current_user.id
        )
    elif current_user.role == "study_coordinator":
        query = query.filter(
            Study.coordinator_id == current_user.id
        )

    studies = query.order_by(Study.study_id).all()

    return [
        {
            "id": study.study_id,
            "title": study.title,
            "description": study.description,
            "principalInvestigator": (
                study.principal_investigator.name
                if study.principal_investigator
                else None
            ),
            "piId": study.principal_investigator_id,
            "coordinator": (
                study.coordinator.name
                if study.coordinator
                else None
            ),
            "coordinatorId": study.coordinator_id,
            "type": study.study_type,
            "phase": study.phase,
            "status": study.status,
            "sites": study.site_count,
            "target": study.target_participants,
            "enrolled": study.enrolled_participants,
            "screened": study.screened_participants,
            "randomized": study.randomized_participants,
            "withdrawn": study.withdrawn_participants,
            "iecStatus": study.iec_status,
            "iecApprovalDate": study.iec_approval_date,
            "ctriStatus": study.ctri_status,
            "ctriRegistrationDate": study.ctri_registration_date,
            "startDate": study.start_date,
            "expectedEndDate": study.expected_end_date,
            "therapeuticArea": study.therapeutic_area,
            "protocolDeviations": study.protocol_deviations,
            "dataQueries": study.data_queries,
        }
        for study in studies
    ]