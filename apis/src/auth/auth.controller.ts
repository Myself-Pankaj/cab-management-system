import { ApiEnvelope } from '../openapi/api-envelope.decorator.js';
import {
  RegistrationResponseDto,
  UserDataDto,
  OtpMessageResponseDto,
  AuthSessionResponseDto,
  RefreshSessionResponseDto,
  MessageResponseDto,
} from '../openapi/response.dto.js';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  AuthCookieService,
  AuthPasswordService,
  AuthRegistrationService,
  AuthRoleService,
  AuthSessionService,
  AuthVerificationService,
  CurrentUser,
  Public,
  RefreshTokenGuard,
} from '@app/resources';
import { RegisterDto } from '@app/resources/auth/dto/register.dto.js';
import { VerifyOtpDto } from '@app/resources/auth/dto/verify-otp.dto.js';
import { ResendOtpDto } from '@app/resources/auth/dto/resend-otp.dto.js';
import { LoginDto } from '@app/resources/auth/dto/login.dto.js';
import { ForgotPasswordDto } from '@app/resources/auth/dto/forgot-password.dto.js';
import { ResetPasswordDto } from '@app/resources/auth/dto/reset-password.dto.js';
import { ChangePasswordDto } from '@app/resources/auth/dto/change-password.dto.js';
import { UpdateProfileDto } from '@app/resources/auth/dto/update-profile.dto.js';
import { ChooseRoleDto } from '@app/resources/auth/dto/choose-role.dto.js';
import type { JwtClaims } from '@app/resources/auth/types/auth.types.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registrationService: AuthRegistrationService,
    private readonly verificationService: AuthVerificationService,
    private readonly sessionService: AuthSessionService,
    private readonly passwordService: AuthPasswordService,
    private readonly cookieService: AuthCookieService,
    private readonly roleService: AuthRoleService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiEnvelope(RegistrationResponseDto, 201)
  async register(@Body() dto: RegisterDto) {
    const result = await this.registrationService.register(dto);
    return {
      user: result.user,
      message: result.message,
      ...(result.dev_otp ? { dev_otp: result.dev_otp } : {}),
    };
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email OTP' })
  @ApiEnvelope(UserDataDto, 200)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const result = await this.verificationService.verifyEmail(dto);
    return { user: result.user };
  }

  @Public()
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend email verification OTP' })
  @ApiEnvelope(OtpMessageResponseDto, 200)
  async resendOtp(@Body() dto: ResendOtpDto) {
    const result = await this.verificationService.resendEmailOtp(dto);
    return {
      message: result.message,
      ...(result.dev_otp ? { dev_otp: result.dev_otp } : {}),
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  @ApiEnvelope(AuthSessionResponseDto, 200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.sessionService.login(dto);
    this.cookieService.setAccessTokenCookie(res, result.accessToken);
    this.cookieService.setRefreshTokenCookie(res, result.refreshToken);
    return this.cookieService.buildAuthSessionData(
      result.user,
      result.accessToken,
      result.refreshToken,
    );
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('refresh_token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiEnvelope(RefreshSessionResponseDto, 200)
  async refresh(
    @CurrentUser() user: JwtClaims,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.sessionService.refresh(user.user_id);
    this.cookieService.setAccessTokenCookie(res, result.accessToken);
    return this.cookieService.buildRefreshSessionData(result.accessToken);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout' })
  @ApiEnvelope(MessageResponseDto, 200)
  logout(@Res({ passthrough: true }) res: Response) {
    this.cookieService.clearAuthCookies(res);
    return { message: 'Logged out successfully' };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset OTP' })
  @ApiEnvelope(OtpMessageResponseDto, 200)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.passwordService.forgotPassword(dto);
    return {
      message: result.message,
      ...(result.dev_otp ? { dev_otp: result.dev_otp } : {}),
    };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with OTP' })
  @ApiEnvelope(MessageResponseDto, 200)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.passwordService.resetPassword(dto);
    this.cookieService.clearAuthCookies(res);
    return { message: 'Password reset successfully' };
  }

  @Post('choose-role')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Choose Passenger or Driver role after registration',
  })
  @ApiEnvelope(UserDataDto, 200)
  async chooseRole(@CurrentUser() user: JwtClaims, @Body() dto: ChooseRoleDto) {
    const profile = await this.roleService.chooseRole(user.user_id, dto);
    return { user: profile };
  }

  @Get('profile')
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiEnvelope(UserDataDto, 200)
  async getProfile(@CurrentUser() user: JwtClaims) {
    const profile = await this.sessionService.getProfile(user.user_id);
    return { user: profile };
  }

  @Patch('profile')
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiEnvelope(UserDataDto, 200)
  async updateProfile(
    @CurrentUser() user: JwtClaims,
    @Body() dto: UpdateProfileDto,
  ) {
    const profile = await this.sessionService.updateProfile(user.user_id, dto);
    return { user: profile };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password for authenticated user' })
  @ApiEnvelope(MessageResponseDto, 200)
  async changePassword(
    @CurrentUser() user: JwtClaims,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.passwordService.changePassword(user.user_id, dto);
    this.cookieService.clearAuthCookies(res);
    return { message: 'Password changed successfully. Please login again.' };
  }
}
