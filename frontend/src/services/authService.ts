import { api } from '@/lib/api'
import type { User } from '@/stores/authStore'

export interface RegisterDto {
  email: string
  password: string
  full_name: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterResponse {
  id: string
  email: string
  full_name: string
  message: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export const authService = {
  /**
   * Đăng ký tài khoản mới
   */
  register: (data: RegisterDto) =>
    api.post<RegisterResponse>('/auth/register', data, { skipAuth: true }),

  /**
   * Đăng nhập (trả về Access Token và gài Cookie Refresh Token)
   */
  login: (data: LoginDto) =>
    api.post<LoginResponse>('/auth/login', data, { skipAuth: true }),

  /**
   * Gửi lại email kích hoạt
   */
  resendVerification: (email: string) =>
    api.post<{ message: string }>('/auth/resend-verification', { email }, { skipAuth: true }),

  /**
   * Đăng xuất
   */
  logout: () => api.post<{ message: string }>('/auth/logout'),

  /**
   * Lấy thông tin tài khoản hiện tại
   */
  getProfile: () => api.get<User>('/auth/me'),
}
