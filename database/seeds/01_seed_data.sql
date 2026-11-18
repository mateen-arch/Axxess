-- =====================================================================
-- Seed Data for Standards Home Care (Axxess Central)
-- =====================================================================

-- Insert Default Organization
INSERT INTO organizations (id, name, code, phone) VALUES 
('e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'Standards Home Care', 'SHC-001', '+1 (800) 555-0199')
ON CONFLICT (id) DO NOTHING;

-- Insert Admin & Clinician Users
INSERT INTO users (id, organization_id, email, password_hash, full_name, role) VALUES
('b1111111-1111-1111-1111-111111111111', 'e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'admin@standardshomecare.com', '$2a$12$eX4mpleH4sh...', 'Director of Nursing', 'director_of_nursing'),
('b2222222-2222-2222-2222-222222222222', 'e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'alexandria.nelson@standardshomecare.com', '$2a$12$eX4mpleH4sh...', 'Alexandria Nelson, RN', 'clinical_supervisor'),
('b3333333-3333-3333-3333-333333333333', 'e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'susanna.welch@standardshomecare.com', '$2a$12$eX4mpleH4sh...', 'Susanna Welch, BSN', 'field_nurse')
ON CONFLICT (id) DO NOTHING;

-- Insert Clinicians
INSERT INTO clinicians (id, user_id, organization_id, license_number, specialty, max_daily_visits, territory) VALUES
('c1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 'e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'RN-883491', 'Supervisory & Infection Control', 5, 'Dallas Metro'),
('c2222222-2222-2222-2222-222222222222', 'b3333333-3333-3333-3333-333333333333', 'e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'RN-992144', 'Pediatric & Wound Care', 6, 'North Suburbs')
ON CONFLICT (id) DO NOTHING;

-- Insert Active Patients (Census: Home Health & Home Care)
INSERT INTO patients (id, organization_id, mrn, first_name, last_name, dob, gender, service_line, status, primary_diagnosis, phone, address_city, address_state) VALUES
('a1111111-1111-1111-1111-111111111111', 'e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'MRN-78210', 'Eleanor', 'Pemberton', '1948-04-12', 'female', 'home_health', 'active', 'Chronic Heart Failure (CHF) & Mobility Impairment', '(214) 555-0123', 'Dallas', 'TX'),
('a2222222-2222-2222-2222-222222222222', 'e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'MRN-78211', 'Marcus', 'Vance', '1955-11-20', 'male', 'home_health', 'active', 'Post-Op Knee Arthroplasty Rehab', '(214) 555-0144', 'Plano', 'TX'),
('a3333333-3333-3333-3333-333333333333', 'e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'MRN-78212', 'Beatrice', 'Holloway', '1941-08-05', 'female', 'home_care', 'active', 'Alzheimers Support & Activities of Daily Living (ADL)', '(214) 555-0177', 'Richardson', 'TX'),
('a4444444-4444-4444-4444-444444444444', 'e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'MRN-78213', 'David', 'Kowalski', '1962-02-17', 'male', 'home_health', 'active', 'Type II Diabetes & Diabetic Foot Ulcer Stage 2', '(214) 555-0189', 'Irving', 'TX'),
('a5555555-5555-5555-5555-555555555555', 'e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'MRN-78214', 'Clara', 'Oswald', '1950-09-14', 'female', 'home_health', 'active', 'COPD & Oxygen Therapy Protocol', '(214) 555-0195', 'Dallas', 'TX'),
('a6666666-6666-6666-6666-666666666666', 'e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'MRN-78215', 'Arthur', 'Pendelton', '1938-12-01', 'male', 'home_care', 'active', 'Fall Risk Prevention & Mobility Support', '(214) 555-0199', 'Plano', 'TX')
ON CONFLICT (id) DO NOTHING;

-- Insert Central Intake & Referrals
INSERT INTO intake_referrals (organization_id, patient_name, service_line, referral_source, stage, urgency, clinical_summary, received_at) VALUES
('e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'Harold Finch', 'home_health', 'Baylor Scott & White Medical Center', 'referral', 'routine', 'Recent pacemaker implantation, wound check required', CURRENT_TIMESTAMP - INTERVAL '5 days'),
('e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'Gladys Baker', 'home_health', 'Dr. Maulshree Gupta MD', 'inquiry', 'routine', 'Inquiry regarding physical therapy frequency for post-stroke recovery', CURRENT_TIMESTAMP - INTERVAL '2 days'),
('e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'Robert Thorne', 'home_care', 'Family Inquiry (Daughter)', 'admitted', 'routine', 'Companion care and meal prep 4 days/week', CURRENT_TIMESTAMP - INTERVAL '10 days'),
('e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'Miriam Vance', 'home_care', 'Texas Health Presbyterian', 'inquiry', 'routine', 'Assisted living transition evaluation and personal care request', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'Samuel Adams', 'home_health', 'Dallas Regional Medical', 'referral', 'urgent', 'IV Antibiotic therapy and daily dressing changes', CURRENT_TIMESTAMP - INTERVAL '4 days');

-- Insert Visits (Past 30 Days and Upcoming 7 Days)
INSERT INTO visits (organization_id, patient_id, clinician_id, service_line, visit_type, status, priority, scheduled_start, scheduled_end, evv_verified) VALUES
('e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'a1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'home_health', 'Skilled Nursing Assessment', 'completed', 'routine', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '1 hour', true),
('e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'a2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'home_health', 'Physical Therapy Assessment', 'completed', 'routine', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '1 hour', true),
('e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'a3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'home_care', 'Aide Personal Care Visit', 'completed', 'routine', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '2 hours', true),
('e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'a4444444-4444-4444-4444-444444444444', 'c2222222-2222-2222-2222-222222222222', 'home_health', 'Diabetic Wound Dressing', 'scheduled', 'routine', CURRENT_TIMESTAMP + INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '1 hour', false),
('e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'a5555555-5555-5555-5555-555555555555', 'c1111111-1111-1111-1111-111111111111', 'home_health', 'Respiratory Therapy Visit', 'scheduled', 'routine', CURRENT_TIMESTAMP + INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '1 hour', false),
('e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'a1111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222', 'home_health', 'Cardiology Medication Review', 'missed', 'routine', CURRENT_TIMESTAMP - INTERVAL '6 days', CURRENT_TIMESTAMP - INTERVAL '6 days' + INTERVAL '1 hour', false);

-- Insert Internal Messages / Alerts
INSERT INTO messages (organization_id, sender_id, subject, body, service_line, priority, is_read, created_at) VALUES
('e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'b2222222-2222-2222-2222-222222222222', 'Physician List Updates and Supervisor Follow-Up on Client Infection Logs', 'Please verify updated contact directives for Dr. Aris and complete weekly infection control audits.', 'home_care', 'urgent', false, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'b3333333-3333-3333-3333-333333333333', 'SN Pediatric Assessment Generates a Plan of Care', 'The 60-day recertification assessment for patient Pemberton is ready for supervisor sign-off.', 'home_care', 'routine', false, CURRENT_TIMESTAMP - INTERVAL '5 hours'),
('e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'b2222222-2222-2222-2222-222222222222', 'Elevate Your Axxess Experience at AGILE Summit', 'Review schedule adjustments for field staff attending clinical compliance training workshops.', 'home_health', 'routine', false, CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Insert Educational Announcements
INSERT INTO announcements (title, summary, category, video_url) VALUES
('Hospice & Home Care Is A Service Of The Future', 'Watch key industry leaders discuss the transition into modern digital EHR, patient-centric outcomes, and value-based care reimbursement.', 'Clinical Leadership', 'https://www.youtube.com/embed/PvexmWMy--E'),
('How Axxess Intelligence Reduces Administrative Burden in Care at Home', 'Administrative responsibilities continue to grow. Discover how automated routing, smart scheduling, and AI documentation reduce nurse burnout.', 'Technology & AI', NULL),
('The Hidden Revenue Leak That AI Can Fix (And Most Organizations Do Not Realize)', 'Detect missing visits causing LUPAs, improve coding accuracy, and optimize clinical documentation before claim submission.', 'Revenue & Compliance', NULL);
