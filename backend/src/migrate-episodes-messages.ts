import { pool } from './db';

async function migrate() {
  console.log('Running migration for episodes and message attachments...');

  // 1. Create episodes table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS episodes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id),
      patient_id UUID NOT NULL REFERENCES patients(id),
      start_of_care_date DATE NOT NULL,
      episode_start_date DATE NOT NULL,
      episode_end_date DATE NOT NULL,
      case_manager VARCHAR(255),
      primary_physician VARCHAR(255),
      primary_insurance VARCHAR(255),
      secondary_insurance VARCHAR(255),
      comments TEXT,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // 2. Add attachments column to messages if not present
  await pool.query(`
    ALTER TABLE messages 
    ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
  `);

  console.log('Migration completed successfully.');
  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
