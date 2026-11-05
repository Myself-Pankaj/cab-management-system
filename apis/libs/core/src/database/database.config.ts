import { registerAs } from '@nestjs/config';
import { buildDatabaseConfig } from '../config/config.factory.js';
import { parseEnvRecord } from '../config/env.schema.js';

/**
 * DB_SSL_MODE:
 *   disable      -> no TLS (local/dev only)
 *   require      -> TLS, but don't verify the server cert
 *   verify-full  -> TLS + verify server cert against DB_SSL_CA (production)
 *
 * PgBouncer: transaction pooling mode works with pgtyped parameterized queries.
 * For RDS / Cloud SQL / Azure Postgres use DB_SSL_MODE=verify-full + DB_SSL_CA.
 */
export default registerAs('database', () =>
  buildDatabaseConfig(
    parseEnvRecord(process.env as Record<string, unknown>),
  ),
);
