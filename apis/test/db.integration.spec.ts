import { describe, it, expect } from 'vitest';

/**
 * Optional DB integration tests — skipped when DB_HOST is not configured.
 * Run with: pnpm docker:up && pnpm db:migrate:up && DB_HOST=localhost pnpm test test/db.integration.spec.ts
 */
const dbHost = process.env.DB_HOST;

describe.skipIf(!dbHost)('Database integration', () => {
  it('connects to postgres when DB_HOST is set', async () => {
    const { Pool } = await import('pg');
    const pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 5432),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    try {
      const result = await pool.query('SELECT 1 AS ok');
      expect(result.rows[0]?.ok).toBe(1);
    } finally {
      await pool.end();
    }
  });
});
