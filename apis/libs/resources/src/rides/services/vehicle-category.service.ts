import { Injectable } from '@nestjs/common';
import { VehicleFareRateRepository } from '../repositories/vehicle-fare-rate.repository.js';
import { VEHICLE_CATEGORY_SEAT_LIMITS } from '../types/ride.types.js';

@Injectable()
export class VehicleCategoryService {
  constructor(private readonly fareRateRepository: VehicleFareRateRepository) {}

  async listCategories() {
    const rates = await this.fareRateRepository.listActive();
    return rates.map((rate) => ({
      category: rate.category,
      display_name: rate.display_name,
      base_fare_inr: Number(rate.base_fare_inr),
      per_km_rate_inr: Number(rate.per_km_rate_inr),
      min_fare_inr: Number(rate.min_fare_inr),
      seat_limit: VEHICLE_CATEGORY_SEAT_LIMITS[rate.category],
    }));
  }
}
