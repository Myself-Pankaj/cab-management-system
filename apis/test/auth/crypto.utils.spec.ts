import { describe, expect, it } from 'vitest';
import {
  compareOtp,
  generateOtp,
  hashOtp,
  hashPassword,
  checkPassword,
} from '@app/resources/auth/utils/crypto.utils.js';

describe('crypto.utils', () => {
  it('generates a 6-digit OTP', () => {
    const otp = generateOtp();
    expect(otp).toMatch(/^\d{6}$/);
  });

  it('hashes and compares OTP with HMAC-SHA256', () => {
    const otp = '123456';
    const secret = 'test-secret';
    const hash = hashOtp(otp, secret);
    expect(hash).not.toBe(otp);
    expect(compareOtp(otp, hash, secret)).toBe(true);
    expect(compareOtp('654321', hash, secret)).toBe(false);
  });

  it('hashes and verifies passwords with bcrypt', async () => {
    const password = 'SecurePass123!';
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    await expect(checkPassword(password, hash)).resolves.toBe(true);
    await expect(checkPassword('wrong-password', hash)).resolves.toBe(false);
  });
});
