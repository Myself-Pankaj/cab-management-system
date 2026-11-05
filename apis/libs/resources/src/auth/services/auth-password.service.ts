import { Injectable } from '@nestjs/common';
import { AppConfigService, DatabaseService } from '@app/core';
import { UserRepository } from '../repositories/user.repository.js';
import { VerificationRepository } from '../repositories/verification.repository.js';
import { EmailService } from './email.service.js';
import { AuthErrors } from '../types/auth-errors.js';
import {
  checkPassword,
  compareOtp,
  generateOtp,
  hashOtp,
  hashPassword,
  normalizeEmail,
} from '../utils/crypto.utils.js';
import type { ChangePasswordDto } from '../dto/change-password.dto.js';
import type { ForgotPasswordDto } from '../dto/forgot-password.dto.js';
import type { ResetPasswordDto } from '../dto/reset-password.dto.js';

export const FORGOT_PASSWORD_MESSAGE =
  'if this email exists, password reset instructions have been sent';

export interface ForgotPasswordResult {
  message: string;
  dev_otp?: string;
}

@Injectable()
export class AuthPasswordService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly verificationRepository: VerificationRepository,
    private readonly databaseService: DatabaseService,
    private readonly emailService: EmailService,
    private readonly config: AppConfigService,
  ) {}

  async forgotPassword(dto: ForgotPasswordDto): Promise<ForgotPasswordResult> {
    const email = normalizeEmail(dto.email);
    const result: ForgotPasswordResult = { message: FORGOT_PASSWORD_MESSAGE };

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return result;
    }

    const otpSecret = this.getOtpSecret();
    const otp = generateOtp();
    const expiresAt = new Date(
      Date.now() + this.config.auth.otpExpirySeconds * 1000,
    );

    await this.databaseService.withTransaction(async (client) => {
      await this.verificationRepository.deleteActive(
        user.id,
        'password_reset',
        email,
        client,
      );
      await this.verificationRepository.create(
        {
          userId: user.id,
          purpose: 'password_reset',
          target: email,
          otpHash: hashOtp(otp, otpSecret),
          attempts: 0,
          maxAttempts: 3,
          isUsed: false,
          expiresAt,
        },
        client,
      );
    });

    await this.emailService.sendPasswordResetOtp(email, otp, user.full_name);

    if (!this.config.isProduction) {
      result.dev_otp = otp;
    }

    return result;
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    if (dto.new_password !== dto.confirm_password) {
      throw AuthErrors.passwordMismatch();
    }

    const email = normalizeEmail(dto.email);
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw AuthErrors.userNotFound();
    }

    await this.rejectPasswordReuse(user.password_hash, dto.new_password);

    const verification = await this.verificationRepository.findActive({
      userId: user.id,
      purpose: 'password_reset',
      target: email,
    });

    if (!verification) {
      throw AuthErrors.noActiveOtp();
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
    if (!compareOtp(dto.otp, verification.otp_hash, otpSecret)) {
      await this.verificationRepository.incrementAttempts(String(verification.id));
      throw AuthErrors.invalidOtp();
    }

    const passwordHash = await hashPassword(dto.new_password);

    await this.databaseService.withTransaction(async (client) => {
      await this.verificationRepository.markUsed(String(verification.id), client);
      await this.userRepository.updatePasswordHash(user.id, passwordHash, client);
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    if (dto.new_password !== dto.confirm_password) {
      throw AuthErrors.passwordMismatch();
    }

    const user = await this.userRepository.findById(userId);
    if (!user?.password_hash) {
      throw AuthErrors.invalidCredentials();
    }

    const valid = await checkPassword(dto.current_password, user.password_hash);
    if (!valid) {
      throw AuthErrors.invalidCredentials();
    }

    await this.rejectPasswordReuse(user.password_hash, dto.new_password);

    const passwordHash = await hashPassword(dto.new_password);
    await this.userRepository.updatePasswordHash(user.id, passwordHash);
  }

  private async rejectPasswordReuse(
    currentHash: string | null,
    newPassword: string,
  ): Promise<void> {
    if (!currentHash) {
      return;
    }
    const same = await checkPassword(newPassword, currentHash);
    if (same) {
      throw AuthErrors.passwordReuse();
    }
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
