import { describe, expect, it } from 'vitest';
import { FareCalculatorService } from '../../libs/resources/src/rides/services/fare-calculator.service.js';

describe('FareCalculatorService', () => {
  const config = {
    booking: { partialAdvancePercent: 30 },
  } as never;

  const service = new FareCalculatorService(config);

  const seater4Rate = {
    category: 'SEATER_4' as const,
    display_name: '4 Seater',
    base_fare_inr: '50',
    per_km_rate_inr: '12',
    min_fare_inr: '100',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const seater7Rate = {
    ...seater4Rate,
    category: 'SEATER_7' as const,
    base_fare_inr: '80',
    per_km_rate_inr: '18',
    min_fare_inr: '150',
  };

  it('calculates fare using category rates', () => {
    const result4 = service.calculate(seater4Rate, 10);
    expect(result4.estimated_fare_inr).toBe(170);

    const result7 = service.calculate(seater7Rate, 10);
    expect(result7.estimated_fare_inr).toBe(260);
  });

  it('applies minimum fare floor', () => {
    const result = service.calculate(seater4Rate, 1);
    expect(result.estimated_fare_inr).toBe(100);
  });

  it('splits partial payment into advance and remainder', () => {
    const split = service.splitPartialPayment(1000);
    expect(split.advance).toBe(300);
    expect(split.remainder).toBe(700);
  });
});
