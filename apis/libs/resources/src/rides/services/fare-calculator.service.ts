import { Injectable } from '@nestjs/common';
import { AppConfigService } from '@app/core';
import type { IGetFareRateByCategoryResult } from '@db/queries/rides/vehicle_fare_rates.queries.js';
import type { FareBreakdown } from '../rides/types/ride.types.js';

@Injectable()
export class FareCalculatorService {
  constructor(private readonly config: AppConfigService) {}

  calculate(
    rate: IGetFareRateByCategoryResult,
    distanceKm: number,
  ): FareBreakdown {
    const base = Number(rate.base_fare_inr);
    const perKm = Number(rate.per_km_rate_inr);
    const min = Number(rate.min_fare_inr);
    const distanceCharge = Math.round(distanceKm * perKm * 100) / 100;
    const raw = base + distanceCharge;
    const estimated = Math.max(min, Math.round(raw * 100) / 100);

    return {
      base_fare_inr: base,
      per_km_rate_inr: perKm,
      distance_km: distanceKm,
      distance_charge_inr: distanceCharge,
      estimated_fare_inr: estimated,
    };
  }

  splitPartialPayment(totalFare: number): { advance: number; remainder: number } {
    const percent = this.config.booking.partialAdvancePercent;
    const advance = Math.round(((totalFare * percent) / 100) * 100) / 100;
    const remainder = Math.round((totalFare - advance) * 100) / 100;
    return { advance, remainder };
  }
}
