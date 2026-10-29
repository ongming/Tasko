import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { 
  Plus, 
  Clock, 
  Check, 
  ChevronDown, 
  Filter, 
  Eye, 
  Columns3, 
  List
} from 'lucide-react'
import { Column } from '@/types/task'

// Mock data for board columns with status-specific lane colors
const INITIAL_COLUMNS: Column[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    count: 8,
    colorBadge: 'bg-slate-400',
    countBadgeClass: 'bg-slate-200/90 text-slate-700',
    wrapperClass: 'bg-slate-100/70 border border-slate-200/70',
    headerClass: '',
    accentBorder: '',
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
    wrapperClass: 'bg-indigo-50/40 border border-indigo-100/80',
    headerClass: '',
    accentBorder: '',
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
    wrapperClass: 'bg-amber-50/40 border border-amber-100/80',
    headerClass: '',
    accentBorder: '',
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
    wrapperClass: 'bg-emerald-50/40 border border-emerald-100/80',
    headerClass: '',
    accentBorder: '',
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

export function KanbanBoardView() {
  const [viewMode, setViewMode] = useState<'columns' | 'list'>('columns')
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS)

  return (
    <div className="flex flex-col gap-4 w-full flex-1">
      {/* 1. Filter & Grouping Toolbar */}
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

      {/* 3. Modern Flat Kanban Board Canvas (Cuộn ngang linh hoạt, không gạch border thô, không hộp thẻ nổi) */}
      {viewMode === 'columns' ? (
        <div className="flex-1 min-h-[500px] flex gap-4 overflow-x-auto pb-4 items-start xl:grid xl:grid-cols-4">
          {columns.map((column) => (
            <div
              key={column.id}
              className={`w-[290px] shrink-0 xl:w-auto p-3 rounded-2xl ${column.wrapperClass} flex flex-col gap-3 min-h-[480px] h-full transition-all`}
            >
              {/* Column Header: Tinh gọn, phẳng, thoáng đãng không bọc hộp nổi */}
              <div className="flex items-center justify-between px-2 pt-1 pb-0.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full ${column.colorBadge} shrink-0`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 truncate">
                    {column.title}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${column.countBadgeClass}`}>
                    {column.tasks.length}
                  </span>
                </div>
                <button
                  type="button"
                  className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
                  title={`Thêm công việc vào ${column.title}`}
                  aria-label={`Thêm công việc vào ${column.title}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Cards in this column */}
              <div className="flex flex-col gap-3 flex-1">
                {column.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white p-3.5 rounded-xl shadow-2xs hover:shadow-md hover:border-indigo-300 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group flex flex-col gap-2.5"
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

export default KanbanBoardView
