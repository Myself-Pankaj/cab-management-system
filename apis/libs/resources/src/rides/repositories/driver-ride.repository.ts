import {
  lockDriverForRides,
  lockVehicleForRides,
  lockOperationalRide,
  listRideOffers,
  getRideOffer,
  createRideOffer,
  respondToRideOffer,
  releaseRideOffer,
  cancelRideOffers,
  clearRideAssignment,
  listResourceReservations,
  lockDriverEligibilityDocuments,
  lockVehicleEligibilityDocuments,
  checkApprovedDriverDocuments,
  listApprovedDriverVehicles,
  listDriverRideOffers,
  getRideCompletion,
  recordRideCompletion,
} from '@db/queries/rides/driver_operations.queries.js';
import { getVehicleById } from '@db/queries/drivers/vehicles.queries.js';
import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { BaseRepository } from '@app/core';
import type { OfferStatus } from '../types/driver-ride.types.js';

@Injectable()
export class DriverRideRepository extends BaseRepository {
  async vehicle(id: string, client?: PoolClient) {
    return (await getVehicleById.run({ id }, client ?? this.pool))[0] ?? null;
  }
  async lockResources(
    profileId: string,
    vehicleId: string,
    client: PoolClient,
  ) {
    const profile = (
      await lockDriverForRides.run({ profileId: profileId }, client)
    )[0];
    const vehicle = (
      await lockVehicleForRides.run({ vehicleId: vehicleId }, client)
    )[0];
    return { profile, vehicle };
  }
  async lockRide(id: string, client: PoolClient) {
    return (await lockOperationalRide.run({ rideId: id }, client))[0];
  }
  async offers(rideId: string, client?: PoolClient) {
    return await listRideOffers.run({ rideId: rideId }, client ?? this.pool);
  }
  async offer(id: string, client?: PoolClient) {
    return (await getRideOffer.run({ offerId: id }, client ?? this.pool))[0];
  }
  async createOffer(
    rideId: string,
    profileId: string,
    vehicleId: string,
    adminId: string,
    expiresAt: Date,
    client: PoolClient,
  ) {
    return (
      await createRideOffer.run(
        {
          rideId: rideId,
          profileId: profileId,
          vehicleId: vehicleId,
          adminId: adminId,
          expiresAt: expiresAt,
        },
        client,
      )
    )[0];
  }
  async respond(
    id: string,
    status: OfferStatus,
    reason: string | null,
    client: PoolClient,
  ) {
    return (
      await respondToRideOffer.run(
        { offerId: id, status: status, reason: reason },
        client,
      )
    )[0];
  }
  async release(
    id: string,
    actorId: string,
    reason: string,
    client: PoolClient,
  ) {
    await releaseRideOffer.run(
      { offerId: id, actorId: actorId, reason: reason },
      client,
    );
  }
  async cancelOffers(
    rideId: string,
    actorId: string,
    reason: string | null,
    client: PoolClient,
  ) {
    await cancelRideOffers.run(
      { rideId: rideId, actorId: actorId, reason: reason },
      client,
    );
  }
  async clearAssignment(rideId: string, client: PoolClient) {
    await clearRideAssignment.run({ rideId: rideId }, client);
  }
  async reservations(
    profileId: string,
    vehicleId: string,
    excludeRide: string,
    client: PoolClient,
  ) {
    return await listResourceReservations.run(
      {
        profileId: profileId,
        vehicleId: vehicleId,
        excludeRideId: excludeRide,
      },
      client,
    );
  }
  async eligibleDocuments(
    profileId: string,
    vehicleId: string,
    client: PoolClient,
  ) {
    await lockDriverEligibilityDocuments.run({ profileId: profileId }, client);
    await lockVehicleEligibilityDocuments.run({ vehicleId: vehicleId }, client);
    const result = await checkApprovedDriverDocuments.run(
      { profileId: profileId, vehicleId: vehicleId },
      client,
    );
    return result[0].eligible;
  }
  async candidates() {
    return await listApprovedDriverVehicles.run(undefined, this.pool);
  }
  async listDriverOffers(
    profileId: string,
    view: string,
    limit: number,
    offset: number,
  ) {
    const rows = await listDriverRideOffers.run(
      { profileId: profileId, view: view, limit: limit, offset: offset },
      this.pool,
    );
    return rows;
  }
  async completion(rideId: string, client?: PoolClient) {
    return (
      await getRideCompletion.run({ rideId: rideId }, client ?? this.pool)
    )[0];
  }
  async recordCompletion(
    data: {
      id: string;
      rideId: string;
      profileId: string;
      actorId: string;
      cash: number;
      paymentId: string | null;
      note: string | null;
    },
    client: PoolClient,
  ) {
    return (
      await recordRideCompletion.run(
        {
          operationId: data.id,
          rideId: data.rideId,
          profileId: data.profileId,
          actorId: data.actorId,
          cash: data.cash,
          paymentId: data.paymentId,
          note: data.note,
        },
        client,
      )
    )[0];
  }
}
