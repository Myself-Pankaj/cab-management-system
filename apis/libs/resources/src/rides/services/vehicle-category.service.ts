import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { VehicleFareRateRepository } from '../repositories/vehicle-fare-rate.repository.js';
import { VEHICLE_CATEGORY_SEAT_LIMITS } from '../types/ride.types.js';
import type { IGetFareRateByCategoryResult } from '@db/queries/rides/vehicle_fare_rates.queries.js';
import {
  VEHICLE_CATEGORIES,
  type UpdateCabCategoryDto,
} from '../dto/ride.dto.js';

@Injectable()
export class VehicleCategoryService {
  constructor(private readonly fareRateRepository: VehicleFareRateRepository) {}
  async listCategories(admin = false) {
    const rates = admin
      ? await this.fareRateRepository.listAll()
      : await this.fareRateRepository.listActive();
    return rates.map((rate) => this.toResponse(rate));
  }
  toResponse(rate: IGetFareRateByCategoryResult) {
    return {
      category: rate.category,
      display_name: rate.display_name,
      description: rate.description,
      image_url: rate.image_url,
      bag_capacity: rate.bag_capacity,
      is_active: rate.is_active,
      base_fare_inr: Number(rate.base_fare_inr),
      per_km_rate_inr: Number(rate.per_km_rate_inr),
      min_fare_inr: Number(rate.min_fare_inr),
      seat_limit: VEHICLE_CATEGORY_SEAT_LIMITS[rate.category],
    };
  }

  async update(category: string, dto: UpdateCabCategoryDto) {
    const key = VEHICLE_CATEGORIES.find((value) => value === category);
    if (!key) throw new BadRequestException('Unknown cab category');
    if (!dto.display_name.trim())
      throw new BadRequestException('Cab name is required');
    const row = await this.fareRateRepository.update({
      category: key,
      displayName: dto.display_name.trim(),
      description: dto.description.trim(),
      imageUrl: dto.image_url ?? null,
      bagCapacity: dto.bag_capacity,
      baseFare: dto.base_fare_inr,
      perKm: dto.per_km_rate_inr,
      minFare: dto.min_fare_inr,
      isActive: dto.is_active,
    });
    if (!row) throw new NotFoundException('Cab category not found');
    return (await this.listCategories(true)).find(
      (item) => item.category === key,
    )!;
  }
}
