# AIIA Clinical Research Management Platform

Phase 1 frontend prototype of a Clinical Trial Portfolio & Compliance Dashboard for the All India Institute of Ayurveda (AIIA).

This application centralizes study status, recruitment, milestones, IEC/CTRI tracking, alerts, and a simulated audit trail. It uses mock data only. It is designed to support future GCP, CTRI, DPDP and regulatory workflows and does **not** claim legal or clinical certification.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL printed by Vite (typically http://localhost:5173).

Use **Demo Login** on the sign-in page. Choose Principal Investigator, Study Coordinator, or Administrator.

## Build

```bash
npm run build
npm run preview
```

## Scope

Phase 1 covers portfolio visibility. Pharmacovigilance, MedDRA/WHO Drug, FHIR, ABDM, EDC, and CDISC outputs are listed as future work on the Settings page.
