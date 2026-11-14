import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsersService } from './users.service.js';
import { User } from '../auth/entities/user.entity.js';
import { Session } from '../auth/entities/session.entity.js';
import { CLOUDINARY_SERVICE } from '../cloudinary/interfaces/cloudinary-service.interface.js';

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: Partial<Repository<User>>;
  let sessionRepo: Partial<Repository<Session>>;
  let cloudinaryMock: { uploadImage: any };

  beforeEach(async () => {
    userRepo = {
      findOne: vi.fn(),
      save: vi.fn(async (user: any) => ({ ...user })),
    };

    sessionRepo = {
      delete: vi.fn().mockResolvedValue({ affected: 1 }),
    };

    cloudinaryMock = {
      uploadImage: vi.fn().mockResolvedValue('https://res.cloudinary.com/test/image.jpg'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Session), useValue: sessionRepo },
        { provide: CLOUDINARY_SERVICE, useValue: cloudinaryMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('getProfile', () => {
    it('throws NotFoundException when user does not exist', async () => {
      vi.mocked(userRepo.findOne!).mockResolvedValue(null);
      await expect(service.getProfile('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('returns sanitized user profile without password_hash', async () => {
      const mockUser = {
        id: 'u-1',
        email: 'test@example.com',
        full_name: 'Nguyen Van A',
        avatar_url: 'https://example.com/avatar.jpg',
        password_hash: 'hashed',
        is_active: true,
        created_at: new Date(),
      } as User;
      vi.mocked(userRepo.findOne!).mockResolvedValue(mockUser);

      const result = await service.getProfile('u-1');
      expect(result.id).toBe('u-1');
      expect(result.email).toBe('test@example.com');
      expect(result.fullName).toBe('Nguyen Van A');
      expect(result.hasPassword).toBe(true);
      expect((result as any).password_hash).toBeUndefined();
    });
  });

  describe('updateProfile', () => {
    it('updates fullName and trims whitespace', async () => {
      const mockUser = {
        id: 'u-1',
        email: 'test@example.com',
        full_name: 'Old Name',
        avatar_url: null,
        password_hash: 'hashed',
        is_active: true,
        created_at: new Date(),
      } as User;
      vi.mocked(userRepo.findOne!).mockResolvedValue(mockUser);

      const result = await service.updateProfile('u-1', { fullName: '  New Name  ' });
      expect(result.fullName).toBe('New Name');
      expect(mockUser.full_name).toBe('New Name');
      expect(userRepo.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('updateAvatar', () => {
    it('uploads to Cloudinary and saves new avatar_url', async () => {
      const mockUser = {
        id: 'u-1',
        email: 'test@example.com',
        full_name: 'User One',
        avatar_url: null,
        password_hash: 'hashed',
        is_active: true,
        created_at: new Date(),
      } as User;
      vi.mocked(userRepo.findOne!).mockResolvedValue(mockUser);

      const mockFile = {
        buffer: Buffer.from('mock-img'),
        mimetype: 'image/png',
        size: 1024,
      } as Express.Multer.File;

      const result = await service.updateAvatar('u-1', mockFile);
      expect(cloudinaryMock.uploadImage).toHaveBeenCalledWith(mockFile, 'tasko/avatars');
      expect(result.avatarUrl).toBe('https://res.cloudinary.com/test/image.jpg');
      expect(mockUser.avatar_url).toBe('https://res.cloudinary.com/test/image.jpg');
    });
  });

  describe('changePassword', () => {
    it('throws BadRequestException if user has no password (Google OAuth user)', async () => {
      const mockUser = {
        id: 'u-1',
        password_hash: '',
      } as User;
      vi.mocked(userRepo.findOne!).mockResolvedValue(mockUser);

      await expect(
        service.changePassword('u-1', { currentPassword: '123', newPassword: '456' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws UnauthorizedException if current password does not match', async () => {
      const currentHash = await bcrypt.hash('CorrectPass123', 10);
      const mockUser = {
        id: 'u-1',
        password_hash: currentHash,
      } as User;
      vi.mocked(userRepo.findOne!).mockResolvedValue(mockUser);

      await expect(
        service.changePassword('u-1', { currentPassword: 'WrongPass', newPassword: 'NewPass1234' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws BadRequestException if new password is identical to current password', async () => {
      const currentHash = await bcrypt.hash('SamePassword123', 10);
      const mockUser = {
        id: 'u-1',
        password_hash: currentHash,
      } as User;
      vi.mocked(userRepo.findOne!).mockResolvedValue(mockUser);

      await expect(
        service.changePassword('u-1', { currentPassword: 'SamePassword123', newPassword: 'SamePassword123' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('successfully changes password and saves new hash', async () => {
      const currentHash = await bcrypt.hash('OldPassword123', 10);
      const mockUser = {
        id: 'u-1',
        password_hash: currentHash,
      } as User;
      vi.mocked(userRepo.findOne!).mockResolvedValue(mockUser);

      const result = await service.changePassword('u-1', {
        currentPassword: 'OldPassword123',
        newPassword: 'BrandNewPassword123',
      });
      expect(result.message).toBe('Đổi mật khẩu thành công.');
      expect(userRepo.save).toHaveBeenCalled();
      const isNewMatch = await bcrypt.compare('BrandNewPassword123', mockUser.password_hash);
      expect(isNewMatch).toBe(true);
    });
  });
});
