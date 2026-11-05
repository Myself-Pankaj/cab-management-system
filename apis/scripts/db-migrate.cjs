const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const {
  loadEnvFile,
  assertDbEnv,
  getPgClientConfig,
} = require('./load-env.cjs');

const UP_MARKER = '-- +migrate Up';
const DOWN_MARKER = '-- +migrate Down';

function readMigrationFile(fileName) {
  const sqlPath = path.resolve(process.cwd(), 'db/migrations', fileName);
  return fs.readFileSync(sqlPath, 'utf8');
}

/** Returns only the Up or Down section from sql-migrate annotated files. */
function extractMigrationSection(sql, direction) {
  const hasUp = sql.includes(UP_MARKER);
  const hasDown = sql.includes(DOWN_MARKER);

  if (!hasUp && !hasDown) {
    return sql.trim();
  }

  if (direction === 'up') {
    if (hasUp) {
      const start = sql.indexOf(UP_MARKER) + UP_MARKER.length;
      const end = hasDown ? sql.indexOf(DOWN_MARKER) : sql.length;
      return sql.slice(start, end).trim();
    }

    if (hasDown) {
      return sql.slice(0, sql.indexOf(DOWN_MARKER)).trim();
    }
  }

  if (direction === 'down') {
    if (!hasDown) {
      return '';
    }
    const start = sql.indexOf(DOWN_MARKER) + DOWN_MARKER.length;
    return sql.slice(start).trim();
  }

  return '';
}

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations(client) {
  const result = await client.query(
    'SELECT name FROM schema_migrations ORDER BY name ASC',
  );
  return new Set(result.rows.map((row) => row.name));
}

function listMigrationFiles() {
  const dir = path.resolve(process.cwd(), 'db/migrations');
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.sql'))
    .sort();
}

async function applyMigration(client, fileName) {
  const sql = extractMigrationSection(readMigrationFile(fileName), 'up');
  if (!sql) {
    throw new Error(`Migration ${fileName} has no Up section`);
  }

  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [
      fileName,
    ]);
    await client.query('COMMIT');
    console.log(`Applied migration: ${fileName}`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}

async function rollbackMigration(client, fileName) {
  const downSql = extractMigrationSection(readMigrationFile(fileName), 'down');

  await client.query('BEGIN');
  try {
    if (downSql) {
      await client.query(downSql);
    } else if (fileName === '001_init.sql') {
      await client.query('DROP SCHEMA IF EXISTS app CASCADE;');
    } else {
      throw new Error(`Migration ${fileName} has no Down section`);
    }

    await client.query('DELETE FROM schema_migrations WHERE name = $1', [
      fileName,
    ]);
    await client.query('COMMIT');
    console.log(`Rolled back migration: ${fileName}`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}

async function applyPendingMigrations(client) {
  const applied = await getAppliedMigrations(client);
  const files = listMigrationFiles();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`Skipping already applied migration: ${file}`);
      continue;
    }
    await applyMigration(client, file);
  }
}

async function migrateUp() {
  loadEnvFile();
  assertDbEnv();

  const client = new Client(getPgClientConfig());
  await client.connect();

  try {
    await ensureMigrationsTable(client);
    await applyPendingMigrations(client);
  } finally {
    await client.end();
  }
}

async function migrateDown() {
  loadEnvFile();
  assertDbEnv();

  const client = new Client(getPgClientConfig());
  await client.connect();

  try {
    await ensureMigrationsTable(client);
    const result = await client.query(
      'SELECT name FROM schema_migrations ORDER BY name DESC LIMIT 1',
    );
    const last = result.rows[0]?.name;
    if (!last) {
      console.log('No migrations to roll back');
      return;
    }
    await rollbackMigration(client, last);
  } finally {
    await client.end();
  }
}

async function migrateRepair() {
  loadEnvFile();
  assertDbEnv();

  const client = new Client(getPgClientConfig());
  await client.connect();

  try {
    await ensureMigrationsTable(client);
    const applied = await getAppliedMigrations(client);

    if (applied.has('002_user.sql')) {
      const usersCheck = await client.query(
        `SELECT to_regclass('public.users') IS NOT NULL AS exists`,
      );
      if (!usersCheck.rows[0]?.exists) {
        await client.query(
          `DELETE FROM schema_migrations WHERE name = '002_user.sql'`,
        );
        console.log(
          'Repaired: removed stale 002_user.sql record (users table missing)',
        );
      }
    }

    await applyPendingMigrations(client);
  } finally {
    await client.end();
  }
}

const command = process.argv[2] ?? 'up';

if (command === 'up') {
  migrateUp().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else if (command === 'down') {
  migrateDown().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else if (command === 'repair') {
  migrateRepair().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  console.error('Usage: node scripts/db-migrate.cjs [up|down|repair]');
  process.exit(1);
}
