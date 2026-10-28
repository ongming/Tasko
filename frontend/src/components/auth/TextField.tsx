import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
  icon?: LucideIcon
  required?: boolean
}

export function TextField({
  id,
  label,
  error,
  icon: Icon,
  required,
  className = '',
  disabled,
  ...rest
}: TextFieldProps) {
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={id}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3.5'} pr-4 py-3 text-sm bg-white border ${
            error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-600 focus:ring-blue-100'
          } rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all font-medium disabled:opacity-60 disabled:bg-slate-50 ${className}`}
          {...rest}
        />
      </div>
      {error && (
        <p id={errorId} className="text-xs text-rose-600 font-medium animate-in fade-in duration-150">
          {error}
        </p>
      )}
    </div>
  )
}

export default TextField
