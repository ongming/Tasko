import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  X,
  MailCheck
} from 'lucide-react'
import Logo from '@/components/Logo'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'

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

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setAuth = useAuthStore((state) => state.setAuth)

  // Cờ kiểm tra người dùng vừa kích hoạt email xong nhảy sang
  const isVerifiedFromEmail = searchParams.get('verified') === 'true'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Trạng thái xử lý form
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isNotActivated, setIsNotActivated] = useState(false)

  // Trạng thái gửi lại email nếu chưa kích hoạt
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsNotActivated(false)
    setResendMessage(null)
    setIsLoading(true)

    try {
      const result = await authService.login({
        email: email.trim().toLowerCase(),
        password,
      })

      // Lưu user và accessToken vào Zustand Store (In-Memory RAM)
      setAuth(result.user, result.accessToken)

      // Chuyển hướng ngay vào Không gian làm việc
      navigate('/workspace/board')
    } catch (err: any) {
      // Trường hợp 403: Tài khoản chưa kích hoạt email
      if (err.statusCode === 403 || err.message?.includes('chưa được kích hoạt')) {
        setIsNotActivated(true)
        setErrorMessage(err.message || 'Tài khoản của bạn chưa được kích hoạt! Vui lòng kiểm tra email để kích hoạt trước khi đăng nhập.')
      } else {
        setErrorMessage(err.message || 'Email hoặc mật khẩu không chính xác!')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Hàm gửi lại email kích hoạt
  const handleResendActivation = async () => {
    if (!email) {
      setResendMessage('Vui lòng nhập địa chỉ email của bạn ở trên trước khi bấm gửi lại.')
      return
    }

    setIsResending(true)
    setResendMessage(null)

    try {
      const res = await authService.resendVerification(email.trim().toLowerCase())
      setResendMessage(res.message || 'Đã gửi lại email kích hoạt! Vui lòng kiểm tra hộp thư.')
    } catch (err: any) {
      setResendMessage(err.message || 'Không thể gửi lại email lúc này. Vui lòng thử lại sau.')
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

      {/* Form đăng nhập ở giữa được gom vào ô chữ nhật Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[480px] bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-7 sm:p-10">

          {/* Tiêu đề */}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            Chào mừng bạn trở lại
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 mb-6">
            Đăng nhập vào tài khoản để tiếp tục cộng tác cùng đội ngũ.
          </p>

          {/* Banner xanh: Khi vừa kích hoạt email thành công từ link */}
          {isVerifiedFromEmail && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Tài khoản của bạn đã được kích hoạt thành công! Hãy đăng nhập để bắt đầu.</span>
            </div>
          )}

          {/* Khung báo lỗi nếu có */}
          {errorMessage && (
            <div className={`mb-5 p-3.5 rounded-xl flex flex-col gap-2 text-xs leading-relaxed animate-in fade-in duration-200 ${
              isNotActivated 
                ? 'bg-amber-50 border border-amber-200 text-amber-800' 
                : 'bg-rose-50 border border-rose-200/80 text-rose-700'
            }`}>
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isNotActivated ? 'text-amber-600' : 'text-rose-600'}`} />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Nút gửi lại email nếu tài khoản chưa kích hoạt */}
              {isNotActivated && (
                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-amber-700">Chưa nhận được email?</span>
                  <button
                    type="button"
                    disabled={isResending}
                    onClick={handleResendActivation}
                    className="font-semibold text-amber-900 hover:underline disabled:opacity-50 inline-flex items-center gap-1 cursor-pointer text-xs"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      <>
                        <MailCheck className="w-3.5 h-3.5" />
                        <span>Gửi lại email kích hoạt</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Thông báo gửi lại email thành công */}
          {resendMessage && (
            <div className="mb-5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{resendMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Mật khẩu <span className="text-rose-500">*</span>
                </label>
                <a
                  href="#forgot-password"
                  onClick={(e) => { e.preventDefault(); alert('Vui lòng liên hệ Quản trị viên Workspace hoặc kiểm tra hòm thư để nhận liên kết đặt lại mật khẩu.') }}
                  className="text-xs font-semibold text-[#0c66e4] hover:text-[#0052cc] hover:underline transition-colors"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu của bạn"
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
            </div>

            {/* Ghi nhớ */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0c66e4] focus:ring-[#0c66e4] accent-[#0c66e4]"
              />
              <span className="text-xs font-medium text-slate-700">
                Ghi nhớ đăng nhập
              </span>
            </label>

            {/* Nút Đăng nhập */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1 bg-[#0c66e4] hover:bg-[#0052cc] active:bg-[#0747a6] disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-xs transition-colors group cursor-pointer"
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

          {/* Nút Google */}
          <button
            type="button"
            onClick={() => navigate('/workspace/board')}
            className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 rounded-xl flex items-center justify-center gap-2.5 text-sm font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            <GoogleIcon className="w-5 h-5" />
            <span>Tiếp tục với Google</span>
          </button>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center flex flex-col gap-2">
            <p className="text-xs text-slate-500">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="font-semibold text-[#0c66e4] hover:text-[#0052cc] hover:underline"
              >
                Đăng ký miễn phí
              </Link>
            </p>
            <p className="text-[11px] text-slate-400">
              Cần trợ giúp? Truy cập{' '}
              <a href="#help" className="underline hover:text-slate-600 font-medium">trung tâm hỗ trợ</a> của Tasko.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LoginPage
