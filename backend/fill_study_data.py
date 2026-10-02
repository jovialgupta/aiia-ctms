from app.database import SessionLocal
from app.models import Study, Site, Recruitment, Milestone

db = SessionLocal()

try:
    studies = db.query(Study).order_by(Study.study_id).all()

    if not studies:
        raise RuntimeError("No studies found. Run seed.py first.")

    locations = [
        "New Delhi", "Srinagar", "Bengaluru", "Mumbai",
        "Hyderabad", "Jaipur", "Lucknow", "Pune",
        "Chandigarh", "Kolkata", "Chennai", "Ahmedabad",
    ]

    months = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
    ]

    milestone_templates = [
        ("IEC Approval", "completed", "15 Feb 2026"),
        ("CTRI Registration", "completed", "01 Mar 2026"),
        ("Site Activation", "completed", "20 Mar 2026"),
        ("Interim Monitoring", "upcoming", "15 Oct 2026"),
        ("Annual IEC Renewal", "upcoming", "15 Feb 2027"),
    ]

    # Give EVERY study at least one site.
    for i, study in enumerate(studies):
        existing_site = (
            db.query(Site)
            .filter(Site.study_id == study.id)
            .first()
        )

        if not existing_site:
            target = max(40, min(100, int(study.target_participants / 4)))
            enrolled = min(target, int(study.enrolled_participants / 4))

            db.add(
                Site(
                    study_id=study.id,
                    name=f"AIIA Research Site {i + 1}",
                    location=locations[i % len(locations)],
                    target_participants=target,
                    enrolled_participants=enrolled,
                    status="On Track",
                )
            )

    db.flush()

    # Update site counts.
    for study in studies:
        study.site_count = (
            db.query(Site)
            .filter(Site.study_id == study.id)
            .count()
        )

    # Give EVERY study 8 months of recruitment data.
    for study in studies:
        for i, month in enumerate(months):
            existing = (
                db.query(Recruitment)
                .filter(
                    Recruitment.study_id == study.id,
                    Recruitment.month == month,
                )
                .first()
            )

            if not existing:
                planned = 15 + (i * 2)
                actual = max(
                    0,
                    min(
                        planned,
                        round(
                            study.enrolled_participants
                            * (i + 1)
                            / len(months)
                            / 2
                        ),
                    ),
                )

                db.add(
                    Recruitment(
                        study_id=study.id,
                        month=month,
                        planned=planned,
                        actual=actual,
                    )
                )

    # Give EVERY study 5 milestones.
    for study in studies:
        for name, milestone_status, milestone_date in milestone_templates:
            existing = (
                db.query(Milestone)
                .filter(
                    Milestone.study_id == study.id,
                    Milestone.name == name,
                )
                .first()
            )

            if not existing:
                db.add(
                    Milestone(
                        study_id=study.id,
                        name=name,
                        description=f"{name} milestone for {study.study_id}",
                        status=milestone_status,
                        due_date=milestone_date,
                        completed_date=(
                            milestone_date
                            if milestone_status == "completed"
                            else None
                        ),
                        responsible_person="Study Coordinator",
                    )
                )

    db.commit()

    print("")
    print("=" * 60)
    print("STUDY DATA FILLED SUCCESSFULLY")
    print("=" * 60)
    print(f"Studies updated: {len(studies)}")
    print("Each study now has:")
    print("  - At least 1 site")
    print("  - 8 recruitment records")
    print("  - 5 milestones")
    print("")

except Exception:
    db.rollback()
    raise

finally:
    db.close()
