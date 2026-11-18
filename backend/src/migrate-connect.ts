import { pool } from './db';

async function migrateConnect() {
  console.log('--- Migrating Connect & Planner Tables ---');

  // 1. Create conversations table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id VARCHAR(100) PRIMARY KEY,
      type VARCHAR(50) NOT NULL DEFAULT 'direct', -- 'direct' | 'care_team' | 'channel'
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
  `);

  // 2. Create conversation_participants table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS conversation_participants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id VARCHAR(100) REFERENCES conversations(id) ON DELETE CASCADE,
      clinician_id UUID REFERENCES clinicians(id) ON DELETE SET NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255),
      status VARCHAR(50) DEFAULT 'online'
    );
  `);

  // 3. Create chat_messages table
  await pool.query(`
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
  `);

  // 4. Create call_logs table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS call_logs (
      id VARCHAR(100) PRIMARY KEY,
      contact_name VARCHAR(255) NOT NULL,
      contact_role VARCHAR(255),
      direction VARCHAR(20) NOT NULL, -- 'incoming' | 'outgoing' | 'missed'
      call_type VARCHAR(20) NOT NULL DEFAULT 'audio', -- 'audio' | 'video'
      duration VARCHAR(50) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Tables created successfully. Now seeding initial conversations & messages...');

  // Get patients
  const patRes = await pool.query(`SELECT id, mrn, first_name, last_name FROM patients`);
  const patientsMap: Record<string, { id: string; name: string; mrn: string }> = {};
  for (const p of patRes.rows) {
    patientsMap[p.mrn] = { id: p.id, name: `${p.first_name} ${p.last_name}`, mrn: p.mrn };
  }

  // Clear existing connect demo data if any
  await pool.query(`DELETE FROM chat_messages;`);
  await pool.query(`DELETE FROM conversation_participants;`);
  await pool.query(`DELETE FROM conversations;`);
  await pool.query(`DELETE FROM call_logs;`);

  // 1. Heather Abuissa Care Team
  const abuissa = patientsMap['1061'];
  if (abuissa) {
    await pool.query(`
      INSERT INTO conversations (id, type, title, subtitle, patient_id, patient_name, service_line, is_pinned, is_urgent, created_at, updated_at)
      VALUES (
        'conv-care-abuissa',
        'care_team',
        'Heather Abuissa (1061) Care Team',
        'Sarah Jenkins RN, Alexandria Nelson RN, Dr. Leslie Rigali',
        $1,
        'Heather Abuissa',
        'home_health',
        true,
        false,
        '2026-11-06 08:30:00',
        '2026-11-06 10:24:00'
      );
    `, [abuissa.id]);

    await pool.query(`
      INSERT INTO conversation_participants (conversation_id, name, role, status)
      VALUES 
        ('conv-care-abuissa', 'Sarah Jenkins, RN', 'Primary Case Manager', 'online'),
        ('conv-care-abuissa', 'Alexandria Nelson, RN', 'Field Clinician (RN)', 'online'),
        ('conv-care-abuissa', 'Dr. Leslie Rigali', 'Attending Physician', 'busy');
    `);

    await pool.query(`
      INSERT INTO chat_messages (id, conversation_id, sender_id, sender_name, sender_role, content, is_read, created_at, attachment_name, attachment_type, attachment_size, attachment_url)
      VALUES 
        (
          'msg-ab-1',
          'conv-care-abuissa',
          'sarah-jenkins',
          'Sarah Jenkins, RN',
          'Primary Case Manager',
          'Patient Heather Abuissa reported mild discomfort at right heel margin during morning dressing change. Granulation tissue looks healthy and pink.',
          true,
          '2026-11-06 09:15:00',
          NULL, NULL, NULL, NULL
        ),
        (
          'msg-ab-2',
          'conv-care-abuissa',
          'alexandria-nelson',
          'Alexandria Nelson, RN',
          'Field Clinician (RN)',
          'Confirmed. Ulcer measurement recorded at 2.1cm x 1.4cm with 0 depth. Applied collagen matrix dressing and secured offloading boot.',
          true,
          '2026-11-06 09:42:00',
          'DFU_Debridement_Note_Nov2026.pdf', 'pdf', '480 KB', '/api/connect/attachments/DFU_Debridement_Note_Nov2026.pdf'
        ),
        (
          'msg-ab-3',
          'conv-care-abuissa',
          'sarah-jenkins',
          'Sarah Jenkins, RN',
          'Primary Case Manager',
          'Wound measurement updated: 2.1cm x 1.4cm with healthy granulation tissue. Order renewal requested from Dr. Rigali.',
          false,
          '2026-11-06 10:24:00',
          NULL, NULL, NULL, NULL
        );
    `);
  }

  // 2. Direct Chat: Alexandria Nelson, RN
  await pool.query(`
    INSERT INTO conversations (id, type, title, subtitle, patient_id, patient_name, service_line, is_pinned, is_urgent, created_at, updated_at)
    VALUES (
      'conv-alexandria',
      'direct',
      'Alexandria Nelson, RN',
      'Field Clinician • Skilled Nursing',
      NULL,
      NULL,
      'home_health',
      true,
      false,
      '2026-11-05 14:00:00',
      '2026-11-06 09:50:00'
    );
  `);

  await pool.query(`
    INSERT INTO conversation_participants (conversation_id, name, role, status)
    VALUES ('conv-alexandria', 'Alexandria Nelson, RN', 'Skilled Field Nurse', 'online');
  `);

  await pool.query(`
    INSERT INTO chat_messages (id, conversation_id, sender_id, sender_name, sender_role, content, is_read, created_at, attachment_name, attachment_type, attachment_size, attachment_url)
    VALUES 
      (
        'msg-an-1',
        'conv-alexandria',
        'alexandria-nelson',
        'Alexandria Nelson, RN',
        'Skilled Field Nurse',
        'Good morning! I finished Eleanor Pemberton encounter early. Proceeding to Heather Abuissa recertification visit.',
        true,
        '2026-11-06 09:10:00',
        NULL, NULL, NULL, NULL
      ),
      (
        'msg-an-2',
        'conv-alexandria',
        'alexandria-nelson',
        'Alexandria Nelson, RN',
        'Skilled Field Nurse',
        'Attaching Eleanor OASIS Comprehensive Recertification Protocol for review before supervisor lock.',
        false,
        '2026-11-06 09:50:00',
        'OASIS_Recertification_Protocol.pdf', 'pdf', '640 KB', '/api/connect/attachments/OASIS_Recertification_Protocol.pdf'
      );
  `);

  // 3. Direct Chat: Carolyn Akukwe, RN
  await pool.query(`
    INSERT INTO conversations (id, type, title, subtitle, patient_id, patient_name, service_line, is_pinned, is_urgent, created_at, updated_at)
    VALUES (
      'conv-carolyn',
      'direct',
      'Carolyn Akukwe, RN',
      'Case Manager • Rehabilitation & Care Coordination',
      NULL,
      NULL,
      'home_health',
      false,
      true,
      '2026-11-04 11:00:00',
      '2026-11-06 08:45:00'
    );
  `);

  await pool.query(`
    INSERT INTO conversation_participants (conversation_id, name, role, status)
    VALUES ('conv-carolyn', 'Carolyn Akukwe, RN', 'Case Manager (RN)', 'online');
  `);

  await pool.query(`
    INSERT INTO chat_messages (id, conversation_id, sender_id, sender_name, sender_role, content, is_read, created_at, attachment_name, attachment_type, attachment_size, attachment_url)
    VALUES 
      (
        'msg-ca-1',
        'conv-carolyn',
        'carolyn-akukwe',
        'Carolyn Akukwe, RN',
        'Case Manager (RN)',
        'David Kowalski PT assessment is complete. Gait evaluation showed improved stability with four-point cane.',
        true,
        '2026-11-05 16:30:00',
        NULL, NULL, NULL, NULL
      ),
      (
        'msg-ca-2',
        'conv-carolyn',
        'carolyn-akukwe',
        'Carolyn Akukwe, RN',
        'Case Manager (RN)',
        'Discharge planning summary ready for Arthur Pendelton. Family conference scheduled for 3:30 PM today.',
        false,
        '2026-11-06 08:45:00',
        'Discharge_Planning_Summary.pdf', 'pdf', '320 KB', '/api/connect/attachments/Discharge_Planning_Summary.pdf'
      );
  `);

  // 4. Care Team: Marie V. Anis Care Team
  const anis = patientsMap['1036'];
  if (anis) {
    await pool.query(`
      INSERT INTO conversations (id, type, title, subtitle, patient_id, patient_name, service_line, is_pinned, is_urgent, created_at, updated_at)
      VALUES (
        'conv-care-anis',
        'care_team',
        'Marie V. Anis (1036) Care Team',
        'Susanna Welch BSN, Andre Bellevue PT, Dr. Leslie Rigali',
        $1,
        'Marie V. Anis',
        'home_health',
        false,
        false,
        '2026-11-04 10:00:00',
        '2026-11-05 15:20:00'
      );
    `, [anis.id]);

    await pool.query(`
      INSERT INTO conversation_participants (conversation_id, name, role, status)
      VALUES 
        ('conv-care-anis', 'Susanna Welch, BSN', 'Lead Staff Nurse', 'online'),
        ('conv-care-anis', 'Andre Bellevue, PT', 'Physical Therapist', 'busy');
    `);

    await pool.query(`
      INSERT INTO chat_messages (id, conversation_id, sender_id, sender_name, sender_role, content, is_read, created_at, attachment_name, attachment_type, attachment_size, attachment_url)
      VALUES 
        (
          'msg-an-anis-1',
          'conv-care-anis',
          'susanna-welch',
          'Susanna Welch, BSN',
          'Lead Staff Nurse',
          'Pre-filled insulin regimen reviewed with family. Blood glucose maintained at 118 mg/dL fasting.',
          true,
          '2026-11-05 15:20:00',
          'Insulin_Administration_Log.pdf', 'pdf', '290 KB', '/api/connect/attachments/Insulin_Administration_Log.pdf'
        );
    `);
  }

  // 5. Direct Chat: Andre Bellevue, PT
  await pool.query(`
    INSERT INTO conversations (id, type, title, subtitle, patient_id, patient_name, service_line, is_pinned, is_urgent, created_at, updated_at)
    VALUES (
      'conv-andre',
      'direct',
      'Andre Bellevue, PT',
      'Physical Therapist Lead • Mobility Assessment',
      NULL,
      NULL,
      'home_health',
      false,
      false,
      '2026-11-03 12:00:00',
      '2026-11-05 17:10:00'
    );
  `);

  await pool.query(`
    INSERT INTO conversation_participants (conversation_id, name, role, status)
    VALUES ('conv-andre', 'Andre Bellevue, PT', 'Physical Therapist Lead', 'busy');
  `);

  await pool.query(`
    INSERT INTO chat_messages (id, conversation_id, sender_id, sender_name, sender_role, content, is_read, created_at, attachment_name, attachment_type, attachment_size, attachment_url)
    VALUES 
      (
        'msg-ab-pt-1',
        'conv-andre',
        'andre-bellevue',
        'Andre Bellevue, PT',
        'Physical Therapist Lead',
        'Beatrice Holloway ambulated 150 ft with rolling walker with good tolerance. Upgraded exercise program.',
        true,
        '2026-11-05 17:10:00',
        'Functional_Mobility_Assessment.pdf', 'pdf', '510 KB', '/api/connect/attachments/Functional_Mobility_Assessment.pdf'
      );
  `);

  // 6. Clinical Triage Channel
  await pool.query(`
    INSERT INTO conversations (id, type, title, subtitle, patient_id, patient_name, service_line, is_pinned, is_urgent, created_at, updated_at)
    VALUES (
      'conv-triage-channel',
      'channel',
      'Standards Home Care - Clinical Triage',
      'Agency-wide on-call broadcast & critical intake',
      NULL,
      NULL,
      'home_health',
      false,
      false,
      '2026-11-01 08:00:00',
      '2026-11-06 07:30:00'
    );
  `);

  await pool.query(`
    INSERT INTO conversation_participants (conversation_id, name, role, status)
    VALUES ('conv-triage-channel', 'All Triage Staff', 'Care Team', 'online');
  `);

  await pool.query(`
    INSERT INTO chat_messages (id, conversation_id, sender_id, sender_name, sender_role, content, is_read, created_at, attachment_name, attachment_type, attachment_size, attachment_url)
    VALUES 
      (
        'msg-triage-1',
        'conv-triage-channel',
        'alexandria-nelson',
        'Alexandria Nelson, RN',
        'Field Clinician (RN)',
        'Weekend on-call coverage roster published. Dallas territory field nurses please confirm EVV verification before 5:00 PM.',
        true,
        '2026-11-06 07:30:00',
        NULL, NULL, NULL, NULL
      );
  `);

  // Seed Call Logs
  await pool.query(`
    INSERT INTO call_logs (id, contact_name, contact_role, direction, call_type, duration, created_at)
    VALUES 
      ('call-1', 'Alexandria Nelson, RN', 'Field Clinician (RN)', 'incoming', 'audio', '4m 12s', '2026-11-06 10:15:00'),
      ('call-2', 'Carolyn Akukwe, RN', 'Case Manager (RN)', 'outgoing', 'audio', '2m 45s', '2026-11-06 09:30:00'),
      ('call-3', 'Andre Bellevue, PT', 'Physical Therapist', 'missed', 'audio', '0s', '2026-11-05 16:40:00'),
      ('call-4', 'Susanna Welch, BSN', 'Lead Staff Nurse', 'incoming', 'audio', '6m 18s', '2026-11-05 11:20:00');
  `);

  // Ensure Sunday Nov 1 and Saturday Nov 7 have visits
  const nov1Check = await pool.query(`SELECT id FROM visits WHERE scheduled_date = '2026-11-01'`);
  if (nov1Check.rows.length === 0) {
    const jocelene = patientsMap['464'];
    const alexandria = (await pool.query(`SELECT id, name FROM clinicians WHERE name ILIKE '%Alexandria%' LIMIT 1`)).rows[0];
    if (jocelene && alexandria) {
      await pool.query(`
        INSERT INTO visits (
          id, organization_id, clinician_id, patient_id, service_line, status,
          scheduled_start, scheduled_end, time_slot, scheduled_date, day_of_week,
          patient_name, employee_name, address, latitude, longitude,
          visit_type, task, evv_status
        )
        VALUES (
          gen_random_uuid(),
          'e2a44bb4-3e9a-4c91-9e23-7fa38b456211',
          $1,
          $2,
          'home_health',
          'completed',
          '2026-11-01 10:30:00',
          '2026-11-01 11:45:00',
          '10:30 AM',
          '2026-11-01',
          0,
          $3,
          $4,
          '1120 Main St, Dallas TX',
          32.7795,
          -96.8005,
          'Emergency Wound Evaluation',
          'Emergency wound assessment following minor fall',
          'verified'
        );
      `, [alexandria.id, jocelene.id, jocelene.name, alexandria.name]);
    }
  }

  const nov7Check = await pool.query(`SELECT id FROM visits WHERE scheduled_date = '2026-11-07'`);
  if (nov7Check.rows.length === 0) {
    const jeffrey = patientsMap['1193'];
    const carolyn = (await pool.query(`SELECT id, name FROM clinicians WHERE name ILIKE '%Carolyn%' LIMIT 1`)).rows[0];
    if (jeffrey && carolyn) {
      await pool.query(`
        INSERT INTO visits (
          id, organization_id, clinician_id, patient_id, service_line, status,
          scheduled_start, scheduled_end, time_slot, scheduled_date, day_of_week,
          patient_name, employee_name, address, latitude, longitude,
          visit_type, task, evv_status
        )
        VALUES (
          gen_random_uuid(),
          'e2a44bb4-3e9a-4c91-9e23-7fa38b456211',
          $1,
          $2,
          'home_health',
          'scheduled',
          '2026-11-07 11:00:00',
          '2026-11-07 12:00:00',
          '11:00 AM',
          '2026-11-07',
          6,
          $3,
          $4,
          '3400 Oak Lawn Ave, Dallas TX',
          32.8090,
          -96.8095,
          'Weekend Medication Assessment & Vitals',
          'Oral med review and cardiopulmonary check',
          'pending'
        );
      `, [carolyn.id, jeffrey.id, jeffrey.name, carolyn.name]);
    }
  }

  console.log('Connect & Planner migration completed successfully.');
  await pool.end();
}

migrateConnect().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
