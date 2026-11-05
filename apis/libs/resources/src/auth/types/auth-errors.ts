import { HttpException, HttpStatus } from '@nestjs/common';

export class AppError extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    public readonly errorCode: string,
  ) {
    super({ message, errorCode }, status);
  }
}

export const AuthErrors = {
  emailExists: () =>
    new AppError('Email already registered', HttpStatus.CONFLICT, 'EMAIL_EXISTS'),
  phoneExists: () =>
    new AppError('Phone number already registered', HttpStatus.CONFLICT, 'PHONE_EXISTS'),
  invalidCredentials: () =>
    new AppError('Invalid credentials', HttpStatus.UNAUTHORIZED, 'INVALID_CREDENTIALS'),
  emailNotVerified: () =>
    new AppError('Email not verified', HttpStatus.FORBIDDEN, 'EMAIL_NOT_VERIFIED'),
  userInactive: () =>
    new AppError('Account is inactive', HttpStatus.FORBIDDEN, 'USER_INACTIVE'),
  userBlocked: () =>
    new AppError('Account is blocked', HttpStatus.FORBIDDEN, 'USER_BLOCKED'),
  userNotFound: () =>
    new AppError('User not found', HttpStatus.NOT_FOUND, 'USER_NOT_FOUND'),
  invalidOtp: () =>
    new AppError('Invalid OTP', HttpStatus.BAD_REQUEST, 'INVALID_OTP'),
  otpExpired: () =>
    new AppError('OTP has expired', HttpStatus.BAD_REQUEST, 'OTP_EXPIRED'),
  tooManyAttempts: () =>
    new AppError('Too many OTP attempts', HttpStatus.TOO_MANY_REQUESTS, 'TOO_MANY_REQUESTS'),
  noActiveOtp: () =>
    new AppError('No active OTP found', HttpStatus.BAD_REQUEST, 'NO_ACTIVE_OTP'),
  passwordMismatch: () =>
    new AppError('Passwords do not match', HttpStatus.BAD_REQUEST, 'PASSWORD_MISMATCH'),
  passwordReuse: () =>
    new AppError('New password must differ from current password', HttpStatus.BAD_REQUEST, 'PASSWORD_REUSE'),
  invalidToken: () =>
    new AppError('Invalid or expired token', HttpStatus.UNAUTHORIZED, 'INVALID_TOKEN'),
  roleAlreadySet: () =>
    new AppError('Role has already been selected', HttpStatus.CONFLICT, 'ROLE_ALREADY_SET'),
  roleNotSelected: () =>
    new AppError('Role has not been selected yet', HttpStatus.FORBIDDEN, 'ROLE_NOT_SELECTED'),
  invalidRole: () =>
    new AppError('Invalid role selection', HttpStatus.BAD_REQUEST, 'INVALID_ROLE'),
};
