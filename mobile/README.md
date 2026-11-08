# Axxess Clinician & Field Nurse Mobile App (React Native)

Designed for registered nurses (RNs), physical therapists (PTs), home health aides (HHAs), and hospice coordinators delivering in-home care.

## Key Features
- **Offline-First Field Charting**: Record vital signs, wound photos, and OASIS-E1 assessments without active cellular connectivity.
- **GPS-Assisted Electronic Visit Verification (EVV)**: 21st Century Cures Act compliant check-in/check-out timestamping.
- **Turn-by-turn Route Optimization**: Daily scheduled patient visit routing with live ETA updates to agency dispatch.
- **HIPAA-Compliant Real-Time Chat**: Immediate escalation to clinical supervisors and on-call physicians.

## Project Structure
```
mobile/
├── src/
│   ├── assets/
│   ├── components/      # Touch-optimized mobile UI widgets
│   ├── navigation/      # Stack & bottom tab navigators
│   ├── screens/
│   │   ├── TodayVisitsScreen.tsx
│   │   ├── PatientDetailScreen.tsx
│   │   ├── VitalSignsRecordScreen.tsx
│   │   └── OfflineSyncScreen.tsx
│   ├── services/        # SQLite local cache + Backend Sync API
│   └── types/
├── app.json
└── package.json
```
