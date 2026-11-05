export interface AppConfig {
  port: number;
  allowedOrigin: string[];
  host: string;
}

export interface LoggerConfig {
  logDir: string;
  isProduction: boolean;
  level: 'debug' | 'info';
}

export interface AuthConfig {
  jwtSecret: string;
  jwtIssuer: string;
  accessExpirySeconds: number;
  refreshExpirySeconds: number;
  otpSecret: string;
  otpExpirySeconds: number;
  smtpHost?: string;
  smtpPort: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpFrom: string;
}

export interface DriverConfig {
  vehicleRequired: boolean;
  requiredDocumentTypes: string[];
}

export interface MediaConfig {
  imagekitPublicKey: string;
  imagekitPrivateKey: string;
  imagekitUrlEndpoint: string;
}

export interface BookingConfig {
  orsApiKey: string;
  orsBaseUrl: string;
  roundTripMultiplier: number;
  partialAdvancePercent: number;
}

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  max: number;
  min: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  statementTimeoutMillis: number;
  maxLifetimeSeconds: number;
  keepAlive: boolean;
  keepAliveInitialDelayMillis: number;
  allowExitOnIdle: boolean;
  maxUses?: number;
  ssl: false | { ca?: string; rejectUnauthorized: boolean };
  startupRetries: number;
  startupRetryDelayMs: number;
  drainTimeoutMs: number;
  txMaxRetries: number;
  poolSaturationThreshold: number;
  serviceName: string;
  slowQueryMs: number;
}
