import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';
import { AdminReportingRepository } from '../../libs/resources/src/admin/admin-reporting.repository.js';
import { AdminReportingService } from '../../libs/resources/src/admin/admin-reporting.service.js';
import {
  AdminApplicationsQueryDto,
  AdminPaymentsQueryDto,
  AdminUsersQueryDto,
  AdminVehiclesQueryDto,
} from '../../libs/resources/src/admin/admin-query.dto.js';

const connectionString = process.env.ADMIN_TEST_DATABASE_URL;
describe.skipIf(!connectionString)(
  'admin reporting against disposable PostgreSQL',
  () => {
    const client = new Client({ connectionString });
    const repository = new AdminReportingRepository({
      getPool: () => client,
      withTransaction: async <T>(work: (c: Client) => Promise<T>) =>
        work(client),
    } as never);
    const service = new AdminReportingService(repository, {} as never);
    beforeAll(async () => {
      await client.connect();
      const result = await client.query<{ name: string }>(
        'SELECT current_database() AS name',
      );
      if (
        !['cab_admin_validation', 'cab_admin_upgrade_reports'].includes(
          result.rows[0]?.name ?? '',
        )
      )
        throw new Error('Use disposable cab_admin_validation only');
    });
    afterAll(async () => {
      await client.end();
    });
    beforeEach(async () => {
      await client.query('BEGIN');
    });
    afterEach(async () => {
      await client.query('ROLLBACK');
    });
    async function user(role: string | null = 'Passenger', deleted = false) {
      const id = randomUUID();
      await client.query(
        `INSERT INTO users(id,full_name,email,global_role,password_hash,metadata,deleted_at) VALUES($1,'Reporting Person',$2,$3,'private-hash','{"private":"secret"}',CASE WHEN $4 THEN NOW() END)`,
        [id, `${id}@test.invalid`, role, deleted],
      );
      return id;
    }
    async function profile(status = 'APPROVED') {
      const userId = await user('Driver'),
        id = randomUUID();
      await client.query(
        'INSERT INTO driver_profiles(id,user_id,status) VALUES($1,$2,$3)',
        [id, userId, status],
      );
      return { id, userId };
    }
    async function vehicle(profileId: string) {
      const id = randomUUID();
      await client.query(
        "INSERT INTO vehicles(id,driver_profile_id,vehicle_number,vehicle_type) VALUES($1,$2,$3,'SEATER_4')",
        [id, profileId, id.slice(0, 20)],
      );
      return id;
    }
    async function ride(userId: string, status: string, pickupAt?: Date) {
      const id = randomUUID();
      await client.query(
        `INSERT INTO rides(id,booked_by_user_id,requested_vehicle_category,trip_type,pickup_address,pickup_latitude,pickup_longitude,destination_address,destination_latitude,destination_longitude,distance_km,estimated_duration_minutes,pickup_at,estimated_fare,payment_option,status) VALUES($1,$2,'SEATER_4','ONE_WAY','Pickup',1,1,'Destination',2,2,10,30,COALESCE($4::timestamptz,NOW()+INTERVAL '2 days'),100,'OFFLINE',$3)`,
        [id, userId, status, pickupAt ?? null],
      );
      return id;
    }
    it('handles empty data and zero percentages', async () => {
      const data = await service.summary();
      expect(data.users.total).toBe(0);
      expect(data.rides.total).toBe(0);
      expect(data.users.percentages).toEqual({
        drivers: 0,
        passengers: 0,
        admins: 0,
        unselected: 0,
      });
      expect(data.pending_reviews).toEqual([]);
    });
    it('counts nullable roles once, excludes deleted users and returns safe paginated records', async () => {
      const id = await user(null);
      await user('Driver');
      await user('Admin');
      await user('Passenger', true);
      const data = await service.summary();
      expect(data.users).toMatchObject({
        total: 3,
        drivers: 1,
        admins: 1,
        passengers: 0,
        unselected: 1,
      });
      const page = await service.users(
        Object.assign(new AdminUsersQueryDto(), { limit: 1 }),
      );
      expect(page.total).toBe(3);
      expect(page.items).toHaveLength(1);
      const detail = await service.user(id);
      expect(detail).not.toHaveProperty('password_hash');
      expect(detail).not.toHaveProperty('metadata');
      expect(detail).not.toHaveProperty('auth_provider');
      const filtered = await service.users(
        Object.assign(new AdminUsersQueryDto(), {
          role: 'UNSELECTED',
          offset: 20,
        }),
      );
      expect(filtered.total).toBe(1);
      expect(filtered.items).toEqual([]);
      await expect(service.user(randomUUID())).rejects.toThrow('not found');
    });
    it('uses half-open Kolkata calendar boundaries and includes scheduled cancelled rides', async () => {
      const u = await user();
      const { rows } = await client.query<{ start: Date }>(
        "SELECT date_trunc('day',NOW() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata' AS start",
      );
      const start = rows[0].start;
      await ride(u, 'CANCELLED', start);
      await ride(u, 'COMPLETED', new Date(start.getTime() + 86400000 - 1));
      await ride(u, 'CONFIRMED', new Date(start.getTime() + 86400000));
      await ride(u, 'IN_PROGRESS', new Date(start.getTime() - 1));
      const { rides } = await service.summary();
      expect(rides).toMatchObject({
        total: 4,
        today: 2,
        active: 2,
        completed: 1,
        confirmed: 1,
        ongoing: 1,
      });
    });
    it('classifies expired offers consistently without changing stored ride or offer state', async () => {
      const u = await user(),
        p = await profile(),
        v = await vehicle(p.id),
        expired = await ride(u, 'DRIVER_ASSIGNED'),
        pending = await ride(u, 'DRIVER_ASSIGNED');
      for (const [id, interval] of [
        [expired, '-1 minute'],
        [pending, '1 hour'],
      ])
        await client.query(
          'INSERT INTO ride_offers(ride_id,driver_profile_id,vehicle_id,expires_at) VALUES($1,$2,$3,NOW()+$4::interval)',
          [id, p.id, v, interval],
        );
      const { rides } = await service.summary();
      expect(rides.awaiting_assignment).toBe(1);
      expect(rides.awaiting_acceptance).toBe(1);
      const page = await service.rides({
        status: 'PENDING_ASSIGNMENT',
        limit: 1,
        offset: 0,
      });
      expect(page.total).toBe(1);
      expect(page.items[0].id).toBe(expired);
      expect(page.items[0].status).toBe('PENDING_ASSIGNMENT');
      const stored = await client.query(
        'SELECT status FROM rides WHERE id=$1',
        [expired],
      );
      expect(stored.rows[0].status).toBe('DRIVER_ASSIGNED');
      expect(
        (
          await client.query(
            'SELECT status FROM ride_offers WHERE ride_id=$1',
            [expired],
          )
        ).rows[0].status,
      ).toBe('PENDING');
    });
    it('separates correction requests and counts only pending documents on submitted applications', async () => {
      const pending = await profile('PENDING_VERIFICATION'),
        correction = await profile('REJECTED'),
        rejected = await profile('REJECTED'),
        draft = await profile('DRAFT');
      for (const p of [pending, draft])
        await client.query(
          "INSERT INTO driver_documents(driver_profile_id,document_type) VALUES($1,'DRIVING_LICENCE')",
          [p.id],
        );
      const v = await vehicle(pending.id);
      await client.query(
        "INSERT INTO vehicle_documents(vehicle_id,document_type,expiry_date) VALUES($1,'RC','2030-12-31')",
        [v],
      );
      await client.query(
        "INSERT INTO driver_verifications(driver_profile_id,status,submitted_at,correction_document_ids) VALUES($1,'REJECTED',NOW(),ARRAY[$2::uuid])",
        [correction.id, randomUUID()],
      );
      const data = await service.summary();
      expect(data.verifications).toEqual({
        pending_drivers: 1,
        pending_documents: 2,
      });
      const corrections = await service.applications(
        Object.assign(new AdminApplicationsQueryDto(), {
          state: 'CORRECTION_REQUESTED',
        }),
      );
      expect(corrections.total).toBe(1);
      expect(corrections.items[0].id).toBe(correction.id);
      const rejections = await service.applications(
        Object.assign(new AdminApplicationsQueryDto(), { state: 'REJECTED' }),
      );
      expect(rejections.items.map((p) => p.id)).toEqual([rejected.id]);
      const fleet = await service.vehicles(new AdminVehiclesQueryDto());
      expect(fleet.items[0].documents[0]).not.toHaveProperty('document_number');
      expect(fleet.items[0].documents[0]).not.toHaveProperty('images');
    });
    it('separates paid collections, failures and refund statuses with filters applied across pages', async () => {
      const u = await user(),
        r = await ride(u, 'COMPLETED');
      for (const [type, status, amount] of [
        ['ONLINE', 'PAID', 100],
        ['OFFLINE', 'PAID', 50],
        ['ONLINE', 'FAILED', 999],
        ['ONLINE', 'REFUNDED', 80],
        ['ONLINE', 'PARTIALLY_REFUNDED', 60],
      ])
        await client.query(
          'INSERT INTO payments(ride_id,user_id,payment_type,status,amount) VALUES($1,$2,$3,$4,$5)',
          [r, u, type, status, amount],
        );
      const page = await service.payments(
        Object.assign(new AdminPaymentsQueryDto(), { limit: 2 }),
      );
      expect(page.total).toBe(5);
      expect(page.items).toHaveLength(2);
      expect(page.summary).toMatchObject({
        online_collected: 100,
        cash_collected: 50,
        successful: 2,
        failed: 1,
        refunded: 1,
        partially_refunded: 1,
      });
      const filtered = await service.payments(
        Object.assign(new AdminPaymentsQueryDto(), {
          status: 'FAILED',
          offset: 10,
        }),
      );
      expect(filtered.total).toBe(1);
      expect(filtered.items).toEqual([]);
      expect(filtered.summary.online_collected).toBe(0);
      await expect(
        service.payments(
          Object.assign(new AdminPaymentsQueryDto(), {
            dateFrom: '2030-01-02',
            dateTo: '2030-01-01',
          }),
        ),
      ).rejects.toThrow('End date');
    });
  },
);
