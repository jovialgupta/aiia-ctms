# AIIA Clinical Trial Management System (CTMS)

A web-based Clinical Trial Management System prototype developed for the **All India Institute of Ayurveda (AIIA)**.**[Open AIIA CTMS](https://aiia-ctms-eta.vercel.app/)**

The platform provides a centralized workspace for managing clinical studies, recruitment, milestones, compliance, alerts, users, and audit activity.


---

## Features

- Role-based authentication
- Clinical study portfolio
- Detailed study management
- Study assignment for Principal Investigators and Study Coordinators
- Recruitment tracking
- Planned vs actual recruitment visualization
- Study lifecycle and milestone tracking
- IEC compliance tracking
- CTRI compliance tracking
- Operational and compliance alerts
- Data quality tracking
- Audit trail
- Role-based study access
- Dashboard with real-time study status
- Recruitment and portfolio analytics
- Responsive React + TypeScript interface
- PostgreSQL-backed persistent data
- FastAPI REST API

---

## User Roles

### Administrator

The Administrator has access to the complete clinical research portfolio.

Administrator can:

- View all studies
- View all recruitment data
- View all sites
- View milestones
- View compliance information
- View alerts
- View audit activity
- Manage users and system-level information

---

### Principal Investigator (PI)

The Principal Investigator is responsible for the overall scientific and clinical oversight of assigned studies.

A PI can:

- View assigned studies
- Monitor recruitment
- View study progress
- Monitor study milestones
- Review compliance information
- View alerts and study issues
- Monitor assigned sites and study activity

---

### Study Coordinator

The Study Coordinator handles the operational and day-to-day management of assigned studies.

A Study Coordinator can:

- View assigned studies
- Track recruitment
- Monitor study milestones
- Manage operational activities
- Monitor sites
- Review alerts
- Track compliance-related actions
- Support study documentation and coordination

---

The application maintains the same overall interface for different roles while restricting study data according to the authenticated user's assignments.

---

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts
- Lucide React

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn
- Psycopg
- Alembic

### Database

- PostgreSQL
- Neon PostgreSQL

### Deployment

- Vercel — Frontend
- Render — Backend
- Neon — Database

---

 ## System Architecture

                  ┌─────────────────────────┐
                  │     React Frontend      │
                  │   TypeScript + Vite     │
                  └────────────┬────────────┘
                               │
                               │ REST API
                               ▼
                  ┌─────────────────────────┐
                  │     FastAPI Backend     │
                  │ Authentication + APIs   │
                  └────────────┬────────────┘
                               │
                               │ SQLAlchemy / Psycopg
                               ▼
                  ┌─────────────────────────┐
                  │    PostgreSQL / Neon    │
                  │     Persistent Data     │
                  └─────────────────────────┘
                      
# Demo User Accounts

The system includes the following demo accounts for testing authentication and role-based access control.

| Name | Email | Password | Role |
|---|---|---|---|
| Administrator | `admin@aiia-ctms.local` | `AIIA@123` | Administrator |
| Ananya | `ananya@aiia-ctms.local` | `AIIA@123` | Principal Investigator (PI) |
| Priya | `priya@aiia-ctms.local` | `AIIA@123` | Study Coordinator |

### Administrator

**Email:** `admin@aiia-ctms.local`  
**Password:** `AIIA@123`  
**Role:** Administrator

The Administrator has access to all clinical studies and associated research data.

### Ananya

**Email:** `ananya@aiia-ctms.local`  
**Password:** `AIIA@123`  
**Role:** Principal Investigator (PI)

Ananya has access to the clinical studies assigned to her as Principal Investigator.

### Priya

**Email:** `priya@aiia-ctms.local`  
**Password:** `AIIA@123`  
**Role:** Study Coordinator

Priya has access to the clinical studies assigned to her as Study Coordinator.

> These credentials are provided for development/demo purposes only and should not be used as production credentials.



                  
                  
                  
                  
                  
                      
                      
