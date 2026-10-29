import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { GoogleLoginDto } from './dto/google-login.dto.js';
import { ResendVerificationDto } from './dto/resend-verification.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Helper gài Refresh Token an toàn vào httpOnly Cookie
   */
  private setRefreshTokenCookie(res: Response, token: string) {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày tính bằng milliseconds
      path: '/',
    });
  }

  /**
   * Helper xóa sạch Cookie khi đăng xuất
   */
  private clearRefreshTokenCookie(res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }

  /**
   * 1. ĐĂNG KÝ TÀI KHOẢN MỚI
   * POST /api/v1/auth/register
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * 1.1. XÁC THỰC EMAIL KÍCH HOẠT TÀI KHOẢN
   * GET /api/v1/auth/verify-email?token=...
   */
  @Get('verify-email')
  async verifyEmail(
    @Query('token') token: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.authService.verifyEmail(token);

    // Nếu người dùng nhấn trực tiếp từ Email trên trình duyệt (Accept text/html)
    // -> Tự động chuyển hướng về trang Đăng nhập kèm cờ verified=true
    const acceptHeader = req.headers['accept'] || '';
    if (acceptHeader.includes('text/html')) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/login?verified=true`);
    }

    // Nếu gọi từ Postman / API Client (JSON)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: result.message,
      data: { success: true },
    });
  }

  /**
   * 1.2. GỬI LẠI EMAIL KÍCH HOẠT
   * POST /api/v1/auth/resend-verification
   */
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() resendVerificationDto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(resendVerificationDto.email);
  }

  /**
   * 2. ĐĂNG NHẬP
   * POST /api/v1/auth/login
   * Trả về Access Token trong JSON, Refresh Token trong httpOnly Cookie
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);
    // Gài Refresh Token vào Cookie
    this.setRefreshTokenCookie(res, result.refreshToken);

    // Trả về Access Token và thông tin User cho Frontend
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  /**
   * 2.1. ĐĂNG NHẬP / ĐĂNG KÝ BẰNG GOOGLE (OAuth 2.0 Credential)
   * POST /api/v1/auth/google
   */
  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleLogin(
    @Body() googleLoginDto: GoogleLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.googleLogin(googleLoginDto);

    // Gài Refresh Token vào Cookie
    this.setRefreshTokenCookie(res, result.refreshToken);

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  /**
   * 3. LÀM MỚI TOKEN (Refresh Token Rotation & Reuse Detection)
   * POST /api/v1/auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawRefreshToken = req.cookies?.['refreshToken'];
    const result = await this.authService.refreshToken(rawRefreshToken);

    // Cập nhật Cookie mới sau khi xoay vòng token
    this.setRefreshTokenCookie(res, result.refreshToken);

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  /**
   * 4. ĐĂNG XUẤT
   * POST /api/v1/auth/logout
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawRefreshToken = req.cookies?.['refreshToken'];
    await this.authService.logout(rawRefreshToken);

    // Xóa Cookie trên trình duyệt
    this.clearRefreshTokenCookie(res);

    return { message: 'Đăng xuất thành công' };
  }

  /**
   * 5. LẤY THÔNG TIN TÀI KHOẢN HIỆN TẠI (Yêu cầu JWT Guard)
   * GET /api/v1/auth/me
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: any) {
    return user;
  }
}
