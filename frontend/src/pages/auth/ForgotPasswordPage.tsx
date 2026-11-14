import React, { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowRight, Loader2 } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { TextField } from '@/components/auth/TextField'
import { AlertBanner } from '@/components/auth/AlertBanner'
import { authService } from '@/services/authService'
import { ApiError } from '@/types/api'

export function ForgotPasswordPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!email || isLoading) return

      setIsLoading(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      try {
        const data = await authService.forgotPassword({ email })
        setSuccessMessage(data.message || 'Mã OTP đã được gửi đến email của bạn!')
        setTimeout(() => {
          navigate(`/verify-otp?email=${encodeURIComponent(email)}`)
        }, 1500)
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setErrorMessage(err.message)
        } else {
          setErrorMessage('Không thể kết nối tới máy chủ. Vui lòng thử lại sau.')
        }
      } finally {
        setIsLoading(false)
      }
    },
    [email, isLoading, navigate],
  )

  return (
    <AuthLayout
      title="Quên mật khẩu?"
      subtitle="Nhập email đăng ký để nhận mã xác nhận OTP."
      footerPrompt="Nhớ mật khẩu rồi?"
      footerLinkText="Đăng nhập"
      footerLinkTo="/login"
    >
      {successMessage && <AlertBanner variant="success" message={successMessage} />}
      {errorMessage && (
        <AlertBanner
          variant="error"
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          id="forgot-email"
          label="Địa chỉ Email"
          type="email"
          required
          autoComplete="email"
          placeholder="alex@company.com"
          icon={Mail}
          value={email}
          disabled={isLoading}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-xs transition-colors group cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang gửi mã...</span>
            </>
          ) : (
            <>
              <span>Gửi mã OTP</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link
          to="/login"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          ← Quay lại đăng nhập
        </Link>
      </div>
    </AuthLayout>
  )
}

export default ForgotPasswordPage
