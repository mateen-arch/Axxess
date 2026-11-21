import fs from 'fs';
import path from 'path';
import { pool } from './db';

// Read SQL from file if available, or fall back to embedded string
function getMigrationSql(): { sql: string; source: 'file' | 'embedded' } {
  const migrationPath = path.resolve(__dirname, '../../database/migrations/02_comprehensive_schema_alignment.sql');
  if (fs.existsSync(migrationPath)) {
    try {
      const fileSql = fs.readFileSync(migrationPath, 'utf8');
      return { sql: fileSql, source: 'file' };
    } catch {
      // fallback to embedded
    }
  }
  return { sql: EMBEDDED_MIGRATION_SQL, source: 'embedded' };
}

export async function runMigration() {
  console.log('[Migration] Starting idempotent schema alignment migration...');
  const { sql, source } = getMigrationSql();
  console.log(`[Migration] Using migration SQL source: ${source}`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log(`[Migration] Schema migration completed successfully via ${source} source and committed.`);
  } catch (err: any) {
    await client.query('ROLLBACK');
    // Sanitize any potential error output to ensure credentials are never leaked
    const safeMessage = (err?.message || 'Unknown database error')
      .replace(/postgres:\/\/[^@]+@/g, 'postgres://***:***@');
    console.error('[Migration Error] Transaction rolled back:', safeMessage);
    throw new Error(safeMessage);
  } finally {
    client.release();
  }
}

if (require.main === module) {
  runMigration()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async () => {
      await pool.end();
      process.exit(1);
    });
}

export const EMBEDDED_MIGRATION_SQL = `
-- =====================================================================
-- Idempotent Migration: Align Railway PostgreSQL Schema with Express Backend
-- Safe to run on every deploy: NO DROP, NO TRUNCATE, NO DESTRUCTIVE RENAMES
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 1. ALTER EXISTING TABLES TO ADD MISSING COLUMNS
-- =====================================================================

-- 1.1 USERS (Safe defaults: NULL/empty for sensitive personal data)
ALTER TABLE users ADD COLUMN IF NOT EXISTS title VARCHAR(150) DEFAULT 'Staff Member';
ALTER TABLE users ADD COLUMN IF NOT EXISTS signature_pin VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS zip VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS home_phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS software_language VARCHAR(50) DEFAULT 'English';
ALTER TABLE users ADD COLUMN IF NOT EXISTS ssn VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS signature_reset_requested_at TIMESTAMPTZ;

-- 1.2 PATIENTS
ALTER TABLE patients ADD COLUMN IF NOT EXISTS secondary_phone VARCHAR(30);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS branch VARCHAR(100) DEFAULT 'Standards Home Care';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS episode_start DATE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS episode_end DATE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS start_of_care_date DATE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS attending_physician VARCHAR(255) DEFAULT '';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance_name VARCHAR(255) DEFAULT '';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS policy_number VARCHAR(100) DEFAULT '';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS primary_contact VARCHAR(255) DEFAULT '';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS secondary_contact VARCHAR(255) DEFAULT '';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS fall_risk BOOLEAN DEFAULT false;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS hospitalization_risk BOOLEAN DEFAULT false;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS infection_risk BOOLEAN DEFAULT false;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS full_code BOOLEAN DEFAULT true;

-- 1.3 CLINICIANS
ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS title VARCHAR(100) DEFAULT 'Registered Nurse';
ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS credentials VARCHAR(50) DEFAULT 'RN';
ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS discipline VARCHAR(100) DEFAULT 'Nursing';
ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS branch VARCHAR(100) DEFAULT 'Standards Home Care';
ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS service_lines TEXT[] DEFAULT ARRAY['home_health'];
ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7) DEFAULT 32.7767;
ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7) DEFAULT -96.7970;
ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS current_address VARCHAR(255) DEFAULT 'Dallas Metro TX';
ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS work_status VARCHAR(50) DEFAULT 'Available';

-- 1.4 VISITS
ALTER TABLE visits ADD COLUMN IF NOT EXISTS employee_name VARCHAR(255);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS patient_name VARCHAR(255);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS time_slot VARCHAR(50);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS scheduled_date DATE;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS day_of_week INT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS location_type VARCHAR(50) DEFAULT 'home';
ALTER TABLE visits ADD COLUMN IF NOT EXISTS evv_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE visits ADD COLUMN IF NOT EXISTS address VARCHAR(500);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS task VARCHAR(255);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS huv_sfv_type VARCHAR(50);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS task_status VARCHAR(50);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS days_remaining INT DEFAULT 3;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS admission_date DATE;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS branch VARCHAR(150) DEFAULT 'Standards Home Care';
ALTER TABLE visits ADD COLUMN IF NOT EXISTS required_credentials TEXT[] DEFAULT ARRAY['RN']::TEXT[];
ALTER TABLE visits ADD COLUMN IF NOT EXISTS notes TEXT;

-- 1.5 MESSAGES (Safe default: empty array for recipients)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS recipients TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE messages ADD COLUMN IF NOT EXISTS folder VARCHAR(50) DEFAULT 'inbox';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- 1.6 INTAKE REFERRALS
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'new';
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS client_first_name VARCHAR(100);
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS client_last_name VARCHAR(100);
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS phone_type VARCHAR(50);
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS contact_first_name VARCHAR(100);
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS contact_last_name VARCHAR(100);
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS contact_phone_type VARCHAR(50);
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS contact_relationship VARCHAR(100);
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS branch VARCHAR(100) DEFAULT 'Standards Home Care';
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS service_requested VARCHAR(255);
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS assigned_team_member VARCHAR(100) DEFAULT 'Sarah Jenkins, RN';
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS follow_up_date DATE;
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS requested_soc DATE;
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS mrn VARCHAR(50);
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS gender VARCHAR(50);
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS created_by VARCHAR(100) DEFAULT 'INTAKE COORDINATOR';
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS liaison VARCHAR(100) DEFAULT 'Not Available';
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS tags VARCHAR(255) DEFAULT 'Direct Intake';
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS referral_source VARCHAR(255);
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS urgency VARCHAR(50) DEFAULT 'routine';
ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS clinical_summary TEXT;

-- =====================================================================
-- 2. CREATE MISSING TABLES WITH SCHEMAS MATCHING BACKEND QUERIES
-- =====================================================================

-- 2.1 PATIENT_TASKS (Clinical charts tasks)
CREATE TABLE IF NOT EXISTS patient_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  task_name VARCHAR(255) DEFAULT 'Communication Note',
  discipline VARCHAR(100) DEFAULT 'Nursing',
  status VARCHAR(50) DEFAULT 'Not Yet Due',
  schedule_start DATE DEFAULT CURRENT_DATE,
  schedule_end DATE DEFAULT CURRENT_DATE,
  assigned_to VARCHAR(255) DEFAULT 'Unassigned Clinician',
  comments TEXT DEFAULT 'Not Available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_patient_tasks_pid ON patient_tasks(patient_id);

-- 2.2 EPISODES
CREATE TABLE IF NOT EXISTS episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  start_of_care_date DATE NOT NULL,
  episode_start_date DATE NOT NULL,
  episode_end_date DATE NOT NULL,
  case_manager VARCHAR(255),
  primary_physician VARCHAR(255),
  primary_insurance VARCHAR(255),
  secondary_insurance VARCHAR(255),
  comments TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_episodes_patient ON episodes(patient_id);

-- 2.3 COMMUNICATION_NOTES
CREATE TABLE IF NOT EXISTS communication_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  patient_name VARCHAR(255) NOT NULL,
  mrn VARCHAR(50),
  patient_status VARCHAR(50) DEFAULT 'Active',
  episode_associated VARCHAR(255),
  physician VARCHAR(255),
  note_date DATE NOT NULL DEFAULT CURRENT_DATE,
  communication_text TEXT NOT NULL,
  send_as_message BOOLEAN DEFAULT FALSE,
  staff_signature VARCHAR(255) NOT NULL,
  signature_date DATE NOT NULL DEFAULT CURRENT_DATE,
  signature_time VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'Approved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_comm_notes_org ON communication_notes(organization_id);
CREATE INDEX IF NOT EXISTS idx_comm_notes_pat ON communication_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_comm_notes_date ON communication_notes(note_date DESC);

-- 2.4 ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  patient_name VARCHAR(255) NOT NULL,
  mrn VARCHAR(50),
  episode_associated VARCHAR(255),
  attending_physician VARCHAR(255),
  send_to VARCHAR(255),
  copy_to VARCHAR(255),
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  order_time VARCHAR(50),
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  order_is_for_next_episode BOOLEAN DEFAULT FALSE,
  summary_title VARCHAR(255) NOT NULL,
  order_type VARCHAR(100) NOT NULL DEFAULT 'Medication Orders',
  order_content TEXT,
  order_read_back_and_verified BOOLEAN DEFAULT TRUE,
  clinician_signature VARCHAR(255) NOT NULL,
  signature_date DATE NOT NULL DEFAULT CURRENT_DATE,
  signature_time VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'Created',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_orders_patient ON orders(patient_id);

-- 2.5 FACE_TO_FACE_ENCOUNTERS
CREATE TABLE IF NOT EXISTS face_to_face_encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  patient_name VARCHAR(255) NOT NULL,
  mrn VARCHAR(50),
  patient_status VARCHAR(50) DEFAULT 'Active',
  episode_associated VARCHAR(255),
  physician VARCHAR(255) NOT NULL,
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  certifying_type VARCHAR(100) DEFAULT 'POC Certifying Physician',
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.6 FACILITIES
CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  facility_type VARCHAR(100) NOT NULL DEFAULT 'Hospital',
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL DEFAULT 'TX',
  zip VARCHAR(20) NOT NULL,
  phone VARCHAR(50),
  fax VARCHAR(50),
  contact_person VARCHAR(150),
  email VARCHAR(150),
  comments TEXT,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.7 PHYSICIANS
CREATE TABLE IF NOT EXISTS physicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  credentials VARCHAR(50) DEFAULT 'MD',
  npi VARCHAR(20) NOT NULL,
  taxonomy_code VARCHAR(50),
  medicaid_provider_id VARCHAR(50),
  pecos_status VARCHAR(50) DEFAULT 'Verified',
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL DEFAULT 'TX',
  zip VARCHAR(20) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  fax VARCHAR(50),
  email VARCHAR(150),
  order_delivery_method VARCHAR(100) DEFAULT 'Fax Transmission',
  comments TEXT,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.8 INSURANCE_PAYERS
CREATE TABLE IF NOT EXISTS insurance_payers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  payer_name VARCHAR(255) NOT NULL,
  payer_type VARCHAR(100) NOT NULL DEFAULT 'Commercial / Private insurance',
  source_of_payment VARCHAR(100),
  clearinghouse VARCHAR(100) DEFAULT 'Availity',
  billing_provider_id VARCHAR(100),
  address_line1 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50) DEFAULT 'TX',
  zip VARCHAR(20),
  phone VARCHAR(50),
  fax VARCHAR(50),
  email VARCHAR(150),
  contact_person VARCHAR(150),
  requires_authorization BOOLEAN DEFAULT FALSE,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.9 PHARMACIES
CREATE TABLE IF NOT EXISTS pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL DEFAULT 'TX',
  zip VARCHAR(20) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  fax VARCHAR(50),
  contact_person VARCHAR(150),
  email VARCHAR(150),
  comments TEXT,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.10 INFECTION_LOGS
CREATE TABLE IF NOT EXISTS infection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  patient_name VARCHAR(255) NOT NULL,
  mrn VARCHAR(50),
  date_of_infection DATE NOT NULL DEFAULT CURRENT_DATE,
  episode_period VARCHAR(255),
  infection_site VARCHAR(150) NOT NULL,
  infection_type VARCHAR(150) NOT NULL,
  pathogen VARCHAR(150),
  treatment TEXT,
  precautions VARCHAR(150) DEFAULT 'Standard Precautions',
  physician_notified BOOLEAN DEFAULT TRUE,
  physician_name VARCHAR(150),
  resolved BOOLEAN DEFAULT FALSE,
  resolution_date DATE,
  surveillance_notes TEXT,
  created_by VARCHAR(150) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.11 INCIDENT_LOGS
CREATE TABLE IF NOT EXISTS incident_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  patient_name VARCHAR(255) NOT NULL,
  mrn VARCHAR(50),
  incident_date DATE NOT NULL DEFAULT CURRENT_DATE,
  incident_time VARCHAR(50),
  incident_type VARCHAR(150) NOT NULL,
  location VARCHAR(150),
  injury_sustained BOOLEAN DEFAULT FALSE,
  injury_description TEXT,
  narrative TEXT NOT NULL,
  action_taken TEXT,
  physician_notified BOOLEAN DEFAULT TRUE,
  supervisor_notified BOOLEAN DEFAULT TRUE,
  reporter_name VARCHAR(150) NOT NULL,
  reporter_role VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Under Review',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.12 NON_VISIT_ACTIVITIES
CREATE TABLE IF NOT EXISTS non_visit_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  clinician_name VARCHAR(255) DEFAULT 'Staff Clinician',
  activity_type VARCHAR(100) NOT NULL,
  activity_date DATE NOT NULL,
  start_time VARCHAR(50) NOT NULL DEFAULT '08:00 AM',
  end_time VARCHAR(50) NOT NULL DEFAULT '08:30 AM',
  duration_minutes INT NOT NULL DEFAULT 30,
  mileage NUMERIC(6, 2) DEFAULT 0,
  comments TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.13 QA_TASKS
CREATE TABLE IF NOT EXISTS qa_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  patient_name VARCHAR(255) NOT NULL,
  mrn VARCHAR(50) NOT NULL,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  task VARCHAR(255) NOT NULL,
  task_category VARCHAR(100) DEFAULT 'OASIS Assessment',
  status VARCHAR(50) NOT NULL DEFAULT 'Pending Review',
  assigned_to VARCHAR(255) DEFAULT 'Alexandria Nelson, RN',
  branch VARCHAR(100) DEFAULT 'Standards Home Care',
  payer VARCHAR(100) DEFAULT 'Medicare Traditional',
  patient_status VARCHAR(50) DEFAULT 'Active',
  tags TEXT[] DEFAULT ARRAY['OASIS-E', 'Priority']::TEXT[],
  notes TEXT DEFAULT '',
  has_oasis_analysis BOOLEAN DEFAULT true,
  has_case_mix BOOLEAN DEFAULT true,
  has_margin_calc BOOLEAN DEFAULT false,
  is_care_visit BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_qa_tasks_event_date ON qa_tasks(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_qa_tasks_status ON qa_tasks(status);

-- 2.14 CONVERSATIONS (CareOrbit Connect)
CREATE TABLE IF NOT EXISTS conversations (
  id VARCHAR(100) PRIMARY KEY,
  type VARCHAR(50) NOT NULL DEFAULT 'direct',
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  patient_name VARCHAR(255),
  service_line VARCHAR(50) DEFAULT 'home_health',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_urgent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.15 CONVERSATION_PARTICIPANTS
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id VARCHAR(100) REFERENCES conversations(id) ON DELETE CASCADE,
  clinician_id UUID REFERENCES clinicians(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  status VARCHAR(50) DEFAULT 'online'
);
CREATE INDEX IF NOT EXISTS idx_conv_part_conv ON conversation_participants(conversation_id);

-- 2.16 CHAT_MESSAGES
CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(100) PRIMARY KEY,
  conversation_id VARCHAR(100) REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id VARCHAR(100) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  sender_role VARCHAR(255),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  attachment_name VARCHAR(255),
  attachment_type VARCHAR(50),
  attachment_size VARCHAR(50),
  attachment_url TEXT
);
CREATE INDEX IF NOT EXISTS idx_chat_msg_conv ON chat_messages(conversation_id);

-- 2.17 CALL_LOGS
CREATE TABLE IF NOT EXISTS call_logs (
  id VARCHAR(100) PRIMARY KEY,
  contact_name VARCHAR(255) NOT NULL,
  contact_role VARCHAR(255),
  direction VARCHAR(20) NOT NULL,
  call_type VARCHAR(20) NOT NULL DEFAULT 'audio',
  duration VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 3. SEPARATE, ROBUST BACKFILL UPDATES
-- Each statement uses a simple single FROM and WHERE clause
-- =====================================================================

-- 3.1 Clinician names from users
UPDATE clinicians c
SET name = u.full_name
FROM users u
WHERE c.user_id = u.id AND c.name IS NULL;

-- 3.2 Visit patient names from patients
UPDATE visits v
SET patient_name = p.first_name || ' ' || p.last_name
FROM patients p
WHERE v.patient_id = p.id AND v.patient_name IS NULL;

-- 3.3 Visit employee names from clinicians
UPDATE visits v
SET employee_name = c.name
FROM clinicians c
WHERE v.clinician_id = c.id AND v.employee_name IS NULL;

-- 3.4 Visit branch from patients
UPDATE visits v
SET branch = p.branch
FROM patients p
WHERE v.patient_id = p.id AND v.branch IS NULL AND p.branch IS NOT NULL;

-- 3.5 Visit address from patients
UPDATE visits v
SET address = p.address_street || ', ' || p.address_city
FROM patients p
WHERE v.patient_id = p.id AND v.address IS NULL AND p.address_street IS NOT NULL;

-- 3.6 Visit latitude & longitude from patients
UPDATE visits v
SET latitude = p.latitude, longitude = p.longitude
FROM patients p
WHERE v.patient_id = p.id AND (v.latitude IS NULL OR v.longitude IS NULL);

-- 3.7 Visit scheduled_date, day_of_week, time_slot from scheduled_start
UPDATE visits v
SET scheduled_date = v.scheduled_start::date,
    day_of_week = EXTRACT(DOW FROM v.scheduled_start)::int,
    time_slot = TO_CHAR(v.scheduled_start, 'HH12:MI AM')
WHERE v.scheduled_start IS NOT NULL AND (v.scheduled_date IS NULL OR v.day_of_week IS NULL OR v.time_slot IS NULL);
`;
