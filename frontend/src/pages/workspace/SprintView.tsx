import React from 'react'
import { Plus, Flame } from 'lucide-react'
import ProjectTabBar from '@/components/workspace/ProjectTabBar'

export function SprintView() {
  const hasActiveSprint = false

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Project Header Navigation */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Quản lý Sprint
            </h1>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-mono text-xs font-semibold">
              SPRINT
            </span>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Sprint mới</span>
          </button>
        </div>

        {/* Dynamic Project Tabs */}
        <ProjectTabBar />
      </div>

      {/* Sprint Active Card */}
      {!hasActiveSprint ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Flame className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">Chưa có Sprint nào đang diễn ra</h2>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5">
            Đi tới tab Backlog để lập kế hoạch, phân bổ các User Story và bắt đầu chu kỳ Sprint đầu tiên.
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo Sprint đầu tiên</span>
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default SprintView
