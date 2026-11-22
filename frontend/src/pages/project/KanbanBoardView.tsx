import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
import type { TaskItem, TaskFilterParams } from '@/types/task'
import type { Project } from '@/types/workspace'
import type { ProjectMember } from '@/types/member'
import type { ProjectWorkType } from '@/types/projectConfig'
import { CompleteSprintModal } from '@/components/project/CompleteSprintModal'
import { TaskDetailDrawer } from '@/components/project/TaskDetailDrawer'
import { TaskFilterBar } from '@/components/project/TaskFilterBar'
import { CreateTaskModal } from '@/components/project/CreateTaskModal'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { KanbanCard } from '@/components/kanban/KanbanCard'
import { KanbanColumn } from '@/components/kanban/KanbanColumn'

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

/**
 * Tính toán position mới theo thuật toán Midpoint (Điểm giữa) chuẩn Jira
 */
export function calculateNewPosition(targetTasks: TaskItem[], targetIndex: number): number {
  if (targetTasks.length === 0) return 1000

  if (targetIndex === 0) {
    const firstPos = targetTasks[0].position ?? 1000
    return firstPos > 1 ? Math.round(firstPos / 2) : firstPos - 1000
  }

  if (targetIndex >= targetTasks.length) {
    const lastPos = targetTasks[targetTasks.length - 1].position ?? 1000
    return lastPos + 1000
  }

  const prevPos = targetTasks[targetIndex - 1].position ?? 1000
  const nextPos = targetTasks[targetIndex].position ?? prevPos + 2000
  return Math.round((prevPos + nextPos) / 2)
}

export function KanbanBoardView() {
  const [columns, setColumns] = useState<BoardColumn[]>([])
  const [allTasks, setAllTasks] = useState<TaskItem[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [workTypes, setWorkTypes] = useState<ProjectWorkType[]>([])
  const [filters, setFilters] = useState<TaskFilterParams>({})
  const [selectedSprintId, setSelectedSprintId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [quickAddColumnId, setQuickAddColumnId] = useState<string | null>(null)
  const [quickTaskTitle, setQuickTaskTitle] = useState('')
  const [isSubmittingQuickAdd, setIsSubmittingQuickAdd] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createTaskInitialStatusId, setCreateTaskInitialStatusId] = useState<string | undefined>(undefined)

  // Drag tracking to prevent card click opening drawer during drag
  const isDraggingRef = useRef(false)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const previousTasksRef = useRef<TaskItem[]>([])

  // Lưu trữ timer đếm ngược riêng cho từng task để Debounce (600ms)
  const debounceTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Cảm biến Pointer với activation constraint 5px tránh xung đột click mở Drawer
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Modal hoàn thành Sprint & Task detail drawer
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const { workspaceSlug, projectKey } = useParams<{ workspaceSlug?: string; projectKey?: string }>()
  const [searchParams] = useSearchParams()
  const projectParam = projectKey || searchParams.get('project') || searchParams.get('projectId') || ''

  const isScrum =
    project?.settings?.method_id === 'scrum' ||
    project?.settings?.method_id === 'scrumban' ||
    project?.name?.toLowerCase().includes('scrum')

  // 1. Tải thông tin dự án, cấu hình cột (Statuses), Sprints, Members, WorkTypes
  const loadInitialData = useCallback(async () => {
    if (!projectParam) return
    try {
      setIsLoading(true)
      const [projData, statuses, loadedSprints, loadedMembers, loadedWorkTypes] = await Promise.all([
        projectService.getProjectById(projectParam).catch(() => null),
        projectService.getProjectStatuses(projectParam).catch(() => []),
        sprintService.getSprints(projectParam).catch(() => []),
        projectService.getProjectMembers(projectParam).catch(() => []),
        projectService.getProjectWorkTypes(projectParam).catch(() => []),
      ])

      if (projData) setProject(projData)
      setSprints(loadedSprints)
      setMembers(loadedMembers)
      setWorkTypes(loadedWorkTypes)

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

  // 2. Tải tasks cho bảng (nếu là Scrum thì lấy theo selectedSprintId)
  const loadTasksForBoard = useCallback(async () => {
    if (!projectParam) return
    try {
      const params = isScrum && selectedSprintId ? { sprintId: selectedSprintId } : {}
      const loadedTasks = await taskService.getProjectTasks(projectParam, params)
      setAllTasks(loadedTasks)
    } catch (err) {
      console.error('Failed to load tasks for board:', err)
    }
  }, [projectParam, isScrum, selectedSprintId])

  useEffect(() => {
    if (columns.length > 0) {
      loadTasksForBoard()
    }
  }, [columns.length, loadTasksForBoard])

  // Lọc task theo search, assignee, priority, workType
  const filterTask = useCallback(
    (task: TaskItem) => {
      // 1. Search (Title hoặc taskKey)
      if (filters.search?.trim()) {
        const q = filters.search.toLowerCase()
        const matchTitle = task.title.toLowerCase().includes(q)
        const matchKey = task.taskKey.toLowerCase().includes(q)
        if (!matchTitle && !matchKey) return false
      }

      // 2. Assignee
      if (filters.assigneeId) {
        if (filters.assigneeId === 'unassigned') {
          if (task.assigneeId) return false
        } else if (task.assigneeId !== filters.assigneeId) {
          return false
        }
      }

      // 3. Priority
      if (filters.priority && task.priority !== filters.priority) {
        return false
      }

      // 4. WorkType
      if (filters.workTypeId && task.typeId !== filters.workTypeId) {
        return false
      }

      return true
    },
    [filters],
  )

  const filteredTasks = useMemo(() => allTasks.filter(filterTask), [allTasks, filterTask])

  // Cột hiển thị kèm tasks đã lọc
  const displayedColumns = useMemo(() => {
    return columns.map((col) => ({
      ...col,
      tasks: filteredTasks.filter((t) => t.statusId === col.id),
    }))
  }, [columns, filteredTasks])

  // Danh sách các Sprint ĐÃ BẮT ĐẦU (ACTIVE hoặc COMPLETED)
  const startedSprints = sprints.filter((s) => s.status === 'ACTIVE' || s.status === 'COMPLETED')
  const currentSprint =
    startedSprints.find((s) => s.id === selectedSprintId) || startedSprints[0] || null
  const plannedSprints = sprints.filter((s) => s.status === 'PLANNED')

  // Dọn dẹp timer khi component unmount
  useEffect(() => {
    return () => {
      debounceTimersRef.current.forEach((timer) => clearTimeout(timer))
      debounceTimersRef.current.clear()
    }
  }, [])

  // Thẻ đang được kéo (dùng cho DragOverlay)
  const activeTask = useMemo(
    () => (activeTaskId ? allTasks.find((t) => t.id === activeTaskId) || null : null),
    [activeTaskId, allTasks],
  )

  // Tìm cột chứa task dựa vào ID (có thể id là của Cột hoặc của Thẻ task)
  const findColumnIdOfItem = useCallback(
    (id: string): string | null => {
      const isCol = columns.some((c) => c.id === id)
      if (isCol) return id

      const task = allTasks.find((t) => t.id === id)
      if (task) return task.statusId

      return null
    },
    [columns, allTasks],
  )

  // Debounced API call: Chờ 600ms không có thao tác kéo mới mới bắn request vào DB
  const debouncedMoveTask = useCallback(
    (
      taskId: string,
      targetStatusId: string,
      newPosition: number,
      previousTasks: TaskItem[],
    ) => {
      // Hủy timer cũ của task này nếu vừa kéo tiếp trong vòng 600ms
      const existingTimer = debounceTimersRef.current.get(taskId)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      const timer = setTimeout(async () => {
        debounceTimersRef.current.delete(taskId)
        try {
          await taskService.moveProjectTask(projectParam, taskId, {
            statusId: targetStatusId,
            position: newPosition,
          })
        } catch (err: any) {
          console.error('Failed to persist task position:', err)
          // Rollback lại snapshot cũ nếu backend trả lỗi (WIP limit / Workflow Transition)
          setAllTasks(previousTasks)
          const detailMsg =
            err?.response?.data?.message ||
            err?.message ||
            'Không thể di chuyển công việc theo quy trình hiện tại!'
          setErrorMessage(detailMsg)
          setTimeout(() => setErrorMessage(null), 6000)
        }
      }, 600)

      debounceTimersRef.current.set(taskId, timer)
    },
    [projectParam],
  )

  // 1. Khi bắt đầu kéo
  const handleDragStart = (event: DragStartEvent) => {
    isDraggingRef.current = true
    setActiveTaskId(String(event.active.id))
    // Lưu lại snapshot trước khi bắt đầu kéo để phục vụ rollback an toàn
    previousTasksRef.current = [...allTasks]
  }

  // 2. Khi rê chuột bay qua cột hoặc thẻ khác: tạo animation dạt chỗ
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)
    if (activeId === overId) return

    const sourceColId = findColumnIdOfItem(activeId)
    const targetColId = findColumnIdOfItem(overId)

    if (!sourceColId || !targetColId || sourceColId === targetColId) return

    // Khi di chuyển sang cột khác, tạm thời cập nhật statusId để UI các cột phản hồi tức thì
    setAllTasks((prev) => {
      const activeIdx = prev.findIndex((t) => t.id === activeId)
      if (activeIdx === -1) return prev

      const targetColTasks = prev.filter(
        (t) => t.statusId === targetColId && t.id !== activeId,
      )
      const overIdxInCol = targetColTasks.findIndex((t) => t.id === overId)

      let targetPos = 1000
      if (overIdxInCol >= 0) {
        targetPos = targetColTasks[overIdxInCol].position ?? 1000
      } else if (targetColTasks.length > 0) {
        targetPos = (targetColTasks[targetColTasks.length - 1].position ?? 0) + 1000
      }

      const updated = [...prev]
      updated[activeIdx] = {
        ...updated[activeIdx],
        statusId: targetColId,
        position: targetPos,
      }
      return updated
    })
  }

  // 3. Khi thả chuột (Drop)
  const handleDragEnd = (event: DragEndEvent) => {
    setTimeout(() => {
      isDraggingRef.current = false
    }, 100)

    const { active, over } = event
    setActiveTaskId(null)

    if (!over) {
      // Nếu thả ra ngoài vùng hợp lệ, khôi phục lại snapshot ban đầu
      setAllTasks(previousTasksRef.current)
      return
    }

    const activeId = String(active.id)
    const overId = String(over.id)

    const targetColId = findColumnIdOfItem(overId)
    if (!targetColId) {
      setAllTasks(previousTasksRef.current)
      return
    }

    const pristineTasks = previousTasksRef.current
    const activeTaskPristine = pristineTasks.find((t) => t.id === activeId)
    if (!activeTaskPristine) return

    // Lọc danh sách task hiện tại của cột đích (loại trừ task đang kéo)
    const colTasks = allTasks
      .filter((t) => t.statusId === targetColId && t.id !== activeId)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

    let newIndex: number
    const overIndexInCol = colTasks.findIndex((t) => t.id === overId)

    if (overIndexInCol >= 0) {
      newIndex = overIndexInCol
    } else {
      newIndex = colTasks.length
    }

    // Tính position mới chuẩn Midpoint
    const calculatedPosition = calculateNewPosition(colTasks, newIndex)

    // Cập nhật giao diện tức thì (0ms)
    setAllTasks((prev) => {
      const currentItem = prev.find((t) => t.id === activeId) || activeTaskPristine
      const withoutActive = prev.filter((t) => t.id !== activeId)
      const updatedActive = {
        ...currentItem,
        statusId: targetColId,
        position: calculatedPosition,
      }

      return [...withoutActive, updatedActive].sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0),
      )
    })

    // Kích hoạt Debounce 600ms trước khi lưu vào Database
    debouncedMoveTask(activeId, targetColId, calculatedPosition, pristineTasks)
  }

  const handleDragCancel = () => {
    setActiveTaskId(null)
    setAllTasks(previousTasksRef.current)
    setTimeout(() => {
      isDraggingRef.current = false
    }, 100)
  }

  // Thêm nhanh task vào cột
  const handleQuickAddTask = async (columnId: string) => {
    const title = quickTaskTitle.trim()
    if (!title || !projectParam || isSubmittingQuickAdd) return

    try {
      setIsSubmittingQuickAdd(true)
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
    } finally {
      setIsSubmittingQuickAdd(false)
    }
  }

  const renderWorkTypeIcon = (typeName?: string | null) => {
    const name = typeName?.toLowerCase() || ''
    if (name.includes('bug')) return <Bug className="w-3.5 h-3.5 text-rose-600 shrink-0" />
    if (name.includes('module')) return <Package className="w-3.5 h-3.5 text-purple-600 shrink-0" />
    return <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
  }

  const totalTasksCount = allTasks.length

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
            <span>
              {filteredTasks.length === totalTasksCount
                ? `${totalTasksCount} công việc trên bảng`
                : `${filteredTasks.length} / ${totalTasksCount} công việc (đã lọc)`}
            </span>
          </div>
        </div>

        {/* Bên phải: Nút Tạo công việc + Bộ chọn Sprint nhỏ */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setCreateTaskInitialStatusId(columns[0]?.id)
              setIsCreateModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo công việc</span>
          </button>

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
      </div>

      {/* 2. Thanh lọc công việc (Search, Assignee, Priority, WorkType) */}
      <TaskFilterBar
        filters={filters}
        onFilterChange={setFilters}
        members={members}
        workTypes={workTypes}
        totalCount={totalTasksCount}
        filteredCount={filteredTasks.length}
      />

      {isLoading && (
        <div className="py-16 flex flex-col items-center justify-center gap-2.5 text-slate-500 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span className="font-medium">Đang tải bảng công việc...</span>
        </div>
      )}

      {/* 3. Modern Flat Kanban Board Canvas with @dnd-kit */}
      {!isLoading && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex-1 flex gap-3.5 overflow-x-auto pb-4 items-start select-none">
            {displayedColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                isDraggingActive={Boolean(activeTaskId)}
                quickAddColumnId={quickAddColumnId}
                quickTaskTitle={quickTaskTitle}
                setQuickTaskTitle={setQuickTaskTitle}
                setQuickAddColumnId={setQuickAddColumnId}
                handleQuickAddTask={handleQuickAddTask}
                isSubmittingQuickAdd={isSubmittingQuickAdd}
                onCardClick={(taskId) => {
                  if (!isDraggingRef.current) setSelectedTaskId(taskId)
                }}
                onOpenCreateModalWithStatus={(statusId) => {
                  setCreateTaskInitialStatusId(statusId)
                  setIsCreateModalOpen(true)
                }}
                renderWorkTypeIcon={renderWorkTypeIcon}
              />
            ))}
          </div>

          {/* Drag Overlay: Thẻ bóng mờ bay theo chuột */}
          <DragOverlay>
            {activeTask ? (
              <KanbanCard task={activeTask} isOverlay renderWorkTypeIcon={renderWorkTypeIcon} />
            ) : null}
          </DragOverlay>
        </DndContext>
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

      {/* Task Detail Drawer */}
      {selectedTaskId && (
        <TaskDetailDrawer
          isOpen={Boolean(selectedTaskId)}
          onClose={() => setSelectedTaskId(null)}
          projectIdOrKey={projectParam}
          taskId={selectedTaskId}
          onTaskUpdated={loadTasksForBoard}
          onTaskDeleted={loadTasksForBoard}
        />
      )}

      {/* Create Task Modal */}
      {projectParam && (
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          projectIdOrKey={projectParam}
          initialSprintId={isScrum && currentSprint ? currentSprint.id : null}
          initialStatusId={createTaskInitialStatusId}
          onTaskCreated={() => {
            setIsCreateModalOpen(false)
            loadTasksForBoard()
          }}
        />
      )}
    </div>
  )
}

export default KanbanBoardView
