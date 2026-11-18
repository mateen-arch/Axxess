import { pool } from './db';

async function migrateNonVisit() {
  console.log('[Migration] Creating non_visit_activities table...');
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS non_visit_activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        clinician_name VARCHAR(255) DEFAULT 'Hilder Magessa, RN',
        activity_type VARCHAR(100) NOT NULL,
        activity_date DATE NOT NULL,
        start_time VARCHAR(50) NOT NULL DEFAULT '08:00 AM',
        end_time VARCHAR(50) NOT NULL DEFAULT '08:30 AM',
        duration_minutes INT NOT NULL DEFAULT 30,
        mileage NUMERIC(6, 2) DEFAULT 0,
        comments TEXT DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check count
    const countRes = await pool.query('SELECT COUNT(*)::int as count FROM non_visit_activities');
    if (countRes.rows[0].count === 0) {
      console.log('[Migration] Seeding initial non-visit activities...');
      await pool.query(`
        INSERT INTO non_visit_activities (activity_type, activity_date, start_time, end_time, duration_minutes, mileage, comments)
        VALUES 
          ('Case Conference', CURRENT_DATE - INTERVAL '1 day', '08:00 AM', '08:45 AM', 45, 0, 'Bi-weekly interdisciplinary team conference for high-risk diabetic and wound care patients.'),
          ('Care Coordination', CURRENT_DATE - INTERVAL '2 days', '11:30 AM', '12:00 PM', 30, 0, 'Coordinated with Dr. Chen regarding blood pressure medication adjustment for patient.'),
          ('In-Service Training', CURRENT_DATE - INTERVAL '4 days', '02:00 PM', '03:00 PM', 60, 0, 'CareOrbit OASIS-E Guidance & Wound VAC Certification Renewal Webinar.'),
          ('Office / Documentation', CURRENT_DATE - INTERVAL '5 days', '04:00 PM', '05:00 PM', 60, 0, 'Comprehensive 60-day recertification chart audit and plan of care sign-offs.'),
          ('Travel Time', CURRENT_DATE - INTERVAL '1 day', '09:00 AM', '09:35 AM', 35, 14.5, 'Travel from Dallas clinic to North Dallas home health patient territory.');
      `);
    }

    console.log('[Migration] non_visit_activities table ready!');
  } catch (err) {
    console.error('[Migration Error]', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateNonVisit();

