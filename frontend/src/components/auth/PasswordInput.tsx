import React, { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string
  label: string
  error?: string
  required?: boolean
  autoComplete: 'current-password' | 'new-password'
  rightLabelAction?: React.ReactNode
}

export function PasswordInput({
  id,
  label,
  error,
  required,
  autoComplete,
  rightLabelAction,
  disabled,
  className = '',
  ...rest
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {rightLabelAction}
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Lock className="w-4 h-4" />
        </div>
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={`w-full pl-10 pr-11 py-3 text-sm bg-white border ${
            error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-600 focus:ring-blue-100'
          } rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all font-medium disabled:opacity-60 disabled:bg-slate-50 ${className}`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={disabled}
          aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p id={errorId} className="text-xs text-rose-600 font-medium animate-in fade-in duration-150">
          {error}
        </p>
      )}
    </div>
  )
}

export default PasswordInput
