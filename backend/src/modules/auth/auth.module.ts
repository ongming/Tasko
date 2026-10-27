import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity.js';
import { Session } from './entities/session.entity.js';
import { EmailVerification } from './entities/email-verification.entity.js';
import { MailModule } from '../mail/mail.module.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
  imports: [
    // 1. Khai báo các Entity cho TypeORM quản lý trong phân hệ Auth
    TypeOrmModule.forFeature([User, Session, EmailVerification]),

    // 2. Phân hệ gửi Email
    MailModule,

    // 3. Đăng ký Passport với chiến lược mặc định là 'jwt'
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // 4. Cấu hình JwtModule đọc cấu hình từ file .env / ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET', 'tasko_access_secret_fallback'),
        signOptions: {
          expiresIn: config.get<any>('JWT_ACCESS_EXPIRES_IN', '15m'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
