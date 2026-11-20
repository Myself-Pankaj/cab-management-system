import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { Reflector } from '@nestjs/core';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import type { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from '../../libs/resources/src/auth/guards/roles.guard.js';
import { AdminReportingController } from '../../src/admin/admin-reporting.controller.js';
import { AdminDriversController } from '../../src/admin/admin-drivers.controller.js';
import { AdminRidesController } from '../../src/admin/admin-rides.controller.js';
import { AdminCabsController } from '../../src/admin/admin-cabs.controller.js';
import { ValidationPipe } from '@nestjs/common';
import {
  AdminUsersQueryDto,
  AdminPaymentsQueryDto,
} from '../../libs/resources/src/admin/admin-query.dto.js';

describe('admin permissions and input validation', () => {
  const guard = new RolesGuard(new Reflector());
  for (const controller of [
    AdminReportingController,
    AdminDriversController,
    AdminRidesController,
    AdminCabsController,
  ]) {
    it(`${controller.name} installs the role guard`, () => {
      expect(Reflect.getMetadata(GUARDS_METADATA, controller)).toContain(
        RolesGuard,
      );
    });
    for (const method of Object.getOwnPropertyNames(
      controller.prototype,
    ).filter((m) => m !== 'constructor')) {
      it(`${controller.name}.${method} requires an authenticated admin`, () => {
        const handler = Reflect.get(controller.prototype, method);
        const context = (role?: string) =>
          ({
            getClass: () => controller,
            getHandler: () => handler,
            switchToHttp: () => ({
              getRequest: () => ({ user: role ? { role } : undefined }),
            }),
          }) as ExecutionContext;
        expect(guard.canActivate(context('Admin'))).toBe(true);
        expect(guard.canActivate(context())).toBe(false);
        for (const role of ['Driver', 'Passenger'])
          expect(() => guard.canActivate(context(role))).toThrow(
            'Insufficient permissions',
          );
      });
    }
  }
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  it('bounds pagination and validates filter enums', async () => {
    for (const query of [
      { limit: 0 },
      { limit: 101 },
      { offset: -1 },
      { role: 'Owner' },
      { password_hash: 'x' },
    ])
      await expect(
        pipe.transform(query, { type: 'query', metatype: AdminUsersQueryDto }),
      ).rejects.toThrow();
    await expect(
      pipe.transform(
        { limit: '20', offset: '0' },
        { type: 'query', metatype: AdminUsersQueryDto },
      ),
    ).resolves.toMatchObject({ limit: 20, offset: 0 });
    await expect(
      pipe.transform(
        { dateFrom: 'not-a-date' },
        { type: 'query', metatype: AdminPaymentsQueryDto },
      ),
    ).rejects.toThrow();
  });
});
