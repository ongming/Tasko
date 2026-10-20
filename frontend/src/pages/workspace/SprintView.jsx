import React from 'react'
import { Link } from 'react-router-dom'
import { Zap, Play, CheckCircle2, AlertCircle, Clock, Plus, ArrowRight } from 'lucide-react'
import { PROJECT_TABS } from './BoardView'

export function SprintView() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Project Header Navigation */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Website Redesign
            </h1>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-mono text-xs font-semibold">
              WR-2024
            </span>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Bắt đầu Sprint 2</span>
          </button>
        </div>

        {/* Tab Strip */}
        <nav className="flex items-center gap-6 border-b border-slate-200/80 overflow-x-auto scrollbar-none">
          {PROJECT_TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = tab.id === 'sprint'

            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Sprint Active Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col gap-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                Sprint 1 - Đang diễn ra
              </span>
              <span className="text-xs text-slate-400 font-medium">01/05 - 15/05 (Còn 3 ngày)</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">Hoàn thiện kiến trúc & Thiết kế UX</h2>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Tiến độ Sprint</span>
              <span className="text-base font-bold text-indigo-600">68% hoàn thành</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
          <div className="bg-emerald-500 h-full w-[45%]" title="Done (45%)" />
          <div className="bg-indigo-600 h-full w-[23%]" title="In Progress (23%)" />
          <div className="bg-amber-400 h-full w-[10%]" title="Review (10%)" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block">Tổng Story Points</span>
            <span className="font-bold text-slate-800 text-sm">42 SP</span>
          </div>
          <div>
            <span className="text-slate-400 block">Đã hoàn thành</span>
            <span className="font-bold text-emerald-600 text-sm">28 SP</span>
          </div>
          <div>
            <span className="text-slate-400 block">Đang thực hiện</span>
            <span className="font-bold text-indigo-600 text-sm">10 SP</span>
          </div>
          <div>
            <span className="text-slate-400 block">Điểm rủi ro</span>
            <span className="font-bold text-amber-600 text-sm">0 cảnh báo</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SprintView
