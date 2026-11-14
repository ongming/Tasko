import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 1. LẤY THÔNG TIN HỒ SƠ NGƯỜI DÙNG HIỆN TẠI
   * GET /api/v1/users/me
   */
  @Get('me')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  /**
   * 2. CẬP NHẬT HỒ SƠ CÁ NHÂN (HỌ VÀ TÊN)
   * PATCH /api/v1/users/me
   */
  @Patch('me')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  /**
   * 3. TẢI LÊN ẢNH ĐẠI DIỆN LÊN CLOUDINARY
   * POST /api/v1/users/me/avatar
   */
  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (_req, file, callback) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Định dạng ảnh không hợp lệ. Chỉ chấp nhận JPG, PNG hoặc WEBP.',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn tệp ảnh để tải lên.');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Kích thước ảnh vượt quá giới hạn 5MB.');
    }
    return this.usersService.updateAvatar(userId, file);
  }

  /**
   * 4. ĐỔI MẬT KHẨU
   * PATCH /api/v1/users/me/password
   */
  @Patch('me/password')
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, changePasswordDto);
  }
}
