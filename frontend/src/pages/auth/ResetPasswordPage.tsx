import React, { useState, useCallback, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2 } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { AlertBanner } from '@/components/auth/AlertBanner'
import { authService } from '@/services/authService'
import { ApiError } from '@/types/api'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const email = searchParams.get('email') ?? ''
  const otp = searchParams.get('otp') ?? ''

  // Redirect if missing params
  useEffect(() => {
    if (!email || !otp) {
      navigate('/forgot-password', { replace: true })
    }
  }, [email, otp, navigate])

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setConfirmError(null)
      setErrorMessage(null)

      if (newPassword.length < 8) {
        setConfirmError('Mật khẩu phải có ít nhất 8 ký tự.')
        return
      }

      if (newPassword !== confirmPassword) {
        setConfirmError('Mật khẩu xác nhận không khớp.')
        return
      }

      if (isLoading) return

      setIsLoading(true)

      try {
        await authService.resetPassword({ email, otp, newPassword })
        setSuccessMessage('Đặt lại mật khẩu thành công! Đang chuyển hướng...')
        setTimeout(() => {
          navigate('/login?passwordReset=true', { replace: true })
        }, 2000)
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
    [email, otp, newPassword, confirmPassword, isLoading, navigate],
  )

  return (
    <AuthLayout
      title="Đặt mật khẩu mới"
      subtitle="Mật khẩu mới phải có ít nhất 8 ký tự."
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
        <PasswordInput
          id="reset-new-password"
          label="Mật khẩu mới"
          required
          autoComplete="new-password"
          placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
          value={newPassword}
          disabled={isLoading}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <PasswordInput
          id="reset-confirm-password"
          label="Xác nhận mật khẩu"
          required
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu mới"
          value={confirmPassword}
          disabled={isLoading}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={confirmError ?? undefined}
        />

        <button
          type="submit"
          disabled={isLoading || !!successMessage}
          className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-xs transition-colors group cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang cập nhật...</span>
            </>
          ) : (
            <>
              <span>Cập nhật mật khẩu</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  )
}

export default ResetPasswordPage
