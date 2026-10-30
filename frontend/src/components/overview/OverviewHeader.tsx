import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ArrowUpRight, Plus } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

interface OverviewHeaderProps {
  onOpenCreateTask: () => void
}

export const OverviewHeader: React.FC<OverviewHeaderProps> = ({ onOpenCreateTask }) => {
  const { user } = useAuthStore()

  // Lời chào theo thời gian trong ngày
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Chào buổi sáng'
    if (hour < 18) return 'Chào buổi chiều'
    return 'Chào buổi tối'
  }

  // Ngày hiện tại định dạng tiếng Việt
  const currentDateStr = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {getGreeting()}, {user?.full_name || 'bạn'}!
        </h1>
        <p className="text-sm text-slate-500 flex items-center gap-1.5 flex-wrap capitalize">
          <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{currentDateStr} • Đây là tổng quan hoạt động trong Không gian làm việc.</span>
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <Link
          to="/workspace/board"
          className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-white text-slate-700 font-medium text-sm rounded-lg border border-slate-200/90 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          <span>Đi tới Bảng Kanban</span>
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </Link>
        <button
          type="button"
          onClick={onOpenCreateTask}
          className="inline-flex items-center gap-1.5 h-9 px-4 bg-indigo-600 text-white font-medium text-sm rounded-lg shadow-2xs hover:bg-indigo-700 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo công việc mới</span>
        </button>
      </div>
    </header>
  )
}
