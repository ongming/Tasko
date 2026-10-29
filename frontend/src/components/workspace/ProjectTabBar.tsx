import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Kanban, 
  ListTodo, 
  CalendarRange, 
  Calendar, 
  BarChart3, 
  Sliders, 
  Plus, 
  X
} from 'lucide-react'
import { ProjectViewType } from '@/types/workspace'

// All possible view types available in the project
export const ALL_VIEW_TYPES: ProjectViewType[] = [
  { 
    id: 'control', 
    label: 'Control Board', 
    path: '/workspace/control', 
    icon: Sliders, 
    isCore: true,
    description: 'Bảng điều khiển tổng quan dự án (Summary), chỉ số và hoạt động gần đây'
  },
  { 
    id: 'board', 
    label: 'Bảng Kanban', 
    path: '/workspace/board', 
    icon: Kanban, 
    isCore: true,
    description: 'Bảng công việc 4 cột trạng thái: Backlog, In Progress, Review, Done'
  },
  { 
    id: 'backlog', 
    label: 'Backlog', 
    path: '/workspace/backlog', 
    icon: ListTodo, 
    isCore: true,
    description: 'Lập kế hoạch Sprint, chia nhỏ công việc và ước lượng Story Points'
  },
  { 
    id: 'timeline', 
    label: 'Timeline', 
    path: '/workspace/timeline', 
    icon: CalendarRange, 
    isCore: false,
    description: 'Lộ trình phát triển và dòng thời gian tổng thể các mốc dự án'
  },
  { 
    id: 'calendar', 
    label: 'Calendar', 
    path: '/workspace/calendar', 
    icon: Calendar, 
    isCore: false,
    description: 'Xem các hạn chót và lịch trình phát hành theo ngày/tháng'
  },
  { 
    id: 'gantt', 
    label: 'Gantt Chart', 
    path: '/workspace/gantt', 
    icon: BarChart3, 
    isCore: false,
    description: 'Biểu đồ tiến độ chi tiết và mối quan hệ phụ thuộc giữa các công việc'
  },
]

export function ProjectTabBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Track which optional views are pinned on the tab bar
  const [pinnedViewIds, setPinnedViewIds] = useState<string[]>(() => {
    // Check if the current URL matches an optional view
    const currentPath = location.pathname
    const matchedView = ALL_VIEW_TYPES.find(v => v.path === currentPath)
    const defaults = ['control', 'board', 'backlog']
    if (matchedView && !defaults.includes(matchedView.id)) {
      return [...defaults, matchedView.id]
    }
    return defaults
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-pin view if user navigates to it
  useEffect(() => {
    const matchedView = ALL_VIEW_TYPES.find(v => v.path === location.pathname)
    if (matchedView && !pinnedViewIds.includes(matchedView.id)) {
      setPinnedViewIds(prev => [...prev, matchedView.id])
    }
  }, [location.pathname, pinnedViewIds])

  const visibleTabs = ALL_VIEW_TYPES.filter(v => v.isCore || pinnedViewIds.includes(v.id))

  const handleSelectView = (view: ProjectViewType) => {
    if (!pinnedViewIds.includes(view.id)) {
      setPinnedViewIds(prev => [...prev, view.id])
    }
    setIsDropdownOpen(false)
    navigate(view.path)
  }

  const handleRemoveTab = (e: React.MouseEvent, viewId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setPinnedViewIds(prev => prev.filter(id => id !== viewId))
    // If the active tab was removed, navigate to board
    const removedView = ALL_VIEW_TYPES.find(v => v.id === viewId)
    if (removedView && location.pathname === removedView.path) {
      navigate('/workspace/board')
    }
  }

  return (
    <div className="relative">
      <nav className="px-4 sm:px-6 flex items-center gap-1 sm:gap-2 border-b border-slate-200 overflow-x-auto scrollbar-none">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = location.pathname === tab.path || (tab.id === 'board' && (location.pathname === '/workspace' || location.pathname === '/workspace/'))

          return (
            <div key={tab.id} className="relative group/tab flex items-center">
              <Link
                to={tab.path}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 font-semibold '
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </Link>

              {/* Close button for non-core views */}
              {!tab.isCore && (
                <button
                  type="button"
                  onClick={(e) => handleRemoveTab(e, tab.id)}
                  className="opacity-0 group-hover/tab:opacity-100 -ml-1 mr-1 p-0.5 text-slate-400 hover:text-rose-500 rounded transition-opacity"
                  title={`Đóng chế độ xem ${tab.label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )
        })}

        {/* The '+' Add View Button */}
        <div className="relative flex items-center" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`p-1.5 rounded-lg transition-all ${
              isDropdownOpen
                ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-100'
                : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
            }`}
            title="Thêm chế độ xem"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Add View Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Thêm chế độ xem vào dự án
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Chọn định dạng hiển thị phù hợp với giai đoạn quản lý
                </span>
              </div>

              <div className="py-1 flex flex-col gap-1 max-h-80 overflow-y-auto">
                {ALL_VIEW_TYPES.map((view) => {
                  const Icon = view.icon
                  const isPinned = pinnedViewIds.includes(view.id) || view.isCore

                  return (
                    <button
                      key={view.id}
                      type="button"
                      onClick={() => handleSelectView(view)}
                      className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group cursor-pointer"
                    >
                      <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-indigo-50 text-slate-600 group-hover:text-indigo-600 shrink-0 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {view.label}
                          </span>
                          {isPinned && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500">
                              Đang mở
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 leading-snug">
                          {view.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}

export default ProjectTabBar
