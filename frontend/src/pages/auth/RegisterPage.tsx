import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, User, ArrowRight, Loader2, Send, RefreshCw } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { TextField } from '@/components/auth/TextField'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { AlertBanner } from '@/components/auth/AlertBanner'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { useRegister } from '@/hooks/useRegister'

export function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)

  const {
    isLoading,
    isSuccess,
    errorMessage,
    resendMessage,
    isResending,
    handleRegister,
    handleGoogleLogin,
    handleResend,
    clearError,
  } = useRegister()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleRegister({ fullName, email, password, confirmPassword, agreeTerms })
  }

  // Màn hình thông báo kích hoạt khi vừa đăng ký thành công
  if (isSuccess) {
    return (
      <AuthLayout
        title="Kiểm tra email của bạn"
        subtitle="Chúng tôi đã gửi một liên kết xác thực tới hòm thư của bạn."
        footerPrompt="Đã kích hoạt xong?"
        footerLinkText="Đăng nhập ngay"
        footerLinkTo="/login"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-5 shadow-xs">
            <Send className="w-8 h-8" />
          </div>
          <p className="text-sm font-semibold text-slate-800 break-all mb-2">{email}</p>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto mb-6">
            Vui lòng nhấn vào nút kích hoạt trong email để hoàn tất đăng ký tài khoản Tasko. Liên kết có hiệu lực trong vòng 24 giờ.
          </p>

          {resendMessage && <AlertBanner variant="success" message={resendMessage} />}

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs">
            <span className="text-slate-500">Chưa nhận được thư?</span>
            <button
              type="button"
              disabled={isResending}
              onClick={() => handleResend(email)}
              className="font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>{isResending ? 'Đang gửi lại...' : 'Gửi lại email kích hoạt'}</span>
            </button>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Bắt đầu cùng Tasko"
      subtitle="Tạo tài khoản miễn phí để quản lý dự án & đội ngũ hiệu quả."
      footerPrompt="Đã có tài khoản?"
      footerLinkText="Đăng nhập ngay"
      footerLinkTo="/login"
    >
      {errorMessage && (
        <AlertBanner variant="error" message={errorMessage} onDismiss={clearError} />
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <TextField
          id="register-fullname"
          label="Họ và tên"
          type="text"
          required
          autoComplete="name"
          placeholder="Nguyễn Văn A"
          icon={User}
          value={fullName}
          disabled={isLoading}
          onChange={(e) => setFullName(e.target.value)}
        />

        <TextField
          id="register-email"
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
          id="register-password"
          label="Mật khẩu"
          required
          autoComplete="new-password"
          placeholder="Tối thiểu 8 ký tự"
          value={password}
          disabled={isLoading}
          onChange={(e) => setPassword(e.target.value)}
        />

        <PasswordInput
          id="register-confirm-password"
          label="Xác nhận mật khẩu"
          required
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu trên"
          value={confirmPassword}
          disabled={isLoading}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {/* Đồng ý điều khoản a11y */}
        <div className="flex items-start gap-2.5 pt-1">
          <input
            id="register-terms"
            type="checkbox"
            required
            checked={agreeTerms}
            disabled={isLoading}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 mt-0.5 cursor-pointer"
          />
          <label htmlFor="register-terms" className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
            Tôi đồng ý với{' '}
            <a href="#terms" className="font-semibold text-blue-600 hover:underline">
              Điều khoản dịch vụ
            </a>{' '}
            và{' '}
            <a href="#privacy" className="font-semibold text-blue-600 hover:underline">
              Chính sách bảo mật
            </a>{' '}
            của Tasko.
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-xs transition-colors group cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang tạo tài khoản...</span>
            </>
          ) : (
            <>
              <span>Tạo tài khoản</span>
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
          <span className="bg-white px-3 text-slate-400">HOẶC ĐĂNG KÝ VỚI</span>
        </div>
      </div>

      <GoogleButton
        onClick={() => handleGoogleLogin()}
        disabled={isLoading}
        label="Đăng ký với Google"
      />
    </AuthLayout>
  )
}

export default RegisterPage
