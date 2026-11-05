import { createHmac, randomInt } from 'node:crypto';
import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  if (!password) {
    throw new Error('password cannot be empty');
  }
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function checkPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateOtp(): string {
  return Array.from({ length: 6 }, () => randomInt(0, 10)).join('');
}

export function hashOtp(otp: string, secret: string): string {
  return createHmac('sha256', secret).update(otp).digest('hex');
}

export function compareOtp(rawOtp: string, otpHash: string, secret: string): boolean {
  const expected = hashOtp(rawOtp, secret);
  return expected === otpHash;
}

export function buildFullName(firstName: string, lastName?: string | null): string {
  return [firstName.trim(), lastName?.trim()].filter(Boolean).join(' ');
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
