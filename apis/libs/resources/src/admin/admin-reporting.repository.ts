import { dateOnly } from '../drivers/types/onboarding-policy.js';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@app/core';
import { getRideById } from '@db/queries/rides/rides.queries.js';
import * as sql from '@db/queries/admin/reporting.queries.js';
import type {
  AdminApplicationsQueryDto,
  AdminPaymentsQueryDto,
  AdminUsersQueryDto,
  AdminVehiclesQueryDto,
} from './admin-query.dto.js';
import type { AdminListRidesQueryDto } from '../rides/dto/ride.dto.js';

function requiredRow<T>(rows: readonly T[]): T {
  const row = rows[0];
  if (!row) throw new Error('Reporting aggregate returned no row');
  return row;
}

@Injectable()
export class AdminReportingRepository extends BaseRepository {
  async paymentRide(id: string) {
    return (await getRideById.run({ id }, this.pool))[0];
  }
  async payment(id: string) {
    return (await sql.adminGetPayment.run({ id }, this.pool))[0];
  }
  vehicleAudit(id: string) {
    return sql.adminVehicleAudit.run({ id }, this.pool);
  }
  vehicleBlockers(id: string, client?: import('pg').PoolClient) {
    return sql.adminVehicleBlockers.run({ vehicleId: id }, client ?? this.pool);
  }
  updateVehicle(
    params: Parameters<typeof sql.adminUpdateVehicle.run>[0],
    client: import('pg').PoolClient,
  ) {
    return sql.adminUpdateVehicle.run(params, client);
  }
  auditVehicle(
    params: Parameters<typeof sql.adminInsertVehicleAudit.run>[0],
    client: import('pg').PoolClient,
  ) {
    return sql.adminInsertVehicleAudit.run(params, client);
  }
  summary() {
    return this.db.withTransaction(
      async (client) => {
        const users = requiredRow(
          await sql.adminUserCounts.run(undefined, client),
        );
        const vehicles = requiredRow(
          await sql.adminVehicleCounts.run(undefined, client),
        );
        const rides = requiredRow(
          await sql.adminRideCounts.run(undefined, client),
        );
        const verifications = requiredRow(
          await sql.adminVerificationCounts.run(undefined, client),
        );
        const pendingReviews = await sql.adminListApplications.run(
          { state: 'PENDING_VERIFICATION', search: null, limit: 5, offset: 0 },
          client,
        );
        const awaitingRides = await sql.adminListOperationalRides.run(
          {
            status: 'PENDING_ASSIGNMENT',
            category: null,
            limit: 5,
            offset: 0,
            userId: null,
            driverProfileId: null,
            view: null,
          },
          client,
        );
        const { rows } = await client.query<{ calculated_at: Date }>(
          'SELECT NOW() AS calculated_at',
        );
        return {
          users,
          vehicles,
          rides,
          verifications,
          pendingReviews,
          recentVerifications: await sql.adminRecentVerifications.run(
            undefined,
            client,
          ),
          recentBookings: await sql.adminListOperationalRides.run(
            {
              status: null,
              category: null,
              limit: 3,
              offset: 0,
              userId: null,
              driverProfileId: null,
              view: null,
            },
            client,
          ),
          awaitingRides,
          calculated_at: requiredRow(rows).calculated_at,
        };
      },
      { readOnly: true, isolationLevel: 'REPEATABLE READ' },
    );
  }
  users(q: AdminUsersQueryDto) {
    const params = {
      limit: q.limit,
      offset: q.offset,
      search: q.search?.trim() || null,
      role: q.role ?? null,
      accountStatus: q.accountStatus ?? null,
    };
    return this.db.withTransaction(
      async (c) => {
        const items = await sql.adminListUsers.run(params, c);
        const count = requiredRow(await sql.adminCountUsers.run(params, c));
        return {
          items,
          total: count.total ?? 0,
          limit: q.limit,
          offset: q.offset,
        };
      },
      { readOnly: true, isolationLevel: 'REPEATABLE READ' },
    );
  }
  async user(id: string) {
    return (await sql.adminGetUser.run({ id }, this.pool))[0];
  }
  applications(q: AdminApplicationsQueryDto) {
    const params = {
      limit: q.limit,
      offset: q.offset,
      state: q.state ?? null,
      search: q.search?.trim() || null,
    };
    return this.db.withTransaction(
      async (c) => {
        const items = await sql.adminListApplications.run(params, c);
        const count = requiredRow(
          await sql.adminCountApplications.run(params, c),
        );
        return {
          items,
          total: count.total ?? 0,
          limit: q.limit,
          offset: q.offset,
        };
      },
      { readOnly: true, isolationLevel: 'REPEATABLE READ' },
    );
  }
  vehicles(q: AdminVehiclesQueryDto) {
    const params = {
      limit: q.limit,
      offset: q.offset,
      search: q.search?.trim() || null,
      active: q.activity ? q.activity === 'active' : null,
      category: q.category ?? null,
    };
    return this.db.withTransaction(
      async (c) => {
        const items = await sql.adminListVehicles.run(params, c);
        const count = requiredRow(await sql.adminCountVehicles.run(params, c));
        const documents = items.length
          ? await sql.adminVehicleDocuments.run(
              { vehicleIds: items.map((v) => v.id) },
              c,
            )
          : [];
        return {
          items: items.map((v) => ({
            ...v,
            documents: documents
              .filter((d) => d.vehicle_id === v.id)
              .map((d) => ({ ...d, expiry_date: dateOnly(d.expiry_date) })),
          })),
          total: count.total ?? 0,
          limit: q.limit,
          offset: q.offset,
        };
      },
      { readOnly: true, isolationLevel: 'REPEATABLE READ' },
    );
  }
  payments(q: AdminPaymentsQueryDto) {
    const params = {
      limit: q.limit,
      offset: q.offset,
      status: q.status ?? null,
      paymentType: q.paymentType ?? null,
      dateFrom: q.dateFrom ?? null,
      dateTo: q.dateTo ?? null,
    };
    return this.db.withTransaction(
      async (c) => {
        const items = await sql.adminListPayments.run(params, c);
        const counts = requiredRow(await sql.adminPaymentCounts.run(params, c));
        return {
          items: items.map((p) => ({ ...p, amount: Number(p.amount) })),
          summary: {
            ...counts,
            online_collected: Number(counts.online_collected ?? 0),
            cash_collected: Number(counts.cash_collected ?? 0),
          },
          total: counts.total ?? 0,
          limit: q.limit,
          offset: q.offset,
        };
      },
      { readOnly: true, isolationLevel: 'REPEATABLE READ' },
    );
  }
  rides(q: AdminListRidesQueryDto) {
    const params = {
      status: q.status ?? null,
      userId: q.userId ?? null,
      driverProfileId: q.driverProfileId ?? null,
      view: q.view ?? null,
      category: q.category ?? null,
      limit: q.limit ?? 20,
      offset: q.offset ?? 0,
    };
    return this.db.withTransaction(
      async (c) => {
        const items = await sql.adminListOperationalRides.run(params, c);
        const count = requiredRow(
          await sql.adminCountOperationalRides.run(params, c),
        );
        return {
          items,
          total: count.total ?? 0,
          limit: params.limit,
          offset: params.offset,
        };
      },
      { readOnly: true, isolationLevel: 'REPEATABLE READ' },
    );
  }
}
