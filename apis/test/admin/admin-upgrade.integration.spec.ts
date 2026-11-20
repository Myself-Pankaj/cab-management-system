import { readFile } from 'node:fs/promises';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Pool, type PoolClient } from 'pg';
import { randomUUID } from 'node:crypto';
import { AdminFleetService } from '../../libs/resources/src/admin/admin-fleet.service.js';
import { AdminReportingRepository } from '../../libs/resources/src/admin/admin-reporting.repository.js';
import { AdminDriverService } from '../../libs/resources/src/drivers/services/admin-driver.service.js';
import { DriverProfileRepository } from '../../libs/resources/src/drivers/repositories/driver-profile.repository.js';
import { VehicleRepository } from '../../libs/resources/src/drivers/repositories/vehicle.repository.js';
import { VehicleDocumentRepository } from '../../libs/resources/src/drivers/repositories/vehicle-document.repository.js';
import { DriverDocumentRepository } from '../../libs/resources/src/drivers/repositories/driver-document.repository.js';
import { DriverVerificationRepository } from '../../libs/resources/src/drivers/repositories/driver-verification.repository.js';
import { DriverRideRepository } from '../../libs/resources/src/rides/repositories/driver-ride.repository.js';
import { AdminListRidesQueryDto } from '../../libs/resources/src/rides/dto/ride.dto.js';
import { adminMutation } from '../../libs/resources/src/admin/admin-mutation.js';
import type { AdminVehicleEditDto } from '../../libs/resources/src/admin/admin-edit.dto.js';

const connectionString = process.env.ADMIN_UPGRADE_TEST_DATABASE_URL;
describe.skipIf(!connectionString)(
  'admin upgrade against disposable PostgreSQL',
  () => {
    const pool = new Pool({ connectionString, max: 8 });
    const db = {
      getPool: () => pool,
      withTransaction: async <T>(work: (client: PoolClient) => Promise<T>) => {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const result = await work(client);
          await client.query('COMMIT');
          return result;
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      },
    };
    const reports = new AdminReportingRepository(db as never),
      profiles = new DriverProfileRepository(db as never),
      vehicles = new VehicleRepository(db as never),
      documents = new VehicleDocumentRepository(db as never),
      verifications = new DriverVerificationRepository(db as never);
    const fleet = new AdminFleetService(
      db as never,
      reports,
      vehicles,
      profiles,
      documents,
      verifications,
      {} as never,
    );
    const driverDocuments = new DriverDocumentRepository(db as never);
    const admin = new AdminDriverService(
      {} as never,
      profiles,
      driverDocuments,
      {} as never,
      vehicles,
      documents,
      verifications,
      {} as never,
      db as never,
      {} as never,
    );
    let actor: string;
    beforeAll(async () => {
      expect(
        (await pool.query('SELECT current_database() name')).rows[0].name,
      ).toBe('cab_admin_upgrade');
      actor = (
        await pool.query(
          "INSERT INTO users(full_name,email,global_role) VALUES('Upgrade Admin',$1,'Admin') RETURNING id",
          [`${randomUUID()}@test.invalid`],
        )
      ).rows[0].id;
    });
    afterAll(async () => {
      await pool.end();
    });
    async function fixture() {
      const user = (
        await pool.query(
          "INSERT INTO users(full_name,email,global_role) VALUES('Original Driver',$1,'Driver') RETURNING id",
          [`${randomUUID()}@test.invalid`],
        )
      ).rows[0].id as string;
      const profile = (
        await pool.query(
          "INSERT INTO driver_profiles(user_id,status) VALUES($1,'APPROVED') RETURNING id",
          [user],
        )
      ).rows[0].id as string;
      const vehicle = (
        await pool.query(
          "INSERT INTO vehicles(driver_profile_id,vehicle_number,vehicle_type,make) VALUES($1,$2,'SEATER_4','Original') RETURNING id",
          [profile, randomUUID().slice(0, 20).toUpperCase()],
        )
      ).rows[0].id as string;
      const licence = (
        await pool.query(
          "INSERT INTO driver_documents(driver_profile_id,document_type,document_number,expiry_date,status) VALUES($1,'DRIVING_LICENCE','LICENCE','2035-01-01','APPROVED') RETURNING id",
          [profile],
        )
      ).rows[0].id as string;
      await pool.query(
        "INSERT INTO driver_verifications(driver_profile_id,status) VALUES($1,'APPROVED')",
        [profile],
      );
      return { user, profile, vehicle, licence };
    }
    async function edit(id: string, extra: Partial<AdminVehicleEditDto> = {}) {
      const vehicle = await vehicles.findById(id);
      if (!vehicle) throw new Error('Missing vehicle');
      return {
        operation_id: randomUUID(),
        expected_updated_at: vehicle.updated_at.toISOString(),
        vehicle_number: vehicle.vehicle_number,
        vehicle_type: 'SEATER_4',
        make: vehicle.make ?? '',
        is_active: true,
        ...extra,
      } satisfies AdminVehicleEditDto;
    }
    async function ride(
      user: string,
      profile?: string,
      vehicle?: string,
      status = 'DRIVER_ASSIGNED',
    ) {
      return (
        await pool.query(
          `INSERT INTO rides(booked_by_user_id,driver_profile_id,vehicle_id,requested_vehicle_category,trip_type,pickup_address,pickup_latitude,pickup_longitude,destination_address,destination_latitude,destination_longitude,distance_km,estimated_duration_minutes,pickup_at,estimated_fare,payment_option,status) VALUES($1,$2,$3,'SEATER_4','ONE_WAY','Pickup',1,1,'Destination',2,2,10,30,NOW()+INTERVAL '2 days',100,'OFFLINE',$4) RETURNING id`,
          [user, profile ?? null, vehicle ?? null, status],
        )
      ).rows[0].id as string;
    }
    it('audits cosmetic edits once, replays identical requests and rejects key reuse/stale saves', async () => {
      const f = await fixture(),
        dto = await edit(f.vehicle, { make: 'Corrected' });
      const first = await fleet.update(f.vehicle, actor, dto);
      const repeated = await fleet.update(f.vehicle, actor, dto);
      expect(repeated.vehicle?.make).toBe(first.vehicle?.make);
      expect(await reports.vehicleAudit(f.vehicle)).toHaveLength(1);
      await expect(
        fleet.update(f.vehicle, actor, { ...dto, make: 'Different' }),
      ).rejects.toThrow('different action');
      await expect(
        fleet.update(f.vehicle, actor, {
          ...dto,
          operation_id: randomUUID(),
          make: 'Another',
        }),
      ).rejects.toThrow('Vehicle changed');
      const unchanged = await edit(f.vehicle);
      await fleet.update(f.vehicle, actor, unchanged);
      expect(await reports.vehicleAudit(f.vehicle)).toHaveLength(1);
    });
    it('requires operational reasons and atomically invalidates category compliance', async () => {
      const f = await fixture();
      await pool.query(
        "INSERT INTO vehicle_documents(vehicle_id,document_type,status) VALUES($1,'RC','APPROVED')",
        [f.vehicle],
      );
      const dto = await edit(f.vehicle, { vehicle_type: 'SEATER_7' });
      await expect(fleet.update(f.vehicle, actor, dto)).rejects.toThrow(
        'reason is required',
      );
      expect((await vehicles.findById(f.vehicle))?.vehicle_type).toBe(
        'SEATER_4',
      );
      await fleet.update(f.vehicle, actor, {
        ...dto,
        reason: 'Correct seating capacity',
      });
      expect((await documents.listByVehicleId(f.vehicle))[0].status).toBe(
        'PENDING',
      );
      expect(
        (await verifications.findLatestByProfileId(f.profile))?.status,
      ).toBe('PENDING');
    });
    it('rechecks a pending offer after waiting on assignment resource locks', async () => {
      const f = await fixture(),
        dto = await edit(f.vehicle, { color: 'Black' }),
        id = await ride(f.user, f.profile, f.vehicle);
      const assignment = await pool.connect();
      try {
        await assignment.query('BEGIN');
        await assignment.query(
          'SELECT id FROM driver_profiles WHERE id=$1 FOR UPDATE',
          [f.profile],
        );
        await assignment.query(
          'SELECT id FROM vehicles WHERE id=$1 FOR UPDATE',
          [f.vehicle],
        );
        const offer = (
          await assignment.query(
            "INSERT INTO ride_offers(ride_id,driver_profile_id,vehicle_id,expires_at) VALUES($1,$2,$3,NOW()+INTERVAL '1 hour') RETURNING id",
            [id, f.profile, f.vehicle],
          )
        ).rows[0].id;
        const outcome = fleet.update(f.vehicle, actor, dto).then(
          () => null,
          (error) => error,
        );
        await assignment.query('COMMIT');
        const error = await outcome;
        expect(error?.errorCode).toBe('VEHICLE_EDIT_BLOCKED');
        expect(error?.getResponse()).toMatchObject({
          blockingRideIds: [id],
          blockingOfferIds: [offer],
        });
        expect(await reports.vehicleAudit(f.vehicle)).toHaveLength(0);
      } finally {
        await assignment.query('ROLLBACK');
        assignment.release();
      }
    });
    it('assignment locking observes committed edits in the reverse race order', async () => {
      const f = await fixture(),
        editor = await pool.connect(),
        assigner = await pool.connect();
      try {
        await editor.query('BEGIN');
        await editor.query(
          'SELECT id FROM driver_profiles WHERE id=$1 FOR UPDATE',
          [f.profile],
        );
        await editor.query('SELECT id FROM vehicles WHERE id=$1 FOR UPDATE', [
          f.vehicle,
        ]);
        await editor.query(
          "UPDATE vehicles SET vehicle_type='SEATER_7' WHERE id=$1",
          [f.vehicle],
        );
        await assigner.query('BEGIN');
        const operations = new DriverRideRepository(db as never);
        const waiting = operations.lockResources(
          f.profile,
          f.vehicle,
          assigner,
        );
        await editor.query('COMMIT');
        const resources = await waiting;
        expect(resources.vehicle?.vehicle_type).toBe('SEATER_7');
        await assigner.query('ROLLBACK');
      } finally {
        await editor.query('ROLLBACK');
        editor.release();
        await assigner.query('ROLLBACK');
        assigner.release();
      }
    });
    it('serializes document corrections, audits before/after and rejects a stale administrator', async () => {
      const f = await fixture(),
        dto = {
          operation_id: randomUUID(),
          reason: 'Correct licence expiry',
          expected_revision: 0,
          expiry_date: '2036-01-01',
        };
      await admin.correctMetadata(f.licence, false, actor, dto);
      await admin.correctMetadata(f.licence, false, actor, dto);
      const doc = await driverDocuments.findById(f.licence);
      expect(doc).toMatchObject({ revision: 1, status: 'PENDING' });
      expect((await profiles.findById(f.profile))?.status).toBe('APPROVED');
      expect(
        (await verifications.findLatestByProfileId(f.profile))?.status,
      ).toBe('PENDING');
      const history = await profiles.auditHistory(f.profile);
      expect(history).toHaveLength(1);
      const audit = await pool.query(
        'SELECT details FROM driver_review_audit WHERE driver_profile_id=$1',
        [f.profile],
      );
      expect(audit.rows[0].details).toMatchObject({
        before: { expiry_date: '2035-01-01' },
        after: { expiry_date: '2036-01-01' },
      });
      await expect(
        admin.correctMetadata(f.licence, false, actor, {
          ...dto,
          operation_id: randomUUID(),
          expiry_date: '2037-01-01',
        }),
      ).rejects.toThrow('changed');
    });
    it('rolls back the revision, audit and review reset if an atomic correction fails', async () => {
      const f = await fixture();
      const broken = new AdminDriverService(
        {} as never,
        profiles,
        driverDocuments,
        {} as never,
        vehicles,
        documents,
        {
          findLatestByProfileId: () => null,
          create: () => {
            throw new Error('Reset failed');
          },
        } as never,
        {} as never,
        db as never,
        {} as never,
      );
      await expect(
        broken.correctMetadata(f.licence, false, actor, {
          operation_id: randomUUID(),
          reason: 'Correction',
          expected_revision: 0,
          document_number: 'NEW',
        }),
      ).rejects.toThrow('Reset failed');
      expect(await driverDocuments.findById(f.licence)).toMatchObject({
        revision: 0,
        status: 'APPROVED',
        document_number: 'LICENCE',
      });
      expect(await profiles.auditHistory(f.profile)).toHaveLength(0);
    });
    it('attributes completed rides to completion records and preserves offer identity', async () => {
      const original = await fixture(),
        replacement = await fixture(),
        id = await ride(
          original.user,
          replacement.profile,
          replacement.vehicle,
          'COMPLETED',
        );
      const offer = (
        await pool.query(
          "INSERT INTO ride_offers(ride_id,driver_profile_id,vehicle_id,status,expires_at) VALUES($1,$2,$3,'ACCEPTED',NOW()) RETURNING id",
          [id, original.profile, original.vehicle],
        )
      ).rows[0].id;
      await pool.query(
        'INSERT INTO ride_completions(id,ride_id,driver_profile_id,declared_by,declared_cash) VALUES($1,$2,$3,$4,0)',
        [randomUUID(), id, original.profile, actor],
      );
      await pool.query(
        "UPDATE users SET full_name='New display name' WHERE id=$1",
        [original.user],
      );
      const page = await reports.rides(
        Object.assign(new AdminListRidesQueryDto(), {
          driverProfileId: original.profile,
          view: 'completed',
          limit: 20,
          offset: 0,
        }),
      );
      expect(page.items.map((r) => r.id)).toContain(id);
      const other = await reports.rides(
        Object.assign(new AdminListRidesQueryDto(), {
          driverProfileId: replacement.profile,
          view: 'completed',
          limit: 20,
          offset: 0,
        }),
      );
      expect(other.total).toBe(0);
      const snapshot = await pool.query(
        'SELECT identity_snapshot FROM ride_offers WHERE id=$1',
        [offer],
      );
      expect(snapshot.rows[0].identity_snapshot.driver_name).toBe(
        'Original Driver',
      );
    });
    it('limits recent previews to three submitted applications and three bookings across statuses', async () => {
      const seeded = [];
      const anchor = (
        await pool.query(
          "SELECT GREATEST(NOW(),(SELECT MAX(submitted_at) FROM driver_verifications),(SELECT MAX(created_at) FROM rides))+INTERVAL '10 days' AS value",
        )
      ).rows[0].value;
      for (let index = 0; index < 5; index++) {
        const f = await fixture();
        seeded.push(f);
        await pool.query(
          "UPDATE driver_verifications SET submitted_at=$4::timestamptz+($2::int*INTERVAL '1 day'),status=$3 WHERE driver_profile_id=$1",
          [
            f.profile,
            index + 10,
            index === 4 ? 'REJECTED' : index === 3 ? 'PENDING' : 'APPROVED',
            anchor,
          ],
        );
        const id = await ride(
          f.user,
          undefined,
          undefined,
          index === 4 ? 'CANCELLED' : 'PENDING_PAYMENT',
        );
        await pool.query(
          "UPDATE rides SET created_at=$3::timestamptz+($2::int*INTERVAL '1 day') WHERE id=$1",
          [id, index + 10, anchor],
        );
      }
      const summary = await reports.summary();
      expect(summary.recentVerifications.map((item) => item.id)).toEqual(
        seeded
          .slice(-3)
          .reverse()
          .map((item) => item.profile),
      );
      expect(summary.recentBookings).toHaveLength(3);
      expect(summary.recentBookings[0].status).toBe('CANCELLED');
    });
    it('shows live pending offers and unfinished accepted rides, excluding expired offers', async () => {
      const f = await fixture(),
        ids = [];
      for (const [status, offerStatus, expiry] of [
        ['DRIVER_ASSIGNED', 'PENDING', 1],
        ['CONFIRMED', 'ACCEPTED', 1],
        ['DRIVER_ASSIGNED', 'PENDING', -1],
      ] as const) {
        const id = await ride(f.user, f.profile, f.vehicle, status);
        ids.push(id);
        await pool.query(
          "INSERT INTO ride_offers(ride_id,driver_profile_id,vehicle_id,status,expires_at) VALUES($1,$2,$3,$4,NOW()+($5::int*INTERVAL '1 hour'))",
          [id, f.profile, f.vehicle, offerStatus, expiry],
        );
      }
      const page = await reports.rides(
        Object.assign(new AdminListRidesQueryDto(), {
          driverProfileId: f.profile,
          view: 'assigned',
          limit: 1,
          offset: 0,
        }),
      );
      expect(page.total).toBe(2);
      expect(page.items).toHaveLength(1);
      const next = await reports.rides(
        Object.assign(new AdminListRidesQueryDto(), {
          driverProfileId: f.profile,
          view: 'assigned',
          limit: 1,
          offset: 1,
        }),
      );
      expect(
        [...page.items, ...next.items].map((item) => item.id).sort(),
      ).toEqual(ids.slice(0, 2).sort());
    });
    it('validates migration rollback/reapplication without persisting destructive changes', async () => {
      const sql = await readFile(
        new URL(
          '../../db/migrations/022_admin_operations.sql',
          import.meta.url,
        ),
        'utf8',
      );
      const up = sql.split('-- +migrate Up')[1].split('-- +migrate Down')[0];
      const down = sql.split('-- +migrate Down')[1];
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(down);
        await client.query(up);
        expect(
          (
            await client.query(
              "SELECT to_regclass('vehicle_edit_audit') AS name",
            )
          ).rows[0].name,
        ).toBe('vehicle_edit_audit');
      } finally {
        await client.query('ROLLBACK');
        client.release();
      }
    });
    it('rolls failed operations back without reserving their idempotency keys', async () => {
      const id = randomUUID();
      await expect(
        db.withTransaction((client) =>
          adminMutation(client, actor, id, 'failure', {}, async () => {
            throw new Error('Failed');
          }),
        ),
      ).rejects.toThrow('Failed');
      const result = await db.withTransaction((client) =>
        adminMutation(client, actor, id, 'failure', {}, async () => ({
          ok: true,
        })),
      );
      expect(result).toEqual({ ok: true });
    });
  },
);
