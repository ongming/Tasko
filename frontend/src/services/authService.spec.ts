import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from './authService'
import { api } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('authService - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gọi đúng endpoint POST /auth/login với skipAuth: true', async () => {
    const payload = { email: 'user@example.com', password: 'Password123!' }
    const mockResponse = {
      accessToken: 'mock-access-token',
      user: { id: 'u1', email: 'user@example.com', full_name: 'User', avatar_url: null },
    }
    vi.mocked(api.post).mockResolvedValue(mockResponse)

    const result = await authService.login(payload)

    expect(api.post).toHaveBeenCalledWith('/auth/login', payload, { skipAuth: true })
    expect(result).toEqual(mockResponse)
  })

  it('gọi đúng endpoint POST /auth/register với payload và skipAuth: true', async () => {
    const payload = {
      email: 'new@example.com',
      password: 'Password123!',
      full_name: 'New Person',
    }
    const mockResponse = {
      id: 'new-id',
      email: 'new@example.com',
      full_name: 'New Person',
      message: 'Đăng ký thành công',
    }
    vi.mocked(api.post).mockResolvedValue(mockResponse)

    const result = await authService.register(payload)

    expect(api.post).toHaveBeenCalledWith('/auth/register', payload, { skipAuth: true })
    expect(result).toEqual(mockResponse)
  })

  it('gọi đúng endpoint POST /auth/google với cả credential hoặc accessToken', async () => {
    const payloadCredential = { credential: 'google-id-token-abc' }
    vi.mocked(api.post).mockResolvedValue({ accessToken: 'tok' })

    await authService.googleLogin(payloadCredential)
    expect(api.post).toHaveBeenCalledWith('/auth/google', payloadCredential, { skipAuth: true })

    const payloadAccessToken = { accessToken: 'google-access-token-xyz' }
    await authService.googleLogin(payloadAccessToken)
    expect(api.post).toHaveBeenCalledWith('/auth/google', payloadAccessToken, { skipAuth: true })
  })

  it('gọi đúng endpoint GET /auth/verify-email và mã hóa token trong URL', async () => {
    const rawToken = 'abc+123/xyz=='
    const mockResponse = { success: true, message: 'Kích hoạt thành công' }
    vi.mocked(api.get).mockResolvedValue(mockResponse)

    const result = await authService.verifyEmail(rawToken)

    expect(api.get).toHaveBeenCalledWith(
      `/auth/verify-email?token=${encodeURIComponent(rawToken)}`,
      { skipAuth: true, headers: { Accept: 'application/json' } },
    )
    expect(result).toEqual(mockResponse)
  })

  it('gọi đúng endpoint POST /auth/resend-verification', async () => {
    const email = 'user@example.com'
    const mockResponse = { message: 'Email đã được gửi' }
    vi.mocked(api.post).mockResolvedValue(mockResponse)

    const result = await authService.resendVerification(email)

    expect(api.post).toHaveBeenCalledWith(
      '/auth/resend-verification',
      { email },
      { skipAuth: true },
    )
    expect(result).toEqual(mockResponse)
  })

  it('gọi đúng endpoint POST /auth/logout', async () => {
    const mockResponse = { message: 'Đăng xuất thành công' }
    vi.mocked(api.post).mockResolvedValue(mockResponse)

    const result = await authService.logout()

    expect(api.post).toHaveBeenCalledWith('/auth/logout')
    expect(result).toEqual(mockResponse)
  })

  it('gọi đúng endpoint GET /auth/me để lấy profile', async () => {
    const mockUser = { id: 'u1', email: 'user@example.com', full_name: 'User', avatar_url: null }
    vi.mocked(api.get).mockResolvedValue(mockUser)

    const result = await authService.getProfile()

    expect(api.get).toHaveBeenCalledWith('/auth/me')
    expect(result).toEqual(mockUser)
  })
})
