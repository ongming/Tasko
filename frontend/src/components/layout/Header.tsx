import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '@/components/Logo'
import { ChevronDown, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

export function Header() {
  const { user, isAuthenticated } = useAuthStore()

  // Tạo chữ cái viết tắt đại diện từ họ tên (VD: "Quang Minh" -> "QM")
  const getInitials = (name?: string) => {
    if (!name) return 'U'
    const words = name.trim().split(/\s+/)
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
    return (words[words.length - 2][0] + words[words.length - 1][0]).toUpperCase()
  }
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100/80 transition-all duration-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Navigation Menu */}
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <Logo className="w-9 h-9 group-hover:scale-105 transition-transform" />
            <span className="text-2xl font-bold tracking-tight text-slate-900">Tasko</span>
          </Link>

          {/* Primary Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-[15px] font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5">
              <span>Phương pháp</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </a>
            <a href="#methodology" className="hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5">
              <span>Mẫu</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">
              Gói sử dụng
            </a>
            <a href="#demo" className="hover:text-indigo-600 transition-colors">
              Hướng dẫn
            </a>
          </nav>
        </div>

        {/* Auth Actions: Chưa đăng nhập -> Đăng nhập / Đăng ký; Đã đăng nhập -> Avatar + Tên + Nút Đi tới Workspace */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-4">
            <Link
              to="/workspace/overview"
              className="flex items-center gap-2.5 group p-1 -m-1 rounded-lg hover:bg-slate-50 transition-colors"
              title="Xem thông tin tài khoản"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20 shadow-2xs group-hover:ring-indigo-500/40 transition-all"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs ring-2 ring-indigo-500/20 group-hover:scale-105 transition-transform select-none">
                  {getInitials(user.full_name)}
                </div>
              )}
              <span className="hidden sm:inline-block text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate max-w-[150px]">
                {user.full_name}
              </span>
            </Link>

            <Link
              to="/workspace/overview"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm hover:shadow transition-all duration-200 active:scale-[0.98]"
            >
              <span>Đi tới Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-5">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm hover:shadow transition-all duration-200"
            >
              Đăng ký miễn phí
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
