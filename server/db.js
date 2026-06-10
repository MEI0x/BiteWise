import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pkg;

// Use the database URL provided by the host environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } // Required for cloud databases like Supabase
    : false
});

// ⚡ THE CRITICAL LINE: Add this modern default export at the bottom!
export default pool;
