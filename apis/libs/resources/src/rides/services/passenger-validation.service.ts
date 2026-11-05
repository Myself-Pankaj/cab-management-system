import { Injectable } from '@nestjs/common';
import type { RideQuoteDto } from '../dto/ride.dto.js';
import { RideErrors } from '../types/ride-errors.js';
import { VEHICLE_CATEGORY_SEAT_LIMITS } from '../types/ride.types.js';

@Injectable()
export class PassengerValidationService {
  validatePassengers(
    vehicleCategory: keyof typeof VEHICLE_CATEGORY_SEAT_LIMITS,
    passengers: RideQuoteDto['passengers'],
  ) {
    if (!passengers.length) {
      throw RideErrors.invalidPassengers('At least one passenger is required');
    }

    const primaryCount = passengers.filter((p) => p.is_primary).length;
    if (primaryCount !== 1) {
      throw RideErrors.invalidPassengers('Exactly one primary passenger is required');
    }

    const limit = VEHICLE_CATEGORY_SEAT_LIMITS[vehicleCategory];
    if (passengers.length > limit) {
      throw RideErrors.passengerCountExceedsCapacity();
    }

    for (const passenger of passengers) {
      if (!passenger.name?.trim() || !passenger.phone?.trim()) {
        throw RideErrors.invalidPassengers('Each passenger requires name and phone');
      }
    }
  }

  validateTripDates(
    tripType: 'ONE_WAY' | 'ROUND_TRIP',
    pickupAt: string,
    returnAt?: string,
  ) {
    const pickup = new Date(pickupAt);
    if (Number.isNaN(pickup.getTime())) {
      throw RideErrors.invalidTripDates();
    }

    if (tripType === 'ROUND_TRIP') {
      if (!returnAt) {
        throw RideErrors.invalidTripDates();
      }
      const ret = new Date(returnAt);
      if (Number.isNaN(ret.getTime()) || ret <= pickup) {
        throw RideErrors.invalidTripDates();
      }
    }
  }
}
