import { HttpException, HttpStatus } from '@nestjs/common';

export class RideError extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    public readonly errorCode: string,
  ) {
    super({ message, errorCode }, status);
  }
}

export const RideErrors = {
  rideNotFound: () =>
    new RideError('Ride not found', HttpStatus.NOT_FOUND, 'RIDE_NOT_FOUND'),
  fareRateNotFound: () =>
    new RideError(
      'Fare rate not found for vehicle category',
      HttpStatus.BAD_REQUEST,
      'FARE_RATE_NOT_FOUND',
    ),
  invalidPassengers: (message: string) =>
    new RideError(message, HttpStatus.BAD_REQUEST, 'INVALID_PASSENGERS'),
  passengerCountExceedsCapacity: () =>
    new RideError(
      'Passenger count exceeds vehicle category capacity',
      HttpStatus.BAD_REQUEST,
      'PASSENGER_COUNT_EXCEEDS_CAPACITY',
    ),
  invalidTripDates: () =>
    new RideError('Invalid trip dates', HttpStatus.BAD_REQUEST, 'INVALID_TRIP_DATES'),
  mapsFailed: () =>
    new RideError(
      'Failed to calculate route distance',
      HttpStatus.BAD_GATEWAY,
      'MAPS_FAILED',
    ),
  invalidStatusTransition: () =>
    new RideError(
      'Invalid ride status transition',
      HttpStatus.CONFLICT,
      'INVALID_STATUS_TRANSITION',
    ),
  notAssignable: () =>
    new RideError(
      'Ride is not in assignable status',
      HttpStatus.CONFLICT,
      'RIDE_NOT_ASSIGNABLE',
    ),
  driverNotAssignable: () =>
    new RideError(
      'Driver is not approved for assignment',
      HttpStatus.BAD_REQUEST,
      'DRIVER_NOT_ASSIGNABLE',
    ),
  vehicleCategoryMismatch: () =>
    new RideError(
      'Vehicle category does not match ride request',
      HttpStatus.BAD_REQUEST,
      'VEHICLE_CATEGORY_MISMATCH',
    ),
  vehicleNotOwnedByDriver: () =>
    new RideError(
      'Vehicle does not belong to the assigned driver',
      HttpStatus.BAD_REQUEST,
      'VEHICLE_NOT_OWNED_BY_DRIVER',
    ),
  paymentNotFound: () =>
    new RideError('Payment not found', HttpStatus.NOT_FOUND, 'PAYMENT_NOT_FOUND'),
  paymentNotPending: () =>
    new RideError(
      'No pending online payment for this ride',
      HttpStatus.CONFLICT,
      'PAYMENT_NOT_PENDING',
    ),
  razorpayNotConfigured: () =>
    new RideError(
      'Razorpay is not configured',
      HttpStatus.SERVICE_UNAVAILABLE,
      'RAZORPAY_NOT_CONFIGURED',
    ),
  webhookSignatureInvalid: () =>
    new RideError(
      'Invalid webhook signature',
      HttpStatus.UNAUTHORIZED,
      'WEBHOOK_SIGNATURE_INVALID',
    ),
  rideNotCancellable: () =>
    new RideError(
      'Ride cannot be cancelled in its current status',
      HttpStatus.CONFLICT,
      'RIDE_NOT_CANCELLABLE',
    ),
};
