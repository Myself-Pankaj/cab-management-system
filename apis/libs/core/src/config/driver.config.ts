import { registerAs } from '@nestjs/config';
import { DriverConfig } from './config.interface.js';

export const REQUIRED_DRIVER_DOCUMENT_TYPES = [
  'AADHAAR',
  'DRIVING_LICENCE',
] as const;

export default registerAs(
  'driver',
  (): DriverConfig => ({
    vehicleRequired: process.env['DRIVER_VEHICLE_REQUIRED'] === 'true',
    requiredDocumentTypes: [...REQUIRED_DRIVER_DOCUMENT_TYPES],
  }),
);
