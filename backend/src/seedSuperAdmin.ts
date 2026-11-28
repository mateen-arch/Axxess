import { pool } from './db';
import { hashPassword } from './authUtils';

export async function initSuperAdminDatabase() {
  console.log('[SuperAdmin] Initializing Super Admin database tables & schemas...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 0. Ensure users.role is VARCHAR and organization_id is nullable
    await client.query(`
      ALTER TABLE users ALTER COLUMN organization_id DROP NOT NULL;
      ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
      ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(100) USING role::VARCHAR;
      ALTER TABLE users ALTER COLUMN role SET DEFAULT 'administrator';
    `);

    // 1. Extend USERS table with admin & moderation fields
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_reason TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_by VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS module_access TEXT[] DEFAULT ARRAY['central', 'home_health', 'connect']::TEXT[];
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS license_number VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS license_state VARCHAR(50) DEFAULT 'TX';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS license_status VARCHAR(50) DEFAULT 'verified';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'Clinical Operations';

      -- 1.1 Extend Core Entity Tables with approval_status for the Super Admin Verification Gate
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'approved';
      ALTER TABLE pharmacies ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'approved';
      ALTER TABLE physicians ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'approved';
      ALTER TABLE facilities ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'approved';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'approved';
      ALTER TABLE episodes ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'approved';
      ALTER TABLE insurance_payers ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'approved';
      ALTER TABLE generated_reports ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'approved';

      UPDATE patients SET approval_status = 'approved' WHERE approval_status IS NULL;
      UPDATE pharmacies SET approval_status = 'approved' WHERE approval_status IS NULL;
      UPDATE physicians SET approval_status = 'approved' WHERE approval_status IS NULL;
      UPDATE facilities SET approval_status = 'approved' WHERE approval_status IS NULL;
      UPDATE orders SET approval_status = 'approved' WHERE approval_status IS NULL;
      UPDATE episodes SET approval_status = 'approved' WHERE approval_status IS NULL;
      UPDATE insurance_payers SET approval_status = 'approved' WHERE approval_status IS NULL;
      UPDATE generated_reports SET approval_status = 'approved' WHERE approval_status IS NULL;
    `);

    // 2. MODERATION REPORTS TABLE (Messages, Users, PHI Violations)
    await client.query(`
      CREATE TABLE IF NOT EXISTS moderation_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        report_type VARCHAR(50) NOT NULL, -- 'message' | 'user' | 'phi_violation' | 'harassment'
        reporter_id VARCHAR(100),
        reporter_name VARCHAR(255) NOT NULL,
        reported_user_id VARCHAR(100),
        reported_user_name VARCHAR(255) NOT NULL,
        reported_message_id VARCHAR(100),
        message_content TEXT,
        reason TEXT NOT NULL,
        severity VARCHAR(50) DEFAULT 'medium', -- 'low' | 'medium' | 'high' | 'critical'
        status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'under_review' | 'resolved' | 'dismissed'
        action_taken VARCHAR(50) DEFAULT 'none', -- 'none' | 'message_deleted' | 'user_warned' | 'user_suspended' | 'user_blocked'
        admin_notes TEXT,
        reviewed_by VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_mod_reports_status ON moderation_reports(status);
      CREATE INDEX IF NOT EXISTS idx_mod_reports_created ON moderation_reports(created_at DESC);
    `);

    // 3. ADMIN APPROVALS & VERIFICATION QUEUE TABLE (Across 3 Modules)
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_approvals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        approval_type VARCHAR(50) NOT NULL, -- 'clinician_credential' | 'doctor_order_signature' | 'prior_authorization' | 'emergency_override' | 'incident_signoff'
        module VARCHAR(50) NOT NULL, -- 'central' | 'home_health' | 'connect'
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority VARCHAR(50) DEFAULT 'normal', -- 'low' | 'normal' | 'urgent' | 'critical'
        status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
        requested_by VARCHAR(255) NOT NULL,
        target_id VARCHAR(100),
        target_type VARCHAR(100),
        details JSONB DEFAULT '{}'::jsonb,
        reviewed_by VARCHAR(255),
        review_notes TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_admin_appr_mod_status ON admin_approvals(module, status);
      CREATE INDEX IF NOT EXISTS idx_admin_appr_created ON admin_approvals(created_at DESC);
    `);

    // 4. MODULE CONFIGS TABLE (Separate Management for Central, Home Health, Connect)
    await client.query(`
      CREATE TABLE IF NOT EXISTS module_configs (
        id VARCHAR(50) PRIMARY KEY, -- 'central' | 'home_health' | 'connect'
        name VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'operational', -- 'operational' | 'maintenance' | 'restricted'
        description TEXT,
        version VARCHAR(50) DEFAULT '2.4.0',
        settings JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_by VARCHAR(255) DEFAULT 'Super Admin',
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. ADMIN AUDIT LOGS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_name VARCHAR(255) NOT NULL DEFAULT 'Super Admin',
        admin_email VARCHAR(255) NOT NULL DEFAULT 'admin@careorbit.health',
        action VARCHAR(100) NOT NULL,
        module VARCHAR(50) NOT NULL DEFAULT 'global',
        entity_type VARCHAR(100) NOT NULL,
        entity_id VARCHAR(100),
        details JSONB DEFAULT '{}'::jsonb,
        ip_address VARCHAR(50) DEFAULT '127.0.0.1',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit_logs(created_at DESC);
    `);

    // =====================================================================
    // 6. SEED ESSENTIAL SUPER ADMIN DATA (IDEMPOTENT)
    // =====================================================================

    // 6.1 Default Module Configurations for the 3 System Modules
    await client.query(`
      INSERT INTO module_configs (id, name, status, description, version, settings, updated_by, updated_at)
      VALUES 
        (
          'central',
          'CareOrbit Central',
          'operational',
          'Centralized Intake, Patient Charts, Territory Roster, and Real-time Census Analytics Hub',
          '2.4.0',
          '{
            "intakeAutoRouting": true,
            "referralThresholdHours": 24,
            "maxActiveCensusPerBranch": 500,
            "allowCrossBranchTransfers": true,
            "requireSupervisorIntakeApproval": false,
            "branchesEnabled": ["Standards Home Care", "Dallas Metro", "Fort Worth East"]
          }'::jsonb,
          'Super Admin',
          NOW()
        ),
        (
          'home_health',
          'CareOrbit Home Health',
          'operational',
          'Clinical EMR, OASIS-E Assessments, 60-Day Episode Management, Orders QA & EVV Compliance',
          '2.4.0',
          '{
            "oasisComplianceDays": 5,
            "requirePhysicianSignatureTimeoutDays": 14,
            "autoLockApprovedEpisodes": true,
            "evvGeofenceRadiusMeters": 150,
            "infectionSurveillanceAlerts": true,
            "incidentSeverityReviewThreshold": "high",
            "qaSamplingRatePercent": 100
          }'::jsonb,
          'Super Admin',
          NOW()
        ),
        (
          'connect',
          'CareOrbit Connect & Planner',
          'operational',
          'HIPAA-Compliant Care Team Messaging, Field Route Planner, and Clinical Triage Channels',
          '2.4.0',
          '{
            "enableChatAuditing": true,
            "autoFilterProfanity": true,
            "autoFlagPhiDisclosures": true,
            "chatRetentionDays": 365,
            "allowFileAttachments": true,
            "maxAttachmentSizeMb": 25,
            "triageBroadcastRestricted": true,
            "allowPatientDirectMessaging": false
          }'::jsonb,
          'Super Admin',
          NOW()
        )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description;
    `);

    // 6.2 Ensure Super Admin user exists
    const orgRes = await client.query('SELECT id FROM organizations LIMIT 1');
    const defaultOrgId = orgRes.rows[0]?.id || null;

    const superAdminCheck = await client.query(`SELECT id FROM users WHERE email = 'admin@careorbit.health' LIMIT 1`);
    if (superAdminCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO users (
          id, organization_id, email, password_hash, full_name, role, is_active, is_super_admin, status,
          department, module_access, title, license_number, license_status
        ) VALUES (
          gen_random_uuid(),
          $1,
          'admin@careorbit.health',
          'pbkdf2:superadminsecurehash2026',
          'Sarah Sterling, MD',
          'super_admin',
          true,
          true,
          'active',
          'Executive Administration',
          ARRAY['central', 'home_health', 'connect']::TEXT[],
          'Chief Medical & Compliance Officer',
          'TX-MD-992104',
          'verified'
        ) ON CONFLICT DO NOTHING;
      `, [defaultOrgId]);
    } else {
      await client.query(`
        UPDATE users 
        SET is_super_admin = true, status = 'active', module_access = ARRAY['central', 'home_health', 'connect']::TEXT[]
        WHERE email = 'admin@careorbit.health';
      `);
    }

    // 6.3 Seed sample users with various statuses (active, pending_approval, blocked, suspended)
    await client.query(`
      INSERT INTO users (
        organization_id, email, password_hash, full_name, role, is_active, is_super_admin, status,
        department, module_access, title, license_number, license_status, blocked_reason, blocked_at, blocked_by
      ) VALUES 
        (
          $1,
          'kristin.siegel@careorbit.health',
          'pbkdf2:demo123',
          'Kristin Siegel, RN',
          'clinician',
          true,
          false,
          'active',
          'Clinical Services',
          ARRAY['central', 'home_health', 'connect']::TEXT[],
          'Field Registered Nurse',
          'RN-TX-884120',
          'verified',
          NULL, NULL, NULL
        ),
        (
          $1,
          'marcus.bell@careorbit.health',
          'pbkdf2:demo123',
          'Marcus Bell, PT',
          'clinician',
          false,
          false,
          'pending_approval',
          'Rehabilitation',
          ARRAY['home_health', 'connect']::TEXT[],
          'Physical Therapist Specialist',
          'PT-TX-109483',
          'pending_verification',
          NULL, NULL, NULL
        ),
        (
          $1,
          'elena.rostova@careorbit.health',
          'pbkdf2:demo123',
          'Elena Rostova, LPN',
          'clinician',
          false,
          false,
          'pending_approval',
          'Skilled Nursing',
          ARRAY['home_health']::TEXT[],
          'Licensed Practical Nurse',
          'LPN-TX-551029',
          'pending_verification',
          NULL, NULL, NULL
        ),
        (
          $1,
          'devon.ward@careorbit.health',
          'pbkdf2:demo123',
          'Devon Ward',
          'staff',
          false,
          false,
          'blocked',
          'Operations',
          ARRAY['connect']::TEXT[],
          'Intake Assistant',
          NULL,
          'expired',
          'Repeated policy violation: Transmitted unredacted patient SSN over unencrypted public triage channel.',
          NOW() - INTERVAL '2 days',
          'Sarah Sterling, MD'
        ),
        (
          $1,
          'alex.reid@careorbit.health',
          'pbkdf2:demo123',
          'Alex Reid, MSW',
          'case_manager',
          false,
          false,
          'suspended',
          'Medical Social Work',
          ARRAY['central', 'home_health']::TEXT[],
          'Medical Social Worker',
          'LCSW-TX-330192',
          'verified',
          'Temporary credential audit hold pending state renewal receipt.',
          NOW() - INTERVAL '5 days',
          'Sarah Sterling, MD'
        )
      ON CONFLICT (email) DO UPDATE SET
        status = EXCLUDED.status,
        license_status = EXCLUDED.license_status,
        module_access = EXCLUDED.module_access;
    `, [defaultOrgId]);

    // 6.4 Seed Moderation Reports (Reported Messages & Reported Users)
    const existingReports = await client.query('SELECT COUNT(*) FROM moderation_reports');
    if (parseInt(existingReports.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO moderation_reports (
          report_type, reporter_id, reporter_name, reported_user_id, reported_user_name,
          reported_message_id, message_content, reason, severity, status, action_taken, admin_notes
        ) VALUES 
          (
            'message',
            'sarah-jenkins',
            'Sarah Jenkins, RN',
            'devon.ward',
            'Devon Ward',
            'msg-flag-01',
            'Patient John Doe SSN is 000-12-3456 please update authorization sheet right now.',
            'Unencrypted PHI transmission violating HIPAA Minimum Necessary Rule in general triage room.',
            'critical',
            'resolved',
            'user_blocked',
            'Message scrubbed from chat records. User Devon Ward blocked from all messaging channels by compliance officer.'
          ),
          (
            'message',
            'alexandria-nelson',
            'Alexandria Nelson, RN',
            'marrio-fortune',
            'Marrio Fortune, LPN',
            'msg-flag-02',
            'I cannot deal with this patient family again, they are completely incompetent and unreasonable!!',
            'Unprofessional and disparaging language regarding patient family in Care Team conversation.',
            'medium',
            'pending',
            'none',
            'Under review by Super Admin. Pending mediation warning.'
          ),
          (
            'user',
            'carolyn-akukwe',
            'Carolyn Akukwe, RN',
            'temp-contractor-99',
            'Thomas Blake, CNA',
            NULL,
            NULL,
            'Repeatedly refusing electronic visit verification check-in and sending hostile messages to dispatch.',
            'high',
            'pending',
            'none',
            'Supervisor review requested before contract termination.'
          ),
          (
            'phi_violation',
            'system-monitor',
            'CareOrbit Automated HIPAA Guard',
            'kristin-siegel',
            'Kristin Siegel, RN',
            'msg-flag-03',
            'Patient medical record image shared: wound_chart_unmasked_face.jpg',
            'Automated AI detection: Patient facial biometric visible without written consent form on file.',
            'high',
            'under_review',
            'none',
            'Automated hold placed on image attachment. Awaiting clinician blur confirmation.'
          )
      `);
    }

    // 6.5 Seed Admin Approvals Queue (Across Central, Home Health, Connect)
    const existingApprovals = await client.query('SELECT COUNT(*) FROM admin_approvals');
    if (parseInt(existingApprovals.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO admin_approvals (
          approval_type, module, title, description, priority, status, requested_by, target_id, target_type, details
        ) VALUES 
          (
            'clinician_credential',
            'home_health',
            'New Clinician License Verification: Marcus Bell, PT',
            'Physical Therapist credentialing submission for Texas Board of Physical Therapy Examiners license #PT-TX-109483.',
            'urgent',
            'pending',
            'Credentialing Dept',
            'user-marcus-bell',
            'user',
            '{
              "clinicianName": "Marcus Bell, PT",
              "licenseNumber": "PT-TX-109483",
              "discipline": "Physical Therapy",
              "npi": "1942048123",
              "expirationDate": "2027-10-31",
              "boardVerified": true,
              "backgroundCheck": "Cleared (State & FBI)"
            }'::jsonb
          ),
          (
            'clinician_credential',
            'home_health',
            'New Clinician License Verification: Elena Rostova, LPN',
            'Licensed Practical Nurse credentialing submission for Texas Board of Nursing license #LPN-TX-551029.',
            'normal',
            'pending',
            'Credentialing Dept',
            'user-elena-rostova',
            'user',
            '{
              "clinicianName": "Elena Rostova, LPN",
              "licenseNumber": "LPN-TX-551029",
              "discipline": "Nursing",
              "npi": "1588204918",
              "expirationDate": "2028-04-15",
              "boardVerified": true,
              "backgroundCheck": "Cleared"
            }'::jsonb
          ),
          (
            'doctor_order_signature',
            'home_health',
            'Physician Verbal Order Verification: High-Risk Anticoagulant',
            'Verbal order given by Dr. Leslie Rigali for patient Heather Abuissa: Enoxaparin (Lovenox) 40mg SQ Daily x 14 days.',
            'urgent',
            'pending',
            'Alexandria Nelson, RN',
            'ord-verbal-1061',
            'order',
            '{
              "patientName": "Heather Abuissa",
              "mrn": "1061",
              "physician": "Dr. Leslie Rigali, MD",
              "medication": "Enoxaparin 40mg SubQ Daily",
              "indication": "Deep Vein Thrombosis Prophylaxis post-op",
              "readBackVerified": true,
              "orderType": "Verbal Order"
            }'::jsonb
          ),
          (
            'prior_authorization',
            'central',
            'Prior Authorization Override: BCBS Texas Skilled Nursing',
            'Payer Blue Cross Blue Shield authorization pending past 48hr turnaround window for patient Marie V. Anis.',
            'urgent',
            'pending',
            'Intake Supervisor',
            'auth-bcbs-1036',
            'authorization',
            '{
              "patientName": "Marie V. Anis",
              "mrn": "1036",
              "payer": "Blue Cross Blue Shield of Texas",
              "requestedVisits": 12,
              "socDate": "2026-11-28",
              "overrideReason": "Urgent wound management prevents hospital readmission"
            }'::jsonb
          ),
          (
            'incident_signoff',
            'home_health',
            'Clinical Incident Report Review: Level 2 Medication Error',
            'Nurse reported omitted insulin dose due to pharmacy delivery delay. Patient blood glucose monitored at 134 mg/dL.',
            'normal',
            'approved',
            'Quality Assurance',
            'inc-med-error-09',
            'incident',
            '{
              "patientName": "David Kowalski",
              "reporter": "Carolyn Akukwe, RN",
              "severity": "Level 2 (Zero Harm)",
              "correctiveAction": "Pharmacy delivery SLA escalation protocol enacted",
              "physicianNotified": true
            }'::jsonb
          ),
          (
            'emergency_override',
            'connect',
            'Emergency Agency-Wide Triage Broadcast Authorization',
            'Request to broadcast severe weather road closure warning and field visit suspension protocol to all clinicians.',
            'critical',
            'approved',
            'Operations Director',
            'broadcast-req-99',
            'broadcast',
            '{
              "title": "Severe Flash Flood Warning - North Texas Territory",
              "targetAudience": "All Active Field Clinicians",
              "actionRequired": "Shelter in place / Re-route afternoon visits"
            }'::jsonb
          )
      `);
    }

    // 6.6 Seed Initial Admin Audit Logs
    const existingLogs = await client.query('SELECT COUNT(*) FROM admin_audit_logs');
    if (parseInt(existingLogs.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO admin_audit_logs (
          admin_name, admin_email, action, module, entity_type, entity_id, details
        ) VALUES 
          (
            'Sarah Sterling, MD',
            'admin@careorbit.health',
            'USER_BLOCKED',
            'connect',
            'user',
            'devon.ward',
            '{"reason": "HIPAA PHI disclosure in public channel", "blockedBy": "Sarah Sterling, MD"}'::jsonb
          ),
          (
            'Sarah Sterling, MD',
            'admin@careorbit.health',
            'MODULE_CONFIG_UPDATE',
            'home_health',
            'module_config',
            'home_health',
            '{"updatedSetting": "qaSamplingRatePercent", "previousValue": 50, "newValue": 100}'::jsonb
          ),
          (
            'Sarah Sterling, MD',
            'admin@careorbit.health',
            'APPROVAL_DECISION',
            'connect',
            'admin_approval',
            'broadcast-req-99',
            '{"decision": "approved", "notes": "Approved emergency weather alert dispatch"}'::jsonb
          ),
          (
            'Sarah Sterling, MD',
            'admin@careorbit.health',
            'USER_CREATED',
            'central',
            'user',
            'kristin.siegel@careorbit.health',
            '{"role": "clinician", "moduleAccess": ["central", "home_health", "connect"]}'::jsonb
          )
      `);
    }

    // 6.4 Ensure ONLY admin@careorbit.health is super_admin and upgrade placeholder password hashes to real scrypt hashes
    await client.query(`
      UPDATE users SET is_super_admin = false WHERE LOWER(email) <> 'admin@careorbit.health';
      UPDATE users SET is_super_admin = true, role = 'super_admin', status = 'active', is_active = true WHERE LOWER(email) = 'admin@careorbit.health';
    `);

    const usersToUpgrade = await client.query(`SELECT id, email, password_hash FROM users`);
    for (const u of usersToUpgrade.rows) {
      if (!u.password_hash || !String(u.password_hash).startsWith('scrypt:')) {
        const lowerEmail = String(u.email || '').toLowerCase();
        let defaultPw = 'CareOrbit@2026!';
        if (lowerEmail === 'admin@careorbit.health') {
          defaultPw = 'Admin@CareOrbit2026!';
        } else if (lowerEmail === 'alexandria.nelson@standardshomecare.com') {
          defaultPw = 'Nurse@2026!';
        }
        await client.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [hashPassword(defaultPw), u.id]);
      }
    }

    await client.query('COMMIT');
    console.log('[SuperAdmin] Super Admin tables and seed data initialized successfully.');
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[SuperAdmin Error] Failed to initialize Super Admin database:', err);
    throw err;
  } finally {
    client.release();
  }
}
