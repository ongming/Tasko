import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import {
  Plus,
  ChevronDown,
  Eye,
  Loader2,
  Play,
  CheckCircle2,
  Calendar,
  Package,
  CheckSquare,
  Bug,
  Inbox,
  ArrowRight,
  AlertTriangle,
  X,
} from 'lucide-react'
import { projectService } from '@/services/projectService'
import { sprintService } from '@/services/sprintService'
import { taskService } from '@/services/taskService'
import type { Sprint } from '@/types/sprint'
import type { TaskItem } from '@/types/task'
import type { Project } from '@/types/workspace'
import { CompleteSprintModal } from '@/components/project/CompleteSprintModal'

export interface BoardColumn {
  id: string
  title: string
  category: 'TODO' | 'IN_PROGRESS' | 'DONE'
  colorBadge: string
  countBadgeClass: string
  wrapperClass: string
  quickAddClass: string
  wipLimit?: number | null
  tasks: TaskItem[]
}

export function KanbanBoardView() {
  const [columns, setColumns] = useState<BoardColumn[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [selectedSprintId, setSelectedSprintId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [quickAddColumnId, setQuickAddColumnId] = useState<string | null>(null)
  const [quickTaskTitle, setQuickTaskTitle] = useState('')

  // Drag over tracking for columns
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null)

  // Modal hoàn thành Sprint
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)

  const { workspaceSlug, projectKey } = useParams<{ workspaceSlug?: string; projectKey?: string }>()
  const [searchParams] = useSearchParams()
  const projectParam = projectKey || searchParams.get('project') || searchParams.get('projectId') || ''

  const isScrum =
    project?.settings?.method_id === 'scrum' ||
    project?.settings?.method_id === 'scrumban' ||
    project?.name?.toLowerCase().includes('scrum')

  // 1. Tải thông tin dự án, cấu hình cột (Statuses), và Sprints
  const loadInitialData = useCallback(async () => {
    if (!projectParam) return
    try {
      setIsLoading(true)
      const [projData, statuses, loadedSprints] = await Promise.all([
        projectService.getProjectById(projectParam).catch(() => null),
        projectService.getProjectStatuses(projectParam).catch(() => []),
        sprintService.getSprints(projectParam).catch(() => []),
      ])

      if (projData) setProject(projData)
      setSprints(loadedSprints)

      // Chỉ chọn Sprint đã BẮT ĐẦU (ACTIVE hoặc COMPLETED)
      const started = loadedSprints.filter((s) => s.status === 'ACTIVE' || s.status === 'COMPLETED')
      const activeSprint = started.find((s) => s.status === 'ACTIVE')
      const defaultSprint = activeSprint || started[0]

      if (defaultSprint && !selectedSprintId) {
        setSelectedSprintId(defaultSprint.id)
      }

      // Khởi tạo khung các cột từ danh sách statuses của dự án
      if (statuses && statuses.length > 0) {
        const dynamicCols: BoardColumn[] = statuses.map((st) => {
          let colorBadge = 'bg-slate-400'
          let countBadgeClass = 'bg-slate-200/90 text-slate-700'
          let quickAddClass =
            'border-slate-300/80 text-slate-500 hover:text-slate-800 hover:border-slate-400 hover:bg-white'

          if (st.category === 'IN_PROGRESS') {
            colorBadge = 'bg-indigo-600'
            countBadgeClass = 'bg-indigo-100 text-indigo-700'
          } else if (st.category === 'DONE') {
            colorBadge = 'bg-emerald-500'
            countBadgeClass = 'bg-emerald-100 text-emerald-800'
            quickAddClass =
              'border-emerald-200 text-emerald-700 hover:text-emerald-900 hover:border-emerald-400 hover:bg-white'
          }

          return {
            id: st.id,
            title: st.name,
            category: st.category,
            colorBadge,
            countBadgeClass,
            wrapperClass: 'bg-slate-100/60 border border-slate-200/70',
            quickAddClass,
            wipLimit: st.wipLimit ?? null,
            tasks: [],
          }
        })
        setColumns(dynamicCols)
      }
    } catch (err) {
      console.error('Failed to load initial board data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [projectParam, selectedSprintId])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  // 2. Tải tasks cho bảng (nếu là Scrum thì lọc theo selectedSprintId)
  const loadTasksForBoard = useCallback(async () => {
    if (!projectParam) return
    try {
      const params = isScrum && selectedSprintId ? { sprintId: selectedSprintId } : {}
      const loadedTasks = await taskService.getProjectTasks(projectParam, params)

      setColumns((prevCols) =>
        prevCols.map((col) => ({
          ...col,
          tasks: loadedTasks.filter((t) => t.statusId === col.id),
        })),
      )
    } catch (err) {
      console.error('Failed to load tasks for board:', err)
    }
  }, [projectParam, isScrum, selectedSprintId])

  useEffect(() => {
    if (columns.length > 0) {
      loadTasksForBoard()
    }
  }, [columns.length, loadTasksForBoard])

  // Danh sách các Sprint ĐÃ BẮT ĐẦU (ACTIVE hoặc COMPLETED)
  const startedSprints = sprints.filter((s) => s.status === 'ACTIVE' || s.status === 'COMPLETED')
  const currentSprint =
    startedSprints.find((s) => s.id === selectedSprintId) || startedSprints[0] || null
  const plannedSprints = sprints.filter((s) => s.status === 'PLANNED')

  // Kéo thả task giữa các cột với Optimistic UI & Auto-Rollback khi lỗi (WIP limit / Workflow Transition)
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
  }

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault()
    setDragOverColumnId(colId)
  }

  const handleDragLeave = () => {
    setDragOverColumnId(null)
  }

  const handleDropOnColumn = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault()
    setDragOverColumnId(null)
    const taskId = e.dataTransfer.getData('taskId')
    if (!taskId || !projectParam) return

    // Lưu snapshot trạng thái trước khi di chuyển để rollback khi API trả lỗi
    const previousColumns = columns

    // Optimistic UI update
    setColumns((prev) => {
      let movedTask: TaskItem | undefined
      const withoutMoved = prev.map((col) => {
        const found = col.tasks.find((t) => t.id === taskId)
        if (found) movedTask = { ...found, statusId: targetColumnId }
        return {
          ...col,
          tasks: col.tasks.filter((t) => t.id !== taskId),
        }
      })
      if (!movedTask) return prev

      return withoutMoved.map((col) => {
        if (col.id === targetColumnId && movedTask) {
          return { ...col, tasks: [...col.tasks, movedTask] }
        }
        return col
      })
    })

    try {
      await taskService.moveProjectTask(projectParam, taskId, {
        statusId: targetColumnId,
      })
    } catch (err: any) {
      console.error('Failed to move task:', err)
      // Tự động hoàn tác (Rollback) lại vị trí cột ban đầu
      setColumns(previousColumns)

      // Trích xuất thông báo lỗi chi tiết từ backend (WIP Limit hoặc Workflow Transition)
      const detailMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể di chuyển công việc theo quy trình hiện tại!'
      setErrorMessage(detailMsg)
      setTimeout(() => setErrorMessage(null), 6000)
    }
  }

  // Thêm nhanh task vào cột
  const handleQuickAddTask = async (columnId: string) => {
    const title = quickTaskTitle.trim()
    if (!title || !projectParam) return

    try {
      await taskService.createProjectTask(projectParam, {
        title,
        statusId: columnId,
        sprintId: isScrum && currentSprint ? currentSprint.id : null,
      })
      setQuickTaskTitle('')
      setQuickAddColumnId(null)
      await loadTasksForBoard()
    } catch (err: any) {
      console.error('Failed to quick add task:', err)
      const msg = err?.response?.data?.message || err?.message || 'Không thể tạo công việc'
      setErrorMessage(msg)
      setTimeout(() => setErrorMessage(null), 5000)
    }
  }

  const renderWorkTypeIcon = (typeName?: string | null) => {
    const name = typeName?.toLowerCase() || ''
    if (name.includes('bug')) return <Bug className="w-3.5 h-3.5 text-rose-600 shrink-0" />
    if (name.includes('module')) return <Package className="w-3.5 h-3.5 text-purple-600 shrink-0" />
    return <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
  }

  const totalTasksCount = columns.reduce((acc, col) => acc + col.tasks.length, 0)

  const backlogLink =
    workspaceSlug && projectKey
      ? `/${workspaceSlug}/${projectKey}/backlog`
      : `/workspace/backlog?project=${projectParam}`

  return (
    <div className="flex flex-col gap-4 w-full flex-1">
      {/* Thông báo lỗi / Rollback Banner khi vi phạm ràng buộc */}
      {errorMessage && (
        <div className="flex items-center justify-between gap-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium shadow-2xs animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-100/60 transition-colors cursor-pointer"
            aria-label="Đóng cảnh báo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Header Toolbar Tinh gọn: Số lượng công việc (trái) + Bộ chọn Sprint nhỏ (phải) */}
      <div className="flex items-center justify-between flex-wrap gap-3 py-1">
        {/* Bên trái: Đếm số công việc */}
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>{totalTasksCount} công việc trên bảng</span>
          </div>
        </div>

        {/* Bên phải: Nút nhỏ chọn Sprint đã start + Nút Hoàn thành Sprint */}
        {isScrum && (
          <div className="flex items-center gap-2.5">
            {startedSprints.length > 0 ? (
              <>
                {/* Dropdown nhỏ chọn Sprint đã start */}
                <div className="relative">
                  <select
                    value={currentSprint?.id || ''}
                    onChange={(e) => setSelectedSprintId(e.target.value)}
                    className="h-8 pl-2.5 pr-7 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 font-semibold text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer appearance-none shadow-2xs transition-all"
                  >
                    {startedSprints.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.status === 'ACTIVE'
                          ? `⚡ ${s.name} (Đang diễn ra)`
                          : `🏆 ${s.name} (Đã hoàn thành)`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Nút Hoàn thành Sprint nếu đang xem Active Sprint */}
                {currentSprint?.status === 'ACTIVE' && (
                  <button
                    type="button"
                    onClick={() => setIsCompleteModalOpen(true)}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Hoàn thành Sprint</span>
                  </button>
                )}
              </>
            ) : (
              /* Khi chưa có Sprint nào start: Hiện nút nhỏ dẫn sang Backlog để bắt đầu */
              <Link
                to={backlogLink}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/80 text-indigo-700 text-xs font-semibold shadow-2xs transition-all"
              >
                <Play className="w-3 h-3 fill-indigo-700" />
                <span>Bắt đầu Sprint tại Backlog</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="py-16 flex flex-col items-center justify-center gap-2.5 text-slate-500 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span className="font-medium">Đang tải bảng công việc...</span>
        </div>
      )}

      {/* 2. Modern Flat Kanban Board Canvas */}
      {!isLoading && (
        <div className="flex-1 flex gap-3.5 overflow-x-auto pb-4 items-start select-none">
          {columns.map((column) => {
            const isDropTarget = dragOverColumnId === column.id
            const columnPoints = column.tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0)
            const hasWipLimit = column.wipLimit !== null && column.wipLimit !== undefined && column.wipLimit > 0
            const isOverLimit = hasWipLimit && column.tasks.length >= column.wipLimit!

            return (
              <div
                key={column.id}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDropOnColumn(e, column.id)}
                className={`w-[280px] min-w-[280px] shrink-0 p-2.5 rounded-xl transition-all flex flex-col gap-2 h-fit self-start ${
                  isDropTarget
                    ? 'bg-indigo-50/40 border-2 border-indigo-400 ring-2 ring-indigo-100 shadow-sm'
                    : isOverLimit
                    ? 'bg-slate-100/70 border border-rose-200/90 shadow-2xs'
                    : `${column.wrapperClass}`
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1.5 pt-0.5 pb-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full ${column.colorBadge} shrink-0`} />
                    <span className="text-[12px] font-bold text-slate-700 capitalize truncate">
                      {column.title.toLowerCase()}
                    </span>

                    {/* Huy hiệu số lượng thẻ & WIP Limit */}
                    <span
                      title={hasWipLimit ? `Giới hạn WIP: ${column.wipLimit}` : undefined}
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold transition-all ${
                        isOverLimit
                          ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-200'
                          : column.countBadgeClass
                      }`}
                    >
                      {hasWipLimit ? `${column.tasks.length} / ${column.wipLimit}` : column.tasks.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {columnPoints > 0 && (
                      <span className="px-1.5 py-0.2 bg-slate-200/80 rounded text-[10px] font-semibold text-slate-600">
                        {columnPoints} pts
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setQuickAddColumnId(column.id)
                        setQuickTaskTitle('')
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                      title="Thêm nhanh công việc"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Form thêm nhanh task */}
                {quickAddColumnId === column.id && (
                  <div className="p-2 bg-white rounded-lg border border-indigo-200 shadow-xs flex flex-col gap-2">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Nhập tiêu đề công việc..."
                      value={quickTaskTitle}
                      onChange={(e) => setQuickTaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleQuickAddTask(column.id)
                        if (e.key === 'Escape') setQuickAddColumnId(null)
                      }}
                      className="text-xs w-full px-2 py-1.5 border border-slate-200 rounded focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setQuickAddColumnId(null)}
                        className="px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-100 rounded"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAddTask(column.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-2xs"
                      >
                        Thêm
                      </button>
                    </div>
                  </div>
                )}

                {/* Task Cards Container */}
                <div className="flex flex-col gap-2 min-h-[40px]">
                  {column.tasks.map((task) => {
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="group bg-white p-3 rounded-lg border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing flex flex-col gap-2"
                      >
                        {/* Title */}
                        <div className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                          {task.title}
                        </div>

                        {/* Footer: Key, WorkType icon, Story Points, Assignee */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {renderWorkTypeIcon(task.type?.name)}
                            <span className="font-mono text-[10px] text-slate-500 font-semibold truncate">
                              {task.taskKey}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {task.storyPoints !== null && task.storyPoints !== undefined && (
                              <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 font-bold text-[9px] flex items-center justify-center">
                                {task.storyPoints}
                              </span>
                            )}

                            {task.assignee ? (
                              task.assignee.avatarUrl ? (
                                <img
                                  src={task.assignee.avatarUrl}
                                  alt={task.assignee.name || ''}
                                  className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                                  {task.assignee.name ? task.assignee.name.slice(0, 1).toUpperCase() : 'U'}
                                </div>
                              )
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Hoàn thành Sprint */}
      {isCompleteModalOpen && currentSprint && (
        <CompleteSprintModal
          isOpen={isCompleteModalOpen}
          onClose={() => setIsCompleteModalOpen(false)}
          sprint={currentSprint}
          plannedSprints={plannedSprints}
          onComplete={async (targetSprintId) => {
            await sprintService.completeSprint(projectParam, currentSprint.id, {
              targetSprintId: targetSprintId || undefined,
            })
            setIsCompleteModalOpen(false)
            await loadInitialData()
          }}
        />
      )}
    </div>
  )
}

export default KanbanBoardView
