import React from 'react'
import ProjectTabBar from '@/components/workspace/ProjectTabBar'
import { BarChartHorizontal } from 'lucide-react'

interface GanttTask {
  name: string
  start: string
  width: string
  color: string
}

export function GanttView() {
  const tasks: GanttTask[] = []

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Biểu đồ Gantt
            </h1>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-mono text-xs font-semibold">
              GANTT
            </span>
          </div>
        </div>

        {/* Dynamic Project Tabs */}
        <ProjectTabBar />
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="font-bold text-slate-800 text-base">Tiến độ dòng thời gian (Gantt Chart Timeline)</h2>
          <span className="text-xs text-slate-400">Thời gian thực</span>
        </div>

        {tasks.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <BarChartHorizontal className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-700">Chưa có công việc nào trên biểu đồ Gantt</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
              Gán ngày bắt đầu và thời hạn cho các công việc trong dự án để trực quan hóa tiến độ tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task, idx) => (
              <div key={idx} className="flex items-center gap-4 text-xs">
                <span className="w-48 font-medium text-slate-700 truncate">{task.name}</span>
                <div className="flex-1 bg-slate-100 h-7 rounded-lg relative overflow-hidden">
                  <div 
                    className={`absolute h-full rounded-lg ${task.color} opacity-90 text-white flex items-center px-3 font-medium text-[11px] shadow-2xs`}
                    style={{ left: task.start, width: task.width }}
                  >
                    {task.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default GanttView
