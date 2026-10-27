import React, { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2, ArrowRight, RefreshCw, Mail } from 'lucide-react'
import Logo from '@/components/Logo'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [countdown, setCountdown] = useState(5)

  const token = searchParams.get('token')
  const hasRequestedRef = useRef(false)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Không tìm thấy mã kích hoạt trong đường dẫn. Vui lòng kiểm tra lại email của bạn.')
      return
    }

    // Chặn React StrictMode trong môi trường Dev gọi useEffect 2 lần liên tiếp
    if (hasRequestedRef.current) return
    hasRequestedRef.current = true

    const verifyToken = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          },
        )

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message || 'Kích hoạt tài khoản thành công! Bây giờ bạn đã có thể đăng nhập vào Tasko.')
        } else {
          setStatus('error')
          setMessage(data.message || 'Mã kích hoạt không hợp lệ hoặc đã hết hạn (quá 24 giờ).')
        }
      } catch {
        setStatus('error')
        setMessage('Không thể kết nối tới máy chủ. Vui lòng thử lại sau.')
      }
    }

    verifyToken()
  }, [token])

  // Đếm ngược tự động chuyển hướng khi kích hoạt thành công
  useEffect(() => {
    if (status !== 'success') return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/login?verified=true')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [status, navigate])

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] font-sans flex flex-col">
      {/* Header Logo */}
      <header className="px-8 sm:px-12 py-6">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <Logo className="w-10 h-10 group-hover:scale-105 transition-transform" />
          <span className="text-2xl font-bold tracking-tight text-slate-900">Tasko</span>
        </Link>
      </header>

      {/* Main Content Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[500px] bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-8 sm:p-12 text-center">
          
          {/* TRƯỜNG HỢP 1: ĐANG XỬ LÝ (LOADING) */}
          {status === 'loading' && (
            <div className="py-8 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                <Loader2 className="w-8 h-8 text-[#0c66e4] animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                Đang xác thực tài khoản...
              </h1>
              <p className="text-sm text-slate-500 max-w-sm">
                Vui lòng đợi trong giây lát, hệ thống đang kiểm tra mã kích hoạt của bạn.
              </p>
            </div>
          )}

          {/* TRƯỜNG HỢP 2: KÍCH HOẠT THÀNH CÔNG (SUCCESS) */}
          {status === 'success' && (
            <div className="py-4 flex flex-col items-center">
              <div className="w-18 h-18 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
                Kích hoạt thành công!
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-sm mb-6">
                {message}
              </p>

              {/* Nút đăng nhập ngay */}
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#0c66e4] hover:bg-[#0052cc] text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 active:scale-[0.99]"
              >
                <span>Đăng nhập ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Dòng đếm ngược */}
              <p className="text-xs text-slate-400 mt-4">
                Tự động chuyển đến trang Đăng nhập sau <span className="font-semibold text-slate-700">{countdown}s</span>...
              </p>
            </div>
          )}

          {/* TRƯỜNG HỢP 3: THẤT BẠI HOẶC HẾT HẠN (ERROR) */}
          {status === 'error' && (
            <div className="py-4 flex flex-col items-center">
              <div className="w-18 h-18 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-6 shadow-sm">
                <XCircle className="w-10 h-10 text-rose-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
                Kích hoạt không thành công
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-sm mb-6">
                {message}
              </p>

              <div className="w-full flex flex-col gap-3">
                <Link
                  to="/register"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Đăng ký lại tài khoản mới</span>
                </Link>

                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all"
                >
                  <span>Quay về trang Đăng nhập</span>
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer nhỏ */}
      <footer className="py-6 text-center text-xs text-slate-400">
        © 2026 Tasko. Bản quyền thuộc về Nhóm phát triển.
      </footer>
    </div>
  )
}

export default VerifyEmailPage
