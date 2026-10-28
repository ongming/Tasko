import { api } from '@/lib/api'
import type {
  User,
  LoginPayload,
  RegisterPayload,
  GoogleLoginPayload,
  LoginResponse,
  RegisterResponse,
  VerifyEmailResponse,
  SimpleMessageResponse,
} from '@/types/auth'

export type {
  LoginPayload,
  RegisterPayload,
  GoogleLoginPayload,
  LoginResponse,
  RegisterResponse,
  VerifyEmailResponse,
}

// Giữ lại alias tương thích nếu có code cũ tham chiếu
export type LoginDto = LoginPayload
export type RegisterDto = RegisterPayload

export const authService = {
  /**
   * Đăng ký tài khoản mới
   */
  register: (payload: RegisterPayload) =>
    api.post<RegisterResponse>('/auth/register', payload, { skipAuth: true }),

  /**
   * Đăng nhập (trả về Access Token và gài Cookie Refresh Token)
   */
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>('/auth/login', payload, { skipAuth: true }),

  /**
   * Đăng nhập / Đăng ký qua Google (Hỗ trợ cả Credential và Access Token)
   */
  googleLogin: (payload: GoogleLoginPayload) =>
    api.post<LoginResponse>('/auth/google', payload, { skipAuth: true }),

  /**
   * Xác thực mã kích hoạt email
   */
  verifyEmail: (token: string) =>
    api.get<VerifyEmailResponse>(`/auth/verify-email?token=${encodeURIComponent(token)}`, {
      skipAuth: true,
      headers: { Accept: 'application/json' },
    }),

  /**
   * Gửi lại email kích hoạt
   */
  resendVerification: (email: string) =>
    api.post<SimpleMessageResponse>('/auth/resend-verification', { email }, { skipAuth: true }),

  /**
   * Đăng xuất (xóa session trong DB và clear cookie)
   */
  logout: () => api.post<SimpleMessageResponse>('/auth/logout'),

  /**
   * Lấy thông tin tài khoản hiện tại
   */
  getProfile: () => api.get<User>('/auth/me'),
}
