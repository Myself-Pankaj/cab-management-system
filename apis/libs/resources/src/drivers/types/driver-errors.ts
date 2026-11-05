import { HttpException, HttpStatus } from '@nestjs/common';

export class DriverError extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    public readonly errorCode: string,
  ) {
    super({ message, errorCode }, status);
  }
}

export const DriverErrors = {
  profileNotFound: () =>
    new DriverError(
      'Driver profile not found',
      HttpStatus.NOT_FOUND,
      'DRIVER_PROFILE_NOT_FOUND',
    ),
  notDriver: () =>
    new DriverError(
      'User is not a driver',
      HttpStatus.FORBIDDEN,
      'NOT_A_DRIVER',
    ),
  profileNotEditable: () =>
    new DriverError(
      'Driver profile cannot be edited in its current status',
      HttpStatus.CONFLICT,
      'PROFILE_NOT_EDITABLE',
    ),
  documentNotFound: () =>
    new DriverError(
      'Driver document not found',
      HttpStatus.NOT_FOUND,
      'DOCUMENT_NOT_FOUND',
    ),
  vehicleNotFound: () =>
    new DriverError(
      'Vehicle not found',
      HttpStatus.NOT_FOUND,
      'VEHICLE_NOT_FOUND',
    ),
  bankDetailsMissing: () =>
    new DriverError(
      'Bank details are required',
      HttpStatus.BAD_REQUEST,
      'BANK_DETAILS_MISSING',
    ),
  documentsIncomplete: () =>
    new DriverError(
      'Aadhaar, driving licence, RC and PUC must have non-rejected document uploads',
      HttpStatus.BAD_REQUEST,
      'DOCUMENTS_INCOMPLETE',
    ),
  vehicleRequired: () =>
    new DriverError(
      'Vehicle registration is required',
      HttpStatus.BAD_REQUEST,
      'VEHICLE_REQUIRED',
    ),
  invalidStatusTransition: () =>
    new DriverError(
      'Invalid profile status for this action',
      HttpStatus.CONFLICT,
      'INVALID_STATUS_TRANSITION',
    ),
  verificationNotFound: () =>
    new DriverError(
      'Driver verification record not found',
      HttpStatus.NOT_FOUND,
      'VERIFICATION_NOT_FOUND',
    ),
};
