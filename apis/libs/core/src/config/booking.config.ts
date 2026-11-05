import { registerAs } from '@nestjs/config';
import { BookingConfig } from './config.interface.js';

export default registerAs(
  'booking',
  (): BookingConfig => ({
    orsApiKey: process.env['ORS_API_KEY'] ?? '',
    orsBaseUrl:
      process.env['ORS_BASE_URL'] ?? 'https://api.openrouteservice.org',
    roundTripMultiplier: Number(process.env['FARE_ROUND_TRIP_MULTIPLIER'] ?? 2),
    partialAdvancePercent: Number(process.env['PARTIAL_ADVANCE_PERCENT'] ?? 30),
  }),
);
