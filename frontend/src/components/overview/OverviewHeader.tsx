import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ArrowUpRight, Plus } from 'lucide-react'

interface OverviewHeaderProps {
  onOpenCreateTask: () => void
}

export const OverviewHeader: React.FC<OverviewHeaderProps> = ({ onOpenCreateTask }) => {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Chào buổi chiều, Quang Minh!
        </h1>
        <p className="text-sm text-slate-500 flex items-center gap-1.5 flex-wrap">
          <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Thứ Năm, 29 tháng 10 • Đây là tổng quan hoạt động trong Không gian làm việc hôm nay.</span>
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
