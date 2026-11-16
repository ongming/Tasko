import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useNavigate, useLocation, useParams } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Star,
  Plus, 
  ChevronsUpDown, 
  Check,
  Building2,
  FolderPlus,
  ChevronRight,
  X,
  Search,
  ListFilter,
  AlignLeft,
  Settings,
  MoreHorizontal,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import type { Project } from '@/types/workspace'
import { workspaceService } from '@/services/workspaceService'
import { projectService } from '@/services/projectService'
import { useAuthStore } from '@/stores/authStore'
import CreateWorkspaceModal from '@/components/workspace/CreateWorkspaceModal'

export interface StarredItem {
  id: string
  name: string
  subtitle: string
  initial: string
  color: string
  path: string
}

export interface WorkspaceItem {
  id: string
  name: string
  slug: string
  subtitle: string
  initial: string
  color: string
  projects: Project[]
}

// User mới tạo account: Mặc định chưa có Workspace nào
const INITIAL_WORKSPACES: WorkspaceItem[] = []

export interface WorkspaceSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export function WorkspaceSidebar({ isMobileOpen, setIsMobileOpen }: WorkspaceSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { workspaceSlug } = useParams<{ workspaceSlug?: string }>()
  const user = useAuthStore((state) => state.user)

  // Danh sách Workspaces và trạng thái chọn
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>(INITIAL_WORKSPACES)
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null)
  const [currentProject, setCurrentProject] = useState<string | null>(null)
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false)
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(false)
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 220 })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Trạng thái Popup "Đã đánh dấu sao" (Jira Flyout Popup)
  const [isStarredOpen, setIsStarredOpen] = useState(false)
  const [starredCoords, setStarredCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const [starredSearch, setStarredSearch] = useState('')
  const [starredItems, setStarredItems] = useState<StarredItem[]>([])
  const starredButtonRef = useRef<HTMLButtonElement>(null)
  const starredPopupRef = useRef<HTMLDivElement>(null)

  // Trạng thái Popup menu 3 chấm của Project & Modal xác nhận xóa
  const [activeMenuProject, setActiveMenuProject] = useState<Project | null>(null)
  const [projectMenuCoords, setProjectMenuCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [isDeletingProject, setIsDeletingProject] = useState(false)
  const projectMenuRef = useRef<HTMLDivElement>(null)
  const deleteModalRef = useRef<HTMLDivElement>(null)

  // Tải danh sách Workspaces từ Backend Database
  const reloadWorkspaces = async () => {
    try {
      const workspacesList = await workspaceService.getMyWorkspaces()
      if (workspacesList) {
        const items: WorkspaceItem[] = workspacesList.map((ws) => ({
          id: ws.id,
          name: ws.name,
          slug: ws.slug,
          subtitle: ws.role === 'OWNER' ? 'Chủ sở hữu' : 'Thành viên',
          initial: ws.name.slice(0, 2).toUpperCase(),
          color: 'bg-indigo-600',
          projects: [],
        }))
        setWorkspaces(items)
        if (items.length > 0) {
          const matched = workspaceSlug ? items.find((w) => w.slug === workspaceSlug) : null
          setSelectedWorkspaceId(matched ? matched.id : (selectedWorkspaceId || items[0].id))
        }
      }
    } catch {
      // Bỏ qua lỗi nếu chưa đăng nhập
    }
  }

  // Tự động đồng bộ khi URL thay đổi workspaceSlug
  useEffect(() => {
    if (workspaceSlug && workspaces.length > 0) {
      const matched = workspaces.find((w) => w.slug === workspaceSlug)
      if (matched && matched.id !== selectedWorkspaceId) {
        setSelectedWorkspaceId(matched.id)
      }
    }
  }, [workspaceSlug, workspaces, selectedWorkspaceId])

  // Tải danh sách dự án của Workspace đang chọn
  const loadProjectsForWorkspace = async (workspaceId: string) => {
    try {
      const projectsList = await projectService.getProjects(workspaceId)
      setWorkspaces((prev) =>
        prev.map((ws) =>
          ws.id === workspaceId ? { ...ws, projects: projectsList || [] } : ws
        )
      )
    } catch {
      // Bỏ qua lỗi nếu tải thất bại
    }
  }

  useEffect(() => {
    reloadWorkspaces()
  }, [])

  // Tải lại dự án khi người dùng đổi workspace hoặc khi có project mới được tạo
  useEffect(() => {
    if (selectedWorkspaceId) {
      loadProjectsForWorkspace(selectedWorkspaceId)
    }
  }, [selectedWorkspaceId])

  useEffect(() => {
    const handleProjectCreated = () => {
      if (selectedWorkspaceId) {
        loadProjectsForWorkspace(selectedWorkspaceId)
      }
    }
    window.addEventListener('project-created', handleProjectCreated)
    return () => window.removeEventListener('project-created', handleProjectCreated)
  }, [selectedWorkspaceId])

  // Đồng bộ khi có workspace mới được tạo từ màn hình khác
  useEffect(() => {
    const handleWorkspaceUpdated = (e: Event) => {
      const customEvent = e as CustomEvent
      reloadWorkspaces()
      if (customEvent.detail?.id) {
        setSelectedWorkspaceId(customEvent.detail.id)
      }
    }
    window.addEventListener('workspace-updated', handleWorkspaceUpdated)
    return () => window.removeEventListener('workspace-updated', handleWorkspaceUpdated)
  }, [])

  // Xử lý tạo workspace mới từ Sidebar
  const handleCreateWorkspaceFromSidebar = async (data: { workspaceName: string; workspaceSlug: string }) => {
    const created = await workspaceService.create({
      name: data.workspaceName,
      slug: data.workspaceSlug,
    })
    await reloadWorkspaces()
    setSelectedWorkspaceId(created.id)
    setIsCreateWorkspaceModalOpen(false)
    window.dispatchEvent(new CustomEvent('workspace-updated', { detail: created }))
  }

  const currentWorkspace = workspaces.find((w) => w.id === selectedWorkspaceId) || workspaces[0] || null
  const activeSlug = currentWorkspace?.slug || workspaceSlug || 'workspace'

  // Mở popup Đã đánh dấu sao và tính toạ độ neo bên phải nút
  const toggleStarredPopup = () => {
    if (!isStarredOpen && starredButtonRef.current) {
      const rect = starredButtonRef.current.getBoundingClientRect()
      const popupWidth = 330
      const popupHeight = 310
      let left = rect.right + 8
      if (left + popupWidth > window.innerWidth) {
        left = Math.max(16, window.innerWidth - popupWidth - 16)
      }
      let top = Math.max(16, rect.top - 6)
      if (top + popupHeight > window.innerHeight) {
        top = Math.max(16, window.innerHeight - popupHeight - 16)
      }
      setStarredCoords({ top, left })
    }
    setIsStarredOpen((prev) => !prev)
  }

  const handleRemoveStarred = (id: string) => {
    setStarredItems((prev) => prev.filter((item) => item.id !== id))
  }

  const filteredStarredItems = starredItems.filter((item) =>
    item.name.toLowerCase().includes(starredSearch.toLowerCase().trim())
  )

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

  // Đóng dropdown và popup khi click ra ngoài hoặc khi cuộn
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      // Click ngoài Workspace Dropdown
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsWorkspaceDropdownOpen(false)
      }

      // Click ngoài Starred Popup
      if (
        starredPopupRef.current &&
        !starredPopupRef.current.contains(target) &&
        starredButtonRef.current &&
        !starredButtonRef.current.contains(target)
      ) {
        setIsStarredOpen(false)
      }

      // Click ngoài Project Options Menu
      if (
        projectMenuRef.current &&
        !projectMenuRef.current.contains(target)
      ) {
        setActiveMenuProject(null)
      }
    }

    function handleScroll(event: Event) {
      // Cho phép cuộn bên trong popup
      if (
        starredPopupRef.current?.contains(event.target as Node) ||
        projectMenuRef.current?.contains(event.target as Node)
      ) {
        return
      }
      setIsWorkspaceDropdownOpen(false)
      setIsStarredOpen(false)
      setActiveMenuProject(null)
    }

    if (isWorkspaceDropdownOpen || isStarredOpen || activeMenuProject) {
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('scroll', handleScroll, true)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isWorkspaceDropdownOpen, isStarredOpen, activeMenuProject])

  const handleOpenProjectMenu = (p: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    if (activeMenuProject?.id === p.id) {
      setActiveMenuProject(null)
      return
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const menuWidth = 140
    let left = rect.right - menuWidth
    if (left < 10) left = rect.left
    setProjectMenuCoords({
      top: rect.bottom + 4,
      left,
    })
    setActiveMenuProject(p)
  }

  const handleConfirmDeleteProject = async () => {
    if (!projectToDelete) return
    try {
      setIsDeletingProject(true)
      await projectService.deleteProject(projectToDelete.id)

      // Cập nhật danh sách dự án trong state
      setWorkspaces((prev) =>
        prev.map((ws) => ({
          ...ws,
          projects: ws.projects.filter((p) => p.id !== projectToDelete.id),
        }))
      )

      // Bắn event toàn cục
      window.dispatchEvent(
        new CustomEvent('project-deleted', { detail: { id: projectToDelete.id } })
      )

      // Nếu đang ở dự án bị xóa, điều hướng sang dự án khác hoặc overview
      const searchParams = new URLSearchParams(location.search)
      const currentUrlProject = searchParams.get('project') || searchParams.get('projectId')
      if (
        currentUrlProject === projectToDelete.key ||
        currentUrlProject === projectToDelete.id ||
        currentProject === projectToDelete.id ||
        currentProject === projectToDelete.key
      ) {
        const remaining = currentWorkspace?.projects.filter((p) => p.id !== projectToDelete.id) || []
        if (remaining.length > 0) {
          const nextTarget = remaining[0].key || remaining[0].id
          setCurrentProject(nextTarget)
          navigate(`/workspace/board?project=${nextTarget}`)
        } else {
          setCurrentProject(null)
          navigate('/workspace/overview')
        }
      }

      setProjectToDelete(null)
    } catch (err) {
      console.error('Failed to delete project:', err)
      alert('Không thể xóa dự án. Vui lòng thử lại sau.')
    } finally {
      setIsDeletingProject(false)
    }
  }

  // Chuyển đổi workspace -> tự động chọn dự án đầu tiên của workspace đó và điều hướng theo slug
  const handleSelectWorkspace = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId)
    const targetWs = workspaces.find((w) => w.id === workspaceId)
    setIsWorkspaceDropdownOpen(false)
    if (targetWs) {
      if (targetWs.projects.length > 0) {
        const firstProj = targetWs.projects[0]
        setCurrentProject(firstProj.key || firstProj.id)
        navigate(`/${targetWs.slug}/${firstProj.key || firstProj.id}/board`)
      } else {
        setCurrentProject(null)
        navigate(`/${targetWs.slug}/overview`)
      }
    }
  }

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
          {/* Primary Nav Menu: Tổng quan & Đã đánh dấu sao */}
          <nav className="flex flex-col gap-1 pt-1">
            <NavLink
              to={`/${activeSlug}/overview`}
              onClick={() => {
                setIsStarredOpen(false)
                setIsMobileOpen?.(false)
              }}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4 shrink-0 text-slate-500" />
              <span>Tổng quan</span>
            </NavLink>

            <button
              ref={starredButtonRef}
              type="button"
              onClick={toggleStarredPopup}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isStarredOpen
                  ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
              title="Mục đã đánh dấu sao"
              aria-expanded={isStarredOpen}
            >
              <div className="flex items-center gap-2.5">
                <Star className={`w-4 h-4 shrink-0 ${isStarredOpen ? 'text-amber-500 fill-amber-400' : 'text-slate-500'}`} />
                <span>Đã đánh dấu sao</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isStarredOpen ? 'rotate-90' : ''}`} />
            </button>
          </nav>

          {/* DỰ ÁN CỦA TÔI & BỘ CHỌN WORKSPACE */}
          <div className="pt-2 border-t border-slate-200/60 flex flex-col gap-2">
            <div className="flex items-center justify-between px-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Dự án của tôi
              </span>
              <button
                type="button"
                onClick={() => {
                  navigate(`/${activeSlug}/projects/new`)
                  setIsMobileOpen?.(false)
                }}
                className="text-slate-400 hover:text-indigo-600 transition-colors p-0.5 rounded cursor-pointer"
                title="Tạo dự án mới"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* BỘ CHỌN WORKSPACE */}
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
                {currentWorkspace ? (
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
                ) : (
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">
                        Chưa có Không gian
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 truncate">
                        Nhấn để tạo mới
                      </span>
                    </div>
                  </div>
                )}
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
                  
                  {workspaces.length === 0 ? (
                    <div className="px-3 py-3 text-center">
                      <p className="text-xs text-slate-500">Chưa có không gian làm việc nào</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsWorkspaceDropdownOpen(false)
                          setIsCreateWorkspaceModalOpen(true)
                        }}
                        className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tạo không gian làm việc</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-60 overflow-y-auto py-0.5">
                        {workspaces.map((ws) => {
                          const isSelected = currentWorkspace && ws.id === currentWorkspace.id
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

                      {/* Nút Tạo thêm Workspace khi đã có danh sách */}
                      <div className="border-t border-slate-100 p-1.5 mt-1 bg-slate-50/50">
                        <button
                          type="button"
                          onClick={() => {
                            setIsWorkspaceDropdownOpen(false)
                            setIsCreateWorkspaceModalOpen(true)
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tạo không gian làm việc mới</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>,
                document.body
              )}
            </div>

            {/* DANH SÁCH CÁC DỰ ÁN */}
            {currentWorkspace && currentWorkspace.projects.length > 0 ? (
              <div className="flex flex-col gap-0.5 mt-1">
                {currentWorkspace.projects.map((p) => {
                  const projectIdentifier = p.key || p.id
                  const urlParam = new URLSearchParams(location.search).get('project') || new URLSearchParams(location.search).get('projectId')
                  const isSelected =
                    currentProject === p.id ||
                    currentProject === p.key ||
                    urlParam === p.key ||
                    urlParam === p.id
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setCurrentProject(projectIdentifier)
                        navigate(`/${activeSlug}/${projectIdentifier}/board`)
                        setIsMobileOpen?.(false)
                      }}
                      className={`group relative w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/80 text-indigo-700 font-medium'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-1">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${p.color}`} />
                        <span className="truncate text-xs">{p.name}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {p.count !== undefined && (
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${
                              isSelected
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {p.count}
                          </span>
                        )}

                        {/* Nút 3 chấm mở popup lựa chọn */}
                        <button
                          type="button"
                          onClick={(e) => handleOpenProjectMenu(p, e)}
                          className={`p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer ${
                            activeMenuProject?.id === p.id
                              ? 'opacity-100 bg-slate-200/60 text-slate-700'
                              : 'opacity-0 group-hover:opacity-100 focus:opacity-100'
                          }`}
                          title="Tùy chọn dự án"
                          aria-label={`Tùy chọn cho dự án ${p.name}`}
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-2.5 px-3 text-center rounded-lg bg-slate-50 border border-slate-100 my-1">
                <p className="text-[11px] text-slate-400">Chưa có dự án nào</p>
              </div>
            )}

            <button 
              type="button"
              onClick={() => {
                navigate(`/${activeSlug}/projects/new`)
                setIsMobileOpen?.(false)
              }}
              className="mt-0.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/60 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo dự án mới</span>
            </button>
          </div>
        </div>

        {/* Footer: Thông tin User & Đường dẫn Cài đặt */}
        <div className="pt-2 px-3 border-t border-slate-200/60 mt-auto">
          <NavLink
            to={`/${activeSlug}/settings`}
            onClick={() => setIsMobileOpen?.(false)}
            className={({ isActive }) =>
              `w-full flex items-center justify-between p-2 rounded-xl border transition-all text-left group cursor-pointer ${
                isActive
                  ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 shadow-2xs'
                  : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/70 text-slate-700'
              }`
            }
            title="Cài đặt & Hồ sơ cá nhân"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {user?.avatar_url || user?.avatarUrl ? (
                <img
                  src={user.avatar_url || user.avatarUrl || ''}
                  alt={user.full_name || user.fullName || 'User'}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 shadow-2xs shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
                  {user?.full_name || user?.fullName ? (user.full_name || user.fullName)!.slice(0, 2).toUpperCase() : 'U'}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold truncate group-hover:text-indigo-600 transition-colors">
                  {user?.full_name || user?.fullName || 'Người dùng'}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  Cài đặt & Hồ sơ
                </span>
              </div>
            </div>
            <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
          </NavLink>
        </div>
      </aside>

      {/* Starred Flyout Popup (Chuẩn Jira Popover) */}
      {isStarredOpen &&
        createPortal(
          <div
            ref={starredPopupRef}
            style={{
              position: 'fixed',
              top: `${starredCoords.top}px`,
              left: `${starredCoords.left}px`,
            }}
            className="w-80 sm:w-88 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header: Title + Close Button */}
            <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
              <span className="text-sm font-bold text-slate-800">Đã đánh dấu sao</span>
              <button
                type="button"
                onClick={() => setIsStarredOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Đóng"
                aria-label="Đóng cửa sổ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="px-3 pb-2.5">
              <div className="relative flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={starredSearch}
                  onChange={(e) => setStarredSearch(e.target.value)}
                  placeholder="Tìm kiếm mục đã gắn sao..."
                  className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  className="p-0.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title="Bộ lọc"
                >
                  <ListFilter className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Starred Items List / Empty State */}
            <div className="max-h-64 overflow-y-auto px-2 pb-2">
              {filteredStarredItems.length === 0 ? (
                <div className="py-7 px-3 text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-2 shadow-2xs">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    {starredSearch ? 'Không tìm thấy mục phù hợp' : 'Chưa có mục nào được gắn sao'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[220px]">
                    {starredSearch 
                      ? 'Thử tìm với từ khóa khác' 
                      : 'Bấm vào biểu tượng ngôi sao ⭐ trên dự án hoặc công việc để ghim vào đây.'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {filteredStarredItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => {
                        navigate(item.path)
                        setIsStarredOpen(false)
                        setIsMobileOpen?.(false)
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg ${item.color} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}>
                          {item.initial}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate">
                            {item.subtitle}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveStarred(item.id)
                        }}
                        className="p-1 text-amber-500 hover:text-slate-300 transition-colors cursor-pointer shrink-0"
                        title="Bỏ đánh dấu sao"
                      >
                        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer: View All Link */}
            <div className="border-t border-slate-100 p-2.5 bg-slate-50/50 flex items-center">
              <button
                type="button"
                onClick={() => {
                  navigate(`/${activeSlug}/projects`)
                  setIsStarredOpen(false)
                  setIsMobileOpen?.(false)
                }}
                className="w-full flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100/70 text-left cursor-pointer"
              >
                <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
                <span>Xem tất cả danh sách dự án</span>
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* Menu Popup 3 chấm cho Dự án */}
      {activeMenuProject &&
        createPortal(
          <div
            ref={projectMenuRef}
            style={{
              position: 'fixed',
              top: `${projectMenuCoords.top}px`,
              left: `${projectMenuCoords.left}px`,
              width: '150px',
            }}
            className="z-[9999] bg-white rounded-xl shadow-xl border border-slate-200/90 py-1 animate-in fade-in zoom-in-95 duration-100 text-xs"
          >
            <button
              type="button"
              onClick={() => {
                setProjectToDelete(activeMenuProject)
                setActiveMenuProject(null)
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left font-medium"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span>Xóa dự án</span>
            </button>
          </div>,
          document.body
        )}

      {/* Modal Xác nhận Xóa Dự án */}
      {projectToDelete &&
        createPortal(
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div
              ref={deleteModalRef}
              className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900">Xác nhận xóa dự án</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Bạn có chắc chắn muốn xóa vĩnh viễn dự án{' '}
                    <span className="font-semibold text-slate-800">"{projectToDelete.name}"</span>? Mọi trạng thái và công việc trong dự án này sẽ bị xóa và không thể khôi phục.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProjectToDelete(null)}
                  disabled={isDeletingProject}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteProject}
                  disabled={isDeletingProject}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {isDeletingProject && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isDeletingProject ? 'Đang xóa...' : 'Xác nhận xóa'}</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Modal Tạo Workspace mở từ Sidebar */}
      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceModalOpen}
        onClose={() => setIsCreateWorkspaceModalOpen(false)}
        onSubmit={handleCreateWorkspaceFromSidebar}
      />
    </>
  )
}

export default WorkspaceSidebar
