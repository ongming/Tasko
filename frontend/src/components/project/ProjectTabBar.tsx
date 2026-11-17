import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
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
import { projectService } from '@/services/projectService'
import type { Project, ProjectViewType } from '@/types/workspace'

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
    label: 'Bảng', 
    path: '/workspace/board', 
    icon: Kanban, 
    isCore: true,
    description: 'Bảng công việc theo các cột trạng thái'
  },
  { 
    id: 'backlog', 
    label: 'Backlog', 
    path: '/workspace/backlog', 
    icon: ListTodo, 
    isCore: true,
    onlyScrum: true,
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

export interface ProjectTabBarProps {
  project?: Project | null
}

export function ProjectTabBar({ project }: ProjectTabBarProps = {}) {
  const location = useLocation()
  const navigate = useNavigate()
  const { workspaceSlug, projectKey } = useParams<{ workspaceSlug?: string; projectKey?: string }>()
  const activeKey = projectKey || project?.key
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Hàm sinh đường dẫn linh hoạt (hỗ trợ cả RESTful /:workspace/:key/tab và /workspace/tab?project=...)
  const getTabPath = (tabId: string) => {
    if (workspaceSlug && activeKey) {
      return `/${workspaceSlug}/${activeKey}/${tabId}`
    }
    return `/workspace/${tabId}${location.search}`
  }

  const isTabActive = (tabId: string) => {
    if (workspaceSlug && activeKey) {
      return (
        location.pathname === `/${workspaceSlug}/${activeKey}/${tabId}` ||
        (tabId === 'board' &&
          (location.pathname === `/${workspaceSlug}/${activeKey}` ||
            location.pathname === `/${workspaceSlug}/${activeKey}/`))
      )
    }
    return (
      location.pathname === `/workspace/${tabId}` ||
      (tabId === 'board' &&
        (location.pathname === '/workspace' || location.pathname === '/workspace/'))
    )
  }

  // Xác định phương pháp quản lý của dự án (Scrum hay Kanban)
  const methodId =
    project?.settings?.method_id ||
    (project?.name?.toLowerCase().includes('scrum') ? 'scrum' : 'kanban')
  const isScrum = methodId === 'scrum' || methodId === 'scrumban'

  // Lấy danh sách views đã lưu trong database nếu có
  const savedViews: string[] | null = Array.isArray(project?.settings?.views)
    ? (project.settings.views as string[])
    : null

  // Chỉ cho phép hiển thị Backlog nếu dự án là Scrum
  const availableViewTypes = ALL_VIEW_TYPES.filter((v) => !v.onlyScrum || isScrum)
  const defaultCoreIds =
    savedViews && savedViews.length > 0
      ? savedViews
      : isScrum
        ? ['control', 'board', 'backlog']
        : ['control', 'board']

  // Track which optional views are pinned on the tab bar
  const [pinnedViewIds, setPinnedViewIds] = useState<string[]>(() => {
    const currentPath = location.pathname
    const matchedView = availableViewTypes.find((v) => currentPath.endsWith('/' + v.id) || v.path === currentPath)
    if (matchedView && !defaultCoreIds.includes(matchedView.id)) {
      return [...defaultCoreIds, matchedView.id]
    }
    return defaultCoreIds
  })

  // Tự động đồng bộ tabs khi project.settings.views từ database được tải về
  useEffect(() => {
    if (project?.settings?.views && Array.isArray(project.settings.views)) {
      setPinnedViewIds(project.settings.views)
    }
  }, [project?.settings?.views])

  // Tự động đồng bộ tabs khi method của dự án thay đổi (ví dụ khi load xong thông tin project)
  useEffect(() => {
    setPinnedViewIds((prev) => {
      const valid = prev.filter((id) => {
        const view = ALL_VIEW_TYPES.find((v) => v.id === id)
        if (!view) return false
        if (view.onlyScrum && !isScrum) return false
        return true
      })
      defaultCoreIds.forEach((id) => {
        if (!valid.includes(id)) valid.push(id)
      })
      return valid
    })

    // Nếu dự án là Kanban mà đang mở URL backlog thì tự chuyển về board
    if (!isScrum && location.pathname.endsWith('/backlog')) {
      navigate(getTabPath('board'), { replace: true })
    }
  }, [isScrum, location.pathname, location.search, navigate])

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
    const matchedView = availableViewTypes.find((v) => location.pathname.endsWith('/' + v.id) || v.path === location.pathname)
    if (matchedView && !pinnedViewIds.includes(matchedView.id)) {
      setPinnedViewIds((prev) => [...prev, matchedView.id])
    }
  }, [location.pathname, pinnedViewIds, availableViewTypes])

  const visibleTabs = availableViewTypes.filter(
    (v) => (v.isCore && (!v.onlyScrum || isScrum)) || pinnedViewIds.includes(v.id),
  )

  const handleSelectView = async (view: ProjectViewType) => {
    let nextPinned = pinnedViewIds
    if (!pinnedViewIds.includes(view.id)) {
      nextPinned = [...pinnedViewIds, view.id]
      setPinnedViewIds(nextPinned)

      // Lưu cập nhật vào Database
      const targetProjectId = project?.id || activeKey
      if (targetProjectId) {
        try {
          await projectService.updateProjectSettings(targetProjectId, { views: nextPinned })
        } catch (err) {
          console.error('Failed to persist pinned view to database:', err)
        }
      }
    }
    setIsDropdownOpen(false)
    navigate(getTabPath(view.id))
  }

  const handleRemoveTab = async (e: React.MouseEvent, viewId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const nextPinned = pinnedViewIds.filter((id) => id !== viewId)
    setPinnedViewIds(nextPinned)

    // Lưu cập nhật vào Database
    const targetProjectId = project?.id || activeKey
    if (targetProjectId) {
      try {
        await projectService.updateProjectSettings(targetProjectId, { views: nextPinned })
      } catch (err) {
        console.error('Failed to persist unpinned view to database:', err)
      }
    }

    // If the active tab was removed, navigate to board
    if (location.pathname.endsWith('/' + viewId)) {
      navigate(getTabPath('board'))
    }
  }

  return (
    <div className="relative">
      <nav className="px-4 sm:px-6 flex items-center gap-1 sm:gap-2 border-b border-slate-200 overflow-x-auto scrollbar-none">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = isTabActive(tab.id)

          return (
            <div key={tab.id} className="relative group/tab flex items-center">
              <Link
                to={getTabPath(tab.id)}
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
                {availableViewTypes.map((view) => {
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
