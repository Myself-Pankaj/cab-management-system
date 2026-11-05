import { Injectable } from '@nestjs/common';
import { AppConfigService, DatabaseService } from '@app/core';
import { UserRepository } from '../repositories/user.repository.js';
import { VerificationRepository } from '../repositories/verification.repository.js';
import { EmailService } from './email.service.js';
import { AuthErrors } from '../types/auth-errors.js';
import { toUserResponse, type UserResponse } from '../types/auth.types.js';
import {
  generateOtp,
  hashOtp,
  normalizeEmail,
} from '../utils/crypto.utils.js';
import type { ResendOtpDto } from '../dto/resend-otp.dto.js';
import type { VerifyOtpDto } from '../dto/verify-otp.dto.js';

export interface VerificationResult {
  user: UserResponse;
}

export interface ResendOtpResult {
  message: string;
  dev_otp?: string;
}

@Injectable()
export class AuthVerificationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly verificationRepository: VerificationRepository,
    private readonly databaseService: DatabaseService,
    private readonly emailService: EmailService,
    private readonly config: AppConfigService,
  ) {}

  async verifyEmail(dto: VerifyOtpDto): Promise<VerificationResult> {
    const email = normalizeEmail(dto.email);
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw AuthErrors.userNotFound();
    }

    if (user.email_verified) {
      return { user: toUserResponse(user) };
    }

    const verification = await this.verificationRepository.findActive({
      userId: user.id,
      purpose: 'email_verification',
      target: email,
    });

    if (!verification) {
      throw AuthErrors.invalidOtp();
    }

    if (verification.is_used) {
      throw AuthErrors.invalidOtp();
    }

    if (new Date() > verification.expires_at) {
      throw AuthErrors.otpExpired();
    }

    if (verification.attempts >= verification.max_attempts) {
      throw AuthErrors.tooManyAttempts();
    }

    const otpSecret = this.getOtpSecret();
    const otpHash = hashOtp(dto.otp, otpSecret);
    if (otpHash !== verification.otp_hash) {
      await this.verificationRepository.incrementAttempts(String(verification.id));
      throw AuthErrors.invalidOtp();
    }

    await this.databaseService.withTransaction(async (client) => {
      await this.verificationRepository.markUsed(String(verification.id), client);
      await this.userRepository.markEmailVerified(user.id, client);
    });

    user.email_verified = true;
    return { user: toUserResponse(user) };
  }

  async resendEmailOtp(dto: ResendOtpDto): Promise<ResendOtpResult> {
    const email = normalizeEmail(dto.email);
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw AuthErrors.userNotFound();
    }

    if (user.email_verified) {
      return { message: 'email already verified' };
    }

    const otpSecret = this.getOtpSecret();
    const otp = generateOtp();
    const otpHash = hashOtp(otp, otpSecret);
    const expiresAt = new Date(
      Date.now() + this.config.auth.otpExpirySeconds * 1000,
    );

    await this.databaseService.withTransaction(async (client) => {
      await this.verificationRepository.deleteActive(
        user.id,
        'email_verification',
        email,
        client,
      );
      await this.verificationRepository.create(
        {
          userId: user.id,
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
    });

    await this.emailService.sendOtp(email, otp, user.full_name);

    const result: ResendOtpResult = {
      message: 'verification OTP sent successfully',
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
