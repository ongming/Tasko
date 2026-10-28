import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react'
import Logo from '@/components/Logo'
import { authService } from '@/services/authService'
import { ApiError } from '@/types/api'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [countdown, setCountdown] = useState(3)

  const token = searchParams.get('token')
  const hasRequestedRef = useRef(false)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Không tìm thấy mã kích hoạt trong liên kết. Vui lòng kiểm tra lại email của bạn.')
      return
    }

    if (hasRequestedRef.current) return
    hasRequestedRef.current = true

    const runVerification = async () => {
      try {
        const data = await authService.verifyEmail(token)
        setStatus('success')
        setMessage(data.message || 'Kích hoạt tài khoản thành công! Bây giờ bạn đã có thể đăng nhập vào Tasko.')
      } catch (err: unknown) {
        setStatus('error')
        if (err instanceof ApiError) {
          setMessage(err.message)
        } else {
          setMessage('Không thể kết nối tới máy chủ. Vui lòng thử lại sau.')
        }
      }
    }

    runVerification()
  }, [token])

  // Đếm ngược tự động chuyển hướng khi kích hoạt thành công
  useEffect(() => {
    if (status !== 'success') return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/login?verified=true', { replace: true })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [status, navigate])

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans flex flex-col">
      <header className="px-8 sm:px-12 py-6">
        <Link to="/" className="inline-flex items-center gap-3 group" aria-label="Trang chủ Tasko">
          <Logo className="w-10 h-10 group-hover:scale-105 transition-transform" />
          <span className="text-2xl font-bold tracking-tight text-slate-900">Tasko</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[480px] bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-8 sm:p-12 text-center">
          {status === 'loading' && (
            <div className="py-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                Đang xác thực tài khoản...
              </h1>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Vui lòng đợi giây lát trong khi chúng tôi kích hoạt tài khoản của bạn.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-4 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                Kích hoạt thành công!
              </h1>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">{message}</p>
              <p className="text-xs text-slate-400 mb-6">
                Hệ thống sẽ tự động chuyển sang trang Đăng nhập sau{' '}
                <span className="font-bold text-blue-600 text-sm">{countdown}s</span>...
              </p>
              <Link
                to="/login?verified=true"
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Đăng nhập ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6">
                <XCircle className="w-9 h-9" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                Kích hoạt không thành công
              </h1>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">{message}</p>
              <div className="flex flex-col gap-3 w-full">
                <Link
                  to="/register"
                  className="w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  Đăng ký lại tài khoản mới
                </Link>
                <Link
                  to="/login"
                  className="w-full py-3 px-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
                >
                  Quay về trang Đăng nhập
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400">
        © 2026 Tasko. Bản quyền thuộc về Nhóm phát triển.
      </footer>
    </div>
  )
}

export default VerifyEmailPage
