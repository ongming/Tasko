import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { 
  Kanban, 
  ListTodo, 
  CalendarRange, 
  Calendar, 
  Sliders, 
  Plus, 
  X,
  Settings,
  List
} from 'lucide-react'
import { projectService } from '@/services/projectService'
import { isScrumProject } from '@/utils/projectMethod'
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
    id: 'list', 
    label: 'Danh sách', 
    path: '/workspace/list', 
    icon: List, 
    isCore: false,
    description: 'Xem toàn bộ công việc dạng danh sách dòng kẻ, quét nhanh và lọc dễ dàng'
  },
  { 
    id: 'timeline', 
    label: 'Lộ trình', 
    path: '/workspace/timeline', 
    icon: CalendarRange, 
    isCore: false,
    description: 'Lộ trình tiến độ tổng thể các mốc thời gian và công việc của dự án'
  },
  { 
    id: 'calendar', 
    label: 'Lịch', 
    path: '/workspace/calendar', 
    icon: Calendar, 
    isCore: false,
    description: 'Theo dõi các hạn chót và lịch bàn giao theo ngày/tháng'
  },
]

export interface ProjectTabBarProps {
  project?: Project | null
}

export function ProjectTabBar({ project }: ProjectTabBarProps = {}) {
  const queryClient = useQueryClient()
  const location = useLocation()
  const navigate = useNavigate()
  const { workspaceSlug, projectKey } = useParams<{ workspaceSlug?: string; projectKey?: string }>()
  const activeKey = projectKey || project?.key
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const closingViewRef = useRef<string | null>(null)

  // Hàm sinh đường dẫn linh hoạt (hỗ trợ cả RESTful /:workspace/:key/tab và /workspace/tab?project=...)
  const getTabPath = (tabId: string) => {
    if (workspaceSlug && activeKey) {
      return `/${workspaceSlug}/${activeKey}/${tabId}`
    }
    if (tabId === 'settings') {
      return `/workspace/project-settings${location.search}`
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
      (tabId === 'settings'
        ? location.pathname === '/workspace/project-settings'
        : location.pathname === `/workspace/${tabId}`) ||
      (tabId === 'board' &&
        (location.pathname === '/workspace' || location.pathname === '/workspace/'))
    )
  }

  // Xác định phương pháp quản lý của dự án (Scrum/Scrumban hay Kanban)
  const isScrum = isScrumProject(project)

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

  // Tự động đồng bộ tabs khi project thay đổi hoặc project.settings.views từ database được tải về
  useEffect(() => {
    if (project) {
      if (Array.isArray(project.settings?.views) && project.settings.views.length > 0) {
        const validViews = project.settings.views.filter((id) => {
          const view = ALL_VIEW_TYPES.find((v) => v.id === id)
          if (!view) return false
          if (view.onlyScrum && !isScrum) return false
          return true
        })
        setPinnedViewIds(validViews)
      } else {
        setPinnedViewIds(isScrum ? ['control', 'board', 'backlog'] : ['control', 'board'])
      }
    }
  }, [project?.id, isScrum, JSON.stringify(project?.settings?.views)])

  // Nếu dự án là Kanban mà đang mở URL backlog thì tự chuyển về board
  useEffect(() => {
    if (!isScrum && location.pathname.endsWith('/backlog')) {
      navigate(getTabPath('board'), { replace: true })
    }
  }, [isScrum, location.pathname])

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

  // Auto-pin view if user navigates to it (skip if user just clicked X to close this tab)
  useEffect(() => {
    const matchedView = availableViewTypes.find((v) => location.pathname.endsWith('/' + v.id) || v.path === location.pathname)
    if (!matchedView) {
      closingViewRef.current = null
      return
    }
    if (closingViewRef.current === matchedView.id) {
      return
    }
    closingViewRef.current = null
    if (!pinnedViewIds.includes(matchedView.id)) {
      setPinnedViewIds((prev) => [...prev, matchedView.id])
    }
  }, [location.pathname, pinnedViewIds, availableViewTypes])

  const visibleTabs = availableViewTypes.filter(
    (v) => (v.isCore && (!v.onlyScrum || isScrum)) || pinnedViewIds.includes(v.id),
  )

  // Chỉ hiển thị trong Popup các View chưa có trên thanh Tab
  const unpinnedViews = availableViewTypes.filter(
    (v) => !visibleTabs.some((tab) => tab.id === v.id),
  )

  const handleSelectView = async (view: ProjectViewType) => {
    let nextPinned = pinnedViewIds
    if (!pinnedViewIds.includes(view.id)) {
      nextPinned = [...pinnedViewIds, view.id]
      setPinnedViewIds(nextPinned)

      // Lưu cập nhật views theo từng project vào Database
      const targetProjectId = project?.id || activeKey
      if (targetProjectId) {
        try {
          await projectService.updateProjectSettings(targetProjectId, {
            settings: {
              ...(project?.settings || {}),
              views: nextPinned,
            },
            views: nextPinned,
          })
          queryClient.invalidateQueries({ queryKey: ['project'] })
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
    closingViewRef.current = viewId
    const nextPinned = pinnedViewIds.filter((id) => id !== viewId)
    setPinnedViewIds(nextPinned)

    // If the active tab was removed, navigate to board immediately
    if (location.pathname.endsWith('/' + viewId)) {
      navigate(getTabPath('board'), { replace: true })
    }

    // Lưu cập nhật views theo từng project vào Database
    const targetProjectId = project?.id || activeKey
    if (targetProjectId) {
      try {
        await projectService.updateProjectSettings(targetProjectId, {
          settings: {
            ...(project?.settings || {}),
            views: nextPinned,
          },
          views: nextPinned,
        })
        queryClient.invalidateQueries({ queryKey: ['project'] })
      } catch (err) {
        console.error('Failed to persist unpinned view to database:', err)
      }
    }
  }

  return (
    <div className="relative z-10">
      <nav className="px-4 sm:px-6 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          {/* Danh sách các Tab đang hiển thị (cuộn ngang nếu quá nhiều tab trên màn hình hẹp) */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-1">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = isTabActive(tab.id)

              return (
                <div key={tab.id} className="relative group/tab flex items-center">
                  <Link
                    to={getTabPath(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 -mb-1 whitespace-nowrap transition-all ${
                      isActive
                        ? 'border-indigo-600 text-indigo-600 font-semibold'
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-lg'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </Link>

                  {/* Nút đóng dành cho các view phụ không phải Core */}
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
          </div>

          {/* Nút '+' Thêm View - Đặt ngoài scroll container để popup KHÔNG BAO GIỜ bị overflow clip */}
          <div className="relative shrink-0 flex items-center" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                isDropdownOpen
                  ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-200 shadow-2xs'
                  : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
              }`}
              title="Thêm chế độ xem"
              aria-label="Thêm chế độ xem"
              aria-expanded={isDropdownOpen}
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Popup Menu chọn Chế độ xem */}
            {isDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white rounded-xl border border-slate-200/90 shadow-xl p-1.5 z-50 animate-in fade-in duration-100">
                <div className="flex flex-col gap-0.5 max-h-80 overflow-y-auto">
                  {unpinnedViews.length > 0 ? (
                    unpinnedViews.map((view) => {
                      const Icon = view.icon

                      return (
                        <button
                          key={view.id}
                          type="button"
                          onClick={() => handleSelectView(view)}
                          className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors text-left group cursor-pointer"
                        >
                          <div className="p-1.5 rounded-md bg-slate-100 group-hover:bg-indigo-50 text-slate-600 group-hover:text-indigo-600 shrink-0 transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors block">
                              {view.label}
                            </span>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 leading-snug">
                              {view.description}
                            </p>
                          </div>
                        </button>
                      )
                    })
                  ) : (
                    <div className="p-3 text-center">
                      <p className="text-xs font-medium text-slate-600">Đã mở tất cả chế độ xem</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Tất cả chế độ xem đã có trên thanh điều hướng.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nút Cài đặt dự án */}
        <div className="shrink-0 flex items-center pl-2">
          <Link
            to={getTabPath('settings')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isTabActive('settings')
                ? 'bg-indigo-50 text-indigo-600 font-semibold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Cài đặt dự án"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cài đặt</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}

export default ProjectTabBar
