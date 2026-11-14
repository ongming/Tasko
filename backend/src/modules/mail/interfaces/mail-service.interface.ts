export const MAIL_SERVICE = 'MAIL_SERVICE';

export interface IMailService {
  /**
   * Gửi email xác thực kèm link kích hoạt tài khoản
   * @param to Địa chỉ email người nhận
   * @param name Tên người dùng hiển thị
   * @param token Mã kích hoạt an toàn (raw verification token)
   */
  sendVerificationEmail(to: string, name: string, token: string): Promise<void>;

  /**
   * Gửi email chứa mã OTP để đặt lại mật khẩu
   * @param to Địa chỉ email người nhận
   * @param name Tên người dùng hiển thị
   * @param otp Mã OTP 6 chữ số
   */
  sendPasswordResetOtpEmail(to: string, name: string, otp: string): Promise<void>;
}
