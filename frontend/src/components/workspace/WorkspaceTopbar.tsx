import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Search, 
  Bell, 
  Settings, 
  Menu, 
  Sparkles,
  LogOut,
  User as UserIcon,
  ChevronDown
} from 'lucide-react'
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
    <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        {/* Mobile toggle */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Mở menu điều hướng"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search */}
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm công việc, dự án, thành viên... (Ctrl + K)"
            className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-200/80 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* AI Assistant Pill (Tasko Gemini) */}
        <button
          type="button"
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50/80 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 text-xs font-medium transition-colors cursor-pointer"
          title="Trợ lý AI Tasko"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Tasko AI</span>
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Thông báo"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Settings */}
        <Link
          to="/workspace/settings"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Cài đặt không gian"
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
