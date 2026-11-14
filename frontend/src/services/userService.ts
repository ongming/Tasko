import { api } from '@/lib/api'
import type {
  User,
  UpdateProfilePayload,
  ChangePasswordPayload,
  SimpleMessageResponse,
} from '@/types/auth'

export const userService = {
  /**
   * Lấy thông tin hồ sơ tài khoản hiện tại
   * GET /api/v1/users/me
   */
  getProfile: () => api.get<User>('/users/me'),

  /**
   * Cập nhật thông tin hồ sơ cá nhân (Họ và tên)
   * PATCH /api/v1/users/me
   */
  updateProfile: (data: UpdateProfilePayload) =>
    api.patch<User>('/users/me', data),

  /**
   * Tải lên ảnh đại diện mới lên Cloudinary
   * POST /api/v1/users/me/avatar
   */
  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<User>('/users/me/avatar', formData)
  },

  /**
   * Đổi mật khẩu tài khoản
   * PATCH /api/v1/users/me/password
   */
  changePassword: (data: ChangePasswordPayload) =>
    api.patch<SimpleMessageResponse>('/users/me/password', data),
}

export default userService
