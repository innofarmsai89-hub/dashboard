import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DBUSER,
  host: process.env.DBSERVER,
  database: process.env.DBNAME,
  password: process.env.DBPASSWORD,
  port: parseInt(process.env.DBPORT || '5432'),
  ssl: {
    rejectUnauthorized: false,
  },
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
