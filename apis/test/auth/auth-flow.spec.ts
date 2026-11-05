import { describe, expect, it, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../src/app.module.js';
import {
  AppConfigService,
  AppLogger,
  DatabaseService,
  HealthRepository,
} from '@app/core';
import { GlobalExceptionFilter } from '@app/core/filter/global.filter.js';
import { ResponseInterceptor } from '@app/core/interceptor/response.interceptor.js';
import { AuthRegistrationService } from '@app/resources/auth/services/auth-registration.service.js';
import { AuthVerificationService } from '@app/resources/auth/services/auth-verification.service.js';
import { AuthSessionService } from '@app/resources/auth/services/auth-session.service.js';
import { AuthPasswordService } from '@app/resources/auth/services/auth-password.service.js';
import { JwtTokenService } from '@app/resources/auth/services/jwt-token.service.js';
import { ImageKitService } from '@app/resources/media/services/imagekit.service.js';
import { toUserResponse } from '@app/resources/auth/types/auth.types.js';
import type { TokenType } from '@app/resources/auth/types/auth.types.js';

const mockUserRow = {
  id: '11111111-1111-1111-1111-111111111111',
  first_name: 'John',
  last_name: 'Doe',
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  phone_number: '+919876543210',
  password_hash: '$2b$12$hashed',
  auth_provider: 'email' as const,
  provider_id: null,
  global_role: 'Passenger' as const,
  email_verified: false,
  phone_verified: false,
  is_active: true,
  is_blocked: false,
  blocked_reason: null,
  avatar_url: null,
  date_of_birth: null,
  gender: null,
  timezone: 'Asia/Kolkata',
  language: 'en',
  last_login_at: null,
  password_changed_at: null,
  deleted_at: null,
  metadata: {},
  created_at: new Date('2026-01-01T00:00:00.000Z'),
  updated_at: new Date('2026-01-01T00:00:00.000Z'),
};

describe('Auth flow (e2e)', () => {
  let app: INestApplication<App>;

  const registrationService = {
    register: vi.fn().mockResolvedValue({
      user: toUserResponse(mockUserRow),
      message: 'Please verify your email using the OTP sent to your email address',
      dev_otp: '123456',
    }),
  };

  const verificationService = {
    verifyEmail: vi.fn().mockResolvedValue({
      user: toUserResponse({ ...mockUserRow, email_verified: true }),
    }),
    resendEmailOtp: vi.fn().mockResolvedValue({
      message: 'verification OTP sent successfully',
      dev_otp: '654321',
    }),
  };

  const sessionService = {
    login: vi.fn().mockResolvedValue({
      user: toUserResponse({ ...mockUserRow, email_verified: true }),
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    }),
    refresh: vi.fn().mockResolvedValue({ accessToken: 'new-access-token' }),
    getProfile: vi.fn().mockResolvedValue(
      toUserResponse({ ...mockUserRow, email_verified: true }),
    ),
    updateProfile: vi.fn().mockResolvedValue(
      toUserResponse({ ...mockUserRow, email_verified: true, first_name: 'Jane' }),
    ),
  };

  const passwordService = {
    forgotPassword: vi.fn().mockResolvedValue({
      message: 'if this email exists, password reset instructions have been sent',
      dev_otp: '111222',
    }),
    resetPassword: vi.fn().mockResolvedValue(undefined),
    changePassword: vi.fn().mockResolvedValue(undefined),
  };

  const jwtTokenService = {
    validateToken: vi.fn((token: string, tokenType: TokenType) => ({
      user_id: mockUserRow.id,
      email: mockUserRow.email ?? '',
      phone_number: mockUserRow.phone_number ?? '',
      role: mockUserRow.global_role,
      email_verified: true,
      phone_verified: false,
      token_type: tokenType,
      sub: mockUserRow.id,
      iss: 'cab-management-api-test',
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    })),
    generateToken: vi.fn(() => 'generated-token'),
    getAccessExpiryDate: vi.fn(() => new Date(Date.now() + 900_000)),
    getRefreshExpiryDate: vi.fn(() => new Date(Date.now() + 604_800_000)),
  };

  beforeEach(async () => {
    const mockLogger = {
      forContext: () => ({
        log: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        logWithMetadata: vi.fn(),
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AppLogger)
      .useValue(mockLogger)
      .overrideProvider(HealthRepository)
      .useValue({ ping: async () => 1 })
      .overrideProvider(DatabaseService)
      .useValue({
        onModuleInit: async () => {},
        onModuleDestroy: async () => {},
        getPool: () => ({}),
        healthCheck: async () => ({ ok: true, latencyMs: 1 }),
        checkReadiness: async () => ({
          ready: true,
          db: { ok: true, latencyMs: 1 },
          pool: { totalCount: 1, idleCount: 1, waitingCount: 0, max: 5 },
          saturated: false,
          shuttingDown: false,
        }),
        query: async () => ({ rows: [], rowCount: 0 }),
        withTransaction: async (work: (client: unknown) => Promise<unknown>) =>
          work({}),
        withSavepoint: async (
          _client: unknown,
          _name: string,
          work: (client: unknown) => Promise<unknown>,
        ) => work({}),
        get shuttingDown() {
          return false;
        },
        isPoolSaturated: () => false,
        getPoolStats: () => ({
          totalCount: 1,
          idleCount: 1,
          waitingCount: 0,
          max: 5,
        }),
      })
      .overrideProvider(AuthRegistrationService)
      .useValue(registrationService)
      .overrideProvider(AuthVerificationService)
      .useValue(verificationService)
      .overrideProvider(AuthSessionService)
      .useValue(sessionService)
      .overrideProvider(AuthPasswordService)
      .useValue(passwordService)
      .overrideProvider(JwtTokenService)
      .useValue(jwtTokenService)
      .overrideProvider(ImageKitService)
      .useValue({
        getUploadAuth: () => ({ token: 'test', signature: 'test', expire: 9999999999 }),
        deleteFile: async () => {},
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());

    const logger = mockLogger;
    const configService =
      moduleFixture.get(AppConfigService, { strict: false }) ?? {
        isDevelopment: false,
        isProduction: false,
        appConfig: { allowedOrigin: ['http://localhost:3000'] },
        auth: {
          accessExpirySeconds: 900,
          refreshExpirySeconds: 604800,
        },
      };
    app.useGlobalFilters(new GlobalExceptionFilter(logger, configService));
    app.useGlobalInterceptors(new ResponseInterceptor(configService, logger));
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('register -> verify-otp -> login -> profile -> refresh -> logout -> forgot -> reset', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone_number: '+919876543210',
        password: 'SecurePass123!',
        role: 'Passenger',
      })
      .expect(201);

    expect(registerRes.body.success).toBe(true);
    expect(registerRes.body.data.dev_otp).toBe('123456');

    const verifyRes = await request(app.getHttpServer())
      .post('/api/v1/auth/verify-otp')
      .send({ email: 'john.doe@example.com', otp: '123456' })
      .expect(200);
    expect(verifyRes.body.data.user.email_verified).toBe(true);

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'john.doe@example.com', password: 'SecurePass123!' })
      .expect(200);

    expect(loginRes.body.data.access_token).toBe('access-token');
    expect(loginRes.headers['set-cookie']).toBeDefined();

    const profileRes = await request(app.getHttpServer())
      .get('/api/v1/auth/profile')
      .set('Authorization', 'Bearer access-token')
      .expect(200);
    expect(profileRes.body.data.user.email).toBe('john.doe@example.com');

    const refreshRes = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('Authorization', 'Bearer refresh-token')
      .expect(200);
    expect(refreshRes.body.data.access_token).toBe('new-access-token');

    await request(app.getHttpServer()).post('/api/v1/auth/logout').expect(200);

    const forgotRes = await request(app.getHttpServer())
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'john.doe@example.com' })
      .expect(200);
    expect(forgotRes.body.data.dev_otp).toBe('111222');

    await request(app.getHttpServer())
      .post('/api/v1/auth/reset-password')
      .send({
        email: 'john.doe@example.com',
        otp: '111222',
        new_password: 'NewSecurePass123!',
        confirm_password: 'NewSecurePass123!',
      })
      .expect(200);
  });
});
