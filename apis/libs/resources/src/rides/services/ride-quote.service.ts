import { Injectable } from '@nestjs/common';
import { AppConfigService } from '@app/core';
import { MapsService } from '../../maps/maps.service.js';
import { VehicleFareRateRepository } from '../repositories/vehicle-fare-rate.repository.js';
import type { RideQuoteDto } from '../dto/ride.dto.js';
import { FareCalculatorService } from './fare-calculator.service.js';
import { PassengerValidationService } from './passenger-validation.service.js';
import { RideErrors } from '../types/ride-errors.js';
import { VEHICLE_CATEGORY_SEAT_LIMITS } from '../types/ride.types.js';

@Injectable()
export class RideQuoteService {
  constructor(
    private readonly config: AppConfigService,
    private readonly mapsService: MapsService,
    private readonly fareRateRepository: VehicleFareRateRepository,
    private readonly fareCalculator: FareCalculatorService,
    private readonly passengerValidation: PassengerValidationService,
  ) {}

  async quote(dto: RideQuoteDto) {
    this.passengerValidation.validatePassengers(dto.vehicle_category, dto.passengers);
    this.passengerValidation.validateTripDates(dto.trip_type, dto.pickup_at, dto.return_at);

    const rate = await this.fareRateRepository.findByCategory(dto.vehicle_category);
    if (!rate) {
      throw RideErrors.fareRateNotFound();
    }

    const route = await this.mapsService.getRoute(
      dto.pickup_latitude,
      dto.pickup_longitude,
      dto.destination_latitude,
      dto.destination_longitude,
      dto.trip_type === 'ROUND_TRIP',
      this.config.booking.roundTripMultiplier,
    );

    const fareBreakdown = this.fareCalculator.calculate(rate, route.distance_km);

    return {
      vehicle_category: dto.vehicle_category,
      seat_limit: VEHICLE_CATEGORY_SEAT_LIMITS[dto.vehicle_category],
      passenger_count: dto.passengers.length,
      trip_type: dto.trip_type,
      distance_km: route.distance_km,
      route_geometry: route.geometry,
      estimated_duration_minutes: route.duration_minutes,
      fare_breakdown: fareBreakdown,
    };
  }
}
