import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { User } from '../auth/entities/user.entity.js';
import { Session } from '../auth/entities/session.entity.js';
import type { ICloudinaryService } from '../cloudinary/interfaces/cloudinary-service.interface.js';
import { CLOUDINARY_SERVICE } from '../cloudinary/interfaces/cloudinary-service.interface.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';

export interface SanitizedUser {
  id: string;
  email: string;
  full_name: string;
  fullName: string;
  avatar_url: string | null;
  avatarUrl: string | null;
  is_active: boolean;
  emailVerified: boolean;
  hasPassword: boolean;
  created_at: Date;
  createdAt: Date;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,

    @Inject(CLOUDINARY_SERVICE)
    private readonly cloudinaryService: ICloudinaryService,
  ) {}

  /**
   * Helper chuyển đổi User Entity sang định dạng an toàn cho Frontend
   */
  private sanitizeUser(user: User): SanitizedUser {
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      fullName: user.full_name,
      avatar_url: user.avatar_url,
      avatarUrl: user.avatar_url,
      is_active: user.is_active,
      emailVerified: user.is_active,
      hasPassword: Boolean(user.password_hash),
      created_at: user.created_at,
      createdAt: user.created_at,
    };
  }

  /**
   * Lấy thông tin hồ sơ người dùng đang đăng nhập
   */
  async getProfile(userId: string): Promise<SanitizedUser> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin người dùng.');
    }
    return this.sanitizeUser(user);
  }

  /**
   * Cập nhật thông tin hồ sơ (Họ và tên)
   */
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<SanitizedUser> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin người dùng.');
    }

    if (dto.fullName !== undefined) {
      user.full_name = dto.fullName.trim();
    }

    const saved = await this.userRepository.save(user);
    return this.sanitizeUser(saved);
  }

  /**
   * Tải ảnh đại diện lên Cloudinary và cập nhật URL vào CSDL
   */
  async updateAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<SanitizedUser> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin người dùng.');
    }

    const avatarUrl = await this.cloudinaryService.uploadImage(
      file,
      'tasko/avatars',
    );
    user.avatar_url = avatarUrl;

    const saved = await this.userRepository.save(user);
    return this.sanitizeUser(saved);
  }

  /**
   * Đổi mật khẩu tài khoản
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin người dùng.');
    }

    // Nếu tài khoản chưa có password_hash (đăng ký qua Google chưa có mật khẩu)
    if (!user.password_hash) {
      throw new BadRequestException(
        'Tài khoản đăng nhập bằng Google chưa được thiết lập mật khẩu.',
      );
    }

    // So khớp mật khẩu hiện tại
    const isMatch = await bcrypt.compare(
      dto.currentPassword,
      user.password_hash,
    );
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu hiện tại không chính xác.');
    }

    // Kiểm tra mật khẩu mới không được trùng mật khẩu cũ
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'Mật khẩu mới không được trùng với mật khẩu hiện tại.',
      );
    }

    // Băm mật khẩu mới bằng bcrypt với 10 salt rounds (chuẩn auth.service)
    const saltRounds = 10;
    user.password_hash = await bcrypt.hash(dto.newPassword, saltRounds);
    await this.userRepository.save(user);

    return { message: 'Đổi mật khẩu thành công.' };
  }
}
