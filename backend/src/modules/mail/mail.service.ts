import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import type { IMailService } from './interfaces/mail-service.interface.js';

@Injectable()
export class MailService implements IMailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initTransporter();
  }

  /**
   * Khởi tạo kết nối Brevo SMTP từ cấu hình file .env
   */
  private initTransporter() {
    const host = this.configService.get<string>('SMTP_HOST', 'smtp-relay.brevo.com');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`Brevo SMTP đã kết nối thành công với tài khoản: ${user}`);
    } else {
      this.logger.warn(
        'Chưa cấu hình SMTP_USER và SMTP_PASS trong .env! Link kích hoạt sẽ được in trực tiếp ra Terminal.',
      );
    }
  }

  /**
   * Gửi email kích hoạt tài khoản Tasko qua Brevo
   */
  async sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:5173',
    );
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    // Luôn in link ra console Terminal trong môi trường dev để test tức thì
    this.logger.log(`\n===============================================================`);
    this.logger.log(` [TASK - XÁC THỰC EMAIL CHO]: ${to}`);
    this.logger.log(` Link kích hoạt tài khoản:`);
    this.logger.log(`   ${verificationUrl}`);
    this.logger.log(`===============================================================\n`);

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="margin-bottom: 24px; text-align: center;">
          <h1 style="color: #0f172a; font-size: 26px; font-weight: 800; margin: 0;">Tasko</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Nền tảng Quản trị Dự án & Công việc Agile</p>
        </div>
        
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #1e293b; font-size: 18px; font-weight: 600; margin-top: 0;">Xin chào ${name},</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
            Cảm ơn bạn đã đăng ký tài khoản tại <strong>Tasko</strong>. Để bắt đầu quản lý dự án cùng đội ngũ, vui lòng nhấn vào nút bên dưới để xác thực địa chỉ email của bạn:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
              Kích hoạt tài khoản ngay
            </a>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 0;">
            <em>Lưu ý: Link kích hoạt này sẽ hết hạn trong vòng <strong>24 giờ</strong>. Nếu nút bấm không hoạt động, bạn có thể sao chép liên kết sau dán vào trình duyệt:</em><br>
            <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all;">${verificationUrl}</a>
          </p>
        </div>

        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
          Nếu bạn không tạo tài khoản trên Tasko, vui lòng bỏ qua email này.<br>
          © 2026 Tasko. Bản quyền thuộc về Nhóm phát triển.
        </p>
      </div>
    `;

    // Gửi email qua Brevo SMTP
    if (this.transporter) {
      const from = this.configService.get<string>(
        'SMTP_FROM',
        '"Tasko Team" <tasko3636@gmail.com>',
      );

      try {
        await this.transporter.sendMail({
          from,
          to,
          subject: '[Tasko] Kích hoạt tài khoản của bạn',
          html: htmlContent,
        });
        this.logger.log(`Đã gửi email qua Brevo SMTP thành công tới: ${to}`);
      } catch (error: any) {
        this.logger.error(`Lỗi khi gửi email qua Brevo SMTP: ${error.message}`);
      }
    }
  }

  /**
   * Gửi email chứa mã OTP để đặt lại mật khẩu
   */
  async sendPasswordResetOtpEmail(to: string, name: string, otp: string): Promise<void> {
    // Luôn in OTP ra console Terminal trong môi trường dev để test tức thì
    this.logger.log(`\n===============================================================`);
    this.logger.log(` [TASK - ĐẶT LẠI MẬT KHẨU CHO]: ${to}`);
    this.logger.log(` Mã OTP đặt lại mật khẩu:`);
    this.logger.log(`   ${otp}`);
    this.logger.log(` (Mã có hiệu lực trong 15 phút)`);
    this.logger.log(`===============================================================\n`);

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="margin-bottom: 24px; text-align: center;">
          <h1 style="color: #0f172a; font-size: 26px; font-weight: 800; margin: 0;">Tasko</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Nền tảng Quản trị Dự án &amp; Công việc Agile</p>
        </div>

        <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #1e293b; font-size: 18px; font-weight: 600; margin-top: 0;">Xin chào ${name},</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>Tasko</strong> của bạn. Vui lòng sử dụng mã OTP bên dưới để xác nhận:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 16px 40px; font-size: 32px; font-weight: 800; letter-spacing: 10px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
              ${otp}
            </div>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 0; text-align: center;">
            <em>Mã OTP này có hiệu lực trong <strong>15 phút</strong> kể từ khi nhận được email.</em><br>
            Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và tài khoản của bạn vẫn an toàn.
          </p>
        </div>

        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
          Vì lý do bảo mật, không chia sẻ mã này với bất kỳ ai.<br>
          © 2026 Tasko. Bản quyền thuộc về Nhóm phát triển.
        </p>
      </div>
    `;

    // Gửi email qua Brevo SMTP
    if (this.transporter) {
      const from = this.configService.get<string>(
        'SMTP_FROM',
        '"Tasko Team" <tasko3636@gmail.com>',
      );

      try {
        await this.transporter.sendMail({
          from,
          to,
          subject: '[Tasko] Mã OTP đặt lại mật khẩu của bạn',
          html: htmlContent,
        });
        this.logger.log(`Đã gửi email OTP qua Brevo SMTP thành công tới: ${to}`);
      } catch (error: any) {
        this.logger.error(`Lỗi khi gửi email OTP qua Brevo SMTP: ${error.message}`);
      }
    }
  }
}
