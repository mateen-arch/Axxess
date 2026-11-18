import { pool } from './db';

async function check() {
  const pCols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'patients' ORDER BY ordinal_position");
  console.log('PATIENT COLUMNS:', pCols.rows);
  const mCols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'messages' ORDER BY ordinal_position");
  console.log('MESSAGES COLUMNS:', mCols.rows);
  await pool.end();
}

check().catch(console.error);
