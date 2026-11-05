import { registerAs } from '@nestjs/config';
import { AuthConfig } from './config.interface.js';

export default registerAs(
  'auth',
  (): AuthConfig => ({
    jwtSecret: process.env['JWT_SECRET'] ?? 'dev-jwt-secret-change-in-production',
    jwtIssuer: process.env['JWT_ISSUER'] ?? 'cab-management-api',
    accessExpirySeconds: Number(process.env['JWT_ACCESS_EXPIRY'] ?? 900),
    refreshExpirySeconds: Number(process.env['JWT_REFRESH_EXPIRY'] ?? 604_800),
    otpSecret: process.env['OTP_SECRET'] ?? 'dev-otp-secret-change-in-production',
    otpExpirySeconds: Number(process.env['OTP_EXPIRY_SECONDS'] ?? 600),
    smtpHost: process.env['SMTP_HOST'] || undefined,
    smtpPort: Number(process.env['SMTP_PORT'] ?? 587),
    smtpUser: process.env['SMTP_USER'] || undefined,
    smtpPassword: process.env['SMTP_PASSWORD'] || undefined,
    smtpFrom: process.env['SMTP_FROM'] ?? 'noreply@cab-management.local',
  }),
);
