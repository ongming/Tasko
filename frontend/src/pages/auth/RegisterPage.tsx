import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  User,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Send,
  X
} from 'lucide-react'
import Logo from '@/components/Logo'
import { authService } from '@/services/authService'

// Icon Google chuẩn 4 màu chính thức
function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  // Trạng thái xử lý form
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // Trạng thái gửi lại email
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.')
      return
    }

    if (password.length < 8) {
      setErrorMessage('Mật khẩu phải có độ dài tối thiểu từ 8 ký tự trở lên.')
      return
    }

    if (!agreeTerms) {
      setErrorMessage('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách quyền riêng tư để tiếp tục.')
      return
    }

    setIsLoading(true)

    try {
      await authService.register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      })

      // Đăng ký thành công -> Chuyển sang màn hình "Kiểm tra hòm thư"
      setIsSuccess(true)
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng ký tài khoản thất bại. Vui lòng thử lại!')
    } finally {
      setIsLoading(false)
    }
  }

  // Hàm xử lý gửi lại email kích hoạt
  const handleResendEmail = async () => {
    setIsResending(true)
    setResendMessage(null)
    try {
      const res = await authService.resendVerification(email.trim().toLowerCase())
      setResendMessage(res.message || 'Đã gửi lại email kích hoạt thành công!')
    } catch (err: any) {
      setResendMessage(err.message || 'Không thể gửi lại email vào lúc này. Vui lòng thử lại sau.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] font-sans flex flex-col">

      {/* Logo góc trên bên trái */}
      <header className="px-8 sm:px-12 py-6">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <Logo className="w-10 h-10 group-hover:scale-105 transition-transform" />
          <span className="text-2xl font-bold tracking-tight text-slate-900">Tasko</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[480px] bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-7 sm:p-10">

          {/* TRƯỜNG HỢP 1: ĐÃ ĐĂNG KÝ THÀNH CÔNG -> HIỂN THỊ MÀN HÌNH KIỂM TRA HÒM THƯ */}
          {isSuccess ? (
            <div className="text-center py-2 flex flex-col items-center">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 shadow-sm">
                <Send className="w-8 h-8 text-[#0c66e4]" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
                Kiểm tra email của bạn
              </h1>

              <p className="text-sm text-slate-600 leading-relaxed max-w-sm mb-6">
                Chúng tôi đã gửi đường liên kết kích hoạt đến địa chỉ{' '}
                <span className="font-semibold text-slate-900">{email}</span>. Vui lòng mở email và bấm nút kích hoạt để hoàn tất đăng ký.
              </p>

              {/* Thông báo gửi lại email nếu có */}
              {resendMessage && (
                <div className="w-full mb-5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700 flex items-center gap-2 text-left">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{resendMessage}</span>
                </div>
              )}

              {/* Nút đi đến Đăng nhập */}
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#0c66e4] hover:bg-[#0052cc] text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 active:scale-[0.99] mb-4"
              >
                <span>Đi đến trang Đăng nhập</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Nút gửi lại email */}
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                Chưa nhận được email?{' '}
                <button
                  type="button"
                  disabled={isResending}
                  onClick={handleResendEmail}
                  className="font-semibold text-[#0c66e4] hover:underline disabled:opacity-50 inline-flex items-center gap-1 cursor-pointer"
                >
                  {isResending && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Gửi lại email</span>
                </button>
              </p>
            </div>
          ) : (
            /* TRƯỜNG HỢP 2: FORM ĐIỀN THÔNG TIN ĐĂNG KÝ */
            <>
              {/* Tiêu đề */}
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                Tạo tài khoản mới
              </h1>
              <p className="text-sm text-slate-500 mt-1.5 mb-6">
                Đăng ký miễn phí để bắt đầu quản lý dự án cùng đội ngũ của bạn.
              </p>

              {/* Khung báo lỗi nếu có */}
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start justify-between gap-3 text-rose-700 text-xs leading-relaxed animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="text-rose-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Họ và tên */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0c66e4] focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Địa chỉ email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0c66e4] focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Mật khẩu */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mật khẩu <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tạo mật khẩu"
                      className="w-full pl-10 pr-11 py-3 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0c66e4] focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tối thiểu 8 ký tự.
                  </p>
                </div>

                {/* Xác nhận mật khẩu */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Xác nhận mật khẩu <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className="w-full pl-10 pr-11 py-3 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0c66e4] focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Đồng ý điều khoản */}
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#0c66e4] focus:ring-[#0c66e4] accent-[#0c66e4] mt-0.5"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    Tôi đồng ý với{' '}
                    <a href="#terms" className="font-semibold text-[#0c66e4] hover:underline">Điều khoản dịch vụ</a>{' '}
                    và{' '}
                    <a href="#privacy" className="font-semibold text-[#0c66e4] hover:underline">Chính sách quyền riêng tư</a>{' '}
                    của Tasko.
                  </span>
                </label>

                {/* Nút Đăng ký */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-1 bg-[#0c66e4] hover:bg-[#0052cc] active:bg-[#0747a6] disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-xs transition-colors group cursor-pointer"
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

              {/* Nút Google */}
              <button
                type="button"
                onClick={() => navigate('/workspace/board')}
                className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 rounded-xl flex items-center justify-center gap-2.5 text-sm font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <GoogleIcon className="w-5 h-5" />
                <span>Đăng ký với Google</span>
              </button>

              {/* Footer */}
              <div className="mt-6 pt-5 border-t border-slate-100 text-center flex flex-col gap-2">
                <p className="text-xs text-slate-500">
                  Đã có tài khoản?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-[#0c66e4] hover:text-[#0052cc] hover:underline"
                  >
                    Đăng nhập ngay
                  </Link>
                </p>
                <p className="text-[11px] text-slate-400">
                  Cần trợ giúp? Truy cập{' '}
                  <a href="#help" className="underline hover:text-slate-600 font-medium">trung tâm hỗ trợ</a> của Tasko.
                </p>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  )
}

export default RegisterPage
