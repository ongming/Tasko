import React from 'react'
import ProjectTabBar from '@/components/workspace/ProjectTabBar'

interface GanttTask {
  name: string
  start: string
  width: string
  color: string
}

export function GanttView() {
  const tasks: GanttTask[] = [
    { name: 'Nghiên cứu đối thủ', start: '10%', width: '25%', color: 'bg-purple-500' },
    { name: 'Thiết kế Wireframe & UI', start: '30%', width: '35%', color: 'bg-indigo-500' },
    { name: 'Phát triển API & Backend', start: '50%', width: '40%', color: 'bg-blue-500' },
    { name: 'Kiểm thử & Tối ưu Responsive', start: '75%', width: '20%', color: 'bg-emerald-500' }
  ]

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
        </div>

        {/* Dynamic Project Tabs */}
        <ProjectTabBar />
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="font-bold text-slate-800 text-base">Tiến độ dòng thời gian (Gantt Chart Timeline)</h2>
          <span className="text-xs text-slate-400">Tháng 5, 2026</span>
        </div>

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
      </div>
    </div>
  )
}

export default GanttView
