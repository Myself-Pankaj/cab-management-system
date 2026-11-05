const fs = require('fs');
const path = require('path');

const REQUIRED_DB_VARS = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const DB_ENV_KEYS = [
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'DATABASE_URL',
];

/**
 * Loads `.env.${NODE_ENV}` (default: development) into process.env.
 * DB_* values from the file always win so local scripts match `.env.development`.
 */
function loadEnvFile() {
  const env = process.env.NODE_ENV || 'development';
  const envFile = path.resolve(process.cwd(), `.env.${env}`);

  if (!fs.existsSync(envFile)) {
    console.error(`Environment file not found: ${envFile}`);
    console.error(
      'Create it from .env.example and set your local PostgreSQL credentials.',
    );
    process.exit(1);
  }

  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (DB_ENV_KEYS.includes(key) || !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function assertDbEnv() {
  const missing = REQUIRED_DB_VARS.filter((key) => !process.env[key]?.trim());
  if (missing.length === 0) {
    return;
  }

  console.error('Missing required database environment variables:');
  for (const key of missing) {
    console.error(`  - ${key}`);
  }
  console.error(
    `\nSet these in .env.${process.env.NODE_ENV || 'development'} (local PostgreSQL).`,
  );
  process.exit(1);
}

function getPgClientConfig() {
  if (process.env.DATABASE_URL?.trim()) {
    return { connectionString: process.env.DATABASE_URL };
  }

  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
}

/** Maps project DB_* vars to pgtyped's PG* env vars (pgtyped reads PG* at runtime). */
function mapDbEnvToPgEnv() {
  process.env.PGHOST = process.env.DB_HOST;
  process.env.PGPORT = String(process.env.DB_PORT ?? 5432);
  process.env.PGUSER = process.env.DB_USER;
  process.env.PGPASSWORD = process.env.DB_PASSWORD;
  process.env.PGDATABASE = process.env.DB_NAME;
}

module.exports = {
  loadEnvFile,
  assertDbEnv,
  getPgClientConfig,
  mapDbEnvToPgEnv,
};
