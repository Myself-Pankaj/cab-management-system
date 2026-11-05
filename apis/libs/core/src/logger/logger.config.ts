import { registerAs } from '@nestjs/config';
import { buildLoggerConfig } from '../config/config.factory.js';
import { parseEnvRecord } from '../config/env.schema.js';

export const loggerConfigRegister = registerAs('logger', () =>
  buildLoggerConfig(
    parseEnvRecord(process.env as Record<string, unknown>),
  ),
);
