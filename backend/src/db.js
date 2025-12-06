import mysql from 'mysql2/promise';
import { config } from './config.js';

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: config.db.connectionLimit,
  namedPlaceholders: true,
});

export async function query(sql, params = {}) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function getConnection() {
  return pool.getConnection();
}

export async function migrateCheck() {
  // Quick check to ensure connection works
  const [versionRow] = await query('SELECT VERSION() AS version');
  return versionRow?.version;
}

export default pool;