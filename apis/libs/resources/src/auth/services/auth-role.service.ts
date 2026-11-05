import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@app/core';
import { UserRepository } from '../repositories/user.repository.js';
import { DriverProfileRepository } from '../../drivers/repositories/driver-profile.repository.js';
import { DriverWalletRepository } from '../../drivers/repositories/driver-wallet.repository.js';
import { AuthErrors } from '../types/auth-errors.js';
import { toUserResponse, type UserResponse } from '../types/auth.types.js';
import type { ChooseRoleDto } from '../dto/choose-role.dto.js';

@Injectable()
export class AuthRoleService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly driverProfileRepository: DriverProfileRepository,
    private readonly driverWalletRepository: DriverWalletRepository,
    private readonly databaseService: DatabaseService,
  ) {}

  async chooseRole(userId: string, dto: ChooseRoleDto): Promise<UserResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw AuthErrors.userNotFound();
    }
    if (!user.email_verified) {
      throw AuthErrors.emailNotVerified();
    }
    if (user.global_role != null) {
      throw AuthErrors.roleAlreadySet();
    }

    const updated = await this.databaseService.withTransaction(async (client) => {
      const row = await this.userRepository.updateRole(userId, dto.role, client);
      if (!row) {
        throw AuthErrors.roleAlreadySet();
      }

      if (dto.role === 'Driver') {
        const profile = await this.driverProfileRepository.create(
          { userId, status: 'DRAFT' },
          client,
        );
        await this.driverWalletRepository.create(profile.id, client);
      }

      return row;
    });

    return toUserResponse(updated);
  }
}
