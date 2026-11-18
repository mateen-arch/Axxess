import { pool } from './db';

async function migrate() {
  console.log('[Migration] Starting intake table columns update...');
  try {
    await pool.query(`
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS client_first_name VARCHAR(100);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS client_last_name VARCHAR(100);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS phone_type VARCHAR(20) DEFAULT 'Home';
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS contact_first_name VARCHAR(100);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS contact_last_name VARCHAR(100);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS contact_phone_type VARCHAR(20) DEFAULT 'Mobile';
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS contact_relationship VARCHAR(100);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS branch VARCHAR(150) DEFAULT 'Standards Home Care';
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS service_requested VARCHAR(255);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS assigned_team_member VARCHAR(150);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS follow_up_date DATE;
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'new';
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS dob DATE;
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS gender VARCHAR(20) DEFAULT 'Female';
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS requested_soc DATE;
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS mrn VARCHAR(50);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS created_by VARCHAR(150) DEFAULT 'Intake Team';
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS liaison VARCHAR(150);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS tags VARCHAR(255);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS notes TEXT;
    `);

    const orgIdRes = await pool.query(`SELECT id FROM organizations LIMIT 1`);
    const orgId = orgIdRes.rows[0]?.id || 'e2a44bb4-3e9a-4c91-9e23-7fa38b456211';

    // Update existing 5 rows
    await pool.query(`
      UPDATE intake_referrals 
      SET client_first_name = 'Harold', client_last_name = 'Finch', phone = '(214) 555-0144',
          branch = 'Dallas Main Branch', requested_soc = CURRENT_DATE + INTERVAL '2 days',
          dob = '1948-03-12', gender = 'Male', mrn = 'MRN-78216', created_by = 'Baylor Scott & White Liaison',
          liaison = 'Baylor Scott & White', tags = 'Skilled Nursing, Wound Care', status = 'pending',
          notes = 'Recent pacemaker implantation, wound check required. Ready for SOC scheduling.'
      WHERE patient_name = 'Harold Finch';
    `);

    await pool.query(`
      UPDATE intake_referrals 
      SET client_first_name = 'Gladys', client_last_name = 'Baker', phone = '(214) 555-0811',
          contact_first_name = 'Arthur', contact_last_name = 'Baker', contact_phone = '(214) 555-0812',
          contact_relationship = 'Spouse', branch = 'Standards Home Care', service_requested = 'Post-stroke rehab & Physical Therapy',
          assigned_team_member = 'Sarah Jenkins, RN', follow_up_date = CURRENT_DATE + INTERVAL '1 day',
          status = 'contacted', urgency = 'routine', notes = 'Inquiry regarding physical therapy frequency for post-stroke recovery'
      WHERE patient_name = 'Gladys Baker';
    `);

    await pool.query(`
      UPDATE intake_referrals 
      SET client_first_name = 'Robert', client_last_name = 'Thorne', phone = '(972) 555-0199',
          branch = 'Plano Regional Branch', requested_soc = CURRENT_DATE - INTERVAL '3 days',
          dob = '1945-11-20', gender = 'Male', mrn = 'MRN-78217', created_by = 'Family Liaison',
          status = 'admitted', admitted_at = CURRENT_TIMESTAMP - INTERVAL '3 days',
          notes = 'Companion care and meal prep 4 days/week. Admission completed successfully.'
      WHERE patient_name = 'Robert Thorne';
    `);

    await pool.query(`
      UPDATE intake_referrals 
      SET client_first_name = 'Miriam', client_last_name = 'Vance', phone = '(214) 555-0182',
          contact_first_name = 'Evelyn', contact_last_name = 'Vance', contact_phone = '(214) 555-0183',
          contact_relationship = 'Daughter', branch = 'Dallas Main Branch', service_requested = 'Personal Care & Attendant Aide',
          assigned_team_member = 'Alexandria Nelson, RN', follow_up_date = CURRENT_DATE + INTERVAL '2 days',
          status = 'new', urgency = 'urgent', notes = 'Assisted living transition evaluation and personal care request'
      WHERE patient_name = 'Miriam Vance';
    `);

    await pool.query(`
      UPDATE intake_referrals 
      SET client_first_name = 'Samuel', client_last_name = 'Adams', phone = '(469) 555-0322',
          branch = 'Dallas Main Branch', requested_soc = CURRENT_DATE + INTERVAL '1 day',
          dob = '1953-07-08', gender = 'Male', mrn = 'MRN-78218', created_by = 'Dallas Regional Discharge',
          liaison = 'Dallas Regional Medical', tags = 'IV Therapy, Wound Care', status = 'pending',
          notes = 'IV Antibiotic therapy and daily dressing changes.'
      WHERE patient_name = 'Samuel Adams';
    `);

    // Check count of inquiries
    const inqCount = await pool.query(`SELECT COUNT(*)::int as count FROM intake_referrals WHERE patient_name = 'Robert Hernandez'`);
    if (inqCount.rows[0].count === 0) {
      console.log('[Migration] Inserting additional clinical seed inquiries & referrals...');

      await pool.query(`
        INSERT INTO intake_referrals (
          organization_id, patient_name, client_first_name, client_last_name, phone, phone_type,
          contact_first_name, contact_last_name, contact_phone, contact_phone_type, contact_relationship,
          service_line, referral_source, service_requested, branch, assigned_team_member,
          follow_up_date, stage, status, urgency, clinical_summary, received_at
        ) VALUES 
        (
          $1, 'Robert Hernandez', 'Robert', 'Hernandez', '(214) 555-0482', 'Home',
          'Maria', 'Hernandez', '(214) 555-0483', 'Mobile', 'Daughter / Primary Caregiver',
          'home_health', 'Hospital Discharge', 'Skilled Nursing & Wound VAC Care', 'Dallas Main Branch', 'Sarah Jenkins, RN',
          CURRENT_DATE + INTERVAL '1 day', 'inquiry', 'new', 'urgent',
          'Client discharged following surgical debridement. Needs skilled nurse for dressing changes 3x weekly.',
          CURRENT_TIMESTAMP - INTERVAL '3 hours'
        )
      `, [orgId]);

      await pool.query(`
        INSERT INTO intake_referrals (
          organization_id, patient_name, client_first_name, client_last_name, phone, phone_type,
          contact_first_name, contact_last_name, contact_phone, contact_phone_type, contact_relationship,
          service_line, referral_source, service_requested, branch, assigned_team_member,
          follow_up_date, stage, status, urgency, clinical_summary, received_at
        ) VALUES 
        (
          $1, 'Eleanor Pemberton', 'Eleanor', 'Pemberton', '(214) 555-0123', 'Home',
          'James', 'Pemberton', '(214) 555-0124', 'Mobile', 'Son',
          'home_health', 'Physician Referral', 'CHF Management & Telehealth Setup', 'Standards Home Care', 'Alexandria Nelson, RN',
          CURRENT_DATE + INTERVAL '3 days', 'inquiry', 'contacted', 'routine',
          'Cardiologist Dr. Garcia referred for vitals monitoring, diuretic titration, and diet education.',
          CURRENT_TIMESTAMP - INTERVAL '1 day'
        )
      `, [orgId]);

      await pool.query(`
        INSERT INTO intake_referrals (
          organization_id, patient_name, client_first_name, client_last_name, phone, phone_type,
          contact_first_name, contact_last_name, contact_phone, contact_phone_type, contact_relationship,
          service_line, referral_source, service_requested, branch, assigned_team_member,
          follow_up_date, stage, status, urgency, clinical_summary, received_at
        ) VALUES 
        (
          $1, 'David Kowalski', 'David', 'Kowalski', '(214) 555-0189', 'Home',
          'Barbara', 'Kowalski', '(214) 555-0190', 'Mobile', 'Wife',
          'home_health', 'Self / Family Referral', 'Diabetic Foot Ulcer Care', 'Plano Regional Branch', 'Susanna Welch, BSN',
          CURRENT_DATE + INTERVAL '1 day', 'inquiry', 'converted', 'urgent',
          'Converted from inquiry to active clinical referral for wound management.',
          CURRENT_TIMESTAMP - INTERVAL '4 days'
        )
      `, [orgId]);

      await pool.query(`
        INSERT INTO intake_referrals (
          organization_id, patient_name, client_first_name, client_last_name, phone, phone_type,
          contact_first_name, contact_last_name, contact_phone, contact_phone_type, contact_relationship,
          service_line, referral_source, service_requested, branch, assigned_team_member,
          follow_up_date, stage, status, urgency, clinical_summary, received_at
        ) VALUES 
        (
          $1, 'Beatrice Holloway', 'Beatrice', 'Holloway', '(214) 555-0177', 'Home',
          'Thomas', 'Holloway', '(214) 555-0178', 'Mobile', 'Son',
          'home_care', 'Social Worker', 'Alzheimer Support & Companion Care', 'Fort Worth Branch', 'Sarah Jenkins, RN',
          CURRENT_DATE + INTERVAL '4 days', 'inquiry', 'contacted', 'routine',
          'Needs 4 hours daily memory care and meal prep.',
          CURRENT_TIMESTAMP - INTERVAL '2 days'
        )
      `, [orgId]);

      await pool.query(`
        INSERT INTO intake_referrals (
          organization_id, patient_name, client_first_name, client_last_name, phone,
          service_line, referral_source, branch, requested_soc, dob, gender, mrn,
          created_by, liaison, tags, stage, status, urgency, notes, received_at
        ) VALUES 
        (
          $1, 'Carmene Hileus', 'Carmene', 'Hileus', '(857) 249-0056',
          'home_care', 'Other', 'Standards Home Care', CURRENT_DATE + INTERVAL '3 days', '1948-02-26', 'Female', 'MRN-78421',
          'MELISSA SWEENEY', 'Not Available', 'Personal Care, Mobility Support', 'referral', 'pending', 'routine',
          'Family inquiry for daily home care attendant and mobility support.',
          CURRENT_TIMESTAMP - INTERVAL '5 days'
        )
      `, [orgId]);

      await pool.query(`
        INSERT INTO intake_referrals (
          organization_id, patient_name, client_first_name, client_last_name, phone,
          service_line, referral_source, branch, requested_soc, dob, gender, mrn,
          created_by, liaison, tags, stage, status, urgency, notes, received_at
        ) VALUES 
        (
          $1, 'William Bradford', 'William', 'Bradford', '(857) 299-1029',
          'home_health', 'Hospital Discharge', 'Dallas Main Branch', CURRENT_DATE + INTERVAL '1 day', '1952-11-14', 'Male', 'MRN-78422',
          'CHLOE MERCER', 'Texas Health Presbyterian', 'Physical Therapy, Fall Risk', 'referral', 'pending', 'urgent',
          'Post total knee arthroplasty rehab. PT 3x weekly ordered.',
          CURRENT_TIMESTAMP - INTERVAL '2 days'
        )
      `, [orgId]);

      await pool.query(`
        INSERT INTO intake_referrals (
          organization_id, patient_name, client_first_name, client_last_name, phone,
          service_line, referral_source, branch, requested_soc, dob, gender, mrn,
          created_by, liaison, tags, stage, status, urgency, notes, received_at
        ) VALUES 
        (
          $1, 'Clara Oswald', 'Clara', 'Oswald', '(214) 555-0195',
          'home_health', 'Pulmonology Clinic', 'Dallas Main Branch', CURRENT_DATE - INTERVAL '1 day', '1950-09-14', 'Female', 'MRN-78214',
          'INTAKE TEAM', 'Dr. Maulshree Gupta MD', 'Oxygen Protocol, Skilled Nursing', 'admitted', 'admitted', 'routine',
          'COPD management and O2 protocol titration completed.',
          CURRENT_TIMESTAMP - INTERVAL '6 days'
        )
      `, [orgId]);
    }

    console.log('[Migration] Migration and seed completed successfully!');
  } catch (error) {
    console.error('[Migration Error]', error);
  } finally {
    await pool.end();
  }
}

migrate();
