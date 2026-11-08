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

-- Insert Active Patients (Census: 75 Home Health, 12 Home Care)
INSERT INTO patients (id, organization_id, mrn, first_name, last_name, dob, gender, service_line, status, primary_diagnosis, phone, address_city, address_state) VALUES
('p1111111-1111-1111-1111-111111111111', 'e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'MRN-78210', 'Eleanor', 'Pemberton', '1948-04-12', 'female', 'home_health', 'active', 'Chronic Heart Failure (CHF) & Mobility Impairment', '(214) 555-0123', 'Dallas', 'TX'),
('p2222222-2222-2222-2222-222222222222', 'e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'MRN-78211', 'Marcus', 'Vance', '1955-11-20', 'male', 'home_health', 'active', 'Post-Op Knee Arthroplasty Rehab', '(214) 555-0144', 'Plano', 'TX'),
('p3333333-3333-3333-3333-333333333333', 'e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'MRN-78212', 'Beatrice', 'Holloway', '1941-08-05', 'female', 'home_care', 'active', 'Alzheimers Support & Activities of Daily Living (ADL)', '(214) 555-0177', 'Richardson', 'TX'),
('p4444444-4444-4444-4444-444444444444', 'e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'MRN-78213', 'David', 'Kowalski', '1962-02-17', 'male', 'home_health', 'active', 'Type II Diabetes & Diabetic Foot Ulcer Stage 2', '(214) 555-0189', 'Irving', 'TX')
ON CONFLICT (id) DO NOTHING;

-- Insert Internal Messages / Alerts
INSERT INTO messages (organization_id, sender_id, subject, body, service_line, priority, is_read, created_at) VALUES
('e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'b2222222-2222-2222-2222-222222222222', 'Physician List Updates and Supervisor Follow-Up on Client Infection Logs', 'Please verify updated contact directives for Dr. Aris and complete weekly infection control audits.', 'home_care', 'urgent', false, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'b3333333-3333-3333-3333-333333333333', 'SN Pediatric Assessment Generates a Plan of Care', 'The 60-day recertification assessment for patient Pemberton is ready for supervisor sign-off.', 'home_care', 'routine', false, CURRENT_TIMESTAMP - INTERVAL '5 hours'),
('e2a44bb4-3e9a-4c91-9e23-7fa38b456211', 'b2222222-2222-2222-2222-222222222222', 'Elevate Your Axxess Experience at AGILE Summit', 'Review schedule adjustments for field staff attending clinical compliance training workshops.', 'home_health', 'routine', false, CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Insert Educational Announcements
INSERT INTO announcements (title, summary, category, video_url) VALUES
('Hospice & Home Care Is A Service Of The Future', 'Watch key industry leaders discuss the transition into modern digital EHR, patient-centric outcomes, and value-based care reimbursement.', 'Clinical Leadership', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
('How Axxess Intelligence Reduces Administrative Burden in Care at Home', 'Administrative responsibilities continue to grow. Discover how automated routing, smart scheduling, and AI documentation reduce nurse burnout.', 'Technology & AI', NULL),
('The Hidden Revenue Leak That AI Can Fix (And Most Organizations Do Not Realize)', 'Detect missing visits causing LUPAs, improve coding accuracy, and optimize clinical documentation before claim submission.', 'Revenue & Compliance', NULL);
