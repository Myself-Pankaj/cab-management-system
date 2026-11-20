import { adminMutation } from '../../admin/admin-mutation.js';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppConfigService, DatabaseService } from '@app/core';
import type { PoolClient } from 'pg';
import { DriverProfileRepository } from '../../drivers/repositories/driver-profile.repository.js';
import { RideRepository } from '../repositories/ride.repository.js';
import { DriverRideRepository } from '../repositories/driver-ride.repository.js';
import { PaymentRepository } from '../repositories/payment.repository.js';
import { RideBookingService } from './ride-booking.service.js';
import { RideStatusService } from './ride-status.service.js';
import { PaymentSummaryService } from './payment-summary.service.js';
import {
  effectiveOffer,
  vehicleMeetsCapacity,
  reservationInterval,
  reservationsConflict,
  type RideRow,
  type RideOffer,
} from '../types/driver-ride.types.js';
import type { CompleteDriverRideDto } from '../dto/driver-ride.dto.js';

@Injectable()
export class DriverRideService {
  constructor(
    private readonly db: DatabaseService,
    private readonly operations: DriverRideRepository,
    private readonly rides: RideRepository,
    private readonly profiles: DriverProfileRepository,
    private readonly payments: PaymentRepository,
    private readonly booking: RideBookingService,
    private readonly statuses: RideStatusService,
    private readonly summaries: PaymentSummaryService,
    private readonly config: AppConfigService,
  ) {}
  private conflict(message: string): never {
    throw new ConflictException(message);
  }
  private async profile(userId: string) {
    const profile = await this.profiles.findByUserId(userId);
    if (!profile) throw new ForbiddenException('Driver profile required');
    return profile;
  }
  private current(offer: RideOffer) {
    return (
      ['PENDING', 'ACCEPTED'].includes(offer.status) &&
      !offer.released_at &&
      !offer.cancelled_at
    );
  }
  private async eligible(
    ride: RideRow,
    profileId: string,
    vehicleId: string,
    client: PoolClient,
  ) {
    // Callers already hold profile/vehicle locks. Review and onboarding writes lock the profile first.
    const { profile, vehicle } = await this.operations.lockResources(
      profileId,
      vehicleId,
      client,
    );
    if (!profile || profile.status !== 'APPROVED')
      throw new ForbiddenException('Driver must be approved and not suspended');
    if (
      !vehicle ||
      vehicle.driver_profile_id !== profileId ||
      !vehicle.is_active ||
      !vehicleMeetsCapacity(
        vehicle.vehicle_type,
        ride.requested_vehicle_category,
      )
    )
      this.conflict(
        'An active vehicle with enough seats for this booking is required',
      );
    if (
      !(await this.operations.eligibleDocuments(profileId, vehicleId, client))
    )
      this.conflict('Required documents must be approved with private uploads');
    const reservations = await this.operations.reservations(
      profileId,
      vehicleId,
      ride.id,
      client,
    );
    if (!reservationInterval(ride))
      this.conflict('Booking needs a valid scheduled duration and return time');
    if (reservations.some((other) => reservationsConflict(ride, other)))
      this.conflict('Driver or vehicle has a conflicting reservation');
  }
  /** Read a mutation response on the transaction that wrote it for exact replays. */
  private async mutationDetail(rideId: string, client: PoolClient) {
    const ride = await this.rides.findById(rideId, client);
    if (!ride) throw new NotFoundException('Ride not found');
    const detail = await this.booking.buildRideDetail(ride, client);
    const offers = await this.operations.offers(rideId, client);
    const completion = await this.operations.completion(rideId, client);
    return {
      ...detail,
      vehicle: ride.vehicle_id
        ? await this.operations.vehicle(ride.vehicle_id, client)
        : null,
      offers: offers.map((offer) => effectiveOffer(offer)),
      permitted_actions:
        ride.status === 'DRIVER_ASSIGNED'
          ? ['accept', 'reject']
          : ride.status === 'IN_PROGRESS'
            ? ['complete']
            : [],
      ...(completion
        ? {
            completion: {
              ...completion,
              declared_cash: Number(completion.declared_cash),
            },
          }
        : {}),
    };
  }
  private async lockedAssigned<T>(
    rideId: string,
    work: (ride: RideRow, client: PoolClient) => Promise<T>,
    operation?: { actorId: string; id: string; action: string; input: object },
  ) {
    const initial = await this.rides.findById(rideId);
    if (!initial) throw new NotFoundException('Ride not found');
    return this.db.withTransaction((client) => {
      const execute = async () => {
        if (initial.driver_profile_id && initial.vehicle_id)
          await this.operations.lockResources(
            initial.driver_profile_id,
            initial.vehicle_id,
            client,
          );
        const ride = await this.operations.lockRide(rideId, client);
        if (!ride) throw new NotFoundException('Ride not found');
        if (
          ride.driver_profile_id !== initial.driver_profile_id ||
          ride.vehicle_id !== initial.vehicle_id
        )
          this.conflict('Assignment changed; refresh the ride');
        return work(ride, client);
      };
      return operation
        ? adminMutation(
            client,
            operation.actorId,
            operation.id,
            operation.action,
            operation.input,
            execute,
          )
        : execute();
    });
  }
  async expire(rideId: string) {
    await this.lockedAssigned(rideId, async (ride, client) => {
      if (ride.status !== 'DRIVER_ASSIGNED') return;
      const offer = (await this.operations.offers(rideId, client)).find((o) =>
        this.current(o),
      );
      if (
        offer?.status === 'PENDING' &&
        offer.expires_at.getTime() <= Date.now()
      ) {
        await this.operations.respond(
          offer.id,
          'EXPIRED',
          'Offer expired',
          client,
        );
        await this.operations.clearAssignment(rideId, client);
        await this.statuses.recordTransition(
          rideId,
          ride.status,
          'PENDING_ASSIGNMENT',
          null,
          'Offer expired',
          client,
        );
      }
    });
  }
  async assign(
    rideId: string,
    adminId: string,
    profileId: string,
    vehicleId: string,
    confirmation?: { operation_id: string; reason: string },
  ) {
    await this.expire(rideId);
    return this.db.withTransaction((client) => {
      const work = async () => {
        await this.operations.lockResources(profileId, vehicleId, client);
        const ride = await this.operations.lockRide(rideId, client);
        if (!ride || ride.status !== 'PENDING_ASSIGNMENT')
          this.conflict('Ride is not awaiting assignment');
        if (ride.pickup_at.getTime() <= Date.now())
          this.conflict('Pickup time has passed; correct the booking schedule');
        await this.eligible(ride, profileId, vehicleId, client);
        const expiry = new Date(
          Math.min(
            ride.pickup_at.getTime(),
            Date.now() + this.config.driver.offerExpiryMinutes * 60_000,
          ),
        );
        await this.operations.createOffer(
          rideId,
          profileId,
          vehicleId,
          adminId,
          expiry,
          client,
        );
        await this.rides.assign(rideId, profileId, vehicleId, adminId, client);
        await this.statuses.recordTransition(
          rideId,
          ride.status,
          'DRIVER_ASSIGNED',
          adminId,
          confirmation?.reason || 'Driver offer created',
          client,
        );
        return this.mutationDetail(rideId, client);
      };
      return confirmation
        ? adminMutation(
            client,
            adminId,
            confirmation.operation_id,
            `assign:${rideId}`,
            { profileId, vehicleId, ...confirmation },
            work,
          )
        : work();
    });
  }
  async respond(
    offerId: string,
    userId: string,
    decision: 'ACCEPTED' | 'REJECTED',
    reason?: string,
  ) {
    const profile = await this.profile(userId);
    const initial = await this.operations.offer(offerId);
    if (!initial || initial.driver_profile_id !== profile.id)
      throw new NotFoundException('Offer not found');
    await this.expire(initial.ride_id);
    await this.db.withTransaction(async (client) => {
      const resources = await this.operations.lockResources(
        profile.id,
        initial.vehicle_id,
        client,
      );
      const ride = await this.operations.lockRide(initial.ride_id, client);
      const offer = await this.operations.offer(offerId, client);
      if (!offer || !ride) throw new NotFoundException('Offer not found');
      if (resources.profile?.status !== 'APPROVED')
        throw new ForbiddenException('Driver is not approved');
      if (offer.status === decision) {
        if (
          decision === 'ACCEPTED' &&
          (offer.released_at ||
            offer.cancelled_at ||
            ride.driver_profile_id !== profile.id)
        )
          this.conflict('This assignment has been released or cancelled');
        return;
      }
      if (
        offer.status !== 'PENDING' ||
        !this.current(offer) ||
        offer.expires_at.getTime() <= Date.now() ||
        ride.status !== 'DRIVER_ASSIGNED' ||
        ride.driver_profile_id !== profile.id ||
        ride.vehicle_id !== offer.vehicle_id
      )
        this.conflict('This offer is no longer actionable');
      if (decision === 'ACCEPTED')
        await this.eligible(ride, profile.id, offer.vehicle_id, client);
      await this.operations.respond(
        offerId,
        decision,
        reason?.trim() || null,
        client,
      );
      if (decision === 'REJECTED')
        await this.operations.clearAssignment(ride.id, client);
      else await this.rides.updateStatus(ride.id, 'CONFIRMED', client);
      await this.statuses.recordTransition(
        ride.id,
        ride.status,
        decision === 'ACCEPTED' ? 'CONFIRMED' : 'PENDING_ASSIGNMENT',
        userId,
        reason || `Offer ${decision.toLowerCase()}`,
        client,
      );
    });
    const result = await this.operations.offer(offerId);
    if (!result) throw new NotFoundException('Offer not found');
    return { offer: effectiveOffer(result) };
  }
  async release(
    rideId: string,
    offerId: string,
    adminId: string,
    reason?: string,
    operationId?: string,
  ) {
    await this.expire(rideId);
    return this.lockedAssigned(
      rideId,
      async (ride, client) => {
        const work = async () => {
          const offer = await this.operations.offer(offerId, client);
          if (!offer || offer.ride_id !== rideId)
            throw new NotFoundException('Offer not found');
          if (
            offer.released_at ||
            offer.status === 'REVOKED' ||
            offer.status === 'EXPIRED'
          )
            return this.mutationDetail(rideId, client);
          if (
            !this.current(offer) ||
            !['DRIVER_ASSIGNED', 'CONFIRMED'].includes(ride.status)
          )
            this.conflict(
              'Only an unanswered or accepted unstarted assignment can be released',
            );
          if (!reason?.trim())
            throw new BadRequestException('A release reason is required');
          if (offer.status === 'PENDING')
            await this.operations.respond(
              offerId,
              'REVOKED',
              reason || 'Revoked by admin',
              client,
            );
          await this.operations.release(
            offerId,
            adminId,
            reason || 'Revoked by admin',
            client,
          );
          await this.operations.clearAssignment(rideId, client);
          await this.statuses.recordTransition(
            rideId,
            ride.status,
            'PENDING_ASSIGNMENT',
            adminId,
            reason || 'Offer revoked',
            client,
          );
          return this.mutationDetail(rideId, client);
        };
        return work();
      },
      operationId
        ? {
            actorId: adminId,
            id: operationId,
            action: `release:${rideId}:${offerId}`,
            input: { reason },
          }
        : undefined,
    );
  }
  async start(rideId: string, userId: string, admin = false, reason?: string) {
    const profile = admin ? null : await this.profile(userId);
    await this.lockedAssigned(rideId, async (ride, client) => {
      if (
        !ride.driver_profile_id ||
        !ride.vehicle_id ||
        (!admin && ride.driver_profile_id !== profile?.id)
      )
        throw new ForbiddenException('Ride is not assigned to you');
      const resources = await this.operations.lockResources(
        ride.driver_profile_id,
        ride.vehicle_id,
        client,
      );
      if (resources.profile?.status !== 'APPROVED')
        throw new ForbiddenException(
          'Suspended drivers cannot start or manage rides',
        );
      if (ride.status === 'IN_PROGRESS') return;
      if (ride.status !== 'CONFIRMED')
        this.conflict('Accept the offer before starting');
      await this.eligible(
        ride,
        ride.driver_profile_id,
        ride.vehicle_id,
        client,
      );
      await this.rides.updateStatus(rideId, 'IN_PROGRESS', client);
      await this.statuses.recordTransition(
        rideId,
        ride.status,
        'IN_PROGRESS',
        userId,
        reason?.trim() || 'Ride started',
        client,
      );
    });
    return this.detail(rideId, userId, admin);
  }
  async complete(
    rideId: string,
    userId: string,
    dto: CompleteDriverRideDto,
    admin = false,
  ) {
    const profile = admin ? null : await this.profile(userId);
    const completion = await this.lockedAssigned(
      rideId,
      async (ride, client) => {
        const work = async () => {
          if (
            !ride.driver_profile_id ||
            (!admin && ride.driver_profile_id !== profile?.id)
          )
            throw new ForbiddenException('Ride is not assigned to you');
          const existing = await this.operations.completion(rideId, client);
          if (existing) {
            if (
              existing.id !== dto.operation_id ||
              existing.declared_by !== userId ||
              Number(existing.declared_cash) !== dto.declared_cash ||
              (existing.note ?? '') !== (dto.note?.trim() ?? '')
            )
              throw new ConflictException(
                'Ride was already completed with a different declaration',
              );
            return existing;
          }
          if (!admin) {
            const driver = await this.profiles.findById(
              ride.driver_profile_id,
              client,
            );
            if (driver?.status !== 'APPROVED')
              throw new ForbiddenException(
                'Admin must resolve suspended driver rides',
              );
          } else if (!dto.note?.trim())
            throw new BadRequestException(
              'Admin completion requires an explanatory note',
            );
          if (ride.status !== 'IN_PROGRESS')
            this.conflict('Only an in-progress ride can be completed');
          await client.query(
            'SELECT id FROM payments WHERE ride_id=$1 ORDER BY id FOR UPDATE',
            [rideId],
          );
          const payments = await this.payments.listByRideId(rideId, client);
          const summary = this.summaries.summarize(
            Number(ride.final_fare ?? ride.estimated_fare),
            payments,
          );
          const due = Math.round(summary.remaining_amount * 100);
          if (Math.round(dto.expected_outstanding * 100) !== due)
            throw new ConflictException({
              message: 'Balance changed; refresh before confirming collection',
              payment_summary: summary,
            });
          if (Math.round(dto.declared_cash * 100) !== due)
            throw new ConflictException({
              message: 'Declare the exact outstanding cash amount',
              payment_summary: summary,
            });
          let paymentId: string | null = null;
          if (due > 0) {
            const offline = payments.filter(
              (p) =>
                p.payment_type === 'OFFLINE' &&
                ['CREATED', 'PENDING'].includes(p.status),
            );
            if (
              offline.length !== 1 ||
              Math.round(Number(offline[0].amount) * 100) !== due
            )
              this.conflict(
                'Offline payment does not match the outstanding balance; admin must reconcile',
              );
            paymentId = offline[0].id;
            await this.payments.markPaid(paymentId, null, 'cash', client);
          }
          const result = await this.operations.recordCompletion(
            {
              id: dto.operation_id,
              rideId,
              profileId: ride.driver_profile_id,
              actorId: userId,
              cash: due / 100,
              paymentId,
              note: dto.note?.trim() || null,
            },
            client,
          );
          await this.rides.updateStatus(rideId, 'COMPLETED', client);
          await this.statuses.recordTransition(
            rideId,
            ride.status,
            'COMPLETED',
            userId,
            'Ride completed; cash receipt declared',
            client,
          );
          return result;
        };
        if (!admin) return work();
        const record = await work();
        return {
          ...(await this.mutationDetail(rideId, client)),
          completion: {
            ...record,
            declared_cash: Number(record.declared_cash),
          },
        };
      },
      admin
        ? {
            actorId: userId,
            id: dto.operation_id,
            action: `complete:${rideId}`,
            input: dto,
          }
        : undefined,
    );
    if ('ride' in completion) return completion;
    return {
      ...(await this.detail(rideId, userId, admin)),
      completion: {
        ...completion,
        declared_cash: Number(completion.declared_cash),
      },
    };
  }
  async detail(rideId: string, userId: string, admin = false) {
    let ride = await this.rides.findById(rideId);
    if (admin && ride?.status === 'DRIVER_ASSIGNED') {
      await this.expire(rideId);
      ride = await this.rides.findById(rideId);
    }
    if (!ride) throw new NotFoundException('Ride not found');
    const profile = admin ? null : await this.profile(userId);
    if (!admin && ride.driver_profile_id !== profile?.id)
      throw new NotFoundException('Ride not found');
    const offers = await this.operations.offers(rideId);
    const current = offers.find((o) => this.current(o));
    const canManage = admin || profile?.status === 'APPROVED';
    const assignedProfileId = ride.driver_profile_id,
      assignedVehicleId = ride.vehicle_id;
    const canTakeNewRideActions =
      canManage &&
      assignedProfileId &&
      assignedVehicleId &&
      ['DRIVER_ASSIGNED', 'CONFIRMED'].includes(ride.status)
        ? await this.db.withTransaction(async (client) => {
            await this.operations.lockResources(
              assignedProfileId,
              assignedVehicleId,
              client,
            );
            return this.operations.eligibleDocuments(
              assignedProfileId,
              assignedVehicleId,
              client,
            );
          })
        : false;
    const ownOffers = admin
      ? offers
      : offers.filter((o) => o.driver_profile_id === profile?.id);
    const detail = await this.booking.buildRideDetail(ride);
    const completion = await this.operations.completion(rideId);
    const vehicle = ride.vehicle_id
      ? await this.operations.vehicle(ride.vehicle_id)
      : null;
    return {
      ...detail,
      vehicle,
      ...(completion
        ? {
            completion: {
              ...completion,
              declared_cash: Number(completion.declared_cash),
            },
          }
        : {}),
      offers: ownOffers.map((o) => effectiveOffer(o)),
      permitted_actions: canManage
        ? [
            ...(ride.status === 'DRIVER_ASSIGNED' &&
            current &&
            effectiveOffer(current).status === 'PENDING'
              ? canTakeNewRideActions
                ? ['accept', 'reject']
                : ['reject']
              : []),
            ...(ride.status === 'CONFIRMED' && canTakeNewRideActions
              ? ['start']
              : []),
            ...(ride.status === 'IN_PROGRESS' ? ['complete'] : []),
          ]
        : [],
    };
  }
  async list(userId: string, view = 'assigned', limit = 20, offset = 0) {
    const profile = await this.profile(userId);
    const rows = await this.operations.listDriverOffers(
      profile.id,
      view,
      limit,
      offset,
    );
    return {
      offers: rows.map((row) => ({
        ...effectiveOffer(row),
        total: undefined,
        can_view_ride:
          row.current_driver_profile_id === profile.id &&
          row.released_at === null &&
          !['REJECTED', 'REVOKED', 'EXPIRED'].includes(
            effectiveOffer(row).status,
          ),
      })),
      total: Number(rows[0]?.total ?? 0),
      limit,
      offset,
    };
  }
  async candidates(rideId: string) {
    await this.expire(rideId);
    const ride = await this.rides.findById(rideId);
    if (!ride) throw new NotFoundException('Ride not found');
    const available: Awaited<ReturnType<DriverRideRepository['candidates']>> =
      [];
    for (const candidate of await this.operations.candidates()) {
      if (
        !vehicleMeetsCapacity(
          candidate.vehicle_type,
          ride.requested_vehicle_category,
        )
      )
        continue;
      const eligible = await this.db.withTransaction(async (client) => {
        await this.operations.lockResources(
          candidate.driver_profile_id,
          candidate.vehicle_id,
          client,
        );
        try {
          await this.eligible(
            ride,
            candidate.driver_profile_id,
            candidate.vehicle_id,
            client,
          );
          return true;
        } catch (error) {
          if (
            error instanceof ConflictException ||
            error instanceof ForbiddenException
          )
            return false;
          throw error;
        }
      });
      if (eligible) available.push(candidate);
    }
    return { drivers: available };
  }
}
