import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Mail, ArrowRight, Loader2, RefreshCw } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { TextField } from '@/components/auth/TextField'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { AlertBanner } from '@/components/auth/AlertBanner'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { useLogin } from '@/hooks/useLogin'

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const isVerifiedFromEmail = searchParams.get('verified') === 'true'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const {
    isLoading,
    errorMessage,
    isUnactivated,
    resendMessage,
    isResending,
    handleLogin,
    handleGoogleLogin,
    handleResend,
    clearError,
  } = useLogin()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || isLoading) return
    handleLogin(email, password)
  }

  return (
    <AuthLayout
      title="Chào mừng bạn trở lại"
      subtitle="Đăng nhập vào tài khoản để tiếp tục cộng tác cùng đội ngũ."
      footerPrompt="Chưa có tài khoản?"
      footerLinkText="Đăng ký miễn phí"
      footerLinkTo="/register"
    >
      {/* Thông báo xanh nếu vừa kích hoạt email thành công từ link */}
      {isVerifiedFromEmail && (
        <AlertBanner
          variant="success"
          message="Tài khoản của bạn đã được kích hoạt thành công! Hãy đăng nhập để bắt đầu."
        />
      )}

      {/* Thông báo gửi lại email */}
      {resendMessage && (
        <AlertBanner variant="success" message={resendMessage} />
      )}

      {/* Thông báo lỗi khi đăng nhập */}
      {errorMessage && (
        <AlertBanner
          variant={isUnactivated ? 'warning' : 'error'}
          message={errorMessage}
          onDismiss={clearError}
          action={
            isUnactivated ? (
              <div className="flex items-center justify-between text-[11px] text-amber-800">
                <span>Chưa nhận được email xác nhận?</span>
                <button
                  type="button"
                  disabled={isResending}
                  onClick={() => handleResend(email)}
                  className="font-semibold underline hover:text-amber-900 inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                  <span>{isResending ? 'Đang gửi...' : 'Gửi lại email'}</span>
                </button>
              </div>
            ) : undefined
          }
        />
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <TextField
          id="login-email"
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

        <PasswordInput
          id="login-password"
          label="Mật khẩu"
          required
          autoComplete="current-password"
          placeholder="Nhập mật khẩu của bạn"
          value={password}
          disabled={isLoading}
          onChange={(e) => setPassword(e.target.value)}
          rightLabelAction={
            <Link
              to="#forgot"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          }
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-xs transition-colors group cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang đăng nhập...</span>
            </>
          ) : (
            <>
              <span>Đăng nhập</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Đường phân cách */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
          <span className="bg-white px-3 text-slate-400">HOẶC TIẾP TỤC VỚI</span>
        </div>
      </div>

      {/* Nút Google full width */}
      <GoogleButton
        onClick={() => handleGoogleLogin()}
        disabled={isLoading}
        label="Tiếp tục với Google"
      />
    </AuthLayout>
  )
}

export default LoginPage
