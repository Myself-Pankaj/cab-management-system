CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE SCHEMA IF NOT EXISTS app;

-- Server-side timeout guardrails (applied to the connected database)
DO $$
BEGIN
  EXECUTE format(
    'ALTER DATABASE %I SET idle_in_transaction_session_timeout = %L',
    current_database(),
    '30s'
  );
  EXECUTE format(
    'ALTER DATABASE %I SET statement_timeout = %L',
    current_database(),
    '30s'
  );
  EXECUTE format(
    'ALTER DATABASE %I SET lock_timeout = %L',
    current_database(),
    '10s'
  );
END $$;
