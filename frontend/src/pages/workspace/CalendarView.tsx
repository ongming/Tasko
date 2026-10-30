import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProjectTabBar from '@/components/workspace/ProjectTabBar'

export function CalendarView() {
  const days: string[] = ['Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'CN']
  const dates: number[] = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
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
          <div className="flex items-center gap-2">
            <button type="button" className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-slate-800 px-2">Tháng 5, 2026</span>
            <button type="button" className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Project Tabs */}
        <ProjectTabBar />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200/80 bg-slate-50/70 text-center py-2 text-xs font-bold text-slate-600">
          {days.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[500px]">
          {dates.map((d) => (
            <div key={d} className="p-2 min-h-[90px] flex flex-col justify-between hover:bg-slate-50/50 transition-colors">
              <span className="text-xs font-semibold text-slate-500">
                {d}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CalendarView
