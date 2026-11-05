import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository.js';
import { JwtTokenService } from './jwt-token.service.js';
import { AuthErrors } from '../types/auth-errors.js';
import { toUserResponse, type UserResponse } from '../types/auth.types.js';
import {
  checkPassword,
  normalizeEmail,
} from '../utils/crypto.utils.js';
import type { LoginDto } from '../dto/login.dto.js';
import type { UpdateProfileDto } from '../dto/update-profile.dto.js';
import type { UserRow } from '../types/auth.types.js';

export interface LoginResult {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResult {
  accessToken: string;
}

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.authenticateUser(dto);
    await this.userRepository.updateLastLogin(user.id);
    return this.issueTokens(user);
  }

  async refresh(userId: string): Promise<RefreshResult> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw AuthErrors.userNotFound();
    }
    if (!user.is_active) {
      throw AuthErrors.userInactive();
    }
    if (user.is_blocked) {
      throw AuthErrors.userBlocked();
    }

    const accessToken = this.jwtTokenService.generateToken({
      userId: user.id,
      email: user.email ?? '',
      phoneNumber: user.phone_number ?? '',
      role: user.global_role,
      emailVerified: user.email_verified,
      phoneVerified: user.phone_verified,
      tokenType: 'access',
    });

    return { accessToken };
  }

  async getProfile(userId: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw AuthErrors.userNotFound();
    }
    return toUserResponse(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserResponse> {
    const updated = await this.userRepository.updateProfile({
      id: userId,
      firstName: dto.first_name,
      lastName: dto.last_name,
      phoneNumber: dto.phone_number,
      dateOfBirth: dto.date_of_birth ? new Date(dto.date_of_birth) : undefined,
      gender: dto.gender,
      timezone: dto.timezone,
      language: dto.language,
    });

    if (!updated) {
      throw AuthErrors.userNotFound();
    }

    return toUserResponse(updated);
  }

  private async authenticateUser(dto: LoginDto): Promise<UserRow> {
    const email = dto.email ? normalizeEmail(dto.email) : '';
    const phoneNumber = dto.phone_number?.trim() ?? '';

    const user = email
      ? await this.userRepository.findByEmail(email)
      : await this.userRepository.findByPhoneNumber(phoneNumber);

    if (!user?.password_hash) {
      throw AuthErrors.invalidCredentials();
    }

    const valid = await checkPassword(dto.password, user.password_hash);
    if (!valid) {
      throw AuthErrors.invalidCredentials();
    }

    if (!user.email_verified) {
      throw AuthErrors.emailNotVerified();
    }
    if (!user.is_active) {
      throw AuthErrors.userInactive();
    }
    if (user.is_blocked) {
      throw AuthErrors.userBlocked();
    }

    return user;
  }

  private issueTokens(user: UserRow): LoginResult {
    const payload = {
      userId: user.id,
      email: user.email ?? '',
      phoneNumber: user.phone_number ?? '',
      role: user.global_role,
      emailVerified: user.email_verified,
      phoneVerified: user.phone_verified,
    };

    return {
      user: toUserResponse(user),
      accessToken: this.jwtTokenService.generateToken({
        ...payload,
        tokenType: 'access',
      }),
      refreshToken: this.jwtTokenService.generateToken({
        ...payload,
        tokenType: 'refresh',
      }),
    };
  }
}
