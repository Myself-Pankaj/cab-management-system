import {
  EnvironmentVariables,
  parseEnvRecord,
} from './env.schema.js';

export type { EnvironmentVariables };

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  console.debug('[ConfigValidation] Validating environment variables...');
  const validated = parseEnvRecord(config);
  console.log('[ConfigValidation] ✓ Environment variables validated successfully');
  return validated;
}
