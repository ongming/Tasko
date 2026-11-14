import { describe, it, expect, vi, beforeEach } from 'vitest'
import { userService } from './userService'
import { api } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}))

describe('userService - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gọi đúng endpoint GET /users/me', async () => {
    const mockUser = {
      id: 'u-1',
      email: 'alex@example.com',
      full_name: 'Alex Johnson',
      avatar_url: null,
    }
    vi.mocked(api.get).mockResolvedValue(mockUser)

    const result = await userService.getProfile()
    expect(api.get).toHaveBeenCalledWith('/users/me')
    expect(result).toEqual(mockUser)
  })

  it('gọi đúng endpoint PATCH /users/me với payload fullName', async () => {
    const payload = { fullName: 'Alex Smith' }
    const mockUser = {
      id: 'u-1',
      email: 'alex@example.com',
      full_name: 'Alex Smith',
      avatar_url: null,
    }
    vi.mocked(api.patch).mockResolvedValue(mockUser)

    const result = await userService.updateProfile(payload)
    expect(api.patch).toHaveBeenCalledWith('/users/me', payload)
    expect(result).toEqual(mockUser)
  })

  it('gọi đúng endpoint POST /users/me/avatar với FormData chứa file', async () => {
    const fakeFile = new File(['content'], 'avatar.png', { type: 'image/png' })
    const mockResponse = {
      id: 'u-1',
      email: 'alex@example.com',
      full_name: 'Alex Johnson',
      avatar_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    }
    vi.mocked(api.post).mockResolvedValue(mockResponse)

    const result = await userService.uploadAvatar(fakeFile)
    expect(api.post).toHaveBeenCalledWith('/users/me/avatar', expect.any(FormData))
    expect(result).toEqual(mockResponse)
  })

  it('gọi đúng endpoint PATCH /users/me/password với payload đổi mật khẩu', async () => {
    const payload = {
      currentPassword: 'CurrentPass123!',
      newPassword: 'BrandNewPass123!',
    }
    const mockResponse = { message: 'Đổi mật khẩu thành công.' }
    vi.mocked(api.patch).mockResolvedValue(mockResponse)

    const result = await userService.changePassword(payload)
    expect(api.patch).toHaveBeenCalledWith('/users/me/password', payload)
    expect(result).toEqual(mockResponse)
  })
})
