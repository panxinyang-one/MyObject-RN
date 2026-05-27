import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { config } from '../config';
import { pool } from '../db/pool';
import type { JwtPayload } from '../types';

type UserRow = RowDataPacket & {
  id: number;
  email: string;
  password_hash: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function assertEmail(email: string): void {
  if (!EMAIL_RE.test(email)) {
    throw new Error('Invalid email format');
  }
}

function assertPassword(password: string): void {
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
}

export async function register(
  email: string,
  password: string,
): Promise<{ token: string; user: { id: number; email: string } }> {
  const normalized = email.trim().toLowerCase();
  assertEmail(normalized);
  assertPassword(password);

  const [existing] = await pool.query<UserRow[]>(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [normalized],
  );
  if (existing.length > 0) {
    throw new Error('Email already exists');
  }

  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    [normalized, hash],
  );

  const userId = result.insertId;
  const token = signToken({ userId, email: normalized });
  return { token, user: { id: userId, email: normalized } };
}

export async function login(
  email: string,
  password: string,
): Promise<{ token: string; user: { id: number; email: string } }> {
  const normalized = email.trim().toLowerCase();
  assertEmail(normalized);

  const [rows] = await pool.query<UserRow[]>(
    'SELECT id, email, password_hash FROM users WHERE email = ? LIMIT 1',
    [normalized],
  );
  const user = rows[0];
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    throw new Error('Invalid email or password');
  }

  const token = signToken({ userId: user.id, email: user.email });
  return { token, user: { id: user.id, email: user.email } };
}

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}
