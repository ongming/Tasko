import { create } from 'zustand'

export interface User {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Các hàm cập nhật State
  setAuth: (user: User, accessToken: string) => void
  setAccessToken: (accessToken: string) => void
  clearAuth: () => void

  // Kiểm tra và phục hồi phiên đăng nhập khi F5 / mở lại web
  checkAuth: () => Promise<boolean>
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // Mặc định true để chờ kiểm tra phiên khi vừa tải trang

  setAuth: (user: User, accessToken: string) => {
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    })
  },

  setAccessToken: (accessToken: string) => {
    set({
      accessToken,
      isAuthenticated: true,
    })
  },

  clearAuth: () => {
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },

  /**
   * Tự động kiểm tra Cookie Refresh Token để khôi phục phiên làm việc (Silent Auth)
   * Chạy một lần khi người dùng vừa mở trang web hoặc F5
   */
  checkAuth: async () => {
    try {
      set({ isLoading: true })

      // Gọi endpoint /auth/refresh với credentials: 'include' để tự động gửi httpOnly Cookie
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        })
        return false
      }

      const json = await response.json()
      const { user, accessToken } = json.data

      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
      })

      return true
    } catch {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      })
      return false
    }
  },
}))
