-- =====================================================================
-- PostgreSQL Database Schema for Axxess Healthcare Platform
-- High-performance, multi-tenant home health, home care & hospice EHR
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE service_line_enum AS ENUM ('home_health', 'home_care', 'hospice');
CREATE TYPE user_role_enum AS ENUM ('administrator', 'clinical_supervisor', 'director_of_nursing', 'field_nurse', 'scheduler', 'intake_coordinator');
CREATE TYPE patient_status_enum AS ENUM ('active', 'pending_admission', 'discharged', 'hospitalized', 'on_hold');
CREATE TYPE visit_status_enum AS ENUM ('unassigned', 'scheduled', 'in_progress', 'completed', 'missed', 'cancelled');
CREATE TYPE priority_level_enum AS ENUM ('routine', 'urgent', 'stat', 'critical');
CREATE TYPE intake_stage_enum AS ENUM ('inquiry', 'referral', 'insurance_verification', 'clinical_review', 'assessment_scheduled', 'admitted', 'declined');

-- 1. Organizations (Multi-tenant support)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address JSONB,
    phone VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users & Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'field_nurse',
    avatar_url TEXT,
    phone VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Clinicians / Field Staff
CREATE TABLE clinicians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    license_number VARCHAR(100),
    specialty VARCHAR(100),
    max_daily_visits INT DEFAULT 6,
    territory VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Patients / Clients Directory
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    mrn VARCHAR(50) NOT NULL, -- Medical Record Number
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(20),
    service_line service_line_enum NOT NULL DEFAULT 'home_health',
    status patient_status_enum NOT NULL DEFAULT 'active',
    primary_diagnosis TEXT,
    assigned_clinician_id UUID REFERENCES clinicians(id) ON DELETE SET NULL,
    phone VARCHAR(30),
    emergency_contact JSONB,
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(50),
    address_zip VARCHAR(20),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    discharge_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_mrn_per_org UNIQUE (organization_id, mrn)
);

-- 5. Visits & Schedules
CREATE TABLE visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinician_id UUID REFERENCES clinicians(id) ON DELETE SET NULL,
    service_line service_line_enum NOT NULL,
    visit_type VARCHAR(100) NOT NULL, -- e.g. Skilled Nursing Assessment, Wound Care, Physical Therapy
    status visit_status_enum NOT NULL DEFAULT 'unassigned',
    priority priority_level_enum NOT NULL DEFAULT 'routine',
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    evv_verified BOOLEAN DEFAULT FALSE, -- Electronic Visit Verification (GPS/Time stamp)
    clinical_notes TEXT,
    missed_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Central Intake & Referrals
CREATE TABLE intake_referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_name VARCHAR(200) NOT NULL,
    service_line service_line_enum NOT NULL DEFAULT 'home_care',
    referral_source VARCHAR(255) NOT NULL, -- e.g. Memorial Hospital, Dr. Miller
    stage intake_stage_enum NOT NULL DEFAULT 'inquiry',
    urgency priority_level_enum NOT NULL DEFAULT 'routine',
    assigned_coordinator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    payer_info JSONB,
    clinical_summary TEXT,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    admitted_at TIMESTAMP WITH TIME ZONE
);

-- 7. Internal Communication / Secure Messaging
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    service_line service_line_enum,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    priority priority_level_enum NOT NULL DEFAULT 'routine',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Clinical News & Updates / Learning
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT,
    category VARCHAR(100) DEFAULT 'Care Industry',
    video_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX idx_patients_org_status ON patients(organization_id, status);
CREATE INDEX idx_visits_org_dates ON visits(organization_id, scheduled_start, scheduled_end);
CREATE INDEX idx_visits_clinician ON visits(clinician_id, scheduled_start);
CREATE INDEX idx_visits_status ON visits(status);
CREATE INDEX idx_intake_org_stage ON intake_referrals(organization_id, stage);
CREATE INDEX idx_messages_recipient_read ON messages(recipient_id, is_read);
