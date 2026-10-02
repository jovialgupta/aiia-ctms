from datetime import date, datetime, UTC

from app.database import Base, SessionLocal, engine
from app.models import (
    Alert,
    AuditLog,
    Milestone,
    Recruitment,
    Site,
    Study,
    User,
)
from app.utils.security import hash_password


Base.metadata.create_all(bind=engine)

db = SessionLocal()


def get_or_create_user(
    name: str,
    email: str,
    role: str,
    password: str = "AIIA@123",
):
    user = db.query(User).filter(User.email == email).first()

    if user:
        return user

    user = User(
        name=name,
        email=email,
        role=role,
        password_hash=hash_password(password),
        is_active=True,
        last_active=datetime.now(UTC),
    )

    db.add(user)
    db.flush()

    return user


try:
    # ========================================================
    # USERS
    # ========================================================

    admin = get_or_create_user(
        "AIIA Administrator",
        "admin@aiia-ctms.local",
        "administrator",
    )

    pi1 = get_or_create_user(
        "Dr. Ananya Sharma",
        "ananya@aiia-ctms.local",
        "principal_investigator",
    )

    pi2 = get_or_create_user(
        "Dr. Rahul Mehta",
        "rahul@aiia-ctms.local",
        "principal_investigator",
    )

    coord1 = get_or_create_user(
        "Priya Nair",
        "priya@aiia-ctms.local",
        "study_coordinator",
    )

    coord2 = get_or_create_user(
        "Arjun Kapoor",
        "arjun@aiia-ctms.local",
        "study_coordinator",
    )

    # ========================================================
    # STUDIES
    # ========================================================

    studies_data = [
        (
            "AIIA-CT-001",
            "Ayurvedic Intervention for Type 2 Diabetes",
            "Interventional",
            "Phase III",
            "Active",
            300,
            242,
            "Approved",
            "Registered",
            "Metabolic Disorders",
            pi1,
            coord1,
        ),
        (
            "AIIA-CT-002",
            "Ayurvedic Management of Osteoarthritis",
            "Interventional",
            "Phase II",
            "Recruiting",
            240,
            181,
            "Approved",
            "Registered",
            "Musculoskeletal",
            pi2,
            coord2,
        ),
        (
            "AIIA-CT-003",
            "Yoga-Based Stress Management Study",
            "Interventional",
            "Phase II",
            "Active",
            180,
            151,
            "Approved",
            "Registered",
            "Mental Wellness",
            pi1,
            coord1,
        ),
        (
            "AIIA-CT-004",
            "Ayurvedic Supportive Care in Hypertension",
            "Interventional",
            "Phase III",
            "Recruiting",
            350,
            226,
            "Approved",
            "Update Due",
            "Cardiology",
            pi2,
            coord1,
        ),
        (
            "AIIA-CT-005",
            "Herbal Intervention for Chronic Gastritis",
            "Interventional",
            "Phase II",
            "CTRI Pending",
            160,
            82,
            "Approved",
            "Not Registered",
            "Gastroenterology",
            pi1,
            coord2,
        ),
        (
            "AIIA-CT-006",
            "Ayurvedic Therapy for Migraine",
            "Interventional",
            "Phase II",
            "Ethics Pending",
            120,
            0,
            "Submitted",
            "Not Registered",
            "Neurology",
            pi2,
            coord2,
        ),
        (
            "AIIA-CT-007",
            "Lifestyle Intervention in Obesity",
            "Interventional",
            "Phase III",
            "Active",
            400,
            326,
            "Approved",
            "Registered",
            "Obesity",
            pi1,
            coord1,
        ),
        (
            "AIIA-CT-008",
            "Ayurvedic Skin Health Study",
            "Interventional",
            "Phase II",
            "Follow-up",
            200,
            178,
            "Approved",
            "Registered",
            "Dermatology",
            pi2,
            coord2,
        ),
    ]

    studies = []

    for (
        code,
        title,
        study_type,
        phase,
        status,
        target,
        enrolled,
        iec,
        ctri,
        area,
        pi,
        coordinator,
    ) in studies_data:

        study = db.query(Study).filter(Study.study_id == code).first()

        if not study:
            study = Study(
                study_id=code,
                title=title,
                description=f"Synthetic clinical trial study: {title}.",
                principal_investigator_id=pi.id,
                coordinator_id=coordinator.id,
                study_type=study_type,
                phase=phase,
                status=status,
                target_participants=target,
                enrolled_participants=enrolled,
                screened_participants=int(enrolled * 1.25),
                randomized_participants=int(enrolled * 0.85),
                withdrawn_participants=int(enrolled * 0.04),
                site_count=0,
                iec_status=iec,
                iec_approval_date=date(2026, 2, 15) if iec == "Approved" else None,
                ctri_status=ctri,
                ctri_registration_date=date(2026, 3, 1) if ctri == "Registered" else None,
                start_date=date(2026, 1, 15),
                expected_end_date=date(2027, 12, 31),
                therapeutic_area=area,
                protocol_deviations=2 if status != "Ethics Pending" else 0,
                data_queries=8 if status != "Ethics Pending" else 0,
            )

            db.add(study)
            db.flush()

        studies.append(study)

    # ========================================================
    # SITES
    # ========================================================

    locations = [
        "New Delhi",
        "Srinagar",
        "Bengaluru",
        "Mumbai",
        "Hyderabad",
        "Jaipur",
        "Lucknow",
        "Pune",
        "Chandigarh",
        "Kolkata",
        "Chennai",
        "Ahmedabad",
    ]

    for index, location in enumerate(locations):
        study = studies[index % len(studies)]

        existing = (
            db.query(Site)
            .filter(
                Site.study_id == study.id,
                Site.name == f"AIIA Research Site {index + 1}",
            )
            .first()
        )

        if existing:
            continue

        target = 40 + (index % 4) * 10
        enrolled = min(target, 20 + index * 4)

        site = Site(
            study_id=study.id,
            name=f"AIIA Research Site {index + 1}",
            location=location,
            target_participants=target,
            enrolled_participants=enrolled,
            status="On Track" if index % 4 != 3 else "At Risk",
        )

        db.add(site)

    db.flush()

    for study in studies:
        study.site_count = (
            db.query(Site)
            .filter(Site.study_id == study.id)
            .count()
        )

    # ========================================================
    # RECRUITMENT
    # ========================================================

    months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
    ]

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

            if existing:
                continue

            planned = 15 + (i * 2)
            actual = max(0, planned - ((i + len(study.study_id)) % 5))

            db.add(
                Recruitment(
                    study_id=study.id,
                    month=month,
                    planned=planned,
                    actual=actual,
                )
            )

    # ========================================================
    # MILESTONES
    # ========================================================

    milestone_templates = [
        ("IEC Approval", "completed", "15 Feb 2026"),
        ("CTRI Registration", "completed", "01 Mar 2026"),
        ("Site Activation", "completed", "20 Mar 2026"),
        ("Interim Monitoring", "upcoming", "15 Oct 2026"),
        ("Annual IEC Renewal", "upcoming", "15 Feb 2027"),
    ]

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

            if existing:
                continue

            completed = (
                milestone_date
                if milestone_status == "completed"
                else None
            )

            db.add(
                Milestone(
                    study_id=study.id,
                    name=name,
                    description=f"{name} milestone for {study.study_id}",
                    status=milestone_status,
                    due_date=milestone_date,
                    completed_date=completed,
                    responsible_person="Study Coordinator",
                )
            )

    # ========================================================
    # ALERTS
    # ========================================================

    alert_data = [
        (
            "IEC renewal approaching",
            "Annual IEC renewal is approaching for the study.",
            "Warning",
            "Open",
            "IEC",
        ),
        (
            "CTRI update required",
            "CTRI record requires an update.",
            "Critical",
            "Open",
            "CTRI",
        ),
        (
            "Monitoring visit due",
            "Monitoring visit is due this month.",
            "Warning",
            "Open",
            "Monitoring",
        ),
        (
            "Data query backlog",
            "Several data queries remain unresolved.",
            "Info",
            "Open",
            "Data Quality",
        ),
        (
            "Protocol deviation review",
            "Protocol deviations require investigator review.",
            "Warning",
            "Open",
            "Compliance",
        ),
    ]

    for i, study in enumerate(studies[:5]):

        title, description, severity, alert_status, category = alert_data[i]

        existing = (
            db.query(Alert)
            .filter(
                Alert.study_id == study.id,
                Alert.title == title,
            )
            .first()
        )

        if existing:
            continue

        db.add(
            Alert(
                study_id=study.id,
                title=title,
                description=description,
                severity=severity,
                status=alert_status,
                due_date="15 Oct 2026",
                category=category,
            )
        )

    # ========================================================
    # AUDIT LOGS
    # ========================================================

    existing_audit = db.query(AuditLog).count()

    if existing_audit == 0:

        actions = [
            ("Study created", "Studies"),
            ("Recruitment updated", "Recruitment"),
            ("IEC milestone completed", "Milestones"),
            ("Alert reviewed", "Alerts"),
            ("Site activated", "Sites"),
            ("User profile updated", "Users"),
        ]

        for i, (action, module) in enumerate(actions):
            study = studies[i % len(studies)]

            db.add(
                AuditLog(
                    user_id=admin.id,
                    study_id=study.id,
                    action=action,
                    module=module,
                    record_id=study.study_id,
                    extra_data={
                        "record": study.study_id,
                        "status": "Success",
                    },
                )
            )

    db.commit()

    print()
    print("=" * 60)
    print("AIIA CTMS DEMO DATABASE SEEDED SUCCESSFULLY")
    print("=" * 60)
    print()
    print("Demo accounts:")
    print()
    print("Administrator")
    print("  Email: admin@aiia-ctms.local")
    print("  Password: AIIA@123")
    print()
    print("Principal Investigator")
    print("  Email: ananya@aiia-ctms.local")
    print("  Password: AIIA@123")
    print()
    print("Study Coordinator")
    print("  Email: priya@aiia-ctms.local")
    print("  Password: AIIA@123")
    print()
    print("Database seeded successfully.")
    print()

except Exception:
    db.rollback()
    raise

finally:
    db.close()