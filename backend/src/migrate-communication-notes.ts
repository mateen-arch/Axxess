import { pool } from './db';

async function migrateCommunicationNotes() {
  console.log('[Migration] Creating communication_notes table...');
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS communication_notes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    `);

    // Check if initial notes exist
    const countRes = await pool.query(`SELECT COUNT(*) as count FROM communication_notes`);
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      console.log('[Migration] Seeding initial communication notes...');
      const orgRes = await pool.query(`SELECT id FROM organizations LIMIT 1`);
      const orgId = orgRes.rows[0]?.id;

      if (orgId) {
        const patientsRes = await pool.query(`SELECT id, mrn, first_name, last_name, attending_physician FROM patients`);
        const patMap = new Map<string, any>();
        patientsRes.rows.forEach(p => {
          patMap.set(p.mrn, p);
          patMap.set(p.last_name.toUpperCase(), p);
        });

        const initialSeed = [
          {
            mrn: '1054',
            patientName: 'DEMERS, KENNETH',
            date: '2026-11-04',
            type: 'Verbal Order / Physician Coordination',
            text: 'Physician Verbal Order: Spoke with Dr. Robert Vance regarding wound healing progression. Received verbal order to continue wound vacuum therapy at 125 mmHg continuous pressure and re-evaluate at next dressing change.',
            createdBy: 'Hilder Magessa RN',
            status: 'Approved',
            episode: '10/01/2026 - 11/29/2026 (SOC: 10/01/2026)',
            physician: 'Dr. Robert Vance, MD'
          },
          {
            mrn: '1021',
            patientName: 'DICATO, ANTHONY',
            date: '2026-11-03',
            type: 'Caregiver Update - Post-Discharge Followup',
            text: 'Caregiver Coordination: Contacted patient spouse to confirm medication schedule adherence and physical therapy appointment times. No acute clinical complaints reported.',
            createdBy: 'Afia Osei Assibey RN',
            status: 'Approved',
            episode: '09/15/2026 - 11/13/2026 (SOC: 09/15/2026)',
            physician: 'Dr. Anita Gupta, MD'
          },
          {
            mrn: '1061',
            patientName: 'ABUISSA, HEATHER',
            date: '2026-11-02',
            type: 'Mass Health PA Approvals - Skilled Nursing',
            text: 'Prior Authorization Note: Submitted documentation to Mass Health for extended skilled nursing visits. Approved for 2x/week for 4 weeks.',
            createdBy: 'Hilder Magessa RN',
            status: 'Approved',
            episode: '11/01/2026 - 12/30/2026 (SOC: 11/01/2026)',
            physician: 'Dr. Leslie Rigali'
          },
          {
            mrn: '1035',
            patientName: 'ANIS, MARIE',
            date: '2026-11-01',
            type: 'Pharmacy Coordination - Insulin Delivery',
            text: 'Pharmacy Coordination: Clarified insulin glargine delivery schedule with retail pharmacy. Confirmed delivery scheduled for tomorrow morning.',
            createdBy: 'Jeffrey Antoniotti LPN',
            status: 'Approved',
            episode: '10/12/2026 - 12/10/2026 (SOC: 10/12/2026)',
            physician: 'Dr. Michael Chen, MD'
          },
          {
            mrn: '1002',
            patientName: 'ANTOINE, LOUIS',
            date: '2026-10-30',
            type: 'Physical Therapy Evaluation Update',
            text: 'Care Team Coordination: PT completed initial gait and transfer evaluation. Recommended 4-wheel walker DME order.',
            createdBy: 'Marcus Chen PT',
            status: 'Approved',
            episode: '10/05/2026 - 12/03/2026 (SOC: 10/05/2026)',
            physician: 'Dr. John Adams, MD'
          }
        ];

        for (const item of initialSeed) {
          const pat = patMap.get(item.mrn) || patMap.get(item.patientName.split(',')[0].trim());
          await pool.query(`
            INSERT INTO communication_notes (
              organization_id, patient_id, patient_name, mrn, patient_status,
              episode_associated, physician, note_date, communication_text,
              send_as_message, staff_signature, signature_date, signature_time, status
            ) VALUES (
              $1, $2, $3, $4, 'Active',
              $5, $6, $7::date, $8,
              false, $9, $7::date, '10:00 AM', $10
            )
          `, [
            orgId,
            pat ? pat.id : null,
            item.patientName,
            pat ? pat.mrn : item.mrn,
            item.episode,
            item.physician,
            item.date,
            item.text,
            item.createdBy,
            item.status
          ]);
        }
        console.log('[Migration] Initial communication notes seeded.');
      }
    }
    console.log('[Migration] communication_notes migration successful.');
  } catch (err) {
    console.error('[Migration Error]', err);
  } finally {
    await pool.end();
  }
}

migrateCommunicationNotes();
