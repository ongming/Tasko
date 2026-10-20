import React from 'react'
import { Sliders, Activity, TrendingUp, CheckCircle, Clock, Users } from 'lucide-react'
import ProjectTabBar from '@/components/workspace/ProjectTabBar'

export function ControlBoardView() {
  const metrics = [
    { label: 'Tốc độ hoàn thành (Velocity)', value: '38 SP/sprint', change: '+12%', isPositive: true, icon: TrendingUp },
    { label: 'Thời gian hoàn thành (Cycle Time)', value: '3.2 ngày', change: '-18%', isPositive: true, icon: Clock },
    { label: 'Tỷ lệ hoàn thành đúng hạn', value: '94.2%', change: '+4.5%', isPositive: true, icon: CheckCircle },
    { label: 'Thành viên tham gia tích cực', value: '9 thành viên', change: '100%', isPositive: true, icon: Users },
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((item, idx) => {
          const Icon = item.icon
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{item.label}</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-slate-900">{item.value}</span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {item.change}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col gap-4">
        <h2 className="text-base font-bold text-slate-900">Sức khỏe dự án & Cảnh báo nghẽn (Bottlenecks)</h2>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-800">Không có công việc nào bị tồn đọng quá 5 ngày</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">Cập nhật 15 phút trước bởi Tasko AI</span>
        </div>
      </div>
    </div>
  )
}

export default ControlBoardView
