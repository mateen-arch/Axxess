import { Pool } from 'pg';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:AbdulMateenBaig05@localhost:5432/axxess';
const isProduction = process.env.NODE_ENV === 'production';
const isInternalRailway = connectionString.includes('railway.internal') || connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

export const pool = new Pool({
  connectionString,
  ssl: isProduction && !isInternalRailway ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]', err);
});
