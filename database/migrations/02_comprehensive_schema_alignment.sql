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

-- =====================================================================
-- 4. SEED CONNECT MODULE & ROUTE PLANNER DATA (IDEMPOTENT)
-- =====================================================================

-- 4.1 Conversations
INSERT INTO conversations (id, type, title, subtitle, patient_name, service_line, is_pinned, is_urgent, created_at, updated_at)
VALUES 
  ('conv-care-abuissa', 'care_team', 'Heather Abuissa (1061) Care Team', 'Sarah Jenkins RN, Alexandria Nelson RN, Dr. Leslie Rigali', 'Heather Abuissa', 'home_health', true, false, '2026-11-06 08:30:00+00', '2026-11-06 10:24:00+00'),
  ('conv-alexandria', 'direct', 'Alexandria Nelson, RN', 'Field Clinician • Skilled Nursing', NULL, 'home_health', true, false, '2026-11-05 14:00:00+00', '2026-11-06 09:50:00+00'),
  ('conv-carolyn', 'direct', 'Carolyn Akukwe, RN', 'Case Manager • Rehabilitation & Care Coordination', NULL, 'home_health', false, true, '2026-11-04 11:00:00+00', '2026-11-06 08:45:00+00'),
  ('conv-care-anis', 'care_team', 'Marie V. Anis (1036) Care Team', 'Susanna Welch BSN, Andre Bellevue PT, Dr. Leslie Rigali', 'Marie V. Anis', 'home_health', false, false, '2026-11-04 10:00:00+00', '2026-11-05 15:20:00+00'),
  ('conv-andre', 'direct', 'Andre Bellevue, PT', 'Physical Therapist Lead • Mobility Assessment', NULL, 'home_health', false, false, '2026-11-03 12:00:00+00', '2026-11-05 17:10:00+00'),
  ('conv-triage-channel', 'channel', 'Standards Home Care - Clinical Triage', 'Agency-wide on-call broadcast & critical intake', NULL, 'home_health', false, false, '2026-11-01 08:00:00+00', '2026-11-06 07:30:00+00')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  updated_at = EXCLUDED.updated_at;

-- Link patient_id on conv-care-abuissa and conv-care-anis if patient exists
UPDATE conversations c
SET patient_id = p.id
FROM patients p
WHERE c.id = 'conv-care-abuissa' AND (p.mrn = '1061' OR p.first_name ILIKE '%Heather%') AND c.patient_id IS NULL;

UPDATE conversations c
SET patient_id = p.id
FROM patients p
WHERE c.id = 'conv-care-anis' AND (p.mrn = '1036' OR p.first_name ILIKE '%Marie%') AND c.patient_id IS NULL;

-- 4.2 Conversation Participants
INSERT INTO conversation_participants (id, conversation_id, name, role, status)
VALUES 
  ('11111111-1111-4111-a111-111111111101', 'conv-care-abuissa', 'Sarah Jenkins, RN', 'Primary Case Manager', 'online'),
  ('11111111-1111-4111-a111-111111111102', 'conv-care-abuissa', 'Alexandria Nelson, RN', 'Field Clinician (RN)', 'online'),
  ('11111111-1111-4111-a111-111111111103', 'conv-care-abuissa', 'Dr. Leslie Rigali', 'Attending Physician', 'busy'),
  ('11111111-1111-4111-a111-111111111104', 'conv-alexandria', 'Alexandria Nelson, RN', 'Skilled Field Nurse', 'online'),
  ('11111111-1111-4111-a111-111111111105', 'conv-carolyn', 'Carolyn Akukwe, RN', 'Case Manager (RN)', 'online'),
  ('11111111-1111-4111-a111-111111111106', 'conv-care-anis', 'Susanna Welch, BSN', 'Lead Staff Nurse', 'online'),
  ('11111111-1111-4111-a111-111111111107', 'conv-care-anis', 'Andre Bellevue, PT', 'Physical Therapist', 'busy'),
  ('11111111-1111-4111-a111-111111111108', 'conv-andre', 'Andre Bellevue, PT', 'Physical Therapist Lead', 'busy'),
  ('11111111-1111-4111-a111-111111111109', 'conv-triage-channel', 'All Triage Staff', 'Care Team', 'online')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- 4.3 Chat Messages
INSERT INTO chat_messages (id, conversation_id, sender_id, sender_name, sender_role, content, is_read, created_at, attachment_name, attachment_type, attachment_size, attachment_url)
VALUES 
  (
    'msg-ab-1', 'conv-care-abuissa', 'sarah-jenkins', 'Sarah Jenkins, RN', 'Primary Case Manager',
    'Patient Heather Abuissa reported mild discomfort at right heel margin during morning dressing change. Granulation tissue looks healthy and pink.',
    true, '2026-11-06 09:15:00+00', NULL, NULL, NULL, NULL
  ),
  (
    'msg-ab-2', 'conv-care-abuissa', 'alexandria-nelson', 'Alexandria Nelson, RN', 'Field Clinician (RN)',
    'Confirmed. Ulcer measurement recorded at 2.1cm x 1.4cm with 0 depth. Applied collagen matrix dressing and secured offloading boot.',
    true, '2026-11-06 09:42:00+00', 'DFU_Debridement_Note_Nov2026.pdf', 'pdf', '480 KB', '/api/connect/attachments/DFU_Debridement_Note_Nov2026.pdf'
  ),
  (
    'msg-ab-3', 'conv-care-abuissa', 'sarah-jenkins', 'Sarah Jenkins, RN', 'Primary Case Manager',
    'Wound measurement updated: 2.1cm x 1.4cm with healthy granulation tissue. Order renewal requested from Dr. Rigali.',
    false, '2026-11-06 10:24:00+00', NULL, NULL, NULL, NULL
  ),
  (
    'msg-an-1', 'conv-alexandria', 'alexandria-nelson', 'Alexandria Nelson, RN', 'Skilled Field Nurse',
    'Good morning! I finished Eleanor Pemberton encounter early. Proceeding to Heather Abuissa recertification visit.',
    true, '2026-11-06 09:10:00+00', NULL, NULL, NULL, NULL
  ),
  (
    'msg-an-2', 'conv-alexandria', 'alexandria-nelson', 'Alexandria Nelson, RN', 'Skilled Field Nurse',
    'Attaching Eleanor OASIS Comprehensive Recertification Protocol for review before supervisor lock.',
    false, '2026-11-06 09:50:00+00', 'OASIS_Recertification_Protocol.pdf', 'pdf', '640 KB', '/api/connect/attachments/OASIS_Recertification_Protocol.pdf'
  ),
  (
    'msg-ca-1', 'conv-carolyn', 'carolyn-akukwe', 'Carolyn Akukwe, RN', 'Case Manager (RN)',
    'David Kowalski PT assessment is complete. Gait evaluation showed improved stability with four-point cane.',
    true, '2026-11-05 16:30:00+00', NULL, NULL, NULL, NULL
  ),
  (
    'msg-ca-2', 'conv-carolyn', 'carolyn-akukwe', 'Carolyn Akukwe, RN', 'Case Manager (RN)',
    'Discharge planning summary ready for Arthur Pendelton. Family conference scheduled for 3:30 PM today.',
    false, '2026-11-06 08:45:00+00', 'Discharge_Planning_Summary.pdf', 'pdf', '320 KB', '/api/connect/attachments/Discharge_Planning_Summary.pdf'
  ),
  (
    'msg-an-anis-1', 'conv-care-anis', 'susanna-welch', 'Susanna Welch, BSN', 'Lead Staff Nurse',
    'Pre-filled insulin regimen reviewed with family. Blood glucose maintained at 118 mg/dL fasting.',
    true, '2026-11-05 15:20:00+00', 'Insulin_Administration_Log.pdf', 'pdf', '290 KB', '/api/connect/attachments/Insulin_Administration_Log.pdf'
  ),
  (
    'msg-ab-pt-1', 'conv-andre', 'andre-bellevue', 'Andre Bellevue, PT', 'Physical Therapist Lead',
    'Beatrice Holloway ambulated 150 ft with rolling walker with good tolerance. Upgraded exercise program.',
    true, '2026-11-05 17:10:00+00', 'Functional_Mobility_Assessment.pdf', 'pdf', '510 KB', '/api/connect/attachments/Functional_Mobility_Assessment.pdf'
  ),
  (
    'msg-triage-1', 'conv-triage-channel', 'alexandria-nelson', 'Alexandria Nelson, RN', 'Field Clinician (RN)',
    'Weekend on-call coverage roster published. Dallas territory field nurses please confirm EVV verification before 5:00 PM.',
    true, '2026-11-06 07:30:00+00', NULL, NULL, NULL, NULL
  )
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content,
  is_read = EXCLUDED.is_read;

-- 4.4 Call Logs
INSERT INTO call_logs (id, contact_name, contact_role, direction, call_type, duration, created_at)
VALUES 
  ('call-1', 'Alexandria Nelson, RN', 'Field Clinician (RN)', 'incoming', 'audio', '4m 12s', '2026-11-06 10:15:00+00'),
  ('call-2', 'Carolyn Akukwe, RN', 'Case Manager (RN)', 'outgoing', 'audio', '2m 45s', '2026-11-06 09:30:00+00'),
  ('call-3', 'Andre Bellevue, PT', 'Physical Therapist', 'missed', 'audio', '0s', '2026-11-05 16:40:00+00'),
  ('call-4', 'Susanna Welch, BSN', 'Lead Staff Nurse', 'incoming', 'audio', '6m 18s', '2026-11-05 11:20:00+00')
ON CONFLICT (id) DO UPDATE SET
  contact_name = EXCLUDED.contact_name,
  duration = EXCLUDED.duration;

-- 4.5 Route Planner Visits for Friday, Nov 6, 2026
DO $$
DECLARE
  v_org_id UUID;
  v_clin_id UUID;
  v_pat1_id UUID;
  v_pat2_id UUID;
  v_pat3_id UUID;
BEGIN
  SELECT id INTO v_org_id FROM organizations LIMIT 1;
  SELECT id INTO v_clin_id FROM clinicians WHERE name ILIKE '%Alexandria%' LIMIT 1;
  IF v_clin_id IS NULL THEN
    SELECT id INTO v_clin_id FROM clinicians LIMIT 1;
  END IF;

  SELECT id INTO v_pat1_id FROM patients WHERE first_name ILIKE '%Eleanor%' LIMIT 1;
  IF v_pat1_id IS NULL THEN SELECT id INTO v_pat1_id FROM patients LIMIT 1; END IF;

  SELECT id INTO v_pat2_id FROM patients WHERE id != v_pat1_id LIMIT 1;
  SELECT id INTO v_pat3_id FROM patients WHERE id NOT IN (v_pat1_id, COALESCE(v_pat2_id, v_pat1_id)) LIMIT 1;

  IF v_org_id IS NOT NULL AND v_pat1_id IS NOT NULL THEN
    -- Stop 1
    INSERT INTO visits (
      id, organization_id, clinician_id, patient_id, service_line, status,
      scheduled_start, scheduled_end, time_slot, scheduled_date, day_of_week,
      patient_name, employee_name, address, latitude, longitude,
      visit_type, task, evv_status
    ) VALUES (
      '22222222-2222-4222-a222-222222222201',
      v_org_id, v_clin_id, v_pat1_id, 'home_health', 'completed',
      '2026-11-06 09:00:00+00', '2026-11-06 10:00:00+00', '09:00 AM', '2026-11-06', 5,
      'Eleanor Pemberton', 'Alexandria Nelson, RN', '1420 Harvard St, Dallas TX', 32.7767, -96.7970,
      'Skilled Nursing Assessment', 'Wound dressing change & vitals check', 'verified'
    ) ON CONFLICT (id) DO NOTHING;

    -- Stop 2
    IF v_pat2_id IS NOT NULL THEN
      INSERT INTO visits (
        id, organization_id, clinician_id, patient_id, service_line, status,
        scheduled_start, scheduled_end, time_slot, scheduled_date, day_of_week,
        patient_name, employee_name, address, latitude, longitude,
        visit_type, task, evv_status
      ) VALUES (
        '22222222-2222-4222-a222-222222222202',
        v_org_id, v_clin_id, v_pat2_id, 'home_health', 'scheduled',
        '2026-11-06 11:00:00+00', '2026-11-06 12:30:00+00', '11:00 AM', '2026-11-06', 5,
        'Heather Abuissa', 'Alexandria Nelson, RN', '77 Sohier Rd, Beverly / Dallas TX', 32.8023, -96.8122,
        'OASIS Recertification', 'OASIS-E Comprehensive Recertification Protocol', 'pending'
      ) ON CONFLICT (id) DO NOTHING;
    END IF;

    -- Stop 3
    IF v_pat3_id IS NOT NULL THEN
      INSERT INTO visits (
        id, organization_id, clinician_id, patient_id, service_line, status,
        scheduled_start, scheduled_end, time_slot, scheduled_date, day_of_week,
        patient_name, employee_name, address, latitude, longitude,
        visit_type, task, evv_status
      ) VALUES (
        '22222222-2222-4222-a222-222222222203',
        v_org_id, v_clin_id, v_pat3_id, 'home_health', 'scheduled',
        '2026-11-06 14:00:00+00', '2026-11-06 15:00:00+00', '02:00 PM', '2026-11-06', 5,
        'Marcus Vance', 'Alexandria Nelson, RN', '88 Tremont St, Plano / Dallas TX', 32.8140, -96.9489,
        'Physical Therapy Evaluation', 'Gait assessment and cane stability evaluation', 'pending'
      ) ON CONFLICT (id) DO NOTHING;
    END IF;
  END IF;
END $$;

-- 4.6 Past Due Items for Route Planner side panel
DO $$
DECLARE
  v_org_id UUID;
  v_pat_id UUID;
BEGIN
  SELECT id INTO v_org_id FROM organizations LIMIT 1;
  SELECT id INTO v_pat_id FROM patients LIMIT 1;
  IF v_org_id IS NOT NULL AND v_pat_id IS NOT NULL THEN
    INSERT INTO patient_tasks (
      id, organization_id, patient_id, task_name, discipline, status,
      schedule_start, schedule_end, assigned_to, comments
    ) VALUES 
      ('33333333-3333-4333-a333-333333333301', v_org_id, v_pat_id, 'OASIS-E Recertification Assessment', 'Nursing', 'Pending Review', '2026-11-03', '2026-11-03', 'Alexandria Nelson, RN', 'Requires 30-day compliance review lock'),
      ('33333333-3333-4333-a333-333333333302', v_org_id, v_pat_id, 'Physician Face-to-Face Follow-up', 'Physician Liaison', 'Overdue', '2026-11-04', '2026-11-04', 'Selina Mwakipunda', 'Attending physician counter-signature pending')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;


-- =====================================================================

-- =====================================================================
-- 5. COMPREHENSIVE CLINICAL & ADMINISTRATIVE DATA SEED (IDEMPOTENT)
-- =====================================================================

DO $$
DECLARE
  v_org_id UUID;
  v_clin_user_id UUID;
  v_clin1_id UUID;
  r_patient RECORD;
BEGIN
  SELECT id INTO v_org_id FROM organizations LIMIT 1;
  IF v_org_id IS NULL THEN
    INSERT INTO organizations (id, name, code, phone)
    VALUES ('e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'Standards Home Care', 'SHC-001', '+1 (800) 555-0199')
    ON CONFLICT (id) DO NOTHING;
    v_org_id := 'e2a44bb4-3e9a-4c91-9e23-7fa38b456211';
  END IF;

  SELECT user_id, id INTO v_clin_user_id, v_clin1_id FROM clinicians WHERE name ILIKE '%Alexandria%' LIMIT 1;
  IF v_clin1_id IS NULL THEN
    SELECT user_id, id INTO v_clin_user_id, v_clin1_id FROM clinicians LIMIT 1;
  END IF;

  -- 5.1 FACILITIES
  INSERT INTO facilities (id, organization_id, name, facility_type, address_line1, address_line2, city, state, zip, phone, fax, contact_person, email, comments, status)
  VALUES 
    ('41111111-1111-4111-a111-111111111101', v_org_id, 'Baylor Scott & White Medical Center', 'Hospital', '3500 Gaston Ave', 'Suite 400', 'Dallas', 'TX', '75246', '(214) 820-0111', '(214) 820-0112', 'Dr. Marcus Vance, MD', 'intake@bswhealth.org', 'Primary tertiary referral hospital for cardiology & orthopedics.', 'Active'),
    ('41111111-1111-4111-a111-111111111102', v_org_id, 'Texas Health Presbyterian Hospital Plano', 'Hospital', '6300 W Parker Rd', '', 'Plano', 'TX', '75093', '(972) 981-8000', '(972) 981-8001', 'Karen Whitmore, RN', 'transfers@texashealth.org', 'Direct inpatient discharge partner for post-acute care.', 'Active'),
    ('41111111-1111-4111-a111-111111111103', v_org_id, 'Dallas Regional Medical Center', 'Hospital', '1011 N Galloway Ave', '', 'Mesquite', 'TX', '75149', '(214) 320-7000', '(214) 320-7005', 'Robert Garcia, MSW', 'liaison@dallasregional.com', 'Wound management and surgical recovery liaison.', 'Active'),
    ('41111111-1111-4111-a111-111111111104', v_org_id, 'Parkland Health & Hospital System', 'Hospital', '5200 Harry Hines Blvd', '', 'Dallas', 'TX', '75235', '(214) 590-8000', '(214) 590-8005', 'Maria Gomez', 'transitions@parklandhealth.org', 'Community health outreach and post-discharge clinic.', 'Active')
  ON CONFLICT (id) DO NOTHING;

  -- 5.2 PHYSICIANS
  INSERT INTO physicians (id, organization_id, first_name, last_name, credentials, npi, taxonomy_code, medicaid_provider_id, pecos_status, address_line1, address_line2, city, state, zip, phone, fax, email, order_delivery_method, comments, status)
  VALUES 
    ('42222222-2222-4222-a222-222222222201', v_org_id, 'Leslie', 'Rigali', 'MD', '1497821034', '207Q00000X', 'TX-MED-8812', 'Verified', '3801 Gaston Ave', 'Suite 210', 'Dallas', 'TX', '75246', '(214) 555-0181', '(214) 555-0182', 'dr.rigali@dallashealth.org', 'Electronic Portal', 'Attending Physician for Home Health Recertifications.', 'Active'),
    ('42222222-2222-4222-a222-222222222202', v_org_id, 'Edward', 'Kowaloff', 'MD', '1821049283', '207R00000X', 'TX-MED-9943', 'Verified', '6020 W Parker Rd', 'Suite 105', 'Plano', 'TX', '75093', '(972) 555-0193', '(972) 555-0194', 'dr.kowaloff@planomedical.com', 'Fax Transmission', 'Cardiopulmonary specialist & POC certifying physician.', 'Active'),
    ('42222222-2222-4222-a222-222222222203', v_org_id, 'Maulshree', 'Gupta', 'MD', '1639201948', '208D00000X', 'TX-MED-4410', 'Verified', '12200 Park Central Dr', '', 'Dallas', 'TX', '75251', '(214) 555-0210', '(214) 555-0211', 'dr.gupta@northtexasmed.com', 'Electronic Portal', 'Geriatric medicine & physical therapy rehabilitation partner.', 'Active')
  ON CONFLICT (id) DO NOTHING;

  -- 5.3 INSURANCE PAYERS
  INSERT INTO insurance_payers (id, organization_id, payer_name, payer_type, source_of_payment, clearinghouse, billing_provider_id, address_line1, city, state, zip, phone, fax, email, contact_person, requires_authorization, notes, status)
  VALUES 
    ('43333333-3333-4333-a333-333333333301', v_org_id, 'Medicare Traditional Part A', 'Medicare', 'Title 18', 'Availity', 'MED-PART-A-01', '7500 Security Blvd', 'Baltimore', 'MD', '21244', '(800) 633-4227', '(877) 555-0101', 'claims@cms.hhs.gov', 'Provider Services', false, 'Standard 60-day home health OASIS episode reimbursement.', 'Active'),
    ('43333333-3333-4333-a333-333333333302', v_org_id, 'Blue Cross Blue Shield of Texas', 'Commercial / Private insurance', 'Private', 'Availity', 'BCBSTX-9941', '1001 E Lookout Dr', 'Richardson', 'TX', '75082', '(800) 521-2227', '(972) 766-0120', 'authorizations@bcbstx.com', 'Case Management Dept', true, 'Prior authorization required for skilled nursing & physical therapy.', 'Active'),
    ('43333333-3333-4333-a333-333333333303', v_org_id, 'UnitedHealthcare Medicare Advantage', 'Medicare HMO/PPO', 'Title 18 HMO', 'Change Healthcare', 'UHC-MEDADV-44', '9900 Bren Rd E', 'Minnetonka', 'MN', '55343', '(866) 842-3278', '(888) 555-0145', 'inhomecare@uhc.com', 'Optum Clinical Liaison', true, 'Pre-certification required within 48 hours of admission.', 'Active')
  ON CONFLICT (id) DO NOTHING;

  -- 5.4 PHARMACIES
  INSERT INTO pharmacies (id, organization_id, name, address_line1, address_line2, city, state, zip, phone, fax, contact_person, email, comments, status)
  VALUES 
    ('44444444-4444-4444-a444-444444444401', v_org_id, 'CVS Pharmacy #4120', '3133 Lee St', '', 'Dallas', 'TX', '75206', '(214) 823-9995', '(214) 823-9998', 'David Chen, PharmD', 'rx4120@cvshealth.com', '24-hour retail and emergency delivery pharmacy.', 'Active'),
    ('44444444-4444-4444-a444-444444444402', v_org_id, 'Walgreens Infusion & Specialty', '5001 Alpha Rd', 'Suite 100', 'Dallas', 'TX', '75244', '(972) 386-0111', '(972) 386-0115', 'Sarah Jenkins, RPh', 'infusion.dallas@walgreens.com', 'Compounding and intravenous antibiotics supply partner.', 'Active'),
    ('44444444-4444-4444-a444-444444444403', v_org_id, 'CarePlus Compounding Pharmacy', '1201 Elm St', '', 'Dallas', 'TX', '75270', '(214) 741-2200', '(214) 741-2205', 'Rachel Adams', 'orders@carepluspharmacy.com', 'Specialized topical wound gels and custom dosages.', 'Active')
  ON CONFLICT (id) DO NOTHING;

  -- 5.5 NON-VISIT ACTIVITIES
  INSERT INTO non_visit_activities (id, user_id, clinician_name, activity_type, activity_date, start_time, end_time, duration_minutes, mileage, comments)
  VALUES 
    ('58888888-8888-4888-a888-888888888801', v_clin_user_id, 'Alexandria Nelson, RN', 'Morning Clinical Triage & Case Conference', CURRENT_DATE, '08:00 AM', '08:45 AM', 45, 0, 'Reviewed daily route stops, acute patient status updates, and lab collection requirements.'),
    ('58888888-8888-4888-a888-888888888802', v_clin_user_id, 'Alexandria Nelson, RN', 'Lab Specimen Drop-Off & Supply Restock', CURRENT_DATE - INTERVAL '1 day', '03:30 PM', '04:15 PM', 45, 8.4, 'Delivered blood cultures to Quest Diagnostics laboratory and restocked wound care dressings.')
  ON CONFLICT (id) DO NOTHING;

  -- 5.6 CLINICAL DATA PER PATIENT (Loop through patients with zero records)
  FOR r_patient IN SELECT id, first_name || ' ' || last_name AS full_name, mrn FROM patients LOOP

    -- A. Patient Tasks (if patient currently has no tasks)
    IF NOT EXISTS (SELECT 1 FROM patient_tasks WHERE patient_id = r_patient.id) THEN
      INSERT INTO patient_tasks (organization_id, patient_id, task_name, discipline, status, schedule_start, schedule_end, assigned_to, comments)
      VALUES 
        (v_org_id, r_patient.id, 'Communication Note', 'Nursing', 'Completed', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE - INTERVAL '3 days', 'Sarah Jenkins, RN', 'Initial intake documentation and vital signs baseline recorded.'),
        (v_org_id, r_patient.id, 'Coordination of Care', 'Nursing', 'Completed', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day', 'Alexandria Nelson, RN', 'Interdisciplinary team conference held regarding medication compliance.'),
        (v_org_id, r_patient.id, 'Face-to-Face Encounter', 'Physician Liaison', 'Returned w/ Physician Signature', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '5 days', 'Selina Mwakipunda', 'Dr. Leslie Rigali counter-signed POC form.'),
        (v_org_id, r_patient.id, 'LPN - Oral Med. Management', 'Nursing', 'Not Yet Due', CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '2 days', 'Marrio Fortune', 'Pre-fill 7-day pill organizer and monitor for diuretic side effects.'),
        (v_org_id, r_patient.id, 'Physical Therapy Evaluation', 'Physical Therapy', 'Completed', CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE - INTERVAL '4 days', 'Andre Bellevue, PT', 'Gait and stability evaluation with rolling walker.');
    END IF;

    -- B. Episodes (if patient currently has no episodes)
    IF NOT EXISTS (SELECT 1 FROM episodes WHERE patient_id = r_patient.id) THEN
      INSERT INTO episodes (organization_id, patient_id, start_of_care_date, episode_start_date, episode_end_date, case_manager, primary_physician, primary_insurance, secondary_insurance, comments, status)
      VALUES 
        (v_org_id, r_patient.id, CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE + INTERVAL '40 days', 'Alexandria Nelson, RN', 'Dr. Leslie Rigali, MD', 'Medicare Traditional Part A', 'Not Available', 'Current 60-day home health certification episode. Plan of care active.', 'active');
    END IF;

    -- C. Communication Notes (if patient currently has no notes)
    IF NOT EXISTS (SELECT 1 FROM communication_notes WHERE patient_id = r_patient.id) THEN
      INSERT INTO communication_notes (organization_id, patient_id, patient_name, mrn, patient_status, episode_associated, physician, note_date, communication_text, send_as_message, staff_signature, signature_date, signature_time, status)
      VALUES 
        (v_org_id, r_patient.id, r_patient.full_name, r_patient.mrn, 'Active', 'Current 60-Day Episode', 'Dr. Leslie Rigali, MD', CURRENT_DATE - INTERVAL '2 days', 'Coordinated DME oxygen delivery and verified medication compliance with family caregiver.', true, 'Alexandria Nelson, RN', CURRENT_DATE - INTERVAL '2 days', '11:45 AM', 'Approved');
    END IF;

    -- D. Orders (if patient currently has no orders)
    IF NOT EXISTS (SELECT 1 FROM orders WHERE patient_id = r_patient.id) THEN
      INSERT INTO orders (organization_id, patient_id, patient_name, mrn, episode_associated, attending_physician, send_to, copy_to, order_date, order_time, effective_date, order_is_for_next_episode, summary_title, order_type, order_content, order_read_back_and_verified, clinician_signature, signature_date, signature_time, status)
      VALUES 
        (v_org_id, r_patient.id, r_patient.full_name, r_patient.mrn, 'Current 60-Day Episode', 'Dr. Leslie Rigali, MD', 'CVS Pharmacy #4120', 'Family Caregiver', CURRENT_DATE - INTERVAL '4 days', '10:00 AM', CURRENT_DATE - INTERVAL '4 days', false, 'Furosemide (Lasix) 40mg PO Daily', 'Medication Orders', 'Furosemide 40 mg tablet: Take 1 tablet by mouth daily in morning with full glass of water. Monitor electrolyte panel.', true, 'Alexandria Nelson, RN', CURRENT_DATE - INTERVAL '4 days', '10:15 AM', 'Approved');
    END IF;

    -- E. Face-to-Face Encounters (if patient currently has no encounters)
    IF NOT EXISTS (SELECT 1 FROM face_to_face_encounters WHERE patient_id = r_patient.id) THEN
      INSERT INTO face_to_face_encounters (organization_id, patient_id, patient_name, mrn, patient_status, episode_associated, physician, request_date, certifying_type, status)
      VALUES 
        (v_org_id, r_patient.id, r_patient.full_name, r_patient.mrn, 'Active', 'Current 60-Day Episode', 'Dr. Leslie Rigali, MD', CURRENT_DATE - INTERVAL '10 days', 'POC Certifying Physician', 'Completed');
    END IF;

    -- F. QA Tasks (if patient currently has no QA tasks)
    IF NOT EXISTS (SELECT 1 FROM qa_tasks WHERE patient_id = r_patient.id) THEN
      INSERT INTO qa_tasks (organization_id, patient_id, patient_name, mrn, event_date, task, task_category, status, assigned_to, branch, payer, patient_status, tags, notes, has_oasis_analysis, has_case_mix, has_margin_calc, is_care_visit)
      VALUES 
        (v_org_id, r_patient.id, r_patient.full_name, r_patient.mrn, CURRENT_DATE - INTERVAL '1 day', 'OASIS-E Recertification Assessment', 'OASIS Assessment', 'Pending Review', 'Alexandria Nelson, RN', 'Standards Home Care', 'Medicare Traditional', 'Active', ARRAY['OASIS-E', 'Priority']::TEXT[], 'Recertification protocol complete. M1021 primary diagnosis verified.', true, true, false, false);
    END IF;

    -- G. Infection Logs (sample on one patient)
    IF NOT EXISTS (SELECT 1 FROM infection_logs) THEN
      INSERT INTO infection_logs (organization_id, patient_id, patient_name, mrn, date_of_infection, episode_period, infection_site, infection_type, pathogen, treatment, precautions, physician_notified, physician_name, resolved, resolution_date, surveillance_notes, created_by)
      VALUES 
        (v_org_id, r_patient.id, r_patient.full_name, r_patient.mrn, CURRENT_DATE - INTERVAL '7 days', 'Current Episode', 'Urinary Tract', 'Catheter-Associated UTI', 'Escherichia coli', 'Oral Nitrofurantoin 100mg PO BID x 7 days prescribed.', 'Standard Precautions', true, 'Dr. Leslie Rigali, MD', true, CURRENT_DATE - INTERVAL '1 day', 'Follow-up urinalysis clean. Patient afebrile with zero dysuria.', 'Alexandria Nelson, RN');
    END IF;

    -- H. Incident Logs (sample on one patient)
    IF NOT EXISTS (SELECT 1 FROM incident_logs) THEN
      INSERT INTO incident_logs (organization_id, patient_id, patient_name, mrn, incident_date, incident_time, incident_type, location, injury_sustained, injury_description, narrative, action_taken, physician_notified, supervisor_notified, reporter_name, reporter_role, status)
      VALUES 
        (v_org_id, r_patient.id, r_patient.full_name, r_patient.mrn, CURRENT_DATE - INTERVAL '5 days', '08:45 AM', 'Fall - Zero Injury', 'Living Room', false, '', 'Patient experienced loss of balance while transferring from sofa. Assisted gently to rug by family member. Zero abrasions, contusions, or head impact.', 'Vital signs assessed within normal limits. Fall risk reassessment completed and walker positioned within direct reach.', true, true, 'Alexandria Nelson, RN', 'Clinical Supervisor', 'Reviewed');
    END IF;

  END LOOP;

END $$;
