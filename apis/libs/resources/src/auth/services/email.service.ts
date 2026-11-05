import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { AppConfigService } from '@app/core';

@Injectable()
export class EmailService {
  constructor(private readonly config: AppConfigService) {}

  private get isConfigured(): boolean {
    const auth = this.config.auth;
    return Boolean(auth.smtpHost && auth.smtpUser && auth.smtpPassword);
  }

  async sendOtp(email: string, otp: string, fullName: string): Promise<void> {
    if (!this.isConfigured) {
      return;
    }

    const transporter = nodemailer.createTransport({
      host: this.config.auth.smtpHost,
      port: this.config.auth.smtpPort,
      secure: this.config.auth.smtpPort === 465,
      auth: {
        user: this.config.auth.smtpUser,
        pass: this.config.auth.smtpPassword,
      },
    });

    await transporter.sendMail({
      from: this.config.auth.smtpFrom,
      to: email,
      subject: 'Verify your email - Cab Management',
      text: `Hello ${fullName},\n\nYour verification code is: ${otp}\n\nThis code expires in ${this.config.auth.otpExpirySeconds / 60} minutes.`,
    });
  }

  async sendPasswordResetOtp(
    email: string,
    otp: string,
    fullName: string,
  ): Promise<void> {
    if (!this.isConfigured) {
      return;
    }

    const transporter = nodemailer.createTransport({
      host: this.config.auth.smtpHost,
      port: this.config.auth.smtpPort,
      secure: this.config.auth.smtpPort === 465,
      auth: {
        user: this.config.auth.smtpUser,
        pass: this.config.auth.smtpPassword,
      },
    });

    await transporter.sendMail({
      from: this.config.auth.smtpFrom,
      to: email,
      subject: 'Reset your password - Cab Management',
      text: `Hello ${fullName},\n\nYour password reset code is: ${otp}\n\nThis code expires in ${this.config.auth.otpExpirySeconds / 60} minutes.`,
    });
  }
}
