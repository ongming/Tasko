import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { ApiError } from '@/types/api'

export type FormStatus = 'idle' | 'loading' | 'error' | 'success'

export function useRegister() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Gửi lại email
  const [resendStatus, setResendStatus] = useState<FormStatus>('idle')
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const handleRegister = async (payload: {
    fullName: string
    email: string
    password: string
    confirmPassword: string
    agreeTerms: boolean
  }) => {
    const { fullName, email, password, confirmPassword, agreeTerms } = payload

    setErrorMessage(null)

    // Kiểm tra tính hợp lệ cơ bản tại Client UX
    if (password !== confirmPassword) {
      setStatus('error')
      setErrorMessage('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.')
      return
    }

    if (password.length < 8) {
      setStatus('error')
      setErrorMessage('Mật khẩu phải có độ dài tối thiểu từ 8 ký tự trở lên.')
      return
    }

    if (!agreeTerms) {
      setStatus('error')
      setErrorMessage('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách quyền riêng tư để tiếp tục.')
      return
    }

    try {
      setStatus('loading')
      await authService.register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      })
      setStatus('success')
    } catch (err: unknown) {
      setStatus('error')
      if (err instanceof ApiError) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Đăng ký tài khoản thất bại. Vui lòng thử lại!')
      }
    }
  }

  // Đăng ký nhanh qua Google (vào thẳng hệ thống)
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setStatus('loading')
        setErrorMessage(null)

        const result = await authService.googleLogin({
          accessToken: tokenResponse.access_token,
        })

        setAuth(result.user, result.accessToken)
        navigate('/workspace/board', { replace: true })
      } catch (err: unknown) {
        setStatus('error')
        if (err instanceof ApiError) {
          setErrorMessage(err.message)
        } else {
          setErrorMessage('Đăng ký bằng Google thất bại. Vui lòng thử lại sau.')
        }
      }
    },
    onError: () => {
      setStatus('error')
      setErrorMessage('Đăng ký bằng Google không thành công hoặc đã bị đóng.')
    },
  })

  const handleResend = async (email: string) => {
    if (!email) return
    try {
      setResendStatus('loading')
      setResendMessage(null)

      const res = await authService.resendVerification(email.trim().toLowerCase())
      setResendStatus('success')
      setResendMessage(res.message || 'Đã gửi lại email kích hoạt thành công!')
    } catch (err: unknown) {
      setResendStatus('error')
      if (err instanceof ApiError) {
        setResendMessage(err.message)
      } else {
        setResendMessage('Không thể gửi lại email vào lúc này. Vui lòng thử lại sau.')
      }
    }
  }

  return {
    status,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    errorMessage,
    resendStatus,
    isResending: resendStatus === 'loading',
    resendMessage,
    handleRegister,
    handleGoogleLogin,
    handleResend,
    clearError: () => setErrorMessage(null),
  }
}

export default useRegister
