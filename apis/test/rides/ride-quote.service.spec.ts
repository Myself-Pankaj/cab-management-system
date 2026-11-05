import { describe, expect, it } from 'vitest';
import { PassengerValidationService } from '../../libs/resources/src/rides/services/passenger-validation.service.js';
import { RideErrors } from '../../libs/resources/src/rides/types/ride-errors.js';

describe('PassengerValidationService', () => {
  const service = new PassengerValidationService();

  it('requires exactly one primary passenger', () => {
    expect(() =>
      service.validatePassengers('SEATER_4', [
        { name: 'A', phone: '+911111111111', is_primary: false },
      ]),
    ).toThrowError(
      expect.objectContaining({ errorCode: 'INVALID_PASSENGERS' }),
    );
  });

  it('rejects passenger count above category seat limit', () => {
    expect(() =>
      service.validatePassengers('SEATER_4', [
        { name: 'A', phone: '+911111111111', is_primary: true },
        { name: 'B', phone: '+911111111112', is_primary: false },
        { name: 'C', phone: '+911111111113', is_primary: false },
        { name: 'D', phone: '+911111111114', is_primary: false },
        { name: 'E', phone: '+911111111115', is_primary: false },
      ]),
    ).toThrowError(
      expect.objectContaining({ errorCode: 'PASSENGER_COUNT_EXCEEDS_CAPACITY' }),
    );
  });

  it('accepts valid passenger list', () => {
    expect(() =>
      service.validatePassengers('SEATER_4', [
        { name: 'Booker Friend', phone: '+911111111111', is_primary: true },
      ]),
    ).not.toThrow();
  });

  it('validates round trip dates', () => {
    expect(() =>
      service.validateTripDates('ROUND_TRIP', '2026-09-20T10:00:00.000Z'),
    ).toThrow(RideErrors.invalidTripDates());
  });
});
