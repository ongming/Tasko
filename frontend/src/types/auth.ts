/**
 * Kiểu dữ liệu thực thể User
 */
export interface User {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
}

/**
 * Payloads gửi lên Backend (camelCase chuẩn API Tasko)
 */
export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  full_name: string
}

export interface GoogleLoginPayload {
  credential?: string
  accessToken?: string
}

export interface ResendVerificationPayload {
  email: string
}

/**
 * Phản hồi từ Backend đã unwrap data
 */
export interface LoginResponse {
  accessToken: string
  user: User
}

export interface RegisterResponse {
  id: string
  email: string
  full_name: string
  message: string
}

export interface VerifyEmailResponse {
  success: boolean
  message: string
}

export interface SimpleMessageResponse {
  message: string
}
