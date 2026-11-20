import { registerAs } from '@nestjs/config';
import { DriverConfig } from './config.interface.js';

export const REQUIRED_DRIVER_DOCUMENT_TYPES = ['DRIVING_LICENCE'] as const;

export default registerAs('driver', (): DriverConfig => ({
  vehicleRequired: true,
  offerExpiryMinutes: Number(process.env['DRIVER_OFFER_EXPIRY_MINUTES'] ?? 30),
  requiredDocumentTypes: [...REQUIRED_DRIVER_DOCUMENT_TYPES],
}));
