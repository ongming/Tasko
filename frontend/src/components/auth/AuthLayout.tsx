import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '@/components/Logo'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: React.ReactNode
  footerPrompt: string
  footerLinkText: string
  footerLinkTo: string
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footerPrompt,
  footerLinkText,
  footerLinkTo,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans flex flex-col">
      {/* Header Logo */}
      <header className="px-8 sm:px-12 py-6">
        <Link to="/" className="inline-flex items-center gap-3 group" aria-label="Trang chủ Tasko">
          <Logo className="w-10 h-10 group-hover:scale-105 transition-transform" />
          <span className="text-2xl font-bold tracking-tight text-slate-900">Tasko</span>
        </Link>
      </header>

      {/* Main Auth Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[480px] bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-7 sm:p-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 mb-6">
            {subtitle}
          </p>

          {children}

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center flex flex-col gap-2">
            <p className="text-xs text-slate-500">
              {footerPrompt}{' '}
              <Link
                to={footerLinkTo}
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                {footerLinkText}
              </Link>
            </p>
            <p className="text-[11px] text-slate-400">
              Cần trợ giúp? Truy cập{' '}
              <a href="#help" className="underline hover:text-slate-600 font-medium">
                trung tâm hỗ trợ
              </a>{' '}
              của Tasko.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AuthLayout
