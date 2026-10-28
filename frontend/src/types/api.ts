/**
 * Định nghĩa lỗi chuẩn từ API backend Tasko
 * Response định dạng: { statusCode, message, data }
 */
export class ApiError extends Error {
  readonly statusCode: number
  readonly code?: string
  readonly data?: any

  constructor(message: string, statusCode: number, code?: string, data?: any) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.data = data
  }
}

export interface ApiResponse<T = any> {
  statusCode: number
  message: string
  data: T
}
