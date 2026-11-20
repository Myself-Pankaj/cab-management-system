import * as fs from 'fs';
import * as path from 'path';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { utilities as nestWinstonUtilities } from 'nest-winston';
import { AppConfig, DatabaseConfig, LoggerConfig } from './config.interface.js';
import { EnvironmentVariables } from './env.schema.js';
import { sanitizeLogValue, summarizeLogValue } from '../logger/log-sanitizer.js';

function buildSsl(env: EnvironmentVariables): DatabaseConfig['ssl'] {
  if (env.DB_SSL_MODE === 'disable') return false;

  const ssl: { ca?: string; rejectUnauthorized: boolean } = {
    rejectUnauthorized: env.DB_SSL_MODE === 'verify-full',
  };

  if (env.DB_SSL_CA_PATH) {
    ssl.ca = fs.readFileSync(env.DB_SSL_CA_PATH, 'utf8');
  } else if (env.DB_SSL_CA) {
    ssl.ca = env.DB_SSL_CA;
  }

  return ssl;
}

export function buildAppConfig(env: EnvironmentVariables): AppConfig {
  return {
    port: env.PORT,
    host: env.HOST,
    allowedOrigin: env.ALLOWED_ORIGINS,
  };
}

export function buildDatabaseConfig(env: EnvironmentVariables): DatabaseConfig {
  return {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,

    max: env.DB_POOL_MAX,
    min: env.DB_POOL_MIN,
    idleTimeoutMillis: env.DB_IDLE_TIMEOUT_MS,
    connectionTimeoutMillis: env.DB_CONNECTION_TIMEOUT_MS,
    statementTimeoutMillis: env.DB_STATEMENT_TIMEOUT_MS,
    maxLifetimeSeconds: env.DB_MAX_LIFETIME_SECONDS,
    keepAlive: env.DB_KEEP_ALIVE,
    keepAliveInitialDelayMillis: env.DB_KEEP_ALIVE_INITIAL_DELAY_MS,
    allowExitOnIdle: env.DB_ALLOW_EXIT_ON_IDLE,
    ...(env.DB_MAX_USES !== undefined ? { maxUses: env.DB_MAX_USES } : {}),

    ssl: buildSsl(env),

    startupRetries: env.DB_STARTUP_RETRIES,
    startupRetryDelayMs: env.DB_STARTUP_RETRY_DELAY_MS,
    drainTimeoutMs: env.DB_DRAIN_TIMEOUT_MS,
    txMaxRetries: env.DB_TX_MAX_RETRIES,
    poolSaturationThreshold: env.DB_POOL_SATURATION_THRESHOLD,

    serviceName: env.SERVICE_NAME,
    slowQueryMs: env.DB_SLOW_QUERY_MS,
  };
}

export function buildLoggerConfig(env: EnvironmentVariables): LoggerConfig {
  return {
    logDir: path.resolve(process.cwd(), env.LOG_DIR),
    isProduction: env.NODE_ENV === 'production',
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  };
}

const productionFormat = winston.format.printf(
  ({
    timestamp,
    level,
    message,
    context,
    trace,
    stack,
    error,
    ...metadata
  }) => {
    const logObject: Record<string, unknown> = {
      '@timestamp': timestamp,
      level,
      message,
      context: context || 'Application',
    };

    if (error) logObject.error = error;
    if (trace) logObject.trace = trace;
    if (stack) logObject.stack = stack;
    if (Object.keys(metadata).length > 0) logObject.metadata = metadata;

    return JSON.stringify(sanitizeLogValue(logObject));
  },
);

export function buildWinstonOptions(
  config: LoggerConfig,
): winston.LoggerOptions {
  const redactionFormat = winston.format((info) => {
    const sanitized = sanitizeLogValue(
      Object.fromEntries(Object.entries(info)),
    );
    // Remove unsanitized fields (including preformatted messages and splat data).
    for (const key of Reflect.ownKeys(info)) {
      if (key !== Symbol.for('level')) delete info[key];
    }
    return Object.assign(info, sanitized);
  });

  const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    redactionFormat(),
  );

  const consoleSummaryFormat = winston.format((info) => {
    const summary = summarizeLogValue(Object.fromEntries(Object.entries(info)));
    for (const key of Reflect.ownKeys(info)) {
      if (key !== Symbol.for('level')) delete info[key];
    }
    return Object.assign(info, summary);
  });

  const consoleTransport = new winston.transports.Console({
    level: config.level,
    format: config.isProduction
      ? winston.format.combine(fileFormat, consoleSummaryFormat(), productionFormat)
      : winston.format.combine(
          redactionFormat(),
          consoleSummaryFormat(),
          nestWinstonUtilities.format.nestLike('CabAPI', {
            prettyPrint: false,
            colors: true,
          }),
        ),
  });

  const fileInfoTransport = new winston.transports.DailyRotateFile({
    dirname: config.logDir,
    filename: 'info-%DATE%.log',
    level: 'info',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    format: winston.format.combine(
      fileFormat,
      winston.format((info) => (info.level === 'error' ? false : info))(),
      productionFormat,
    ),
  });

  const fileErrorTransport = new winston.transports.DailyRotateFile({
    dirname: config.logDir,
    filename: 'error-%DATE%.log',
    level: 'error',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '45d',
    format: winston.format.combine(fileFormat, productionFormat),
  });

  return {
    level: config.level,
    // Sanitize before any transport, including the development console.
    format: redactionFormat(),
    transports: [consoleTransport, fileInfoTransport, fileErrorTransport],
    exceptionHandlers: [consoleTransport, fileErrorTransport],
    rejectionHandlers: [consoleTransport, fileErrorTransport],
  };
}
