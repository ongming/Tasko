import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Search, 
  Bell, 
  Settings, 
  Menu, 
  LogOut,
  User as UserIcon,
  ChevronDown
} from 'lucide-react'
import Logo from '@/components/Logo'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/authService'

export interface WorkspaceTopbarProps {
  onToggleMobileSidebar?: () => void;
}

export function WorkspaceTopbar({ onToggleMobileSidebar }: WorkspaceTopbarProps) {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Bắt phím tắt Ctrl + K / Cmd + K để focus nhanh vào thanh tìm kiếm
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Đóng dropdown khi nhấn ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await authService.logout()
    } catch {
      // Dù API thất bại thì vẫn xóa phiên ở client để đảm bảo an toàn
    } finally {
      clearAuth()
      setIsDropdownOpen(false)
      setIsLoggingOut(false)
      navigate('/login', { replace: true })
    }
  }

  // Tạo chữ cái viết tắt đại diện từ họ tên (VD: "Nguyễn Đình Quang Minh" -> "QM")
  const getInitials = (name?: string) => {
    if (!name) return 'U'
    const words = name.trim().split(/\s+/)
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
    return (words[words.length - 2][0] + words[words.length - 1][0]).toUpperCase()
  }

  return (
    <header className="w-full h-14 shrink-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-5 flex items-center justify-between gap-3 shadow-2xs">
      {/* 1. Left: Mobile menu toggle + App Switcher + Brand Logo (Trải dài toàn màn hình như Jira) */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Mobile toggle */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Mở menu điều hướng"
          aria-label="Mở menu điều hướng"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 group cursor-pointer select-none" 
          title="Về trang chủ Tasko"
        >
          <Logo className="w-7 h-7 group-hover:scale-105 transition-transform shrink-0" />
          <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-none">Tasko</span>
        </Link>
      </div>

      {/* 2. Middle: Global Search bar + Quick Create button (Jira style) */}
      <div className="flex items-center gap-2.5 flex-1 max-w-xl mx-1 sm:mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Tìm kiếm công việc, dự án, thành viên... (Ctrl + K)"
            aria-label="Tìm kiếm toàn hệ thống"
            className="w-full h-9 pl-9 pr-14 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-lg text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 pointer-events-none shadow-2xs">
            <span>Ctrl</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* 3. Right: Notifications, Settings, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Thông báo"
          aria-label="Xem thông báo"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Settings */}
        <Link
          to="/workspace/settings"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Cài đặt không gian"
          aria-label="Cài đặt không gian làm việc"
        >
          <Settings className="w-4 h-4" />
        </Link>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tài khoản cá nhân"
            aria-expanded={isDropdownOpen}
            aria-label="Menu tài khoản cá nhân"
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-white shadow-xs">
                {getInitials(user?.full_name)}
              </div>
            )}
            <span className="hidden sm:inline text-xs font-semibold text-slate-700 max-w-[120px] truncate">
              {user?.full_name || 'Người dùng'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header profile info */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Đang đăng nhập với</p>
                <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">{user?.full_name}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <Link
                  to="/workspace/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>Hồ sơ & Cài đặt</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 my-1" />

              {/* Logout button */}
              <div className="px-1 py-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default WorkspaceTopbar
