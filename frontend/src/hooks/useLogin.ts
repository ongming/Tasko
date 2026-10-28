import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { ApiError } from '@/types/api'

export type FormStatus = 'idle' | 'loading' | 'error' | 'success'

export function useLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((state) => state.setAuth)

  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isUnactivated, setIsUnactivated] = useState(false)

  // Gửi lại email kích hoạt
  const [resendStatus, setResendStatus] = useState<FormStatus>('idle')
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  // Địa chỉ trang đích cần quay về sau khi đăng nhập (mặc định /workspace/board)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/workspace/board'

  const handleLogin = async (email: string, password: string) => {
    try {
      setStatus('loading')
      setErrorMessage(null)
      setIsUnactivated(false)

      const result = await authService.login({
        email: email.trim().toLowerCase(),
        password,
      })

      setAuth(result.user, result.accessToken)
      setStatus('success')
      navigate(from, { replace: true })
    } catch (err: unknown) {
      setStatus('error')
      if (err instanceof ApiError) {
        // Kiểm tra mã trạng thái HTTP theo đúng AGENT.md (không so sánh text)
        if (err.statusCode === 403) {
          setIsUnactivated(true)
        }
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Không thể kết nối tới máy chủ. Vui lòng thử lại sau.')
      }
    }
  }

  // Đăng nhập nhanh qua Google
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setStatus('loading')
        setErrorMessage(null)

        const result = await authService.googleLogin({
          accessToken: tokenResponse.access_token,
        })

        setAuth(result.user, result.accessToken)
        setStatus('success')
        navigate(from, { replace: true })
      } catch (err: unknown) {
        setStatus('error')
        if (err instanceof ApiError) {
          setErrorMessage(err.message)
        } else {
          setErrorMessage('Đăng nhập bằng Google thất bại. Vui lòng thử lại sau.')
        }
      }
    },
    onError: () => {
      setStatus('error')
      setErrorMessage('Đăng nhập bằng Google không thành công hoặc đã bị đóng.')
    },
  })

  // Xử lý gửi lại email kích hoạt nếu tài khoản chưa kích hoạt
  const handleResend = async (email: string) => {
    if (!email) return
    try {
      setResendStatus('loading')
      setResendMessage(null)

      const res = await authService.resendVerification(email.trim().toLowerCase())
      setResendStatus('success')
      setResendMessage(res.message || 'Email kích hoạt mới đã được gửi! Vui lòng kiểm tra hộp thư.')
    } catch (err: unknown) {
      setResendStatus('error')
      if (err instanceof ApiError) {
        setResendMessage(err.message)
      } else {
        setResendMessage('Không thể gửi lại email lúc này. Vui lòng thử lại sau.')
      }
    }
  }

  return {
    status,
    isLoading: status === 'loading',
    errorMessage,
    isUnactivated,
    resendStatus,
    isResending: resendStatus === 'loading',
    resendMessage,
    handleLogin,
    handleGoogleLogin,
    handleResend,
    clearError: () => setErrorMessage(null),
  }
}

export default useLogin
