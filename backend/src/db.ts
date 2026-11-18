import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:AbdulMateenBaig05@localhost:5432/careorbit',
});

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]', err);
});
