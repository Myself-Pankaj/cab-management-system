import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { BaseRepository } from '@app/core';
import {
  createUser,
  emailExists,
  getUserByEmail,
  getUserById,
  getUserByPhoneNumber,
  markEmailVerified,
  phoneExists,
  updateUserLastLogin,
  updateUserPasswordHash,
  updateUserProfile,
  updateUserRole,
  type global_role,
  type ICreateUserParams,
  type IGetUserByIdResult,
  type IUpdateUserProfileParams,
} from '@db/queries/users/users.queries.js';

export type UserRow = IGetUserByIdResult;

@Injectable()
export class UserRepository extends BaseRepository {
  async create(params: ICreateUserParams, client?: PoolClient): Promise<IGetUserByIdResult> {
    const connection = client ?? this.pool;
    const [row] = await createUser.run(params, connection);
    if (!row) {
      throw new Error('Failed to create user');
    }
    return row;
  }

  async findById(id: string, client?: PoolClient): Promise<IGetUserByIdResult | null> {
    const connection = client ?? this.pool;
    const [row] = await getUserById.run({ id }, connection);
    return row ?? null;
  }

  async findByEmail(
    email: string,
    client?: PoolClient,
  ): Promise<IGetUserByIdResult | null> {
    const connection = client ?? this.pool;
    const [row] = await getUserByEmail.run({ email }, connection);
    return row ?? null;
  }

  async findByPhoneNumber(
    phoneNumber: string,
    client?: PoolClient,
  ): Promise<IGetUserByIdResult | null> {
    const connection = client ?? this.pool;
    const [row] = await getUserByPhoneNumber.run({ phoneNumber }, connection);
    return row ?? null;
  }

  async emailExists(email: string, client?: PoolClient): Promise<boolean> {
    const connection = client ?? this.pool;
    const [row] = await emailExists.run({ email }, connection);
    return row?.exists ?? false;
  }

  async phoneExists(phoneNumber: string, client?: PoolClient): Promise<boolean> {
    const connection = client ?? this.pool;
    const [row] = await phoneExists.run({ phoneNumber }, connection);
    return row?.exists ?? false;
  }

  async markEmailVerified(id: string, client?: PoolClient): Promise<void> {
    const connection = client ?? this.pool;
    await markEmailVerified.run({ id }, connection);
  }

  async updatePasswordHash(
    id: string,
    passwordHash: string,
    client?: PoolClient,
  ): Promise<void> {
    const connection = client ?? this.pool;
    await updateUserPasswordHash.run({ id, passwordHash }, connection);
  }

  async updateLastLogin(id: string, client?: PoolClient): Promise<void> {
    const connection = client ?? this.pool;
    await updateUserLastLogin.run({ id }, connection);
  }

  async updateProfile(
    params: IUpdateUserProfileParams,
    client?: PoolClient,
  ): Promise<IGetUserByIdResult | null> {
    const connection = client ?? this.pool;
    const [row] = await updateUserProfile.run(params, connection);
    return row ?? null;
  }

  async updateRole(
    id: string,
    globalRole: global_role,
    client?: PoolClient,
  ): Promise<IGetUserByIdResult | null> {
    const connection = client ?? this.pool;
    const [row] = await updateUserRole.run({ id, globalRole }, connection);
    return row ?? null;
  }
}
