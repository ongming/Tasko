import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Settings, 
  Plus, 
  ChevronsUpDown, 
  Check,
  Sliders
} from 'lucide-react'
import type { NavItem, Project } from '@/types/workspace'

export interface WorkspaceItem {
  id: string
  name: string
  subtitle: string
  initial: string
  color: string
  projects: Project[]
}

const WORKSPACES_DATA: WorkspaceItem[] = [
  {
    id: 'ws-marketing',
    name: 'Marketing Team',
    subtitle: 'Tasko Agile',
    initial: 'M',
    color: 'bg-indigo-600',
    projects: [
      { id: 'website-redesign', name: 'Website Redesign', count: 18, color: 'bg-indigo-600' },
      { id: 'mobile-app', name: 'Mobile App', count: 9, color: 'bg-emerald-500' },
      { id: 'marketing-campaign', name: 'Marketing Campaign', count: 5, color: 'bg-amber-500' },
    ],
  },
  {
    id: 'ws-tech',
    name: 'Kỹ thuật & Công nghệ',
    subtitle: 'Sprint Scrum',
    initial: 'K',
    color: 'bg-blue-600',
    projects: [
      { id: 'backend-core', name: 'Backend API NestJS', count: 12, color: 'bg-blue-600' },
      { id: 'frontend-react', name: 'Frontend React 19', count: 8, color: 'bg-cyan-500' },
      { id: 'devops-infra', name: 'DevOps & CI/CD', count: 3, color: 'bg-purple-500' },
    ],
  },
  {
    id: 'ws-product',
    name: 'Phát triển Sản phẩm',
    subtitle: 'Kanban Flow',
    initial: 'P',
    color: 'bg-violet-600',
    projects: [
      { id: 'design-system', name: 'Design System & UI', count: 14, color: 'bg-violet-600' },
      { id: 'user-research', name: 'Nghiên cứu Người dùng', count: 4, color: 'bg-rose-500' },
    ],
  },
]

export interface WorkspaceSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export function WorkspaceSidebar({ isMobileOpen, setIsMobileOpen }: WorkspaceSidebarProps) {
  const location = useLocation()

  // Quản lý Không gian làm việc đang chọn và Dự án đang chọn
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('ws-marketing')
  const [currentProject, setCurrentProject] = useState<string>('website-redesign')
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false)
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 220 })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const currentWorkspace =
    WORKSPACES_DATA.find((w) => w.id === selectedWorkspaceId) || WORKSPACES_DATA[0]

  // Mở dropdown và tính toán toạ độ vị trí trên màn hình
  const toggleWorkspaceDropdown = () => {
    if (!isWorkspaceDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownCoords({
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.max(rect.width, 240),
      })
    }
    setIsWorkspaceDropdownOpen((prev) => !prev)
  }

  // Đóng dropdown khi click ra ngoài hoặc khi cuộn
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsWorkspaceDropdownOpen(false)
      }
    }

    function handleScroll() {
      setIsWorkspaceDropdownOpen(false)
    }

    if (isWorkspaceDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('scroll', handleScroll, true)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isWorkspaceDropdownOpen])

  // Chuyển đổi workspace -> tự động chọn dự án đầu tiên của workspace đó
  const handleSelectWorkspace = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId)
    const targetWs = WORKSPACES_DATA.find((w) => w.id === workspaceId)
    if (targetWs && targetWs.projects.length > 0) {
      setCurrentProject(targetWs.projects[0].id)
    }
    setIsWorkspaceDropdownOpen(false)
  }

  const navItems: NavItem[] = [
    { label: 'Tổng quan', path: '/workspace/overview', icon: LayoutDashboard },
    { label: 'Dự án', path: '/workspace/projects', icon: FolderKanban },
    { label: 'Bảng Kanban', path: '/workspace/board', icon: CheckSquare },
    { label: 'Control Board', path: '/workspace/control', icon: Sliders },
    { label: 'Cài đặt', path: '/workspace/settings', icon: Settings },
  ]

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 top-14 bg-slate-900/40 z-30 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileOpen?.(false)}
        />
      )}

      {/* Sidebar: Cột Flexbox tự nhiên trên Desktop, Drawer trượt trên Mobile */}
      <aside className={`
        fixed lg:static top-14 lg:top-auto bottom-0 lg:bottom-auto left-0 z-40 lg:z-auto
        w-60 shrink-0 bg-white border-r border-slate-200/80 
        flex flex-col py-3 shadow-xs h-[calc(100vh-3.5rem)] lg:h-full
        transition-transform duration-200 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col gap-3 overflow-y-auto px-3 flex-1">
          {/* Primary Nav Menu */}
          <nav className="flex flex-col gap-1 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                location.pathname === item.path ||
                (item.path === '/workspace/board' &&
                  (location.pathname === '/workspace' || location.pathname === '/workspace/'))

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen?.(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          {/* Divider */}
          <div className="h-px bg-slate-200/60 mx-1" />

          {/* Projects Section: DỰ ÁN CỦA TÔI */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-2 pt-0.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Dự án của tôi
              </span>
              <button 
                type="button" 
                className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-slate-100 cursor-pointer"
                title="Tạo dự án mới"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* BỘ CHỌN WORKSPACE (Dời xuống dưới 'Dự án của tôi') */}
            <div>
              <button 
                ref={buttonRef}
                type="button"
                onClick={toggleWorkspaceDropdown}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50/90 hover:bg-slate-100 border border-slate-200/80 transition-all group text-left cursor-pointer shadow-2xs"
                title="Đổi không gian làm việc"
                aria-label="Đổi không gian làm việc"
                aria-expanded={isWorkspaceDropdownOpen}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-7 h-7 rounded-lg ${currentWorkspace.color} text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0`}>
                    {currentWorkspace.initial}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                      {currentWorkspace.name}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 truncate">
                      {currentWorkspace.subtitle}
                    </span>
                  </div>
                </div>
                <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0 ml-1" />
              </button>

              {/* Dropdown danh sách Workspaces: Render ra ngoài Sidebar để không bị che và có z-index tuyệt đối */}
              {isWorkspaceDropdownOpen && createPortal(
                <div 
                  ref={dropdownRef}
                  style={{
                    position: 'fixed',
                    top: `${dropdownCoords.top}px`,
                    left: `${dropdownCoords.left}px`,
                    width: `${dropdownCoords.width}px`,
                  }}
                  className="z-[9999] bg-white rounded-xl shadow-2xl border border-slate-200/90 py-1.5 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Không gian làm việc
                  </div>
                  <div className="max-h-60 overflow-y-auto py-0.5">
                    {WORKSPACES_DATA.map((ws) => {
                      const isSelected = ws.id === currentWorkspace.id
                      return (
                        <button
                          key={ws.id}
                          type="button"
                          onClick={() => handleSelectWorkspace(ws.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                            isSelected ? 'bg-indigo-50/80 text-indigo-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-6 h-6 rounded-md ${ws.color} text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-2xs`}>
                              {ws.initial}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs truncate">{ws.name}</span>
                              <span className="text-[10px] text-slate-400 truncate">{ws.subtitle}</span>
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-1" />}
                        </button>
                      )
                    })}
                  </div>
                </div>,
                document.body
              )}
            </div>

            {/* DANH SÁCH CÁC DỰ ÁN TƯƠNG ỨNG VỚI WORKSPACE ĐÃ CHỌN */}
            <div className="flex flex-col gap-0.5 mt-1">
              {currentWorkspace.projects.map((p) => {
                const isSelected = currentProject === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setCurrentProject(p.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 text-indigo-700 font-medium'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${p.color}`} />
                      <span className="truncate text-xs">{p.name}</span>
                    </div>
                    {p.count !== undefined && (
                      <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${
                        isSelected 
                          ? 'bg-indigo-100 text-indigo-700' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <button 
              type="button"
              className="mt-0.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/60 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo dự án mới</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default WorkspaceSidebar
