import { Injectable } from '@nestjs/common';
import { AppConfigService, DatabaseService } from '@app/core';
import { UserRepository } from '../repositories/user.repository.js';
import { VerificationRepository } from '../repositories/verification.repository.js';
import { EmailService } from './email.service.js';
import { AuthErrors } from '../types/auth-errors.js';
import { toUserResponse, type UserResponse } from '../types/auth.types.js';
import {
  buildFullName,
  generateOtp,
  hashOtp,
  hashPassword,
  normalizeEmail,
} from '../utils/crypto.utils.js';
import type { RegisterDto } from '../dto/register.dto.js';
import { DriverWalletRepository } from '@app/resources/drivers/repositories/driver-wallet.repository.js';
import { DriverProfileRepository } from '@app/resources/drivers/repositories/driver-profile.repository.js';

export interface RegistrationResult {
  user: UserResponse;
  message: string;
  dev_otp?: string;
}

@Injectable()
export class AuthRegistrationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly verificationRepository: VerificationRepository,
    private readonly driverWalletRepository: DriverWalletRepository,
    private readonly driverProfileRepository: DriverProfileRepository,
    private readonly databaseService: DatabaseService,
    private readonly emailService: EmailService,
    private readonly config: AppConfigService,
  ) {}

  // async register(dto: RegisterDto): Promise<RegistrationResult> {
  //   const email = normalizeEmail(dto.email);
  //   const phoneNumber = dto.phone_number.trim();
  //   const fullName = buildFullName(dto.first_name, dto.last_name);

  //   if (await this.userRepository.emailExists(email)) {
  //     throw AuthErrors.emailExists();
  //   }
  //   if (await this.userRepository.phoneExists(phoneNumber)) {
  //     throw AuthErrors.phoneExists();
  //   }

  //   const passwordHash = await hashPassword(dto.password);
  //   const otpSecret = this.getOtpSecret();
  //   const otp = generateOtp();
  //   const otpHash = hashOtp(otp, otpSecret);
  //   const expiresAt = new Date(
  //     Date.now() + this.config.auth.otpExpirySeconds * 1000,
  //   );

  //   const user = await this.databaseService.withTransaction(async (client) => {
  //     const created = await this.userRepository.create(
  //       {
  //         firstName: dto.first_name,
  //         lastName: dto.last_name ?? null,
  //         fullName,
  //         email,
  //         phoneNumber,
  //         passwordHash,
  //         authProvider: 'email',
  //         globalRole: null,
  //         emailVerified: false,
  //         phoneVerified: false,
  //         isActive: true,
  //         isBlocked: false,
  //         timezone: 'Asia/Kolkata',
  //         language: 'en',
  //         metadata: {},
  //       },
  //       client,
  //     );

  //     await this.verificationRepository.deleteActive(
  //       created.id,
  //       'email_verification',
  //       email,
  //       client,
  //     );

  //     await this.verificationRepository.create(
  //       {
  //         userId: created.id,
  //         purpose: 'email_verification',
  //         target: email,
  //         otpHash,
  //         attempts: 0,
  //         maxAttempts: 3,
  //         isUsed: false,
  //         expiresAt,
  //       },
  //       client,
  //     );

  //     return created;
  //   });

  //   await this.emailService.sendOtp(email, otp, fullName);

  //   const result: RegistrationResult = {
  //     user: toUserResponse(user),
  //     message:
  //       'Please verify your email using the OTP sent to your email address',
  //   };

  //   if (!this.config.isProduction) {
  //     result.dev_otp = otp;
  //   }

  //   return result;
  // }
  async register(dto: RegisterDto): Promise<RegistrationResult> {
    const email = normalizeEmail(dto.email);
    const phoneNumber = dto.phone_number.trim();
    const fullName = buildFullName(dto.first_name, dto.last_name);

    if (await this.userRepository.emailExists(email)) {
      throw AuthErrors.emailExists();
    }

    if (await this.userRepository.phoneExists(phoneNumber)) {
      throw AuthErrors.phoneExists();
    }

    const passwordHash = await hashPassword(dto.password);

    const otpSecret = this.getOtpSecret();
    const otp = generateOtp();
    const otpHash = hashOtp(otp, otpSecret);

    const expiresAt = new Date(
      Date.now() + this.config.auth.otpExpirySeconds * 1000,
    );

    const user = await this.databaseService.withTransaction(async (client) => {
      const created = await this.userRepository.create(
        {
          firstName: dto.first_name,
          lastName: dto.last_name ?? null,
          fullName,
          email,
          phoneNumber,
          passwordHash,
          authProvider: 'email',

          // Role selected during registration
          globalRole: dto.role,

          emailVerified: false,
          phoneVerified: false,
          isActive: true,
          isBlocked: false,
          timezone: 'Asia/Kolkata',
          language: 'en',
          metadata: {},
        },
        client,
      );

      /*
       * Create role-specific resources inside the SAME transaction.
       *
       * User creation
       *        ↓
       * Driver profile
       *        ↓
       * Driver wallet
       *
       * If any step fails, everything rolls back.
       */
      if (dto.role === 'Driver') {
        const profile = await this.driverProfileRepository.create(
          {
            userId: created.id,
            status: 'DRAFT',
          },
          client,
        );

        await this.driverWalletRepository.create(profile.id, client);
      }

      await this.verificationRepository.deleteActive(
        created.id,
        'email_verification',
        email,
        client,
      );

      await this.verificationRepository.create(
        {
          userId: created.id,
          purpose: 'email_verification',
          target: email,
          otpHash,
          attempts: 0,
          maxAttempts: 3,
          isUsed: false,
          expiresAt,
        },
        client,
      );

      return created;
    });

    // External side effect stays OUTSIDE DB transaction
    await this.emailService.sendOtp(email, otp, fullName);

    const result: RegistrationResult = {
      user: toUserResponse(user),
      message:
        'Please verify your email using the OTP sent to your email address',
    };

    if (!this.config.isProduction) {
      result.dev_otp = otp;
    }

    return result;
  }
  private getOtpSecret(): string {
    const secret = this.config.auth.otpSecret.trim();
    if (secret) {
      return secret;
    }
    if (this.config.isProduction) {
      throw new Error('OTP_SECRET is required in production');
    }
    return 'development-otp-secret-change-me';
  }
}
