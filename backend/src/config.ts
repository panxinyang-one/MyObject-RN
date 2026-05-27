import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) {
    throw new Error(`Missing env: ${name}`);
  }
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  mysql: {
    host: process.env.MYSQL_HOST ?? '127.0.0.1',
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: required('MYSQL_USER', 'evidence'),
    password: required('MYSQL_PASSWORD', 'evidence_pass'),
    database: required('MYSQL_DATABASE', 'evidence_db'),
  },
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  publicBaseUrl: (process.env.PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(
    /\/$/,
    '',
  ),
  uploadDir: path.resolve(
    process.cwd(),
    process.env.UPLOAD_DIR ?? 'uploads',
  ),
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB ?? 5),
};
