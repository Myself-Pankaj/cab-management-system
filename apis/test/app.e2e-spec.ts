import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { DatabaseService, HealthRepository } from '@app/core';
import { GlobalExceptionFilter } from '@app/core/filter/global.filter.js';
import { ResponseInterceptor } from '@app/core/interceptor/response.interceptor.js';
import { AppConfigService } from '@app/core/config/config.service.js';
import { AppLogger } from '@app/core/logger/logger.service.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
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
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');

    const logger = app.get(AppLogger);
    const configService = app.get(AppConfigService);
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

  it('/api/v1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBe('Hello World!');
      });
  });

  it('/api/v1/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('ok');
      });
  });

  it('/api/v1/health/ready (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health/ready')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('ready');
      });
  });
});
