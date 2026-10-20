import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Bell, 
  Settings, 
  Menu, 
  User,
  Sparkles,
  HelpCircle,
  ExternalLink
} from 'lucide-react'

export function WorkspaceTopbar({ onToggleMobileSidebar }) {
  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        {/* Mobile toggle */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
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
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50/80 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 text-xs font-medium transition-colors"
          title="Trợ lý AI Tasko"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Tasko AI</span>
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
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

        {/* User Profile Avatar */}
        <button
          type="button"
          className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          title="Tài khoản cá nhân"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-white shadow-2xs">
            QM
          </div>
          <span className="hidden sm:inline text-xs font-semibold text-slate-700">
            Quang Minh
          </span>
        </button>
      </div>
    </header>
  )
}

export default WorkspaceTopbar
