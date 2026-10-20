import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Star, 
  Share2, 
  Kanban, 
  Zap, 
  BarChart3, 
  Calendar, 
  Sliders, 
  Plus, 
  Clock, 
  Check, 
  ChevronDown, 
  Filter, 
  Eye, 
  Columns3, 
  List, 
  Layers,
  Sparkles
} from 'lucide-react'

import ProjectTabBar, { ALL_VIEW_TYPES as PROJECT_TABS } from '@/components/workspace/ProjectTabBar'

// Mock data for board columns with status-specific lane colors
const INITIAL_COLUMNS = [
  {
    id: 'backlog',
    title: 'Backlog',
    count: 8,
    colorBadge: 'bg-slate-400',
    countBadgeClass: 'bg-slate-200/90 text-slate-700',
    wrapperClass: 'bg-slate-100/75 border border-slate-200/90 shadow-2xs',
    headerClass: 'bg-white/95 border border-slate-200/80',
    accentBorder: 'border-t-4 border-t-slate-400',
    quickAddClass: 'border-slate-300/80 text-slate-500 hover:text-slate-800 hover:border-slate-400 hover:bg-white',
    tasks: [
      {
        id: 'WR-101',
        title: 'Nghiên cứu đối thủ cạnh tranh',
        tag: 'Research',
        tagClass: 'bg-purple-50 text-purple-700 border border-purple-200/50',
        dueDate: '12 thg 5',
        assignees: [
          { name: 'NA', bg: 'bg-indigo-600 text-white' },
          { name: 'TB', bg: 'bg-blue-500 text-white' }
        ]
      },
      {
        id: 'WR-102',
        title: 'Thiết kế giao diện trang chủ',
        tag: 'Design',
        tagClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200/50',
        dueDate: '15 thg 5',
        assignees: [
          { name: 'LC', bg: 'bg-amber-500 text-white' }
        ]
      },
      {
        id: 'WR-103',
        title: 'Viết nội dung marketing',
        tag: 'Content',
        tagClass: 'bg-rose-50 text-rose-700 border border-rose-200/50',
        dueDate: '18 thg 5',
        assignees: [
          { name: 'PD', bg: 'bg-teal-500 text-white' }
        ]
      }
    ]
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    count: 6,
    colorBadge: 'bg-indigo-600',
    countBadgeClass: 'bg-indigo-100 text-indigo-700',
    wrapperClass: 'bg-indigo-50/50 border border-indigo-200/70 shadow-2xs',
    headerClass: 'bg-white/95 border border-indigo-200/80',
    accentBorder: 'border-t-4 border-t-indigo-600',
    quickAddClass: 'border-indigo-200 text-indigo-600 hover:text-indigo-800 hover:border-indigo-400 hover:bg-white',
    tasks: [
      {
        id: 'WR-104',
        title: 'Phát triển API đăng nhập',
        tag: 'Backend',
        tagClass: 'bg-blue-50 text-blue-700 border border-blue-200/50',
        dueDate: '10 thg 5',
        assignees: [
          { name: 'NA', bg: 'bg-indigo-600 text-white' }
        ]
      },
      {
        id: 'WR-105',
        title: 'Tích hợp thanh toán',
        tag: 'Backend',
        tagClass: 'bg-blue-50 text-blue-700 border border-blue-200/50',
        dueDate: '14 thg 5',
        assignees: [
          { name: 'HQ', bg: 'bg-cyan-600 text-white' }
        ]
      },
      {
        id: 'WR-106',
        title: 'Tối ưu SEO',
        tag: 'SEO',
        tagClass: 'bg-amber-50 text-amber-700 border border-amber-200/50',
        dueDate: '17 thg 5',
        assignees: [
          { name: 'MN', bg: 'bg-purple-600 text-white' }
        ]
      }
    ]
  },
  {
    id: 'review',
    title: 'Review',
    count: 4,
    colorBadge: 'bg-amber-500',
    countBadgeClass: 'bg-amber-100 text-amber-800',
    wrapperClass: 'bg-amber-50/50 border border-amber-200/70 shadow-2xs',
    headerClass: 'bg-white/95 border border-amber-200/80',
    accentBorder: 'border-t-4 border-t-amber-500',
    quickAddClass: 'border-amber-200 text-amber-700 hover:text-amber-900 hover:border-amber-400 hover:bg-white',
    tasks: [
      {
        id: 'WR-107',
        title: 'Sửa lỗi responsive',
        tag: 'Frontend',
        tagClass: 'bg-sky-50 text-sky-700 border border-sky-200/50',
        dueDate: '11 thg 5',
        assignees: [
          { name: 'TB', bg: 'bg-blue-500 text-white' }
        ]
      },
      {
        id: 'WR-108',
        title: 'Đánh giá hiệu năng',
        tag: 'DevOps',
        tagClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
        dueDate: '13 thg 5',
        assignees: [
          { name: 'NA', bg: 'bg-indigo-600 text-white' }
        ]
      }
    ]
  },
  {
    id: 'done',
    title: 'Done',
    count: 12,
    colorBadge: 'bg-emerald-500',
    countBadgeClass: 'bg-emerald-100 text-emerald-800',
    wrapperClass: 'bg-emerald-50/50 border border-emerald-200/70 shadow-2xs',
    headerClass: 'bg-white/95 border border-emerald-200/80',
    accentBorder: 'border-t-4 border-t-emerald-500',
    quickAddClass: 'border-emerald-200 text-emerald-700 hover:text-emerald-900 hover:border-emerald-400 hover:bg-white',
    tasks: [
      {
        id: 'WR-109',
        title: 'Tạo wireframe ban đầu',
        tag: 'Design',
        tagClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200/50',
        dueDate: '08 thg 5',
        isDone: true,
        assignees: [
          { name: 'LC', bg: 'bg-amber-500 text-white' }
        ]
      },
      {
        id: 'WR-110',
        title: 'Khởi tạo repository',
        tag: 'Setup',
        tagClass: 'bg-slate-100 text-slate-700 border border-slate-200/50',
        dueDate: '09 thg 5',
        isDone: true,
        assignees: [
          { name: 'VT', bg: 'bg-slate-700 text-white' }
        ]
      }
    ]
  }
]

export function BoardView() {
  const location = useLocation()
  const [isFavorite, setIsFavorite] = useState(true)
  const [viewMode, setViewMode] = useState('columns') // 'columns' | 'list'
  const [columns, setColumns] = useState(INITIAL_COLUMNS)

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* 1. Project Header & Ribbon */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left: Project title, Favorite star, Key badge */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Website Redesign
            </h1>
            
            {/* Interactive favorite star toggle */}
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              title={isFavorite ? 'Bỏ đánh dấu yêu thích' : 'Đánh dấu dự án yêu thích'}
            >
              <Star 
                className={`w-5 h-5 transition-colors ${
                  isFavorite 
                    ? 'fill-amber-400 text-amber-500' 
                    : 'text-slate-400 hover:text-amber-500'
                }`} 
              />
            </button>

            {/* Project key code */}
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-mono text-xs font-semibold tracking-wider">
              WR-2024
            </span>
          </div>

          {/* Right: Member Avatar Stack & Share Action */}
          <div className="flex items-center gap-4">
            {/* Avatar Stack */}
            <div className="flex items-center -space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-white shadow-xs" title="Nguyễn An">
                NA
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-white shadow-xs" title="Trần Bình">
                TB
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-white shadow-xs" title="Lê Cúc">
                LC
              </div>
              <div className="w-8 h-8 rounded-full bg-teal-500 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-white shadow-xs" title="Phạm Dũng">
                PD
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center ring-2 ring-white shadow-xs">
                +5
              </div>
            </div>

            {/* Share CTA button */}
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs hover:shadow transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>Chia sẻ</span>
            </button>
          </div>
        </div>

        {/* Project Navigation Tab Bar with dynamic views */}
        <ProjectTabBar />
      </div>

      {/* 2. Filter & Grouping Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3 py-1">
        {/* Left Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick status dropdown filter */}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <span>Todo</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Filter button */}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Bộ lọc</span>
          </button>

          <div className="hidden sm:block h-4 w-px bg-slate-200" />

          {/* Total count badge */}
          <div className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>20 / 20 công việc</span>
          </div>
        </div>

        {/* Right View Switch & Group By */}
        <div className="flex items-center gap-3">
          {/* Columns / List switch */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('columns')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'columns'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Cột</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Danh sách</span>
            </button>
          </div>

          {/* Group by */}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 text-xs text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <span className="text-slate-400 font-normal">Nhóm theo:</span>
            <span className="font-semibold text-indigo-600">Trạng thái</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 3. 4-Column Agile Kanban Board Canvas */}
      {viewMode === 'columns' ? (
        <div className="bg-slate-200/40 p-3 sm:p-4 rounded-3xl border border-slate-200/60 min-h-[660px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {columns.map((column) => (
            <div
              key={column.id}
              className={`p-3 rounded-2xl ${column.wrapperClass} ${column.accentBorder} flex flex-col gap-3 min-h-[620px] transition-all`}
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl ${column.headerClass} shadow-2xs`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${column.colorBadge}`} />
                  <span className="text-sm font-bold text-slate-800">{column.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${column.countBadgeClass}`}>
                    {column.tasks.length}
                  </span>
                </div>
                <button
                  type="button"
                  className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                  title={`Thêm công việc vào ${column.title}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Cards in this column */}
              <div className="flex flex-col gap-3 flex-1">
                {column.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group flex flex-col gap-2.5"
                  >
                    {/* Top Tag & Due Date */}
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${task.tagClass}`}>
                        {task.tag}
                      </span>
                      <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
                        {task.isDone ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Clock className="w-3 h-3 text-slate-400" />
                        )}
                        <span>{task.dueDate}</span>
                      </span>
                    </div>

                    {/* Task Title */}
                    <h3 className={`text-sm font-semibold transition-colors ${
                      task.isDone 
                        ? 'text-slate-400 line-through' 
                        : 'text-slate-800 group-hover:text-indigo-600'
                    }`}>
                      {task.title}
                    </h3>

                    {/* Bottom Metadata: Task ID & Assignees */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="font-mono text-xs font-medium text-slate-400">
                        {task.id}
                      </span>
                      <div className="flex items-center -space-x-1.5">
                        {task.assignees.map((assignee, idx) => (
                          <div
                            key={idx}
                            className={`w-6 h-6 rounded-full ${assignee.bg} flex items-center justify-center text-[10px] font-bold ring-2 ring-white shadow-2xs`}
                            title={assignee.name}
                          >
                            {assignee.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Quick Add Card Placeholder */}
                <button
                  type="button"
                  className={`mt-auto flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-dashed text-xs font-semibold transition-all ${column.quickAddClass}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo việc mới</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View Alternative */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 font-semibold text-xs text-slate-500 uppercase tracking-wider">
            <span>Mã / Tên công việc</span>
            <div className="flex items-center gap-12">
              <span className="w-24 text-center">Trạng thái</span>
              <span className="w-20 text-center">Hạn chót</span>
              <span className="w-16 text-right">Phụ trách</span>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {columns.flatMap((col) => col.tasks.map((task) => ({ ...task, status: col.title }))).map((task) => (
              <div 
                key={task.id} 
                className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-slate-400 w-16">
                    {task.id}
                  </span>
                  <span className={`text-sm font-medium ${task.isDone ? 'line-through text-slate-400' : 'text-slate-800 group-hover:text-indigo-600'}`}>
                    {task.title}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${task.tagClass}`}>
                    {task.tag}
                  </span>
                </div>
                <div className="flex items-center gap-12 text-xs">
                  <span className="w-24 text-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                    {task.status}
                  </span>
                  <span className="w-20 text-center text-slate-500">
                    {task.dueDate}
                  </span>
                  <div className="w-16 flex justify-end -space-x-1.5">
                    {task.assignees.map((assignee, idx) => (
                      <div
                        key={idx}
                        className={`w-6 h-6 rounded-full ${assignee.bg} flex items-center justify-center text-[10px] font-bold ring-2 ring-white`}
                      >
                        {assignee.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default BoardView
