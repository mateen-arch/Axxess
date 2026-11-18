import { pool } from './db';

async function migratePatientCharts() {
  console.log('[Migration] Starting Patient Charts schema and seed...');
  try {
    // 1. Alter patients table
    await pool.query(`
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS email VARCHAR(150);
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS secondary_phone VARCHAR(30);
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS episode_start DATE;
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS episode_end DATE;
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS start_of_care_date DATE;
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS attending_physician VARCHAR(150);
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance_name VARCHAR(150);
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS policy_number VARCHAR(100);
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS primary_contact VARCHAR(150);
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS secondary_contact VARCHAR(150);
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS fall_risk BOOLEAN DEFAULT TRUE;
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS hospitalization_risk BOOLEAN DEFAULT TRUE;
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS infection_risk BOOLEAN DEFAULT TRUE;
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS full_code BOOLEAN DEFAULT TRUE;
    `);

    // 2. Create patient_tasks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patient_tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        task_name VARCHAR(255) NOT NULL,
        discipline VARCHAR(50) DEFAULT 'Nursing',
        status VARCHAR(50) NOT NULL DEFAULT 'Not Yet Due',
        schedule_start DATE NOT NULL,
        schedule_end DATE NOT NULL,
        assigned_to VARCHAR(150) NOT NULL,
        comments TEXT DEFAULT 'Not Available',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const orgRes = await pool.query(`SELECT id FROM organizations LIMIT 1`);
    const orgId = orgRes.rows[0]?.id || 'e2a44bb4-3e9a-4c91-9e23-7fa38b456211';

    // 3. Insert reference patients if not already present
    const checkAbuissa = await pool.query(`SELECT id FROM patients WHERE mrn = '1061' OR (first_name = 'Heather' AND last_name = 'Abuissa')`);
    let heatherId = checkAbuissa.rows[0]?.id;

    if (!heatherId) {
      const insRes = await pool.query(`
        INSERT INTO patients (
          organization_id, mrn, first_name, last_name, dob, gender, service_line, status,
          primary_diagnosis, phone, secondary_phone, email, address_street, address_city, address_state, address_zip,
          episode_start, episode_end, start_of_care_date, attending_physician,
          insurance_name, policy_number, primary_contact, secondary_contact,
          fall_risk, hospitalization_risk, infection_risk, full_code
        ) VALUES (
          $1, '1061', 'Heather', 'Abuissa', '1964-04-15', 'Female', 'home_health', 'active',
          'Type 2 Diabetes Mellitus with Neuropathy & Diabetic Foot Ulcer',
          '(351) 201-4985', NULL, 'heather.abuissa@gmail.com',
          '77 Sohier RD Apt 2B', 'Beverly', 'MA', '01915',
          '2026-10-26', '2026-12-24', '2026-10-26', 'RIGALI, LESLIE',
          'COMMONWEALTH CARE ALLIANCE', 'CCA-36563446600', 'Not Available', 'DEREK PRIME (617) 595-9512',
          true, true, true, true
        ) RETURNING id;
      `, [orgId]);
      heatherId = insRes.rows[0].id;
    }

    // Insert other patients from reference screenshot
    const refPatients = [
      {
        mrn: '1036',
        first: 'Marie V.',
        last: 'Anis',
        dob: '1958-02-10',
        gender: 'Female',
        sLine: 'home_health',
        phone: '(617) 293-8472',
        email: 'marie.anis@yahoo.com',
        street: '14 Harvard Ave',
        city: 'Boston',
        state: 'MA',
        zip: '02134',
        soc: '2026-10-15',
        epStart: '2026-10-15',
        epEnd: '2026-12-13',
        physician: 'GUPTA, MAULSHREE MD',
        insurance: 'MEDICARE PART A',
        policy: 'MCR-9920192',
        primaryContact: 'Jean Anis (617) 293-8470',
        secondaryContact: 'Not Available'
      },
      {
        mrn: '1002',
        first: 'Louis',
        last: 'Antoine',
        dob: '1952-11-04',
        gender: 'Male',
        sLine: 'home_health',
        phone: '(781) 948-2831',
        email: 'louis.antoine@comcast.net',
        street: '88 Washington St',
        city: 'Lynn',
        state: 'MA',
        zip: '01902',
        soc: '2026-10-01',
        epStart: '2026-10-01',
        epEnd: '2026-11-29',
        physician: 'KOWALOFF, EDWARD M.D.',
        insurance: 'MEDICAID',
        policy: 'MCD-839210',
        primaryContact: 'Marie Antoine (781) 948-2830',
        secondaryContact: 'Not Available'
      },
      {
        mrn: '1193',
        first: 'Jeffrey C.',
        last: 'Antoniotti',
        dob: '1960-08-21',
        gender: 'Male',
        sLine: 'home_health',
        phone: '(978) 582-1920',
        email: 'j.antoniotti@gmail.com',
        street: '402 Cabot St',
        city: 'Beverly',
        state: 'MA',
        zip: '01915',
        soc: '2026-10-10',
        epStart: '2026-10-10',
        epEnd: '2026-12-08',
        physician: 'GUPTA, MAULSHREE MD',
        insurance: 'MEDICAID',
        policy: 'MCD-910283',
        primaryContact: 'Jeffrey Antoniotti Jr (978) 582-1922',
        secondaryContact: 'Not Available'
      },
      {
        mrn: '464',
        first: 'Jocelene',
        last: 'Auguste',
        dob: '1971-06-18',
        gender: 'Female',
        sLine: 'home_health',
        phone: '(617) 582-9011',
        email: 'jocelene.auguste@verizon.net',
        street: '22 River St',
        city: 'Mattapan',
        state: 'MA',
        zip: '02126',
        soc: '2026-10-18',
        epStart: '2026-10-18',
        epEnd: '2026-12-16',
        physician: 'MUQQADUS, SYED M.D',
        insurance: 'COMMONWEALTH CARE ALLIANCE',
        policy: 'CCA-109283',
        primaryContact: 'Not Available',
        secondaryContact: 'Not Available'
      }
    ];

    for (const rp of refPatients) {
      const pCheck = await pool.query(`SELECT id FROM patients WHERE mrn = $1`, [rp.mrn]);
      if (pCheck.rows.length === 0) {
        await pool.query(`
          INSERT INTO patients (
            organization_id, mrn, first_name, last_name, dob, gender, service_line, status,
            primary_diagnosis, phone, email, address_street, address_city, address_state, address_zip,
            episode_start, episode_end, start_of_care_date, attending_physician,
            insurance_name, policy_number, primary_contact, secondary_contact,
            fall_risk, hospitalization_risk, infection_risk, full_code
          ) VALUES (
            $1, $2, $3, $4, $5::date, $6, $7, 'active',
            'Post-operative clinical monitoring & medication management',
            $8, $9, $10, $11, $12, $13,
            $14::date, $15::date, $16::date, $17,
            $18, $19, $20, $21,
            true, true, false, true
          );
        `, [
          orgId, rp.mrn, rp.first, rp.last, rp.dob, rp.gender, rp.sLine,
          rp.phone, rp.email, rp.street, rp.city, rp.state, rp.zip,
          rp.epStart, rp.epEnd, rp.soc, rp.physician,
          rp.insurance, rp.policy, rp.primaryContact, rp.secondaryContact
        ]);
      }
    }

    // 4. Update existing older patients with episode dates & contacts
    await pool.query(`
      UPDATE patients
      SET episode_start = '2026-10-01', episode_end = '2026-11-29', start_of_care_date = '2026-10-01',
          attending_physician = 'DR. MAULSHREE GUPTA MD', insurance_name = 'MEDICARE PART A',
          policy_number = 'MCR-78210', primary_contact = 'James Pemberton (214) 555-0124',
          secondary_contact = 'Not Available', fall_risk = true, hospitalization_risk = true,
          infection_risk = true, full_code = true
      WHERE first_name = 'Eleanor' AND last_name = 'Pemberton';

      UPDATE patients
      SET episode_start = '2026-09-15', episode_end = '2026-11-13', start_of_care_date = '2026-09-15',
          attending_physician = 'DR. KOWALOFF EDWARD MD', insurance_name = 'BLUE CROSS BLUE SHIELD',
          policy_number = 'BCBS-88319', primary_contact = 'Sarah Vance (214) 555-0145',
          secondary_contact = 'Not Available', fall_risk = true, hospitalization_risk = false,
          infection_risk = false, full_code = true
      WHERE first_name = 'Marcus' AND last_name = 'Vance';
    `);

    // 5. Seed tasks for Heather Abuissa matching the exact screenshot!
    const taskCount = await pool.query(`SELECT COUNT(*)::int as count FROM patient_tasks WHERE patient_id = $1`, [heatherId]);
    if (taskCount.rows[0].count === 0) {
      console.log('[Migration] Seeding tasks matching reference screenshot for Heather Abuissa...');

      const screenshotTasks = [
        {
          taskName: 'Communication Note',
          discipline: 'Nursing',
          status: 'Completed',
          start: '2026-11-09',
          end: '2026-11-09',
          assignedTo: 'Kristin Siegel',
          comments: 'Not Available'
        },
        {
          taskName: 'Coordination of Care',
          discipline: 'Nursing',
          status: 'Not Yet Due',
          start: '2026-12-15',
          end: '2026-12-15',
          assignedTo: 'Mary Kyalikunda',
          comments: 'Not Available'
        },
        {
          taskName: 'Coordination of Care',
          discipline: 'Nursing',
          status: 'Not Yet Due',
          start: '2026-11-15',
          end: '2026-11-15',
          assignedTo: 'Mary Kyalikunda',
          comments: 'Not Available'
        },
        {
          taskName: 'Face-to-Face Encounter',
          discipline: 'Physician Liaison',
          status: 'Returned w/ Physician Signature',
          start: '2026-10-26',
          end: '2026-10-26',
          assignedTo: 'Selina Mwakipunda',
          comments: 'Not Available'
        },
        {
          taskName: 'LPN - Oral Med. Management',
          discipline: 'Nursing',
          status: 'Not Yet Due',
          start: '2026-11-18',
          end: '2026-11-18',
          assignedTo: 'Marrio Fortune',
          comments: 'Not Available'
        },
        {
          taskName: 'LPN - Oral Med. Management',
          discipline: 'Nursing',
          status: 'Not Yet Due',
          start: '2026-12-03',
          end: '2026-12-03',
          assignedTo: 'Marrio Fortune',
          comments: 'Not Available'
        },
        {
          taskName: 'LPN - Oral Med. Management',
          discipline: 'Nursing',
          status: 'Not Yet Due',
          start: '2026-12-21',
          end: '2026-12-21',
          assignedTo: 'Marrio Fortune',
          comments: 'Not Available'
        }
      ];

      for (const st of screenshotTasks) {
        await pool.query(`
          INSERT INTO patient_tasks (
            organization_id, patient_id, task_name, discipline, status,
            schedule_start, schedule_end, assigned_to, comments
          ) VALUES ($1, $2, $3, $4, $5, $6::date, $7::date, $8, $9);
        `, [
          orgId, heatherId, st.taskName, st.discipline, st.status,
          st.start, st.end, st.assignedTo, st.comments
        ]);
      }
    }

    // Also populate default tasks for other patients if they have none
    const allPats = await pool.query(`SELECT id FROM patients WHERE id != $1`, [heatherId]);
    for (const pat of allPats.rows) {
      const tc = await pool.query(`SELECT COUNT(*)::int as count FROM patient_tasks WHERE patient_id = $1`, [pat.id]);
      if (tc.rows[0].count === 0) {
        await pool.query(`
          INSERT INTO patient_tasks (
            organization_id, patient_id, task_name, discipline, status,
            schedule_start, schedule_end, assigned_to, comments
          ) VALUES 
          ($1, $2, 'Communication Note', 'Nursing', 'Completed', '2026-11-05', '2026-11-05', 'Sarah Jenkins, RN', 'Not Available'),
          ($1, $2, 'Coordination of Care', 'Nursing', 'Not Yet Due', '2026-11-20', '2026-11-20', 'Alexandria Nelson, RN', 'Not Available'),
          ($1, $2, 'Physical Therapy Evaluation', 'Physical Therapy', 'Completed', '2026-11-02', '2026-11-02', 'Andre Bellevue, PT', 'Not Available'),
          ($1, $2, 'Face-to-Face Encounter', 'Physician Liaison', 'Returned w/ Physician Signature', '2026-10-28', '2026-10-28', 'Selina Mwakipunda', 'Not Available');
        `, [orgId, pat.id]);
      }
    }

    console.log('[Migration] Patient charts schema and seed completed successfully!');
  } catch (err) {
    console.error('[Migration Error]', err);
  } finally {
    await pool.end();
  }
}

migratePatientCharts();

