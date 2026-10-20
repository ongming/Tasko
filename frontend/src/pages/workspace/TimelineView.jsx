import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Star, 
  Share2, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  CalendarRange, 
  Calendar, 
  Clock, 
  Filter, 
  Search, 
  Bookmark, 
  CheckSquare, 
  Layers,
  Sparkles
} from 'lucide-react'
import ProjectTabBar from '@/components/workspace/ProjectTabBar'

export function TimelineView() {
  const [isFavorite, setIsFavorite] = useState(true)
  const [scale, setScale] = useState('months') // 'weeks' | 'months' | 'quarters'

  const timelineItems = [
    {
      epic: 'Giai đoạn 1: Khảo sát & Thiết kế kiến trúc',
      color: 'bg-purple-600',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      startCol: '10%',
      widthCol: '35%',
      progress: 85,
      tasks: [
        { id: 'WR-101', name: 'Nghiên cứu đối thủ cạnh tranh', dates: '01/05 - 12/05', start: '10%', width: '15%', color: 'bg-purple-500' },
        { id: 'WR-102', name: 'Thiết kế Design System trang chủ', dates: '05/05 - 20/05', start: '18%', width: '22%', color: 'bg-indigo-500' },
      ]
    },
    {
      epic: 'Giai đoạn 2: Phát triển Core Backend & API',
      color: 'bg-blue-600',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      startCol: '25%',
      widthCol: '50%',
      progress: 60,
      tasks: [
        { id: 'WR-104', name: 'Phát triển API JWT Authentication & RBAC', dates: '10/05 - 22/05', start: '28%', width: '25%', color: 'bg-blue-500' },
        { id: 'WR-105', name: 'Tích hợp thanh toán MoMo & Stripe', dates: '18/05 - 05/06', start: '45%', width: '25%', color: 'bg-cyan-500' },
      ]
    },
    {
      epic: 'Giai đoạn 3: Kiểm thử, Tối ưu & Ra mắt',
      color: 'bg-emerald-600',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      startCol: '55%',
      widthCol: '40%',
      progress: 20,
      tasks: [
        { id: 'WR-106', name: 'Tối ưu SEO & Performance Core Web Vitals', dates: '28/05 - 15/06', start: '58%', width: '22%', color: 'bg-amber-500' },
        { id: 'WR-108', name: 'Kiểm thử tải & triển khai CI/CD Production', dates: '05/06 - 25/06', start: '70%', width: '25%', color: 'bg-emerald-500' },
      ]
    }
  ]

  const months = ['Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7']

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* 1. Project Ribbon Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Website Redesign
            </h1>
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              title="Đánh dấu dự án yêu thích"
            >
              <Star className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
            </button>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-mono text-xs font-semibold">
              WR-2024
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center -space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-white">NA</div>
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-white">TB</div>
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-white">LC</div>
              <div className="w-8 h-8 rounded-full bg-teal-500 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-white">PD</div>
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center ring-2 ring-white">+5</div>
            </div>
            <button type="button" className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs">
              <Share2 className="w-4 h-4" />
              <span>Chia sẻ</span>
            </button>
          </div>
        </div>

        {/* Dynamic Project Tabs */}
        <ProjectTabBar />
      </div>

      {/* 2. Timeline Controls Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm công việc trên Timeline..."
              className="w-full h-8.5 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Scale Switcher: Tuần / Tháng / Quý */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setScale('weeks')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${scale === 'weeks' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'}`}
            >
              Tuần
            </button>
            <button
              type="button"
              onClick={() => setScale('months')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${scale === 'months' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'}`}
            >
              Tháng
            </button>
            <button
              type="button"
              onClick={() => setScale('quarters')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${scale === 'quarters' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'}`}
            >
              Quý
            </button>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Epic / Mốc</span>
          </button>
        </div>
      </div>

      {/* 3. Timeline Gantt Roadmap Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Timeline Header Row */}
        <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50/80 py-2.5 px-4 text-xs font-bold text-slate-600">
          <div className="col-span-4 border-r border-slate-200 pr-4">
            Epic / Công việc
          </div>
          <div className="col-span-8 grid grid-cols-4 text-center divide-x divide-slate-200">
            {months.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        {/* Timeline Items */}
        <div className="divide-y divide-slate-100">
          {timelineItems.map((item, idx) => (
            <div key={idx} className="flex flex-col">
              {/* Epic Parent Bar */}
              <div className="grid grid-cols-12 items-center py-3 px-4 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                <div className="col-span-4 border-r border-slate-200 pr-4 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${item.color} shrink-0`} />
                  <span className="text-xs font-bold text-slate-900 truncate">{item.epic}</span>
                  <span className="text-[10px] font-bold text-indigo-600 ml-auto shrink-0">{item.progress}%</span>
                </div>
                <div className="col-span-8 pl-4 relative h-7 flex items-center">
                  <div 
                    className={`absolute h-5.5 rounded-md ${item.color} opacity-90 shadow-2xs text-white text-[10px] font-bold px-2 flex items-center justify-between overflow-hidden`}
                    style={{ left: item.startCol, width: item.widthCol }}
                  >
                    <span className="truncate">{item.epic}</span>
                    <span>{item.progress}%</span>
                  </div>
                </div>
              </div>

              {/* Sub-tasks in this Epic */}
              {item.tasks.map((task) => (
                <div key={task.id} className="grid grid-cols-12 items-center py-2 px-4 hover:bg-slate-50/70 transition-colors">
                  <div className="col-span-4 border-r border-slate-200 pr-4 pl-6 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[11px] font-semibold text-slate-400">{task.id}</span>
                      <span className="text-slate-700 truncate font-medium text-[11px]">{task.name}</span>
                    </div>
                  </div>
                  <div className="col-span-8 pl-4 relative h-6 flex items-center">
                    <div 
                      className={`absolute h-4 rounded-md ${task.color} text-white text-[9px] font-bold px-2 flex items-center truncate shadow-2xs`}
                      style={{ left: task.start, width: task.width }}
                      title={`${task.name} (${task.dates})`}
                    >
                      {task.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TimelineView
