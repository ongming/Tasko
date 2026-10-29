import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service.js';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      // Tự động trích xuất chuỗi Bearer token từ header 'Authorization: Bearer <token>'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Không bỏ qua token hết hạn (hết hạn là chặn ngay)
      ignoreExpiration: false,
      // Khóa bí mật dùng để xác thực chữ ký của Access Token
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  /**
   * Sau khi Passport xác thực chữ ký token thành công, hàm validate này sẽ được gọi.
   * Dữ liệu trả về ở đây sẽ được gán tự động vào `req.user`.
   */
  async validate(payload: JwtPayload) {
    const user = await this.authService.findUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Tài khoản không tồn tại hoặc đã bị vô hiệu hóa!');
    }

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
    };
  }
}
