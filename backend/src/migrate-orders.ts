import { pool } from './db';

async function migrateOrders() {
  console.log('[Migration] Creating orders table...');
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
      CREATE INDEX IF NOT EXISTS idx_orders_org ON orders(organization_id);
      CREATE INDEX IF NOT EXISTS idx_orders_patient ON orders(patient_id);
      CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date DESC);
    `);

    const countRes = await pool.query(`SELECT COUNT(*) as count FROM orders`);
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      console.log('[Migration] Seeding initial orders...');
      const orgRes = await pool.query(`SELECT id FROM organizations LIMIT 1`);
      const orgId = orgRes.rows[0]?.id;

      if (orgId) {
        const patientsRes = await pool.query(`SELECT id, mrn, first_name, last_name, attending_physician FROM patients`);
        const patMap = new Map<string, any>();
        patientsRes.rows.forEach(p => {
          patMap.set(p.mrn, p);
          patMap.set(p.last_name.toUpperCase(), p);
        });

        const initialOrders = [
          {
            patientName: 'Lantigua Gonzalez, Scarlet',
            mrn: '1061',
            episode: '11/01/2026 - 12/30/2026',
            physician: 'Dr. Anita Gupta, MD',
            summary: 'Skilled Nursing: Wound Vac Dressing Change 3x/wk',
            type: 'Discipline Frequency',
            content: '[SN] Frequency: 3w9. Goals: Wound vac management to sacral ulcer, drainage measurement, negative pressure monitoring.',
            date: '2026-11-06',
            status: 'Pending MD Signature',
            clinician: 'Hilder Magessa RN'
          },
          {
            patientName: 'Abuissa, Heather',
            mrn: '1061',
            episode: '11/01/2026 - 12/30/2026',
            physician: 'Dr. Leslie Rigali',
            summary: 'Medication Order: Insulin Glargine Dose Titration',
            type: 'Medication Orders',
            content: '[CHANGE] Insulin Glargine 24 Units SubQ Daily at Bedtime (Indication: Type 2 Diabetes Mellitus)',
            date: '2026-11-05',
            status: 'To Be Sent',
            clinician: 'Sarah Jenkins RN'
          },
          {
            patientName: 'Demers, Kenneth',
            mrn: '1054',
            episode: '10/01/2026 - 11/29/2026',
            physician: 'Dr. Robert Vance, MD',
            summary: 'Physical Therapy: Gait Training 2x/wk for 4w',
            type: 'Discipline Frequency',
            content: '[PT] Frequency: 2w4. Goals: Independent ambulation with rollator walker, dynamic balance 4/5.',
            date: '2026-11-04',
            status: 'Pending Co-Signature',
            clinician: 'Kristin Siegel LPN'
          },
          {
            patientName: 'Anis, Marie',
            mrn: '1035',
            episode: '10/12/2026 - 12/10/2026',
            physician: 'Dr. Michael Chen, MD',
            summary: 'Supply Order: Hydrocolloid & Bordered Gauze',
            type: 'Supply Manager',
            content: '[SUPPLY] Bordered Gauze 4x4 (Qty: 30/mo) and Normal Saline 500mL Flushes (Qty: 10/mo)',
            date: '2026-11-02',
            status: 'Approved',
            clinician: 'Jeffrey Antoniotti LPN'
          }
        ];

        for (const ord of initialOrders) {
          const pat = patMap.get(ord.mrn) || patMap.get(ord.patientName.split(',')[0].trim().toUpperCase());
          await pool.query(`
            INSERT INTO orders (
              organization_id, patient_id, patient_name, mrn, episode_associated,
              attending_physician, send_to, order_date, order_time, effective_date,
              order_is_for_next_episode, summary_title, order_type, order_content,
              order_read_back_and_verified, clinician_signature, signature_date, signature_time, status
            ) VALUES (
              $1, $2, $3, $4, $5,
              $6, $6, $7::date, '14:30', $7::date,
              false, $8, $9, $10,
              true, $11, $7::date, '14:32', $12
            )
          `, [
            orgId,
            pat ? pat.id : null,
            ord.patientName,
            pat ? pat.mrn : ord.mrn,
            ord.episode,
            ord.physician,
            ord.date,
            ord.summary,
            ord.type,
            ord.content,
            ord.clinician,
            ord.status
          ]);
        }
        console.log('[Migration] Initial orders seeded.');
      }
    }
    console.log('[Migration] orders migration successful.');
  } catch (err) {
    console.error('[Migration Error]', err);
  } finally {
    await pool.end();
  }
}

migrateOrders();
