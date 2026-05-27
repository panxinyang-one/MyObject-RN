import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { config } from '../config';

export const pool = mysql.createPool({
  host: config.mysql.host,
  port: config.mysql.port,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  waitForConnections: true,
  connectionLimit: 10,
  timezone: 'Z',
});

export async function pingDb(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

export async function runMigrations(): Promise<void> {
  const schemaPath = path.resolve(__dirname, '../../db/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await pool.query(statement);
  }
}

export async function waitForDb(
  maxAttempts = 30,
  delayMs = 2000,
): Promise<void> {
  for (let i = 1; i <= maxAttempts; i++) {
    if (await pingDb()) {
      return;
    }
    console.log(`Waiting for MySQL (${i}/${maxAttempts})...`);
    await new Promise(r => setTimeout(r, delayMs));
  }
  throw new Error('MySQL not reachable after retries');
}
