import { useAuthStore } from '@/stores/authStore'
import { ApiError } from '@/types/api'

export { ApiError }

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

// Biến lưu giữ Promise refresh đang chạy để tránh việc gọi /refresh nhiều lần đồng thời
let refreshPromise: Promise<string | null> | null = null

/**
 * Hàm gọi ngầm API /auth/refresh để lấy Access Token mới khi token cũ hết hạn (Silent Refresh)
 */
async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        useAuthStore.getState().clearAuth()
        return null
      }

      const json = await response.json()
      const { accessToken, user } = json.data

      // Cập nhật State trong Zustand
      useAuthStore.getState().setAuth(user, accessToken)
      return accessToken
    } catch {
      useAuthStore.getState().clearAuth()
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
}

/**
 * Hàm lõi bọc quanh fetch() hỗ trợ tự động gắn Token và Silent Refresh
 */
async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, headers = {}, ...restOptions } = options

  // 1. Chuẩn bị Headers
  const requestHeaders = new Headers(headers)

  if (!requestHeaders.has('Content-Type') && !(restOptions.body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  // Tự động gắn Access Token từ Zustand Store nếu có
  const currentToken = useAuthStore.getState().accessToken
  if (!skipAuth && currentToken && !requestHeaders.has('Authorization')) {
    requestHeaders.set('Authorization', `Bearer ${currentToken}`)
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

  // 2. Thực hiện Request ban đầu (luôn kèm credentials: 'include' để gửi nhận Cookie)
  let response = await fetch(url, {
    ...restOptions,
    headers: requestHeaders,
    credentials: 'include',
  })

  // 3. Xử lý khi Token hết hạn (401 Unauthorized) -> Cơ chế Silent Refresh
  const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/refresh') || endpoint.includes('/auth/register')
  
  if (response.status === 401 && !skipAuth && !isAuthEndpoint) {
    // Gọi API refresh token
    const newAccessToken = await refreshAccessToken()

    if (newAccessToken) {
      // Thử lại request ban đầu với Access Token mới
      requestHeaders.set('Authorization', `Bearer ${newAccessToken}`)
      response = await fetch(url, {
        ...restOptions,
        headers: requestHeaders,
        credentials: 'include',
      })
    }
  }

  // 4. Bóc tách dữ liệu phản hồi
  let responseData: any = null
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    responseData = await response.json()
  } else {
    responseData = await response.text()
  }

  // Nếu request thất bại
  if (!response.ok) {
    const errorMessage = responseData?.message || response.statusText || 'Đã có lỗi xảy ra!'
    const errorCode = responseData?.code || responseData?.error
    throw new ApiError(errorMessage, response.status, errorCode, responseData?.data ?? null)
  }

  return responseData?.data !== undefined ? responseData.data : responseData
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
}
