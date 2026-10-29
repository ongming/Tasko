import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { User } from './entities/user.entity.js';
import { Session } from './entities/session.entity.js';
import { EmailVerification } from './entities/email-verification.entity.js';
import { MailService } from '../mail/mail.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

export interface AuthTokensResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
  };
}

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,

    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepository: Repository<EmailVerification>,

    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    this.googleClient = new OAuth2Client(clientId);
  }

  /**
   * Hàm tiện ích: Băm Token bằng thuật toán SHA-256
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * 1. ĐĂNG KÝ TÀI KHOẢN MỚI (Tạo tài khoản chưa kích hoạt & Gửi email)
   * Sử dụng Database Transaction để đảm bảo tính trọn vẹn (Atomic)
   */
  async register(
    registerDto: RegisterDto,
  ): Promise<{ id: string; email: string; full_name: string; message: string }> {
    const { email, password, full_name } = registerDto;

    // Kiểm tra xem email đã tồn tại trong CSDL chưa
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Địa chỉ email này đã được sử dụng!');
    }

    // Băm mật khẩu bằng thuật toán bcrypt (salt rounds = 10)
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Tạo Token kích hoạt ngẫu nhiên an toàn (32 bytes hex)
    const rawVerificationToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawVerificationToken);

    // Thời hạn kích hoạt: 24 giờ
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Bọc trong TypeORM Transaction để tạo User và EmailVerification đồng thời
    const savedUser = await this.dataSource.transaction(async (manager) => {
      const newUser = manager.create(User, {
        email,
        password_hash,
        full_name,
        avatar_url: null,
        is_active: false,
      });
      const user = await manager.save(newUser);

      const verification = manager.create(EmailVerification, {
        token_hash: tokenHash,
        expires_at: expiresAt,
        user,
      });
      await manager.save(verification);

      return user;
    });

    // Gửi email kích hoạt (hoặc in ra terminal trong môi trường dev)
    await this.mailService.sendVerificationEmail(
      savedUser.email,
      savedUser.full_name,
      rawVerificationToken,
    );

    return {
      id: savedUser.id,
      email: savedUser.email,
      full_name: savedUser.full_name,
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản của bạn.',
    };
  }

  /**
   * 1.1. XÁC THỰC EMAIL (Kích hoạt tài khoản khi nhấn vào link)
   */
  async verifyEmail(rawToken: string): Promise<{ success: boolean; message: string }> {
    if (!rawToken) {
      throw new BadRequestException('Mã kích hoạt không hợp lệ!');
    }

    const tokenHash = this.hashToken(rawToken);
    const verification = await this.emailVerificationRepository.findOne({
      where: { token_hash: tokenHash },
      relations: { user: true },
    });

    if (!verification) {
      throw new BadRequestException('Mã kích hoạt không tồn tại hoặc đã được sử dụng!');
    }

    // Kiểm tra hết hạn 24 giờ
    if (new Date() > new Date(verification.expires_at)) {
      await this.emailVerificationRepository.delete(verification.id);
      throw new BadRequestException('Mã kích hoạt đã hết hạn! Vui lòng yêu cầu gửi lại email mới.');
    }

    // Kích hoạt tài khoản người dùng
    const user = verification.user;
    user.is_active = true;
    await this.userRepository.save(user);

    // Xóa mã kích hoạt đã sử dụng
    await this.emailVerificationRepository.delete(verification.id);

    return {
      success: true,
      message: 'Kích hoạt tài khoản thành công! Bây giờ bạn đã có thể đăng nhập vào Tasko.',
    };
  }

  /**
   * 1.2. GỬI LẠI EMAIL KÍCH HOẠT (Nếu bị thất lạc hoặc hết hạn)
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Chống User Enumeration: không ném 404 để tránh lộ danh sách email đã đăng ký
      return {
        message: 'Nếu địa chỉ email tồn tại trong hệ thống, liên kết kích hoạt mới đã được gửi.',
      };
    }

    if (user.is_active) {
      throw new ConflictException('Tài khoản này đã được kích hoạt trước đó! Bạn có thể đăng nhập ngay.');
    }

    // Xóa các mã kích hoạt cũ chưa dùng
    await this.emailVerificationRepository.delete({ user_id: user.id });

    // Tạo mã kích hoạt mới
    const rawVerificationToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawVerificationToken);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const verification = this.emailVerificationRepository.create({
      token_hash: tokenHash,
      expires_at: expiresAt,
      user,
    });
    await this.emailVerificationRepository.save(verification);

    // Gửi email
    await this.mailService.sendVerificationEmail(
      user.email,
      user.full_name,
      rawVerificationToken,
    );

    return {
      message: 'Email kích hoạt mới đã được gửi! Vui lòng kiểm tra hộp thư của bạn.',
    };
  }

  /**
   * 2. ĐĂNG NHẬP (Tạo Access Token + Refresh Token + Lưu Session)
   */
  async login(loginDto: LoginDto): Promise<AuthTokensResult> {
    const { email, password } = loginDto;

    // Tìm User theo email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
    }

    if (!user.is_active) {
      throw new ForbiddenException(
        'Tài khoản của bạn chưa được kích hoạt! Vui lòng kiểm tra email để kích hoạt tài khoản trước khi đăng nhập.',
      );
    }

    // So sánh mật khẩu người dùng nhập với password_hash trong database
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
    }

    // Cấp cặp Token và tạo Session phiên đăng nhập
    return this.createSessionAndTokens(user);
  }

  /**
   * 2.1. ĐĂNG NHẬP / ĐĂNG KÝ BẰNG GOOGLE (Hỗ trợ cả ID Token và Access Token)
   */
  async googleLogin(params: { credential?: string; accessToken?: string }): Promise<AuthTokensResult> {
    const { credential, accessToken } = params;
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');

    let email: string | undefined;
    let name: string | undefined;
    let picture: string | undefined;

    // Cách 1: Xác thực qua Google ID Token (Credential)
    if (credential) {
      try {
        const ticket = await this.googleClient.verifyIdToken({
          idToken: credential,
          audience: clientId,
        });
        const payload = ticket.getPayload();
        if (!payload?.email_verified) {
          throw new UnauthorizedException('Email tài khoản Google này chưa được xác minh chính chủ!');
        }
        email = payload?.email;
        name = payload?.name;
        picture = payload?.picture;
      } catch (err: any) {
        if (err instanceof UnauthorizedException) throw err;
        throw new UnauthorizedException('Mã xác thực Google không hợp lệ hoặc đã hết hạn!');
      }
    } 
    // Cách 2: Xác thực qua Google Access Token (Từ popup chuẩn của nút custom)
    else if (accessToken) {
      try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) {
          throw new UnauthorizedException('Không thể xác thực với Google!');
        }
        const data: any = await response.json();
        if (!data?.email_verified) {
          throw new UnauthorizedException('Email tài khoản Google này chưa được xác minh chính chủ!');
        }
        email = data.email;
        name = data.name;
        picture = data.picture;
      } catch (err: any) {
        if (err instanceof UnauthorizedException) throw err;
        throw new UnauthorizedException('Không thể lấy thông tin người dùng từ Google!');
      }
    } else {
      throw new BadRequestException('Vui lòng cung cấp mã xác thực từ Google!');
    }

    if (!email) {
      throw new BadRequestException('Không thể lấy thông tin email từ tài khoản Google!');
    }

    // 1. Tìm User theo email trong CSDL
    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Tạo mật khẩu ngẫu nhiên cho tài khoản đăng ký qua Google
      const randomPassword = randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = this.userRepository.create({
        email,
        full_name: name || 'Người dùng Google',
        password_hash: passwordHash,
        avatar_url: picture || null,
        is_active: true, // Google đã xác minh email, tài khoản kích hoạt ngay lập tức
      });
      user = await this.userRepository.save(user);
    } else {
      // Người dùng đã có tài khoản: kích hoạt nếu chưa và cập nhật avatar nếu chưa có
      let needsUpdate = false;
      if (!user.is_active) {
        user.is_active = true;
        needsUpdate = true;
      }
      if (!user.avatar_url && picture) {
        user.avatar_url = picture;
        needsUpdate = true;
      }
      if (needsUpdate) {
        user = await this.userRepository.save(user);
      }
    }

    // 2. Tạo Session và cấp cặp Token JWT đồng bộ
    return this.createSessionAndTokens(user);
  }

  /**
   * 3. LÀM MỚI TOKEN (Session ID Tracking & Token Reuse Detection)
   * Token trong Cookie có định dạng: `${sessionId}.${rawToken}`
   */
  async refreshToken(rawCookieValue: string): Promise<AuthTokensResult> {
    if (!rawCookieValue || !rawCookieValue.includes('.')) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc đã hết hạn!');
    }

    const [sessionId, rawToken] = rawCookieValue.split('.');
    if (!sessionId || !rawToken) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ!');
    }

    // Tìm Session trong database theo sessionId
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: { user: true },
    });

    // Trường hợp 1: Session không tồn tại (đã logout hoặc đã bị hủy)
    if (!session) {
      throw new UnauthorizedException('Phiên đăng nhập không tồn tại hoặc đã đăng xuất!');
    }

    // Băm token gửi lên để so khớp
    const incomingHash = this.hashToken(rawToken);

    // Trường hợp 2: 🔥 BẮT QUẢ TANG TÁI SỬ DỤNG TRÁI PHÉP (TOKEN REUSE DETECTION)
    // Phiên này đang tồn tại, nhưng token gửi lên KHÔNG KHỚP với token hiện tại
    // => Kẻ gian đã xoay vòng token trước đó và người dùng gửi token cũ lên
    if (session.refresh_token_hash !== incomingHash) {
      // Tiêu diệt ngay phiên này (hacker đang giữ token mới nhất cũng bị văng ra)
      await this.sessionRepository.delete(session.id);
      throw new UnauthorizedException(
        'Cảnh báo: Phiên làm việc đã bị hủy bỏ !',
      );
    }

    // Trường hợp 3: Hết hạn phiên (quá 7 ngày)
    if (new Date() > new Date(session.expires_at)) {
      await this.sessionRepository.delete(session.id);
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại.');
    }

    // Trường hợp 4: ✅ HỢP LỆ 100% -> XOAY VÒNG TOKEN (In-place update)
    const newRawToken = randomBytes(64).toString('hex');
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    session.refresh_token_hash = this.hashToken(newRawToken);
    session.expires_at = newExpiresAt;
    await this.sessionRepository.save(session);

    // Cấp Access Token mới (15 phút)
    const payload = { sub: session.user.id, email: session.user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      refreshToken: `${session.id}.${newRawToken}`,
      user: {
        id: session.user.id,
        email: session.user.email,
        full_name: session.user.full_name,
        avatar_url: session.user.avatar_url,
      },
    };
  }

  /**
   * 4. ĐĂNG XUẤT (Xóa cứng Session khỏi bảng sessions)
   */
  async logout(rawCookieValue: string): Promise<{ success: boolean }> {
    if (!rawCookieValue) {
      return { success: true };
    }

    const [sessionId] = rawCookieValue.split('.');
    if (sessionId) {
      await this.sessionRepository.delete(sessionId);
    }

    return { success: true };
  }

  /**
   * 5. HELPER: Tạo Access Token, Refresh Token ngẫu nhiên và lưu Session
   */
  private async createSessionAndTokens(user: User): Promise<AuthTokensResult> {
    // 1. Tạo Access Token (hạn 15m)
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    // 2. Tạo Refresh Token ngẫu nhiên (chuỗi an toàn 64 bytes hex)
    const rawRefreshToken = randomBytes(64).toString('hex');
    const refreshHash = this.hashToken(rawRefreshToken);

    // 3. Thời gian hết hạn (mặc định 7 ngày)
    const expiresDays = 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresDays);

    // 4. Lưu Session mới vào database
    const session = this.sessionRepository.create({
      refresh_token_hash: refreshHash,
      expires_at: expiresAt,
      user,
    });
    const savedSession = await this.sessionRepository.save(session);

    return {
      accessToken,
      refreshToken: `${savedSession.id}.${rawRefreshToken}`,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
      },
    };
  }

  /**
   * Helper tìm user theo ID (dùng cho JWT Strategy xác thực request)
   */
  async findUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id, is_active: true } });
  }
}
