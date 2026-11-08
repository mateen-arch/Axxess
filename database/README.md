# PostgreSQL Database Architecture & Migrations

Relational schema supporting multi-tenant healthcare organizations (Standards Home Care), clinicians, patients, EHR visits, EVV verification, intake pipelines, and clinical messaging.

## Setup Instructions

1. **Prerequisites**: PostgreSQL 15+ installed and running.
2. **Create Database**:
   ```sql
   CREATE DATABASE axxess_healthcare;
   ```
3. **Execute Schema & Seeds**:
   ```bash
   psql -U postgres -d axxess_healthcare -f database/schema.sql
   psql -U postgres -d axxess_healthcare -f database/seeds/01_seed_data.sql
   ```
4. **Environment Variables**:
   In `backend/.env`:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/axxess_healthcare
   PORT=5000
   ```
