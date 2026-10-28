import React from 'react'
import { AlertCircle, CheckCircle2, AlertTriangle, X } from 'lucide-react'

export type AlertVariant = 'error' | 'success' | 'warning'

interface AlertBannerProps {
  variant: AlertVariant
  message: string
  action?: React.ReactNode
  onDismiss?: () => void
}

const variantStyles: Record<AlertVariant, { container: string; iconColor: string; Icon: React.ElementType }> = {
  error: {
    container: 'bg-rose-50 border border-rose-200/80 text-rose-700',
    iconColor: 'text-rose-600',
    Icon: AlertCircle,
  },
  success: {
    container: 'bg-emerald-50 border border-emerald-200 text-emerald-800',
    iconColor: 'text-emerald-600',
    Icon: CheckCircle2,
  },
  warning: {
    container: 'bg-amber-50 border border-amber-200 text-amber-800',
    iconColor: 'text-amber-600',
    Icon: AlertTriangle,
  },
}

export function AlertBanner({ variant, message, action, onDismiss }: AlertBannerProps) {
  const { container, iconColor, Icon } = variantStyles[variant]

  return (
    <div className={`mb-5 p-3.5 rounded-xl text-xs leading-relaxed animate-in fade-in duration-200 ${container}`}>
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5">
          <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
          <span className="font-medium">{message}</span>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Đóng thông báo"
            className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {action && <div className="mt-2.5 pt-2 border-t border-amber-200/60">{action}</div>}
    </div>
  )
}

export default AlertBanner
