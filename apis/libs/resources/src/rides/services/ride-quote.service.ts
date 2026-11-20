import { BadRequestException, Injectable } from '@nestjs/common';
import { AppConfigService } from '@app/core';
import { MapsService } from '../../maps/maps.service.js';
import { VehicleFareRateRepository } from '../repositories/vehicle-fare-rate.repository.js';
import type { RideQuoteDto, RideEstimateDto } from '../dto/ride.dto.js';
import { FareCalculatorService } from './fare-calculator.service.js';
import { PassengerValidationService } from './passenger-validation.service.js';
import { RideErrors } from '../types/ride-errors.js';
import { RazorpayService } from './razorpay.service.js';
import { VehicleCategoryService } from './vehicle-category.service.js';
import { VEHICLE_CATEGORY_SEAT_LIMITS } from '../types/ride.types.js';

@Injectable()
export class RideQuoteService {
  constructor(
    private readonly razorpay: RazorpayService,
    private readonly categories: VehicleCategoryService,
    private readonly config: AppConfigService,
    private readonly mapsService: MapsService,
    private readonly fareRateRepository: VehicleFareRateRepository,
    private readonly fareCalculator: FareCalculatorService,
    private readonly passengerValidation: PassengerValidationService,
  ) {}

  async estimates(dto: RideEstimateDto) {
    this.passengerValidation.validateTripDates(
      dto.trip_type,
      dto.pickup_at,
      dto.return_at,
    );
    const rates = await this.fareRateRepository.listActive();
    const categories = rates.map((rate) => this.categories.toResponse(rate));
    if (!categories.length)
      return {
        distance_km: 0,
        estimated_duration_minutes: 0,
        categories: [],
        online_payment_available: this.razorpay.isConfigured(),
        partial_advance_percent: this.config.booking.partialAdvancePercent,
      };
    const route = await this.mapsService.getRoute(
      dto.pickup_latitude,
      dto.pickup_longitude,
      dto.destination_latitude,
      dto.destination_longitude,
      dto.trip_type === 'ROUND_TRIP',
      this.config.booking.roundTripMultiplier,
    );
    return {
      distance_km: route.distance_km,
      estimated_duration_minutes: route.duration_minutes,
      route_geometry: route.geometry,
      online_payment_available: this.razorpay.isConfigured(),
      partial_advance_percent: this.config.booking.partialAdvancePercent,
      categories: categories.map((category) => ({
        ...category,
        fare_breakdown: this.fareCalculator.calculate(
          rates.find((rate) => rate.category === category.category)!,
          route.distance_km,
        ),
      })),
    };
  }

  async quote(dto: RideQuoteDto) {
    this.passengerValidation.validatePassengers(
      dto.vehicle_category,
      dto.passengers,
    );
    this.passengerValidation.validateTripDates(
      dto.trip_type,
      dto.pickup_at,
      dto.return_at,
    );

    const rate = await this.fareRateRepository.findByCategory(
      dto.vehicle_category,
    );
    if (!rate) {
      throw RideErrors.fareRateNotFound();
    }

    if ((dto.bag_count ?? 0) > rate.bag_capacity)
      throw new BadRequestException('Bag count exceeds cab capacity');

    const route = await this.mapsService.getRoute(
      dto.pickup_latitude,
      dto.pickup_longitude,
      dto.destination_latitude,
      dto.destination_longitude,
      dto.trip_type === 'ROUND_TRIP',
      this.config.booking.roundTripMultiplier,
    );

    const fareBreakdown = this.fareCalculator.calculate(
      rate,
      route.distance_km,
    );

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
