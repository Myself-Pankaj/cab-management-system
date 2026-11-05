import { z } from 'zod';

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'staging', 'production'])
      .default('development'),

    PORT: z.coerce
      .number({ message: 'PORT must be a valid number' })
      .int({ message: 'PORT must be an integer' })
      .min(1000, { message: 'PORT must be at least 1000' })
      .max(65535, {
        message: 'PORT must be less than or equal to 65535',
      }),

    ALLOWED_ORIGINS: z
      .string()
      .min(1, { message: 'ALLOWED_ORIGINS is required' })
      .transform((value) => value.split(',').map((origin) => origin.trim()))
      .pipe(
        z.array(z.string().url()).min(1, {
          message: 'ALLOWED_ORIGINS must contain at least one valid URL',
        }),
      ),

    HOST: z
      .string()
      .min(1, { message: 'HOST is required' })
      .refine(
        (value) => {
          const isValidIp =
            /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/([1-9]|[12][0-9]|3[012]))?$/.test(
              value,
            );
          const isValidHostname =
            /^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))*\.?$/.test(
              value,
            );
          return isValidIp || isValidHostname;
        },
        { message: 'HOST must be a valid IP address or hostname' },
      ),

    DB_HOST: z.string().min(1, { message: 'DB_HOST is required' }),
    DB_PORT: z.coerce.number().int().min(1).max(65535).default(5432),
    DB_USER: z.string().min(1, { message: 'DB_USER is required' }),
    DB_PASSWORD: z.string().min(1, { message: 'DB_PASSWORD is required' }),
    DB_NAME: z.string().min(1, { message: 'DB_NAME is required' }),

    DB_POOL_MAX: z.coerce.number().int().min(1).default(10),
    DB_POOL_MIN: z.coerce.number().int().min(0).default(2),
    DB_IDLE_TIMEOUT_MS: z.coerce.number().int().min(1000).default(30_000),
    DB_CONNECTION_TIMEOUT_MS: z.coerce.number().int().min(1000).default(10_000),
    DB_STATEMENT_TIMEOUT_MS: z.coerce.number().int().min(1000).default(30_000),
    DB_MAX_LIFETIME_SECONDS: z.coerce.number().int().min(60).default(1800),
    DB_KEEP_ALIVE: z
      .enum(['true', 'false'])
      .default('true')
      .transform((v) => v === 'true'),
    DB_KEEP_ALIVE_INITIAL_DELAY_MS: z.coerce
      .number()
      .int()
      .min(0)
      .default(10_000),
    DB_ALLOW_EXIT_ON_IDLE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
    DB_MAX_USES: z.coerce.number().int().min(1).optional(),

    DB_STARTUP_RETRIES: z.coerce.number().int().min(0).default(3),
    DB_STARTUP_RETRY_DELAY_MS: z.coerce.number().int().min(100).default(2000),
    DB_DRAIN_TIMEOUT_MS: z.coerce.number().int().min(1000).default(10_000),
    DB_TX_MAX_RETRIES: z.coerce.number().int().min(0).default(3),
    DB_POOL_SATURATION_THRESHOLD: z.coerce
      .number()
      .min(0.1)
      .max(1)
      .default(0.9),
    DB_SLOW_QUERY_MS: z.coerce.number().int().min(0).default(200),

    DB_SSL_MODE: z
      .enum(['disable', 'require', 'verify-full'])
      .default('disable'),
    DB_SSL_CA: z.string().optional(),
    DB_SSL_CA_PATH: z.string().optional(),

    SERVICE_NAME: z.string().default('cab-management-api'),
    LOG_DIR: z.string().default('logs'),

    JWT_SECRET: z.string().default('dev-jwt-secret-change-in-production'),
    JWT_ISSUER: z.string().default('cab-management-api'),
    JWT_ACCESS_EXPIRY: z.coerce.number().int().min(60).default(900),
    JWT_REFRESH_EXPIRY: z.coerce.number().int().min(300).default(604_800),
    OTP_SECRET: z.string().default('dev-otp-secret-change-in-production'),
    OTP_EXPIRY_SECONDS: z.coerce.number().int().min(60).default(600),

    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_FROM: z
      .string()
      .default('noreply@cab-management.local'),

    DRIVER_VEHICLE_REQUIRED: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),

    IMAGEKIT_PUBLIC_KEY: z.string().default(''),
    IMAGEKIT_PRIVATE_KEY: z.string().default(''),
    IMAGEKIT_URL_ENDPOINT: z
      .string()
      .default('https://ik.imagekit.io/demo'),

    ORS_API_KEY: z.string().default(''),
    ORS_BASE_URL: z
      .string()
      .default('https://api.openrouteservice.org'),
    FARE_ROUND_TRIP_MULTIPLIER: z.coerce.number().min(1).default(2),
    PARTIAL_ADVANCE_PERCENT: z.coerce.number().int().min(1).max(99).default(30),

    RAZORPAY_KEY_ID: z.string().default(''),
    RAZORPAY_KEY_SECRET: z.string().default(''),
    RAZORPAY_WEBHOOK_SECRET: z.string().default(''),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production' && env.ALLOWED_ORIGINS.includes('*')) {
      ctx.addIssue({
        code: 'custom',
        path: ['ALLOWED_ORIGINS'],
        message: 'Wildcard (*) origin is not allowed in production',
      });
    }

    if (env.DB_POOL_MIN > env.DB_POOL_MAX) {
      ctx.addIssue({
        code: 'custom',
        path: ['DB_POOL_MIN'],
        message: 'DB_POOL_MIN must be less than or equal to DB_POOL_MAX',
      });
    }

    if (env.NODE_ENV === 'production') {
      if (env.JWT_SECRET === 'dev-jwt-secret-change-in-production') {
        ctx.addIssue({
          code: 'custom',
          path: ['JWT_SECRET'],
          message: 'JWT_SECRET must be set to a secure value in production',
        });
      }
      if (env.OTP_SECRET === 'dev-otp-secret-change-in-production') {
        ctx.addIssue({
          code: 'custom',
          path: ['OTP_SECRET'],
          message: 'OTP_SECRET must be set to a secure value in production',
        });
      }
    }
  });

export type EnvironmentVariables = z.infer<typeof envSchema>;

function formatValidationErrors(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const property = issue.path.join('.') || 'environment';
      return ` ✗ ${property}: ${issue.message}`;
    })
    .join('\n');
}

function cleanEnvRecord(
  config: Record<string, unknown>,
): Record<string, unknown> {
  return Object.entries(config).reduce(
    (acc, [key, value]) => {
      acc[key] =
        typeof value === 'string' && value.trim() === '' ? undefined : value;
      return acc;
    },
    {} as Record<string, unknown>,
  );
}

/** Single source of truth for parsing environment variables at bootstrap. */
export function parseEnvRecord(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const result = envSchema.safeParse(cleanEnvRecord(config));

  if (!result.success) {
    const formattedErrors = formatValidationErrors(result.error);
    console.error('[ConfigValidation] Environment validation failed');
    console.error(`\n${formattedErrors}`);
    console.error(
      '\n✗ Please fix the above environment variables in your .env file.\n',
    );
    process.exit(1);
  }

  return result.data;
}
