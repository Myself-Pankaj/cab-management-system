import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DriversController } from '../../src/drivers/drivers.controller.js';
import { AdminDriversController } from '../../src/admin/admin-drivers.controller.js';
import { DriverOnboardingService } from '../../libs/resources/src/drivers/services/driver-onboarding.service.js';
import { AdminDriverService } from '../../libs/resources/src/drivers/services/admin-driver.service.js';
import { onboardingFixture } from './onboarding.fixture.js';

describe('Driver onboarding HTTP flow', () => {
  let app: INestApplication;
  let f: ReturnType<typeof onboardingFixture>;
  beforeEach(async () => {
    f = onboardingFixture();
    f.profiles.updateStatus.mockImplementation(async (_id, status) => {
      f.profile.status = status;
      return { ...f.profile };
    });
    const reviews = {
      findLatestByProfileId: f.verifications.findLatestByProfileId,
      updateReview: vi.fn(async (_id, status, _admin, reason) => ({
        ...f.verification,
        status,
        rejection_reason: reason,
        reviewed_at: new Date(),
      })),
    };
    const admin = new AdminDriverService(
      f.user as never,
      f.profiles as never,
      f.documents as never,
      f.banks as never,
      f.vehicles as never,
      f.vehicleDocs as never,
      reviews as never,
      f.images as never,
      f.db as never,
      f.service,
    );
    const module = await Test.createTestingModule({
      controllers: [DriversController, AdminDriversController],
      providers: [
        { provide: DriverOnboardingService, useValue: f.service },
        { provide: AdminDriverService, useValue: admin },
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    // Authentication is supplied by the test harness; controller RolesGuard remains active.
    app.use(
      (
        req: { headers: Record<string, string>; user?: unknown },
        _res: unknown,
        next: () => void,
      ) => {
        req.user = { user_id: 'user-1', role: req.headers['x-test-role'] };
        next();
      },
    );
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

  it('submits complete details, waits for admin approval, then exposes APPROVED status', async () => {
    const onboarding = await request(app.getHttpServer())
      .get('/api/v1/drivers/me/onboarding')
      .set('x-test-role', 'Driver')
      .expect(200);
    expect(onboarding.body.complete).toBe(true);
    await request(app.getHttpServer())
      .post('/api/v1/drivers/me/submit')
      .set('x-test-role', 'Driver')
      .expect(200);
    expect(f.profile.status).toBe('PENDING_VERIFICATION');
    await request(app.getHttpServer())
      .put('/api/v1/drivers/me/bank-details')
      .set('x-test-role', 'Driver')
      .send({
        account_holder_name: 'Driver',
        account_number: '123456',
        ifsc: 'ABCD0123456',
        bank_name: 'Bank',
      })
      .expect(409);
    await request(app.getHttpServer())
      .post('/api/v1/admin/drivers/profile-1/review')
      .set('x-test-role', 'Driver')
      .send({ decision: 'APPROVED' })
      .expect(403);
    await request(app.getHttpServer())
      .post('/api/v1/admin/drivers/profile-1/review')
      .set('x-test-role', 'Admin')
      .send({ decision: 'APPROVED' })
      .expect(200);
    const profile = await request(app.getHttpServer())
      .get('/api/v1/drivers/me/profile')
      .set('x-test-role', 'Driver')
      .expect(200);
    expect(profile.body.profile.status).toBe('APPROVED');
  });

  it('rejects blank bank details and vehicle registration numbers at the API boundary', async () => {
    await request(app.getHttpServer())
      .put('/api/v1/drivers/me/bank-details')
      .set('x-test-role', 'Driver')
      .send({
        account_holder_name: '  ',
        account_number: '123456',
        ifsc: 'ABCD0123456',
        bank_name: 'Bank',
      })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/v1/drivers/me/vehicles')
      .set('x-test-role', 'Driver')
      .send({ vehicle_number: '  ', vehicle_type: 'SEATER_4' })
      .expect(400);
  });
});
