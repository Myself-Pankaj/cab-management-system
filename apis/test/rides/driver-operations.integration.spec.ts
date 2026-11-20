import type { vehicle_category } from '../../db/queries/rides/vehicle_fare_rates.queries.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AdminRideService } from '../../libs/resources/src/rides/services/admin-ride.service.js';
import { RideCancellationRepository } from '../../libs/resources/src/rides/repositories/ride-cancellation.repository.js';
import { Pool, type PoolClient } from 'pg';
import { randomUUID } from 'node:crypto';
import { DriverRideService } from '../../libs/resources/src/rides/services/driver-ride.service.js';
import { DriverRideRepository } from '../../libs/resources/src/rides/repositories/driver-ride.repository.js';
import { RideRepository } from '../../libs/resources/src/rides/repositories/ride.repository.js';
import { PaymentRepository } from '../../libs/resources/src/rides/repositories/payment.repository.js';
import { DriverProfileRepository } from '../../libs/resources/src/drivers/repositories/driver-profile.repository.js';
import { RideStatusHistoryRepository } from '../../libs/resources/src/rides/repositories/ride-status-history.repository.js';
import { RideStatusService } from '../../libs/resources/src/rides/services/ride-status.service.js';
import { PaymentSummaryService } from '../../libs/resources/src/rides/services/payment-summary.service.js';
import { toRideResponse } from '../../libs/resources/src/rides/types/ride.types.js';
import {
  reservationInterval,
  reservationsConflict,
  type RideRow,
} from '../../libs/resources/src/rides/types/driver-ride.types.js';

describe('reservation windows', () => {
  const ride = {
    pickup_at: new Date('2026-12-01T10:00:00Z'),
    return_at: null,
    trip_type: 'ONE_WAY',
    estimated_duration_minutes: 60,
    status: 'CONFIRMED',
  } as RideRow;
  it('uses half-open intervals including the buffer', () => {
    const other = { ...ride, pickup_at: new Date('2026-12-01T11:30:00Z') };
    expect(reservationsConflict(ride, other)).toBe(false);
    expect(
      reservationsConflict(ride, {
        ...other,
        pickup_at: new Date('2026-12-01T11:29:00Z'),
      }),
    ).toBe(true);
  });
  it('includes the return leg and buffer', () => {
    expect(
      reservationInterval({
        ...ride,
        trip_type: 'ROUND_TRIP',
        return_at: new Date('2026-12-02T10:00:00Z'),
        estimated_duration_minutes: 120,
      })?.end,
    ).toBe(new Date('2026-12-02T11:30:00Z').getTime());
  });
  it('blocks in-progress rides past the estimate and rejects invalid schedules', () => {
    expect(
      reservationsConflict(ride, {
        ...ride,
        status: 'IN_PROGRESS',
        pickup_at: new Date('2020-01-01'),
      }),
    ).toBe(true);
    expect(
      reservationInterval({ ...ride, estimated_duration_minutes: 0 }),
    ).toBeNull();
  });
});
const connectionString = process.env.DRIVER_TEST_DATABASE_URL;
describe.skipIf(!connectionString)(
  'driver operations against isolated PostgreSQL',
  () => {
    const pool = new Pool({ connectionString, max: 8 });
    const db = {
      getPool: () => pool,
      withTransaction: async <T>(work: (client: PoolClient) => Promise<T>) => {
        const c = await pool.connect();
        try {
          await c.query('BEGIN');
          const result = await work(c);
          await c.query('COMMIT');
          return result;
        } catch (e) {
          await c.query('ROLLBACK');
          throw e;
        } finally {
          c.release();
        }
      },
    };
    const ops = new DriverRideRepository(db as never),
      rides = new RideRepository(db as never),
      payments = new PaymentRepository(db as never),
      profiles = new DriverProfileRepository(db as never),
      summary = new PaymentSummaryService();
    const booking = {
      buildRideDetail: async (r: RideRow) => ({
        ride: toRideResponse(r),
        passengers: [],
        payments: [],
        status_history: [],
        payment_summary: summary.summarize(
          Number(r.estimated_fare),
          await payments.listByRideId(r.id),
        ),
      }),
    };
    const service = new DriverRideService(
      db as never,
      ops,
      rides,
      profiles,
      payments,
      booking as never,
      new RideStatusService(new RideStatusHistoryRepository(db as never)),
      summary,
      { driver: { offerExpiryMinutes: 30 } } as never,
    );
    let admin: string, booker: string;
    async function user(role: string) {
      return (
        await pool.query<{ id: string }>(
          'INSERT INTO users(full_name,global_role,email) VALUES($1,$2,$3) RETURNING id',
          [`Test ${randomUUID()}`, role, `${randomUUID()}@example.test`],
        )
      ).rows[0].id;
    }
    beforeAll(async () => {
      if (
        !['cab_driver_test', 'cab_admin_upgrade_driver'].includes(
          (await pool.query('SELECT current_database() name')).rows[0].name,
        )
      )
        throw new Error('Use disposable cab_driver_test only');
      admin = await user('Admin');
      booker = await user('Passenger');
    });
    afterAll(async () => {
      await pool.end();
    });
    async function driver(category: vehicle_category = 'SEATER_4') {
      const userId = await user('Driver');
      const profileId = (
        await pool.query(
          "INSERT INTO driver_profiles(user_id,status) VALUES($1,'APPROVED') RETURNING id",
          [userId],
        )
      ).rows[0].id as string;
      const vehicleId = (
        await pool.query(
          'INSERT INTO vehicles(driver_profile_id,vehicle_number,vehicle_type) VALUES($1,$2,$3) RETURNING id',
          [profileId, randomUUID().slice(0, 20), category],
        )
      ).rows[0].id as string;
      const docs = [
        {
          type: 'DRIVER_DOCUMENT',
          id: (
            await pool.query(
              "INSERT INTO driver_documents(driver_profile_id,document_type,status) VALUES($1,'DRIVING_LICENCE','APPROVED') RETURNING id",
              [profileId],
            )
          ).rows[0].id,
        },
      ];
      for (const kind of ['RC', 'PUC', 'INSURANCE'])
        docs.push({
          type: 'VEHICLE_DOCUMENT',
          id: (
            await pool.query(
              "INSERT INTO vehicle_documents(vehicle_id,document_type,status) VALUES($1,$2,'APPROVED') RETURNING id",
              [vehicleId, kind],
            )
          ).rows[0].id,
        });
      for (const doc of docs)
        await pool.query(
          "INSERT INTO images(owner_type,owner_id,image_type,imagekit_file_id,url,document_private) VALUES($1,$2,'DOCUMENT',$3,'/private',true)",
          [doc.type, doc.id, randomUUID()],
        );
      return { userId, profileId, vehicleId };
    }
    async function ride(
      category: vehicle_category = 'SEATER_4',
      pickupOffset = '1 day',
    ) {
      return (
        await pool.query<{ id: string }>(
          `INSERT INTO rides(booked_by_user_id,trip_type,pickup_address,pickup_latitude,pickup_longitude,destination_address,destination_latitude,destination_longitude,distance_km,estimated_duration_minutes,pickup_at,estimated_fare,payment_option,status,requested_vehicle_category) VALUES($1,'ONE_WAY','Pickup',1,1,'Destination',2,2,10,60,NOW()+$3::interval,1000,'OFFLINE','PENDING_ASSIGNMENT',$2) RETURNING id`,
          [booker, category, pickupOffset],
        )
      ).rows[0].id;
    }
    async function assigned() {
      const d = await driver(),
        id = await ride();
      await service.assign(id, admin, d.profileId, d.vehicleId);
      return { ...d, id, offer: (await ops.offers(id))[0] };
    }
    async function underway() {
      const f = await assigned();
      await service.respond(f.offer.id, f.userId, 'ACCEPTED');
      await service.start(f.id, f.userId);
      return f;
    }
    async function payment(id: string, amount: number, online = false) {
      return payments.create({
        rideId: id,
        userId: booker,
        paymentType: online ? 'ONLINE' : 'OFFLINE',
        amount,
        currency: 'INR',
        provider: null,
        providerOrderId: null,
        status: online ? 'PAID' : 'CREATED',
      });
    }
    it('lists exact and larger vehicles for a five-seater booking and accepts an upgrade', async () => {
      const smaller = await driver('SEATER_4'),
        exact = await driver('SEATER_5'),
        larger = await driver('SEATER_7'),
        largest = await driver('SEATER_12');
      const id = await ride('SEATER_5');
      const candidates = (await service.candidates(id)).drivers.map(
        (d) => d.vehicle_id,
      );
      expect(candidates).toContain(exact.vehicleId);
      expect(candidates).toContain(larger.vehicleId);
      expect(candidates).toContain(largest.vehicleId);
      expect(candidates).not.toContain(smaller.vehicleId);
      await expect(
        service.assign(id, admin, smaller.profileId, smaller.vehicleId),
      ).rejects.toThrow('enough seats');
      await service.assign(id, admin, larger.profileId, larger.vehicleId);
      const offer = (await ops.offers(id))[0];
      await service.respond(offer.id, larger.userId, 'ACCEPTED');
      const booked = await rides.findById(id);
      expect(booked?.status).toBe('CONFIRMED');
      expect(booked?.requested_vehicle_category).toBe('SEATER_5');
      expect(Number(booked?.estimated_fare)).toBe(1000);
    });
    it('excludes overlapping reservations across a driver’s vehicles and allows a different time', async () => {
      const d = await driver('SEATER_7'),
        other = await driver('SEATER_12');
      await pool.query('UPDATE vehicles SET driver_profile_id=$1 WHERE id=$2', [
        d.profileId,
        other.vehicleId,
      ]);
      const first = await ride('SEATER_5');
      await service.assign(first, admin, d.profileId, d.vehicleId);
      const overlap = await ride('SEATER_5', '1 day 30 minutes');
      const blocked = (await service.candidates(overlap)).drivers;
      expect(blocked.some((c) => c.driver_profile_id === d.profileId)).toBe(
        false,
      );
      await expect(
        service.assign(overlap, admin, d.profileId, other.vehicleId),
      ).rejects.toThrow('conflicting reservation');
      const later = await ride('SEATER_5', '1 day 2 hours');
      const available = (await service.candidates(later)).drivers.map(
        (c) => c.vehicle_id,
      );
      expect(available).toContain(d.vehicleId);
      expect(available).toContain(other.vehicleId);
      await service.assign(later, admin, d.profileId, other.vehicleId);
    });
    it('reserves pending offers and serializes overlapping assignments', async () => {
      const d = await driver(),
        a = await ride(),
        b = await ride();
      const results = await Promise.allSettled([
        service.assign(a, admin, d.profileId, d.vehicleId),
        service.assign(b, admin, d.profileId, d.vehicleId),
      ]);
      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    });
    it('permits only one concurrent assignment for the same ride', async () => {
      const a = await driver(),
        b = await driver(),
        id = await ride();
      const results = await Promise.allSettled([
        service.assign(id, admin, a.profileId, a.vehicleId),
        service.assign(id, admin, b.profileId, b.vehicleId),
      ]);
      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      expect(await ops.offers(id)).toHaveLength(1);
    });
    it('records rejection once and supports same-driver reassignment', async () => {
      const f = await assigned();
      await service.respond(f.offer.id, f.userId, 'REJECTED');
      await service.respond(f.offer.id, f.userId, 'REJECTED');
      expect((await rides.findById(f.id))?.status).toBe('PENDING_ASSIGNMENT');
      await service.assign(f.id, admin, f.profileId, f.vehicleId);
      await expect(
        service.respond(f.offer.id, f.userId, 'ACCEPTED'),
      ).rejects.toThrow('no longer');
      expect(await ops.offers(f.id)).toHaveLength(2);
    });
    it('persists expiry before rejecting acceptance', async () => {
      const f = await assigned();
      await pool.query(
        "UPDATE ride_offers SET expires_at=NOW()-INTERVAL '1 minute' WHERE id=$1",
        [f.offer.id],
      );
      await expect(
        service.respond(f.offer.id, f.userId, 'ACCEPTED'),
      ).rejects.toThrow();
      expect((await ops.offer(f.offer.id))?.status).toBe('EXPIRED');
      expect((await rides.findById(f.id))?.status).toBe('PENDING_ASSIGNMENT');
      await service.assign(f.id, admin, f.profileId, f.vehicleId);
    });
    it('rechecks suspension and document approval', async () => {
      const f = await assigned();
      await pool.query(
        "UPDATE driver_profiles SET status='SUSPENDED' WHERE id=$1",
        [f.profileId],
      );
      await expect(
        service.respond(f.offer.id, f.userId, 'ACCEPTED'),
      ).rejects.toThrow('approved');
      await pool.query(
        "UPDATE driver_profiles SET status='APPROVED' WHERE id=$1",
        [f.profileId],
      );
      await pool.query(
        "UPDATE vehicle_documents SET status='REJECTED' WHERE vehicle_id=$1 AND document_type='INSURANCE'",
        [f.vehicleId],
      );
      await expect(
        service.respond(f.offer.id, f.userId, 'ACCEPTED'),
      ).rejects.toThrow('documents');
    });
    it('preserves acceptance after an admin release', async () => {
      const f = await assigned();
      await service.respond(f.offer.id, f.userId, 'ACCEPTED');
      await service.respond(f.offer.id, f.userId, 'ACCEPTED');
      await expect(service.release(f.id, f.offer.id, admin)).rejects.toThrow(
        'reason',
      );
      await service.release(f.id, f.offer.id, admin, 'Unavailable');
      expect(await ops.offer(f.offer.id)).toMatchObject({
        status: 'ACCEPTED',
        release_reason: 'Unavailable',
      });
      await expect(
        service.respond(f.offer.id, f.userId, 'ACCEPTED'),
      ).rejects.toThrow('released');
    });
    it('replays original admin assignment/release snapshots without modifying a newer offer', async () => {
      const d = await driver(),
        id = await ride();
      const confirmation = {
        operation_id: randomUUID(),
        reason: 'Assign available driver',
      };
      const first = await service.assign(
        id,
        admin,
        d.profileId,
        d.vehicleId,
        confirmation,
      );
      const releaseId = randomUUID();
      const released = await service.release(
        id,
        first.offers[0].id,
        admin,
        'Driver unavailable',
        releaseId,
      );
      await service.assign(id, admin, d.profileId, d.vehicleId);
      const repeatedAssign = await service.assign(
        id,
        admin,
        d.profileId,
        d.vehicleId,
        confirmation,
      );
      const repeatedRelease = await service.release(
        id,
        first.offers[0].id,
        admin,
        'Driver unavailable',
        releaseId,
      );
      expect(JSON.parse(JSON.stringify(repeatedAssign))).toEqual(
        JSON.parse(JSON.stringify(first)),
      );
      expect(JSON.parse(JSON.stringify(repeatedRelease))).toEqual(
        JSON.parse(JSON.stringify(released)),
      );
      expect((await rides.findById(id))?.status).toBe('DRIVER_ASSIGNED');
      expect(await ops.offers(id)).toHaveLength(2);
    });
    it('rejects undercollection and stale balance without payment changes', async () => {
      const f = await underway();
      await payment(f.id, 700);
      await payment(f.id, 300, true);
      await expect(
        service.complete(f.id, f.userId, {
          operation_id: randomUUID(),
          expected_outstanding: 700,
          declared_cash: 500,
        }),
      ).rejects.toThrow('exact');
      await expect(
        service.complete(f.id, f.userId, {
          operation_id: randomUUID(),
          expected_outstanding: 1000,
          declared_cash: 1000,
        }),
      ).rejects.toThrow('Balance changed');
      expect((await rides.findById(f.id))?.status).toBe('IN_PROGRESS');
      expect(
        (await payments.listByRideId(f.id)).find(
          (p) => p.payment_type === 'OFFLINE',
        )?.status,
      ).toBe('CREATED');
    });
    it('collects once under concurrent completion retries', async () => {
      const f = await underway();
      await payment(f.id, 1000);
      const dto = {
        operation_id: randomUUID(),
        expected_outstanding: 1000,
        declared_cash: 1000,
      };
      const [a, b] = await Promise.all([
        service.complete(f.id, f.userId, dto),
        service.complete(f.id, f.userId, dto),
      ]);
      expect(a.completion.id).toBe(b.completion.id);
      expect(
        (await payments.listByRideId(f.id)).filter((p) => p.status === 'PAID'),
      ).toHaveLength(1);
      expect(
        (
          await pool.query('SELECT * FROM ride_completions WHERE ride_id=$1', [
            f.id,
          ])
        ).rows,
      ).toHaveLength(1);
    });
    it('completes fully paid rides with zero cash', async () => {
      const f = await underway();
      await payment(f.id, 1000, true);
      expect(
        (
          await service.complete(f.id, f.userId, {
            operation_id: randomUUID(),
            expected_outstanding: 0,
            declared_cash: 0,
          })
        ).completion.declared_cash,
      ).toBe(0);
    });
    it('lets admin resolve a suspended in-progress ride with a note', async () => {
      const f = await underway();
      await payment(f.id, 1000);
      await pool.query(
        "UPDATE driver_profiles SET status='SUSPENDED' WHERE id=$1",
        [f.profileId],
      );
      const dto = {
        operation_id: randomUUID(),
        expected_outstanding: 1000,
        declared_cash: 1000,
      };
      await expect(service.complete(f.id, f.userId, dto)).rejects.toThrow(
        'Admin',
      );
      await expect(service.complete(f.id, admin, dto, true)).rejects.toThrow(
        'note',
      );
      expect(
        (
          await service.complete(
            f.id,
            admin,
            { ...dto, note: 'Confirmed with driver' },
            true,
          )
        ).completion.declared_by,
      ).toBe(admin);
    });
    it('rolls back payment collection when completion persistence fails', async () => {
      const first = await underway();
      await payment(first.id, 1000);
      const operation = randomUUID();
      await service.complete(first.id, first.userId, {
        operation_id: operation,
        expected_outstanding: 1000,
        declared_cash: 1000,
      });
      const second = await underway();
      await payment(second.id, 1000);
      await expect(
        service.complete(second.id, second.userId, {
          operation_id: operation,
          expected_outstanding: 1000,
          declared_cash: 1000,
        }),
      ).rejects.toThrow();
      expect((await payments.listByRideId(second.id))[0].status).toBe(
        'CREATED',
      );
      expect((await rides.findById(second.id))?.status).toBe('IN_PROGRESS');
    });
    it.each([false, true])(
      'preserves pending/accepted offer history on admin cancellation (accepted=%s)',
      async (accepted) => {
        const f = await assigned();
        if (accepted) await service.respond(f.offer.id, f.userId, 'ACCEPTED');
        const adminService = new AdminRideService(
          db as never,
          rides,
          payments,
          new RideCancellationRepository(db as never),
          profiles,
          {} as never,
          {} as never,
          booking as never,
          new RideStatusService(new RideStatusHistoryRepository(db as never)),
          { isConfigured: () => false } as never,
          service,
          ops,
        );
        await adminService.cancelRide(f.id, admin, {
          operation_id: randomUUID(),
          reason: 'Passenger cancelled',
          refund_required: false,
        });
        const offer = await ops.offer(f.offer.id);
        expect(offer?.status).toBe(accepted ? 'ACCEPTED' : 'REVOKED');
        expect(offer?.cancelled_at).not.toBeNull();
        expect(
          (await service.list(f.userId, 'cancelled')).offers[0].ride_id,
        ).toBe(f.id);
      },
    );
    it('starts idempotently and checks vehicle activity again before acceptance', async () => {
      const f = await assigned();
      await pool.query('UPDATE vehicles SET is_active=FALSE WHERE id=$1', [
        f.vehicleId,
      ]);
      await expect(
        service.respond(f.offer.id, f.userId, 'ACCEPTED'),
      ).rejects.toThrow('active vehicle');
      await pool.query('UPDATE vehicles SET is_active=TRUE WHERE id=$1', [
        f.vehicleId,
      ]);
      await service.respond(f.offer.id, f.userId, 'ACCEPTED');
      await service.start(f.id, f.userId);
      await service.start(f.id, f.userId);
      expect(
        (
          await pool.query(
            "SELECT * FROM ride_status_history WHERE ride_id=$1 AND new_status='IN_PROGRESS'",
            [f.id],
          )
        ).rows,
      ).toHaveLength(1);
    });
    it('denies reassigned passenger details to the former driver', async () => {
      const f = await assigned();
      await service.respond(f.offer.id, f.userId, 'REJECTED');
      const d = await driver();
      await service.assign(f.id, admin, d.profileId, d.vehicleId);
      await expect(service.detail(f.id, f.userId)).rejects.toThrow('not found');
      expect(
        (await service.list(f.userId, 'rejected')).offers[0].can_view_ride,
      ).toBe(false);
    });
  },
);
