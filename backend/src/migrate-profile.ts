import { pool } from './db';

export async function migrateProfile() {
  console.log('[Migration] Ensuring user profile schema & Hilder Magessa user record...');
  try {
    await pool.query(`
      ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
      ALTER TABLE users ADD COLUMN IF NOT EXISTS title VARCHAR(150) DEFAULT 'QA Nurse / Clinical Reviewer';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS signature_pin VARCHAR(50) DEFAULT '4892';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255) DEFAULT '100 Cummings Center 235C';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(255) DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT 'Beverly';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'Massachusetts';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS zip VARCHAR(20) DEFAULT '01915';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS home_phone VARCHAR(50) DEFAULT '978-922-0088';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_phone VARCHAR(50) DEFAULT '978-922-0088';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS software_language VARCHAR(50) DEFAULT 'English';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS ssn VARCHAR(50) DEFAULT '***-**-4892';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS signature_reset_requested_at TIMESTAMPTZ;
    `);

    const orgRes = await pool.query('SELECT id, name FROM organizations LIMIT 1');
    const orgId = orgRes.rows[0]?.id || 'e2a44bb4-3e9a-4c91-9e23-7fa38b456211';

    const checkHilder = await pool.query(`
      SELECT id FROM users WHERE email = 'hilder@standardsincare.com' OR full_name ILIKE '%Hilder%'
    `);

    if (checkHilder.rows.length === 0) {
      await pool.query(`
        INSERT INTO users (
          id,
          organization_id,
          email,
          password_hash,
          full_name,
          role,
          title,
          address_line1,
          address_line2,
          city,
          state,
          zip,
          home_phone,
          mobile_phone,
          software_language,
          ssn,
          signature_pin,
          created_at,
          updated_at
        ) VALUES (
          'b9999999-9999-9999-9999-999999999999',
          $1,
          'hilder@standardsincare.com',
          '$2a$12$eX4mpleH4sh...',
          'Hilder Magessa, RN',
          'clinical_supervisor',
          'QA Nurse / Clinical Reviewer',
          '100 Cummings Center 235C',
          '',
          'Beverly',
          'Massachusetts',
          '01915',
          '978-922-0088',
          '978-922-0088',
          'English',
          '***-**-4892',
          '4892',
          '2023-04-18 10:00:00+00',
          NOW()
        );
      `, [orgId]);
      console.log('[Migration] Successfully created user Hilder Magessa in PostgreSQL users table.');
    } else {
      console.log('[Migration] User Hilder Magessa exists with ID:', checkHilder.rows[0].id);
    }
  } catch (err) {
    console.error('[Migration] Profile migration error:', err);
  }
}

if (require.main === module) {
  migrateProfile().then(() => {
    console.log('[Migration] Profile migration finished.');
    process.exit(0);
  });
}
