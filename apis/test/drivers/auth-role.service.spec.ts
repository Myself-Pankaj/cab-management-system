import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AuthRoleService } from '../../libs/resources/src/auth/services/auth-role.service.js';
import { AuthErrors } from '../../libs/resources/src/auth/types/auth-errors.js';

describe('AuthRoleService', () => {
  const userRepository = {
    findById: vi.fn(),
    updateRole: vi.fn(),
  };
  const driverProfileRepository = {
    create: vi.fn(),
  };
  const driverWalletRepository = {
    create: vi.fn(),
  };
  const databaseService = {
    withTransaction: vi.fn(async (work: (client: unknown) => Promise<unknown>) =>
      work({}),
    ),
  };

  let service: AuthRoleService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthRoleService(
      userRepository as never,
      driverProfileRepository as never,
      driverWalletRepository as never,
      databaseService as never,
    );
  });

  it('selects Passenger role when global_role is null', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      email_verified: true,
      global_role: null,
    });
    userRepository.updateRole.mockResolvedValue({
      id: 'user-1',
      global_role: 'Passenger',
      email_verified: true,
      phone_verified: false,
      first_name: 'John',
      last_name: 'Doe',
      full_name: 'John Doe',
      email: 'john@example.com',
      phone_number: '9999999999',
      auth_provider: 'email',
      is_active: true,
      is_blocked: false,
      avatar_url: null,
      date_of_birth: null,
      gender: null,
      timezone: 'Asia/Kolkata',
      language: 'en',
      last_login_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const result = await service.chooseRole('user-1', { role: 'Passenger' });

    expect(result.global_role).toBe('Passenger');
    expect(driverProfileRepository.create).not.toHaveBeenCalled();
  });

  it('creates driver profile and wallet when Driver role is selected', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      email_verified: true,
      global_role: null,
    });
    userRepository.updateRole.mockResolvedValue({
      id: 'user-1',
      global_role: 'Driver',
      email_verified: true,
      phone_verified: false,
      first_name: 'John',
      last_name: 'Doe',
      full_name: 'John Doe',
      email: 'john@example.com',
      phone_number: '9999999999',
      auth_provider: 'email',
      is_active: true,
      is_blocked: false,
      avatar_url: null,
      date_of_birth: null,
      gender: null,
      timezone: 'Asia/Kolkata',
      language: 'en',
      last_login_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    });
    driverProfileRepository.create.mockResolvedValue({ id: 'profile-1' });

    const result = await service.chooseRole('user-1', { role: 'Driver' });

    expect(result.global_role).toBe('Driver');
    expect(driverProfileRepository.create).toHaveBeenCalledWith(
      { userId: 'user-1', status: 'DRAFT' },
      {},
    );
    expect(driverWalletRepository.create).toHaveBeenCalledWith('profile-1', {});
  });

  it('rejects role selection when role is already set', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      email_verified: true,
      global_role: 'Passenger',
    });

    await expect(service.chooseRole('user-1', { role: 'Driver' })).rejects.toEqual(
      AuthErrors.roleAlreadySet(),
    );
  });
});
