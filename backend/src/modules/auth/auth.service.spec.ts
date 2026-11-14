import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import bcrypt from 'bcrypt';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { AuthService } from './auth.service.js';
import { User } from './entities/user.entity.js';
import { Session } from './entities/session.entity.js';
import { EmailVerification } from './entities/email-verification.entity.js';
import { PasswordResetToken } from './entities/password-reset-token.entity.js';
import { IMailService, MAIL_SERVICE } from '../mail/interfaces/mail-service.interface.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: Partial<Repository<User>>;
  let sessionRepo: Partial<Repository<Session>>;
  let emailVerificationRepo: Partial<Repository<EmailVerification>>;
  let passwordResetTokenRepo: Partial<Repository<PasswordResetToken>>;
  let dataSourceMock: Partial<DataSource>;
  let jwtServiceMock: Partial<JwtService>;
  let configServiceMock: Partial<ConfigService>;
  let mailServiceMock: Partial<IMailService>;
  let managerMock: any;

  beforeEach(async () => {
    managerMock = {
      create: vi.fn((entityClass, data) => ({
        ...data,
        id: data.id || 'mock-generated-id',
      })),
      save: vi.fn(async (entity) => ({
        ...entity,
        id: entity.id || 'mock-saved-id',
      })),
    };

    userRepo = {
      findOne: vi.fn(),
      create: vi.fn((data: any) => ({ ...data, id: 'mock-user-id' } as User)),
      save: vi.fn(async (user: any) => ({ ...user, id: user.id || 'mock-user-id' })),
    };

    sessionRepo = {
      findOne: vi.fn(),
      create: vi.fn((data: any) => ({ ...data, id: 'mock-session-id' } as Session)),
      save: vi.fn(async (session: any) => ({ ...session, id: session.id || 'mock-session-id' })),
      delete: vi.fn().mockResolvedValue({ affected: 1 }),
    };

    emailVerificationRepo = {
      findOne: vi.fn(),
      create: vi.fn((data: any) => ({ ...data, id: 'mock-verify-id' } as EmailVerification)),
      save: vi.fn(async (record: any) => ({ ...record, id: record.id || 'mock-verify-id' })),
      delete: vi.fn().mockResolvedValue({ affected: 1 }),
    };

    passwordResetTokenRepo = {
      findOne: vi.fn(),
      create: vi.fn((data: any) => ({ ...data, id: 'mock-reset-token-id' } as PasswordResetToken)),
      save: vi.fn(async (record: any) => ({ ...record, id: record.id || 'mock-reset-token-id' })),
      delete: vi.fn().mockResolvedValue({ affected: 1 }),
    };

    dataSourceMock = {
      transaction: vi.fn(async (cb: (manager: any) => Promise<any>) => cb(managerMock)),
    };

    jwtServiceMock = {
      sign: vi.fn().mockReturnValue('mock-jwt-access-token'),
    };

    configServiceMock = {
      get: vi.fn((key: string) => {
        if (key === 'GOOGLE_CLIENT_ID') return 'mock-google-client-id';
        return 'mock-secret';
      }),
    };

    mailServiceMock = {
      sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
      sendPasswordResetOtpEmail: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Session), useValue: sessionRepo },
        { provide: getRepositoryToken(EmailVerification), useValue: emailVerificationRepo },
        { provide: getRepositoryToken(PasswordResetToken), useValue: passwordResetTokenRepo },
        { provide: DataSource, useValue: dataSourceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: MAIL_SERVICE, useValue: mailServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================
  // 1. REGISTER & EMAIL VERIFICATION
  // ==========================================
  describe('register', () => {
    it('creates inactive user, verification record in transaction and sends email', async () => {
      userRepo.findOne = vi.fn().mockResolvedValue(null);

      const result = await service.register({
        email: 'newuser@example.com',
        password: 'Password123!',
        full_name: 'New User',
      });

      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email: 'newuser@example.com' } });
      expect(dataSourceMock.transaction).toHaveBeenCalled();
      expect(mailServiceMock.sendVerificationEmail).toHaveBeenCalledWith(
        'newuser@example.com',
        'New User',
        expect.any(String),
      );
      expect(result.email).toBe('newuser@example.com');
      expect(result.message).toContain('Đăng ký thành công');
    });

    it('throws ConflictException if email is already registered', async () => {
      userRepo.findOne = vi.fn().mockResolvedValue({ id: 'existing-id', email: 'taken@example.com' });

      await expect(
        service.register({
          email: 'taken@example.com',
          password: 'Password123!',
          full_name: 'Existing User',
        }),
      ).rejects.toThrow(ConflictException);

      expect(dataSourceMock.transaction).not.toHaveBeenCalled();
      expect(mailServiceMock.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('rolls back and propagates error if mail sending fails', async () => {
      userRepo.findOne = vi.fn().mockResolvedValue(null);
      mailServiceMock.sendVerificationEmail = vi.fn().mockRejectedValue(new Error('SMTP down'));

      await expect(
        service.register({
          email: 'smtp.fail@example.com',
          password: 'Password123!',
          full_name: 'SMTP Fail',
        }),
      ).rejects.toThrow('SMTP down');
    });
  });

  describe('verifyEmail', () => {
    it('activates user and deletes verification record on valid token', async () => {
      const mockUser = { id: 'u1', email: 'test@example.com', is_active: false } as User;
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      emailVerificationRepo.findOne = vi.fn().mockResolvedValue({
        id: 'ev1',
        token_hash: 'somehash',
        expires_at: futureDate,
        user: mockUser,
      });

      const res = await service.verifyEmail('valid-token-raw');

      expect(res.success).toBe(true);
      expect(mockUser.is_active).toBe(true);
      expect(userRepo.save).toHaveBeenCalledWith(mockUser);
      expect(emailVerificationRepo.delete).toHaveBeenCalledWith('ev1');
    });

    it('throws BadRequestException on empty rawToken', async () => {
      await expect(service.verifyEmail('')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when token does not exist or was used', async () => {
      emailVerificationRepo.findOne = vi.fn().mockResolvedValue(null);
      await expect(service.verifyEmail('nonexistent-token')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException and deletes record when token is expired', async () => {
      const expiredDate = new Date(Date.now() - 1000 * 60);
      emailVerificationRepo.findOne = vi.fn().mockResolvedValue({
        id: 'ev-expired',
        expires_at: expiredDate,
        user: { id: 'u1' },
      });

      await expect(service.verifyEmail('expired-token')).rejects.toThrow(BadRequestException);
      expect(emailVerificationRepo.delete).toHaveBeenCalledWith('ev-expired');
      expect(userRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('resendVerificationEmail', () => {
    it('returns generic message without error when email does not exist (anti-enumeration)', async () => {
      userRepo.findOne = vi.fn().mockResolvedValue(null);

      const res = await service.resendVerificationEmail('ghost@example.com');
      expect(res.message).toContain('Nếu địa chỉ email tồn tại');
      expect(mailServiceMock.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('throws ConflictException if account is already activated', async () => {
      userRepo.findOne = vi.fn().mockResolvedValue({ id: 'u1', email: 'active@example.com', is_active: true });

      await expect(service.resendVerificationEmail('active@example.com')).rejects.toThrow(ConflictException);
      expect(mailServiceMock.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('deletes old tokens, creates new token, and sends email for inactive account', async () => {
      const user = { id: 'u-inactive', email: 'inactive@example.com', full_name: 'Inactive', is_active: false };
      userRepo.findOne = vi.fn().mockResolvedValue(user);

      const res = await service.resendVerificationEmail('inactive@example.com');

      expect(emailVerificationRepo.delete).toHaveBeenCalledWith({ user_id: 'u-inactive' });
      expect(emailVerificationRepo.save).toHaveBeenCalled();
      expect(mailServiceMock.sendVerificationEmail).toHaveBeenCalledWith(
        'inactive@example.com',
        'Inactive',
        expect.any(String),
      );
      expect(res.message).toContain('Email kích hoạt mới đã được gửi');
    });
  });

  // ==========================================
  // 2. LOGIN
  // ==========================================
  describe('login', () => {
    it('successfully logs in active user with correct password', async () => {
      const password = 'Password123!';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        full_name: 'Test User',
        password_hash: hashedPassword,
        avatar_url: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        sessions: [],
        email_verifications: [],
        workspace_memberships: [],
      };

      userRepo.findOne = vi.fn().mockResolvedValue(user);

      const result = await service.login({ email: 'test@example.com', password });

      expect(result.accessToken).toBe('mock-jwt-access-token');
      expect(result.refreshToken).toMatch(/^mock-session-id\.[a-f0-9]{128}$/);
      expect(result.user.email).toBe('test@example.com');
      expect(sessionRepo.save).toHaveBeenCalled();
    });

    it('throws UnauthorizedException if user does not exist', async () => {
      userRepo.findOne = vi.fn().mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@example.com', password: 'Password123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws ForbiddenException if user is not active yet', async () => {
      userRepo.findOne = vi.fn().mockResolvedValue({
        id: 'user-inactive',
        email: 'pending@example.com',
        is_active: false,
      });

      await expect(
        service.login({ email: 'pending@example.com', password: 'Password123!' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws UnauthorizedException if password does not match', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword123', 10);
      userRepo.findOne = vi.fn().mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password_hash: hashedPassword,
        is_active: true,
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'WrongPassword999' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ==========================================
  // 3. GOOGLE LOGIN
  // ==========================================
  describe('googleLogin', () => {
    it('throws BadRequestException if neither credential nor accessToken is provided', async () => {
      await expect(service.googleLogin({})).rejects.toThrow(BadRequestException);
    });

    it('authenticates with ID token and auto-registers new active user', async () => {
      (service as any).googleClient = {
        verifyIdToken: vi.fn().mockResolvedValue({
          getPayload: () => ({
            email: 'google.new@example.com',
            email_verified: true,
            name: 'Google User',
            picture: 'https://avatar.url',
          }),
        }),
      };
      userRepo.findOne = vi.fn().mockResolvedValue(null);

      const result = await service.googleLogin({ credential: 'valid-google-id-token' });

      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'google.new@example.com',
          full_name: 'Google User',
          is_active: true,
        }),
      );
      expect(result.accessToken).toBe('mock-jwt-access-token');
      expect(result.user.email).toBe('google.new@example.com');
    });

    it('rejects Google ID token if email_verified is false', async () => {
      (service as any).googleClient = {
        verifyIdToken: vi.fn().mockResolvedValue({
          getPayload: () => ({
            email: 'unverified@example.com',
            email_verified: false,
          }),
        }),
      };

      await expect(
        service.googleLogin({ credential: 'fake-unverified-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('links Google login with existing inactive user and activates them', async () => {
      (service as any).googleClient = {
        verifyIdToken: vi.fn().mockResolvedValue({
          getPayload: () => ({
            email: 'existing.inactive@example.com',
            email_verified: true,
            name: 'Existing Inactive',
            picture: 'https://new-avatar.url',
          }),
        }),
      };

      const existingUser: User = {
        id: 'u-existing',
        email: 'existing.inactive@example.com',
        full_name: 'Existing Inactive',
        password_hash: 'hash',
        avatar_url: null,
        is_active: false,
        created_at: new Date(),
        updated_at: new Date(),
        sessions: [],
        email_verifications: [],
        workspace_memberships: [],
      };
      userRepo.findOne = vi.fn().mockResolvedValue(existingUser);

      const result = await service.googleLogin({ credential: 'valid-token' });

      expect(existingUser.is_active).toBe(true);
      expect(existingUser.avatar_url).toBe('https://new-avatar.url');
      expect(userRepo.save).toHaveBeenCalledWith(existingUser);
      expect(result.user.email).toBe('existing.inactive@example.com');
    });

    it('authenticates with accessToken via Google userinfo endpoint', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          email: 'access.token@example.com',
          email_verified: true,
          name: 'Access Token User',
          picture: 'https://pic.url',
        }),
      });
      global.fetch = mockFetch;

      userRepo.findOne = vi.fn().mockResolvedValue(null);

      const result = await service.googleLogin({ accessToken: 'valid-access-token' });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        expect.any(Object),
      );
      expect(result.user.email).toBe('access.token@example.com');
    });

    it('throws UnauthorizedException if Google userinfo request fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false });

      await expect(
        service.googleLogin({ accessToken: 'bad-access-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ==========================================
  // 4. REFRESH TOKEN & REUSE DETECTION
  // ==========================================
  describe('refreshToken & Token Reuse Detection', () => {
    it('throws UnauthorizedException on invalid cookie format', async () => {
      await expect(service.refreshToken('malformed-token')).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshToken('')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when session does not exist in db', async () => {
      sessionRepo.findOne = vi.fn().mockResolvedValue(null);
      await expect(service.refreshToken('sess-1.rawtoken')).rejects.toThrow(UnauthorizedException);
    });

    it('kills session immediately upon Token Reuse Detection', async () => {
      const session = {
        id: 'sess-target',
        refresh_token_hash: 'legitimate_hash',
        expires_at: new Date(Date.now() + 1000 * 60 * 60),
        user: { id: 'u1', email: 'test@example.com' },
      };
      sessionRepo.findOne = vi.fn().mockResolvedValue(session);

      // Pass an old/stolen token whose SHA256 does NOT match legitimate_hash
      await expect(service.refreshToken('sess-target.stolen_old_raw_token')).rejects.toThrow(
        UnauthorizedException,
      );

      // Session must be purged from database to protect user
      expect(sessionRepo.delete).toHaveBeenCalledWith('sess-target');
    });

    it('throws UnauthorizedException and cleans up expired session', async () => {
      const rawToken = 'fresh_token';
      const hash = (service as any).hashToken(rawToken);
      const expiredSession = {
        id: 'sess-expired',
        refresh_token_hash: hash,
        expires_at: new Date(Date.now() - 1000), // past
        user: { id: 'u1', email: 'test@example.com' },
      };
      sessionRepo.findOne = vi.fn().mockResolvedValue(expiredSession);

      await expect(service.refreshToken(`sess-expired.${rawToken}`)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(sessionRepo.delete).toHaveBeenCalledWith('sess-expired');
    });

    it('rotates refresh token and returns new tokens on valid session', async () => {
      const rawToken = 'fresh_token';
      const hash = (service as any).hashToken(rawToken);
      const validSession = {
        id: 'sess-valid',
        refresh_token_hash: hash,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
        user: { id: 'u1', email: 'valid@example.com', full_name: 'Valid', avatar_url: null },
      };
      sessionRepo.findOne = vi.fn().mockResolvedValue(validSession);

      const result = await service.refreshToken(`sess-valid.${rawToken}`);

      expect(result.accessToken).toBe('mock-jwt-access-token');
      expect(result.refreshToken).toMatch(/^sess-valid\.[a-f0-9]{128}$/);
      expect(sessionRepo.save).toHaveBeenCalled();
    });
  });

  // ==========================================
  // 5. LOGOUT
  // ==========================================
  describe('logout', () => {
    it('deletes session from database when valid cookie is provided', async () => {
      const res = await service.logout('session-id-123.some-raw-token');
      expect(sessionRepo.delete).toHaveBeenCalledWith('session-id-123');
      expect(res.success).toBe(true);
    });

    it('handles empty cookie gracefully', async () => {
      const res = await service.logout('');
      expect(sessionRepo.delete).not.toHaveBeenCalled();
      expect(res.success).toBe(true);
    });
  });

  // ==========================================
  // 6. DTO VALIDATION (Adversarial inputs)
  // ==========================================
  describe('Auth DTO Validation', () => {
    it('rejects invalid email and short password in LoginDto', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'not-an-email',
        password: '123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const errorProperties = errors.map((e) => e.property);
      expect(errorProperties).toContain('email');
      expect(errorProperties).toContain('password');
    });

    it('accepts valid LoginDto', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'user@example.com',
        password: 'validpassword123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('rejects short password (<8) and empty name in RegisterDto', async () => {
      const dto = plainToInstance(RegisterDto, {
        email: 'user@example.com',
        password: '12345',
        full_name: '',
      });
      const errors = await validate(dto);
      const errorProperties = errors.map((e) => e.property);
      expect(errorProperties).toContain('password');
      expect(errorProperties).toContain('full_name');
    });

    it('accepts valid RegisterDto', async () => {
      const dto = plainToInstance(RegisterDto, {
        email: 'valid@example.com',
        password: 'SecurePassword123',
        full_name: 'Nguyen Van A',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('rejects invalid ForgotPasswordDto and accepts valid one', async () => {
      const invalidDto = plainToInstance(ForgotPasswordDto, { email: 'invalid-email' });
      const errors = await validate(invalidDto);
      expect(errors.length).toBeGreaterThan(0);

      const validDto = plainToInstance(ForgotPasswordDto, { email: 'valid@example.com' });
      const validErrors = await validate(validDto);
      expect(validErrors.length).toBe(0);
    });

    it('validates VerifyOtpDto', async () => {
      const invalidDto = plainToInstance(VerifyOtpDto, { email: 'invalid', otp: '123' });
      const errors = await validate(invalidDto);
      expect(errors.length).toBeGreaterThan(0);

      const validDto = plainToInstance(VerifyOtpDto, { email: 'valid@example.com', otp: '123456' });
      const validErrors = await validate(validDto);
      expect(validErrors.length).toBe(0);
    });

    it('validates ResetPasswordDto', async () => {
      const invalidDto = plainToInstance(ResetPasswordDto, { email: 'invalid', otp: '12', newPassword: '123' });
      const errors = await validate(invalidDto);
      expect(errors.length).toBeGreaterThan(0);

      const validDto = plainToInstance(ResetPasswordDto, { email: 'valid@example.com', otp: '123456', newPassword: 'securePassword123' });
      const validErrors = await validate(validDto);
      expect(validErrors.length).toBe(0);
    });
  });

  // ==========================================
  // 7. FORGOT PASSWORD / OTP / RESET PASSWORD
  // ==========================================
  describe('forgotPassword', () => {
    it('returns generic message without error if user does not exist (anti-enumeration)', async () => {
      vi.mocked(userRepo.findOne!).mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@example.com');
      expect(result.message).toContain('Nếu địa chỉ email tồn tại');
      expect(mailServiceMock.sendPasswordResetOtpEmail).not.toHaveBeenCalled();
    });

    it('returns generic message if user exists but inactive', async () => {
      vi.mocked(userRepo.findOne!).mockResolvedValue({ id: 'u1', email: 'test@example.com', is_active: false } as User);

      const result = await service.forgotPassword('test@example.com');
      expect(result.message).toContain('Nếu địa chỉ email tồn tại');
      expect(mailServiceMock.sendPasswordResetOtpEmail).not.toHaveBeenCalled();
    });

    it('deletes old tokens, creates new OTP record and sends email if user active', async () => {
      const mockUser = { id: 'u1', email: 'test@example.com', full_name: 'Test User', is_active: true } as User;
      vi.mocked(userRepo.findOne!).mockResolvedValue(mockUser);

      const result = await service.forgotPassword('test@example.com');
      expect(result.message).toContain('Nếu địa chỉ email tồn tại');
      expect(passwordResetTokenRepo.delete).toHaveBeenCalledWith({ user_id: 'u1' });
      expect(passwordResetTokenRepo.save).toHaveBeenCalled();
      expect(mailServiceMock.sendPasswordResetOtpEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.full_name,
        expect.any(String),
      );
    });
  });

  describe('verifyOtp', () => {
    it('throws BadRequestException if user does not exist', async () => {
      vi.mocked(userRepo.findOne!).mockResolvedValue(null);
      await expect(service.verifyOtp('none@example.com', '123456')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if token not found or already used', async () => {
      vi.mocked(userRepo.findOne!).mockResolvedValue({ id: 'u1', email: 'test@example.com' } as User);
      vi.mocked(passwordResetTokenRepo.findOne!).mockResolvedValue(null);

      await expect(service.verifyOtp('test@example.com', '123456')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if token has expired', async () => {
      vi.mocked(userRepo.findOne!).mockResolvedValue({ id: 'u1', email: 'test@example.com' } as User);
      const expiredDate = new Date();
      expiredDate.setMinutes(expiredDate.getMinutes() - 1);
      vi.mocked(passwordResetTokenRepo.findOne!).mockResolvedValue({
        id: 'token-1',
        expires_at: expiredDate,
        is_used: false,
      } as PasswordResetToken);

      await expect(service.verifyOtp('test@example.com', '123456')).rejects.toThrow(BadRequestException);
    });

    it('returns valid: true on valid OTP', async () => {
      vi.mocked(userRepo.findOne!).mockResolvedValue({ id: 'u1', email: 'test@example.com' } as User);
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 10);
      vi.mocked(passwordResetTokenRepo.findOne!).mockResolvedValue({
        id: 'token-1',
        expires_at: futureDate,
        is_used: false,
      } as PasswordResetToken);

      const result = await service.verifyOtp('test@example.com', '123456');
      expect(result.valid).toBe(true);
    });
  });

  describe('resetPassword', () => {
    it('throws BadRequestException if token is invalid or expired', async () => {
      vi.mocked(userRepo.findOne!).mockResolvedValue({ id: 'u1', email: 'test@example.com' } as User);
      vi.mocked(passwordResetTokenRepo.findOne!).mockResolvedValue(null);

      await expect(service.resetPassword('test@example.com', '123456', 'NewPassword123!')).rejects.toThrow(BadRequestException);
    });

    it('resets password, marks token used and deletes sessions', async () => {
      const mockUser = { id: 'u1', email: 'test@example.com', password_hash: 'old_hash' } as User;
      vi.mocked(userRepo.findOne!).mockResolvedValue(mockUser);

      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 10);
      const mockToken = {
        id: 'token-1',
        expires_at: futureDate,
        is_used: false,
      } as PasswordResetToken;
      vi.mocked(passwordResetTokenRepo.findOne!).mockResolvedValue(mockToken);

      const result = await service.resetPassword('test@example.com', '123456', 'NewPassword123!');

      expect(userRepo.save).toHaveBeenCalled();
      expect(mockToken.is_used).toBe(true);
      expect(passwordResetTokenRepo.save).toHaveBeenCalledWith(mockToken);
      expect(sessionRepo.delete).toHaveBeenCalledWith({ user: { id: 'u1' } });
      expect(result.message).toContain('thành công');
    });
  });
});
