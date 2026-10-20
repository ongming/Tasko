import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '@/components/Logo'
import { ChevronDown } from 'lucide-react'

export function Header() {
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

        {/* Auth Actions */}
        <div className="flex items-center gap-5">
          <Link to="/workspace" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Đăng nhập
          </Link>
          <Link
            to="/workspace"
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm hover:shadow transition-all duration-200"
          >
            Đăng ký miễn phí
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
