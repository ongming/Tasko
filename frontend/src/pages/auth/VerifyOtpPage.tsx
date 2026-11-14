import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2 } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AlertBanner } from '@/components/auth/AlertBanner'
import { authService } from '@/services/authService'
import { ApiError } from '@/types/api'

const OTP_LENGTH = 6
const RESEND_COUNTDOWN = 60

function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (val: string) => void
  disabled: boolean
}) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  const digits = value.split('').concat(Array(OTP_LENGTH).fill('')).slice(0, OTP_LENGTH)

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return
    const newDigits = [...digits]
    newDigits[index] = char.slice(-1)
    onChange(newDigits.join(''))
    if (char && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const newDigits = [...digits]
        newDigits[index] = ''
        onChange(newDigits.join(''))
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus()
        const newDigits = [...digits]
        newDigits[index - 1] = ''
        onChange(newDigits.join(''))
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    onChange(pasted.padEnd(OTP_LENGTH, '').slice(0, OTP_LENGTH))
    const nextFocus = Math.min(pasted.length, OTP_LENGTH - 1)
    inputsRef.current[nextFocus]?.focus()
  }

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={[
            'w-11 h-13 text-center text-xl font-bold rounded-xl border transition-all outline-none',
            'border-slate-200 bg-white text-slate-900',
            'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            digit ? 'border-indigo-400' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      ))}
    </div>
  )
}

export function VerifyOtpPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const email = searchParams.get('email') ?? ''

  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN)

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const handleVerify = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (otp.length !== OTP_LENGTH || isLoading) return

      setIsLoading(true)
      setErrorMessage(null)

      try {
        await authService.verifyOtp({ email, otp })
        navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`)
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
    [otp, email, isLoading, navigate],
  )

  const handleResend = useCallback(async () => {
    if (countdown > 0 || isResending) return

    setIsResending(true)
    setErrorMessage(null)

    try {
      await authService.forgotPassword({ email })
      setCountdown(RESEND_COUNTDOWN)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Không thể gửi lại mã. Vui lòng thử lại sau.')
      }
    } finally {
      setIsResending(false)
    }
  }, [countdown, isResending, email])

  return (
    <AuthLayout
      title="Nhập mã OTP"
      subtitle={`Mã 6 chữ số đã được gửi đến ${email || 'email của bạn'}`}
      footerPrompt="Chưa nhận được mã?"
      footerLinkText="Đổi email khác"
      footerLinkTo="/forgot-password"
    >
      {errorMessage && (
        <AlertBanner
          variant="error"
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      <form onSubmit={handleVerify} className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-700">Mã OTP</p>
          <OtpInput value={otp} onChange={setOtp} disabled={isLoading} />
        </div>

        <button
          type="submit"
          disabled={isLoading || otp.length !== OTP_LENGTH}
          className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-xs transition-colors group cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang xác nhận...</span>
            </>
          ) : (
            <>
              <span>Xác nhận mã OTP</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={countdown > 0 || isResending}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed transition-colors"
        >
          {isResending
            ? 'Đang gửi lại...'
            : countdown > 0
              ? `Gửi lại (${String(countdown).padStart(2, '0')}s)`
              : 'Gửi lại mã'}
        </button>
      </div>
    </AuthLayout>
  )
}

export default VerifyOtpPage
