// db.ts
import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',           // replace with your PostgreSQL user
  host: 'localhost',           // usually localhost
  database: 'ksh_db',   // replace with your database name
  password: 'lin097',   // replace with your password
  port: 5432,                  // default PostgreSQL port
});

// optional: export query function for easier usage
export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
