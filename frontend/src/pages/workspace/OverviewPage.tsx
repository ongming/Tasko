import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

export function OverviewPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Tổng quan không gian làm việc
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Chào mừng bạn trở lại, Quang Minh! Đây là hoạt động nổi bật hôm nay.
          </p>
        </div>
        <Link
          to="/workspace/board"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs"
        >
          <span>Xem Board công việc</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Dự án đang kích hoạt</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">3 dự án</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Công việc cần xử lý hôm nay</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">6 việc</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Thành viên đang online</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">9 / 12 người</p>
        </div>
      </div>
    </div>
  )
}

export default OverviewPage
