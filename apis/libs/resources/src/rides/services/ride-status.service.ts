import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import type { ride_status } from '@db/queries/rides/rides.queries.js';
import { RideStatusHistoryRepository } from '../repositories/ride-status-history.repository.js';
import { RideErrors } from '../types/ride-errors.js';
import { RIDE_STATUS_TRANSITIONS } from '../types/ride.types.js';

@Injectable()
export class RideStatusService {
  constructor(
    private readonly historyRepository: RideStatusHistoryRepository,
  ) {}

  assertTransition(current: ride_status | null, next: ride_status) {
    if (current == null) {
      return;
    }
    const allowed = RIDE_STATUS_TRANSITIONS[current] ?? [];
    if (!allowed.includes(next)) {
      throw RideErrors.invalidStatusTransition();
    }
  }

  async recordTransition(
    rideId: string,
    oldStatus: ride_status | null,
    newStatus: ride_status,
    changedBy: string | null,
    note: string | null,
    client: PoolClient,
  ) {
    this.assertTransition(oldStatus, newStatus);
    return this.historyRepository.insert(
      rideId,
      oldStatus,
      newStatus,
      changedBy,
      note,
      client,
    );
  }

  canTransition(current: ride_status, next: ride_status): boolean {
    const allowed = RIDE_STATUS_TRANSITIONS[current] ?? [];
    return allowed.includes(next);
  }
}
