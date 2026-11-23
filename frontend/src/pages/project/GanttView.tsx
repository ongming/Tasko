import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  CalendarPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Eye,
  GanttChart,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import { taskService } from '@/services/taskService'
import { sprintService } from '@/services/sprintService'
import { projectService } from '@/services/projectService'
import { workspaceService } from '@/services/workspaceService'
import { useAuthStore } from '@/stores/authStore'
import { taskKeys } from '@/hooks/queries/useTasksQuery'
import { sprintKeys } from '@/hooks/queries/useSprintsQuery'
import type { TaskItem } from '@/types/task'
import type { Sprint } from '@/types/sprint'
import type { Project, WorkspaceResponse } from '@/types/workspace'
import type { ProjectMember } from '@/types/member'
import { TaskDetailDrawer } from '@/components/project/TaskDetailDrawer'
import { WorkTypeIcon } from '@/components/project/WorkTypeIcon'
import { formatLocalDateKey } from '@/utils/dateFormat'
import {
  buildGanttHierarchy,
  flattenVisibleGanttRows,
  calculateGanttBar,
  applyDragDelta,
  addDaysToKey,
  normalizeDateKey,
  type GanttDragMode,
  type GanttNode,
  type GanttBarGeometry,
} from '@/utils/ganttUtils'

type ZoomLevel = 'week' | 'month' | 'quarter'

const ZOOM_CONFIG: Record<
  ZoomLevel,
  { label: string; totalDays: number; dayWidthPx: number; stepDays: number }
> = {
  week: { label: 'Tuần (14 ngày)', totalDays: 14, dayWidthPx: 64, stepDays: 7 },
  month: { label: 'Tháng (30 ngày)', totalDays: 30, dayWidthPx: 40, stepDays: 14 },
  quarter: { label: 'Quý (60 ngày)', totalDays: 60, dayWidthPx: 26, stepDays: 30 },
}

const ROW_HEIGHT = 44
const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

interface DragState {
  taskId: string
  mode: GanttDragMode
  startClientX: number
  origStart: string
  origDue: string
  previewStart: string
  previewDue: string
  hasMoved: boolean
}

export interface GanttViewProps {
  readOnly?: boolean
}

function getBarColors(task: TaskItem, isSummary: boolean): {
  track: string
  fill: string
  border: string
} {
  if (isSummary) {
    return {
      track: 'bg-slate-800/90 text-white',
      fill: 'bg-indigo-500/80',
      border: 'border-slate-700',
    }
  }

  const category = task.status?.category
  if (category === 'DONE') {
    return {
      track: 'bg-emerald-500/85 text-white',
      fill: 'bg-emerald-700/40',
      border: 'border-emerald-600/80',
    }
  }
  if (category === 'IN_PROGRESS') {
    if (task.priority === 'URGENT') {
      return {
        track: 'bg-rose-500/85 text-white',
        fill: 'bg-rose-700/40',
        border: 'border-rose-600/80',
      }
    }
    return {
      track: 'bg-indigo-500/90 text-white',
      fill: 'bg-indigo-700/45',
      border: 'border-indigo-600/80',
    }
  }
  // TODO
  if (task.priority === 'URGENT' || task.priority === 'HIGH') {
    return {
      track: 'bg-amber-500/85 text-white',
      fill: 'bg-amber-700/35',
      border: 'border-amber-600/70',
    }
  }
  return {
    track: 'bg-sky-500/85 text-white',
    fill: 'bg-sky-700/35',
    border: 'border-sky-600/70',
  }
}

export function GanttView({ readOnly = false }: GanttViewProps = {}) {
  const { projectKey } = useParams<{ projectKey?: string }>()
  const [searchParams] = useSearchParams()
  const projectParam =
    projectKey || searchParams.get('project') || searchParams.get('projectId') || ''

  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  // State điều hướng, zoom, lọc, cây mở rộng, drawer
  const [zoom, setZoom] = useState<ZoomLevel>('month')
  const [windowStart, setWindowStart] = useState<Date>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - 5)
    return d
  })
  const [sprintFilter, setSprintFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())
  const [hasInitExpanded, setHasInitExpanded] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)
  const [dragState, setDragState] = useState<DragState | null>(null)

  const { totalDays, dayWidthPx, stepDays } = ZOOM_CONFIG[zoom]
  const timelineWidth = totalDays * dayWidthPx

  // 1. Queries dữ liệu
  const tasksQueryKey = taskKeys.projectTasks(projectParam, undefined)
  const {
    data: tasks = [],
    isLoading: isLoadingTasks,
    isError: isErrorTasks,
    refetch: refetchTasks,
  } = useQuery<TaskItem[]>({
    queryKey: tasksQueryKey,
    queryFn: () => taskService.getProjectTasks(projectParam),
    enabled: Boolean(projectParam),
    staleTime: 1000 * 60 * 2,
  })

  const { data: sprints = [] } = useQuery<Sprint[]>({
    queryKey: sprintKeys.byProject(projectParam),
    queryFn: () => sprintService.getSprints(projectParam),
    enabled: Boolean(projectParam),
    staleTime: 1000 * 60 * 2,
  })

  const { data: project = null } = useQuery<Project | null>({
    queryKey: ['project', projectParam],
    queryFn: () => projectService.getProjectById(projectParam),
    enabled: Boolean(projectParam),
  })

  const { data: projectMembers = [] } = useQuery<ProjectMember[]>({
    queryKey: ['project-members', project?.id],
    queryFn: () => projectService.getProjectMembers(project!.id),
    enabled: Boolean(project?.id),
  })

  const { data: myWorkspaces = [] } = useQuery<WorkspaceResponse[]>({
    queryKey: ['my-workspaces'],
    queryFn: async () => {
      const res = await workspaceService.getMyWorkspaces()
      return (res as any)?.data || res || []
    },
    staleTime: 1000 * 60 * 5,
  })

  // 2. Xác định quyền ghi (TASK_WRITE — khóa kéo thả nếu là VIEWER)
  const canEdit = useMemo(() => {
    if (readOnly) return false
    if (!user?.id) return true

    const ws = myWorkspaces.find((w) => w.id === project?.workspaceId)
    if (ws && (ws.role === 'OWNER' || ws.role === 'ADMIN' || ws.ownerId === user.id)) {
      return true
    }

    const member = projectMembers.find((m) => m.userId === user.id)
    if (member) {
      return member.role?.name?.toUpperCase() !== 'VIEWER'
    }

    return true
  }, [readOnly, user?.id, myWorkspaces, project?.workspaceId, projectMembers])

  // 3. Mutation cập nhật ngày với Optimistic UI + Rollback khi lỗi
  const updateTaskDatesMutation = useMutation({
    mutationFn: ({
      taskId,
      startDate,
      dueDate,
    }: {
      taskId: string
      startDate: string
      dueDate: string
    }) => taskService.updateProjectTask(projectParam, taskId, { startDate, dueDate }),
    onMutate: async ({ taskId, startDate, dueDate }) => {
      setFeedbackError(null)
      await queryClient.cancelQueries({ queryKey: tasksQueryKey })
      const previousTasks = queryClient.getQueryData<TaskItem[]>(tasksQueryKey)

      queryClient.setQueryData<TaskItem[]>(tasksQueryKey, (old = []) =>
        old.map((t) => (t.id === taskId ? { ...t, startDate, dueDate } : t)),
      )

      return { previousTasks }
    },
    onError: (err: any, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(tasksQueryKey, context.previousTasks)
      }
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể cập nhật lịch công việc. Đã khôi phục trạng thái trước đó.'
      setFeedbackError(msg)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectParam] })
    },
  })

  // 4. Danh sách trạng thái duy nhất để lọc nhanh
  const availableStatuses = useMemo(() => {
    const map = new Map<string, { id: string; name: string; color: string }>()
    for (const t of tasks) {
      if (t.status && !map.has(t.status.id)) {
        map.set(t.status.id, { id: t.status.id, name: t.status.name, color: t.status.color })
      }
    }
    return Array.from(map.values())
  }, [tasks])

  // 5. Lọc tasks & xây dựng cây cha–con
  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return tasks.filter((t) => {
      if (sprintFilter === 'BACKLOG') {
        if (t.sprintId) return false
      } else if (sprintFilter !== 'ALL') {
        if (t.sprintId !== sprintFilter) return false
      }

      if (statusFilter !== 'ALL' && t.statusId !== statusFilter) {
        return false
      }

      if (q) {
        const matchKey = t.taskKey?.toLowerCase().includes(q)
        const matchTitle = t.title?.toLowerCase().includes(q)
        if (!matchKey && !matchTitle) return false
      }

      return true
    })
  }, [tasks, sprintFilter, statusFilter, searchQuery])

  const hierarchyRoots = useMemo(() => buildGanttHierarchy(filteredTasks), [filteredTasks])

  // Thu thập tất cả parentIds có con để hỗ trợ Expand All / Collapse All
  const allParentIds = useMemo(() => {
    const ids: string[] = []
    const collect = (nodes: GanttNode[]) => {
      for (const n of nodes) {
        if (n.children.length > 0) {
          ids.push(n.task.id)
          collect(n.children)
        }
      }
    }
    collect(hierarchyRoots)
    return ids
  }, [hierarchyRoots])

  // Mặc định mở rộng toàn bộ cây khi dữ liệu tải xong lần đầu
  useEffect(() => {
    if (!hasInitExpanded && allParentIds.length > 0) {
      setExpandedIds(new Set(allParentIds))
      setHasInitExpanded(true)
    }
  }, [hasInitExpanded, allParentIds])

  const visibleRows = useMemo(
    () => flattenVisibleGanttRows(hierarchyRoots, expandedIds),
    [hierarchyRoots, expandedIds],
  )

  const toggleExpand = useCallback((taskId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }, [])

  const isAllExpanded =
    allParentIds.length > 0 && allParentIds.every((id) => expandedIds.has(id))

  const handleToggleExpandAll = () => {
    if (isAllExpanded) {
      setExpandedIds(new Set())
    } else {
      setExpandedIds(new Set(allParentIds))
    }
  }

  // 6. Danh sách ngày và nhóm tháng cho Time Ruler
  const todayKey = formatLocalDateKey(new Date())

  const daysList = useMemo(() => {
    const list: Array<{
      date: Date
      dateKey: string
      dayNumber: number
      weekday: string
      isToday: boolean
      isWeekend: boolean
      monthLabel: string
    }> = []

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(windowStart)
      d.setDate(d.getDate() + i)
      const dateKey = formatLocalDateKey(d)
      const dow = d.getDay()
      list.push({
        date: d,
        dateKey,
        dayNumber: d.getDate(),
        weekday: WEEKDAY_LABELS[dow],
        isToday: dateKey === todayKey,
        isWeekend: dow === 0 || dow === 6,
        monthLabel: `Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`,
      })
    }
    return list
  }, [windowStart, totalDays, todayKey])

  const monthGroups = useMemo(() => {
    const groups: Array<{ label: string; count: number }> = []
    for (const day of daysList) {
      const last = groups[groups.length - 1]
      if (last && last.label === day.monthLabel) {
        last.count += 1
      } else {
        groups.push({ label: day.monthLabel, count: 1 })
      }
    }
    return groups
  }, [daysList])

  const todayColumnIndex = useMemo(
    () => daysList.findIndex((d) => d.isToday),
    [daysList],
  )

  // 7. Điều hướng cửa sổ thời gian
  const handlePrevRange = () => {
    setWindowStart((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() - stepDays)
      return d
    })
  }

  const handleNextRange = () => {
    setWindowStart((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + stepDays)
      return d
    })
  }

  const handleToday = () => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - Math.min(5, Math.floor(totalDays / 4)))
    setWindowStart(d)
  }

  // 8. Tính toán hình học thanh cho từng hàng (có áp dụng dragState preview trực tiếp)
  const rowGeometries = useMemo(() => {
    const map = new Map<
      string,
      { bar: GanttBarGeometry; displayStart: string | null; displayDue: string | null }
    >()

    for (const row of visibleRows) {
      const { node } = row
      const isDraggingThis = dragState?.taskId === node.task.id
      const displayStart = isDraggingThis ? dragState.previewStart : node.effectiveStartDate
      const displayDue = isDraggingThis ? dragState.previewDue : node.effectiveDueDate
      const bar = calculateGanttBar(displayStart, displayDue, windowStart, totalDays)
      map.set(node.task.id, { bar, displayStart, displayDue })
    }
    return map
  }, [visibleRows, dragState, windowStart, totalDays])

  // 9. Xử lý Pointer Drag (move / resize-start / resize-end)
  const startDrag = (
    e: React.PointerEvent,
    task: TaskItem,
    origStart: string,
    origDue: string,
    mode: GanttDragMode,
  ) => {
    if (!canEdit) return
    e.preventDefault()
    e.stopPropagation()

    setDragState({
      taskId: task.id,
      mode,
      startClientX: e.clientX,
      origStart,
      origDue,
      previewStart: origStart,
      previewDue: origDue,
      hasMoved: false,
    })
  }

  useEffect(() => {
    if (!dragState) return

    const handlePointerMove = (e: PointerEvent) => {
      const deltaPx = e.clientX - dragState.startClientX
      const deltaDays = Math.round(deltaPx / dayWidthPx)
      const next = applyDragDelta(
        dragState.origStart,
        dragState.origDue,
        dragState.mode,
        deltaDays,
      )
      setDragState((prev) =>
        prev
          ? {
              ...prev,
              previewStart: next.startDate,
              previewDue: next.dueDate,
              hasMoved: prev.hasMoved || Math.abs(deltaPx) > 3,
            }
          : null,
      )
    }

    const handlePointerUp = () => {
      const current = dragState
      setDragState(null)

      if (
        current.previewStart !== current.origStart ||
        current.previewDue !== current.origDue
      ) {
        updateTaskDatesMutation.mutate({
          taskId: current.taskId,
          startDate: current.previewStart,
          dueDate: current.previewDue,
        })
      } else if (!current.hasMoved) {
        setSelectedTaskId(current.taskId)
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [dragState, dayWidthPx, updateTaskDatesMutation])

  // 10. Đặt lịch nhanh cho task chưa có startDate / dueDate
  const handleQuickSchedule = (e: React.MouseEvent, task: TaskItem) => {
    e.stopPropagation()
    if (!canEdit) {
      setSelectedTaskId(task.id)
      return
    }
    const startDate = todayKey
    const dueDate = addDaysToKey(todayKey, 2)
    updateTaskDatesMutation.mutate({ taskId: task.id, startDate, dueDate })
  }

  // 11. Tính đường nối SVG cha–con (elbow connector)
  const svgConnectors = useMemo(() => {
    const rowByTaskId = new Map(visibleRows.map((r) => [r.node.task.id, r]))
    const paths: Array<{ id: string; d: string }> = []

    for (const row of visibleRows) {
      if (!row.parentId) continue
      const parentRow = rowByTaskId.get(row.parentId)
      if (!parentRow) continue

      const parentGeom = rowGeometries.get(parentRow.node.task.id)?.bar
      const childGeom = rowGeometries.get(row.node.task.id)?.bar
      if (
        !parentGeom?.hasDates ||
        parentGeom.isOutOfRange ||
        !childGeom?.hasDates ||
        childGeom.isOutOfRange
      ) {
        continue
      }

      const x1 = Math.max(8, (parentGeom.leftPercent / 100) * timelineWidth + 10)
      const y1 = parentRow.rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2 + 12
      const x2 = (childGeom.leftPercent / 100) * timelineWidth
      const y2 = row.rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2

      let d: string
      if (x2 >= x1 + 6) {
        d = `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}`
      } else {
        const elbowX = Math.max(4, x2 - 8)
        const midY = y1 + 6
        d = `M ${x1} ${y1} L ${x1} ${midY} L ${elbowX} ${midY} L ${elbowX} ${y2} L ${x2} ${y2}`
      }

      paths.push({ id: `${parentRow.node.task.id}-${row.node.task.id}`, d })
    }

    return paths
  }, [visibleRows, rowGeometries, timelineWidth])

  const hasActiveFilter =
    sprintFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery.trim() !== ''

  const clearFilters = () => {
    setSprintFilter('ALL')
    setStatusFilter('ALL')
    setSearchQuery('')
  }

  return (
    <div className="flex flex-col gap-4 w-full flex-1 min-h-0 pb-8">
      {/* 1. Thanh công cụ (Toolbar) */}
      <div className="flex flex-col gap-3 bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Điều hướng thời gian & Zoom */}
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center bg-slate-50 border border-slate-200/90 rounded-lg p-0.5">
              <button
                type="button"
                onClick={handlePrevRange}
                className="p-1.5 rounded-md hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Khoảng thời gian trước"
                aria-label="Trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="px-2.5 py-1 rounded-md hover:bg-white text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={handleNextRange}
                className="p-1.5 rounded-md hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Khoảng thời gian sau"
                aria-label="Sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Bộ chọn mức Zoom */}
            <div
              className="flex items-center bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/70"
              role="group"
              aria-label="Mức thu phóng trục thời gian"
            >
              {(['week', 'month', 'quarter'] as ZoomLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setZoom(level)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    zoom === level
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {ZOOM_CONFIG[level].label}
                </button>
              ))}
            </div>
          </div>

          {/* Thông tin & Mở rộng/Thu gọn */}
          <div className="flex items-center gap-2">
            {!canEdit && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold">
                <Eye className="w-3.5 h-3.5" />
                <span>Chế độ chỉ xem</span>
              </span>
            )}

            {allParentIds.length > 0 && (
              <button
                type="button"
                onClick={handleToggleExpandAll}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                {isAllExpanded ? (
                  <>
                    <ChevronsDownUp className="w-3.5 h-3.5 text-slate-500" />
                    <span>Thu gọn tất cả</span>
                  </>
                ) : (
                  <>
                    <ChevronsUpDown className="w-3.5 h-3.5 text-slate-500" />
                    <span>Mở rộng tất cả</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Hàng bộ lọc nhanh */}
        <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-slate-100">
          {/* Tìm kiếm */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã hoặc tiêu đề task..."
              aria-label="Tìm kiếm công việc"
              className="w-full pl-8 pr-7 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-slate-50/50 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Lọc theo Sprint */}
          <select
            value={sprintFilter}
            onChange={(e) => setSprintFilter(e.target.value)}
            aria-label="Lọc theo Sprint"
            className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Tất cả Sprint</option>
            <option value="BACKLOG">Backlog (Chưa gán Sprint)</option>
            {sprints.map((sp) => (
              <option key={sp.id} value={sp.id}>
                {sp.name}
              </option>
            ))}
          </select>

          {/* Lọc theo Trạng thái */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Lọc theo trạng thái"
            className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            {availableStatuses.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          )}

          <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-500">
            <GanttChart className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              <strong className="text-slate-800">{filteredTasks.length}</strong> công việc
            </span>
          </div>
        </div>
      </div>

      {/* Banner báo lỗi Optimistic rollback */}
      {feedbackError && (
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{feedbackError}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackError(null)}
            className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
            aria-label="Đóng thông báo lỗi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Loading Skeleton */}
      {isLoadingTasks && (
        <div
          className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3 shadow-2xs"
          aria-label="Đang tải biểu đồ Gantt"
        >
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-4 animate-pulse">
              <div className="w-72 h-7 bg-slate-100 rounded-lg shrink-0" />
              <div className="flex-1 h-7 bg-slate-100/80 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* 3. Error State */}
      {!isLoadingTasks && isErrorTasks && (
        <div className="bg-white rounded-xl border border-rose-200 p-10 flex flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="w-8 h-8 text-rose-500" />
          <div>
            <p className="text-sm font-bold text-slate-900">Không thể tải dữ liệu biểu đồ Gantt</p>
            <p className="text-xs text-slate-500 mt-1">
              Đã xảy ra lỗi khi kết nối máy chủ. Vui lòng thử lại.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetchTasks()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {/* 4. Empty State */}
      {!isLoadingTasks && !isErrorTasks && visibleRows.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 flex flex-col items-center justify-center gap-2.5 text-center shadow-2xs">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <GanttChart className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {hasActiveFilter
              ? 'Không có công việc nào khớp bộ lọc'
              : 'Dự án chưa có công việc nào'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm">
            {hasActiveFilter
              ? 'Hãy thử điều chỉnh điều kiện lọc Sprint, trạng thái hoặc từ khóa tìm kiếm.'
              : 'Tạo công việc mới ở Bảng hoặc Backlog để theo dõi tiến độ trực quan trên biểu đồ Gantt.'}
          </p>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-1 px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold cursor-pointer"
            >
              Xóa tất cả bộ lọc
            </button>
          )}
        </div>
      )}

      {/* 5. Bố cục Split Pane 2 cột đồng bộ cuộn dọc */}
      {!isLoadingTasks && !isErrorTasks && visibleRows.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-auto flex-1 min-h-[360px]">
          <div
            className="relative"
            style={{ minWidth: `${320 + timelineWidth}px` }}
          >
            {/* Header sticky top */}
            <div className="flex sticky top-0 z-30 border-b border-slate-200 bg-slate-50/95 backdrop-blur-xs select-none">
              {/* Cột tiêu đề trái sticky left */}
              <div className="w-[320px] shrink-0 sticky left-0 z-40 bg-slate-50 border-r border-slate-200 px-3 py-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Công việc &amp; Tiến độ
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {visibleRows.length} mục
                </span>
              </div>

              {/* Thước đo thời gian phải (2 tầng: Tháng + Ngày) */}
              <div style={{ width: `${timelineWidth}px` }} className="shrink-0 flex flex-col">
                {/* Tầng 1: Tháng */}
                <div className="flex border-b border-slate-200/80">
                  {monthGroups.map((mg, idx) => (
                    <div
                      key={`${mg.label}-${idx}`}
                      style={{ width: `${mg.count * dayWidthPx}px` }}
                      className="px-2 py-1 text-[11px] font-bold text-slate-700 border-r border-slate-200/80 last:border-r-0 truncate"
                    >
                      {mg.label}
                    </div>
                  ))}
                </div>

                {/* Tầng 2: Ngày */}
                <div className="flex">
                  {daysList.map((d) => (
                    <div
                      key={d.dateKey}
                      style={{ width: `${dayWidthPx}px` }}
                      className={`shrink-0 py-1 text-center border-r border-slate-100 last:border-r-0 flex flex-col items-center leading-tight ${
                        d.isToday
                          ? 'bg-rose-50 text-rose-600 font-bold'
                          : d.isWeekend
                            ? 'bg-slate-100/70 text-slate-400'
                            : 'text-slate-600'
                      }`}
                    >
                      <span className="text-[9px] font-medium opacity-75">{d.weekday}</span>
                      <span className="text-[11px] font-bold">{d.dayNumber}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Body Split Pane */}
            <div className="flex relative">
              {/* CỘT TRÁI: Cây Task cha–con (sticky left) */}
              <div className="w-[320px] shrink-0 sticky left-0 z-20 bg-white border-r border-slate-200 divide-y divide-slate-100">
                {visibleRows.map((row) => {
                  const { node, isExpanded } = row
                  const { task } = node
                  const hasChildren = node.children.length > 0

                  return (
                    <div
                      key={task.id}
                      style={{ height: `${ROW_HEIGHT}px`, paddingLeft: `${12 + node.depth * 18}px` }}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`pr-3 flex items-center gap-1.5 hover:bg-slate-50/90 transition-colors cursor-pointer group ${
                        node.isSummary ? 'bg-slate-50/40' : ''
                      }`}
                    >
                      {/* Nút thu gọn/mở rộng hoặc nhánh cây */}
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleExpand(task.id)
                          }}
                          aria-label={isExpanded ? `Thu gọn ${task.taskKey}` : `Mở rộng ${task.taskKey}`}
                          className="p-0.5 rounded hover:bg-slate-200/70 text-slate-500 shrink-0 cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                      ) : node.depth > 0 ? (
                        <span className="text-[11px] text-slate-300 font-mono shrink-0 select-none">
                          └─
                        </span>
                      ) : (
                        <span className="w-4 shrink-0" />
                      )}

                      <WorkTypeIcon type={task.type} />

                      <span className="font-mono text-[11px] font-bold text-slate-500 group-hover:text-indigo-600 shrink-0">
                        {task.taskKey}
                      </span>

                      <span
                        className={`text-xs truncate flex-1 ${
                          node.isSummary
                            ? 'font-bold text-slate-900'
                            : 'font-medium text-slate-700'
                        }`}
                        title={task.title}
                      >
                        {task.title}
                      </span>

                      {/* Badge số con + % tiến độ cho Task cha */}
                      {hasChildren && (
                        <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold shrink-0">
                          {node.children.length} · {node.progressPercent}%
                        </span>
                      )}

                      {/* Avatar người phụ trách */}
                      {task.assignee && (
                        task.assignee.avatarUrl ? (
                          <img
                            src={task.assignee.avatarUrl}
                            alt={task.assignee.name}
                            title={task.assignee.name}
                            className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                          />
                        ) : (
                          <div
                            title={task.assignee.name}
                            className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-bold flex items-center justify-center shrink-0"
                          >
                            {task.assignee.name.slice(0, 2).toUpperCase()}
                          </div>
                        )
                      )}
                    </div>
                  )
                })}
              </div>

              {/* CỘT PHẢI: Lưới trục thời gian + SVG Connectors + Thanh Gantt */}
              <div
                style={{
                  width: `${timelineWidth}px`,
                  height: `${visibleRows.length * ROW_HEIGHT}px`,
                }}
                className="relative shrink-0"
              >
                {/* Nền cột ngày */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {daysList.map((d) => (
                    <div
                      key={d.dateKey}
                      style={{ width: `${dayWidthPx}px` }}
                      className={`h-full border-r border-slate-100 last:border-r-0 ${
                        d.isToday
                          ? 'bg-rose-50/30'
                          : d.isWeekend
                            ? 'bg-slate-50/70'
                            : ''
                      }`}
                    />
                  ))}
                </div>

                {/* Đường kẻ dọc đỏ đánh dấu Hôm nay */}
                {todayColumnIndex >= 0 && (
                  <div
                    style={{
                      left: `${todayColumnIndex * dayWidthPx + dayWidthPx / 2}px`,
                    }}
                    className="absolute top-0 bottom-0 w-[1.5px] bg-rose-500/80 pointer-events-none z-20"
                    title={`Hôm nay (${todayKey})`}
                  />
                )}

                {/* SVG Overlay: Đường nối quan hệ Cha–Con */}
                {svgConnectors.length > 0 && (
                  <svg
                    width={timelineWidth}
                    height={visibleRows.length * ROW_HEIGHT}
                    className="absolute inset-0 pointer-events-none z-10"
                    data-testid="gantt-svg-connectors"
                  >
                    {svgConnectors.map((conn) => (
                      <path
                        key={conn.id}
                        d={conn.d}
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ))}
                  </svg>
                )}

                {/* Các dòng thanh Gantt */}
                <div className="relative z-10 divide-y divide-slate-100">
                  {visibleRows.map((row) => {
                    const { node } = row
                    const { task } = node
                    const geomEntry = rowGeometries.get(task.id)
                    const bar = geomEntry?.bar
                    const displayStart = geomEntry?.displayStart
                    const displayDue = geomEntry?.displayDue
                    const isDraggingThis = dragState?.taskId === task.id
                    const colors = getBarColors(task, node.isSummary)

                    const origStart = normalizeDateKey(node.effectiveStartDate)
                    const origDue = normalizeDateKey(node.effectiveDueDate)

                    return (
                      <div
                        key={task.id}
                        style={{ height: `${ROW_HEIGHT}px` }}
                        className="relative flex items-center"
                      >
                        {!bar?.hasDates ? (
                          /* Task chưa có lịch -> Nút đặt lịch nhanh */
                          <div className="px-3">
                            <button
                              type="button"
                              onClick={(e) => handleQuickSchedule(e, task)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-dashed border-slate-300 text-[11px] font-medium text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/40 transition-colors cursor-pointer"
                            >
                              <CalendarPlus className="w-3 h-3" />
                              <span>Đặt lịch</span>
                            </button>
                          </div>
                        ) : bar.isOutOfRange ? (
                          <span className="px-3 text-[10px] italic text-slate-400 select-none">
                            Ngoài khung thời gian ({displayStart} → {displayDue})
                          </span>
                        ) : (
                          /* Thanh tiến độ Gantt */
                          <div
                            data-testid={`gantt-bar-${task.id}`}
                            data-readonly={canEdit ? 'false' : 'true'}
                            onPointerDown={(e) => {
                              if (origStart && origDue) {
                                startDrag(e, task, origStart, origDue, 'move')
                              }
                            }}
                            onClick={(e) => {
                              if (!canEdit) {
                                e.stopPropagation()
                                setSelectedTaskId(task.id)
                              }
                            }}
                            style={{
                              left: `${bar.leftPercent}%`,
                              width: `${bar.widthPercent}%`,
                            }}
                            title={`${task.taskKey}: ${task.title}\nThời gian: ${displayStart} → ${displayDue}\nTiến độ: ${node.progressPercent}%`}
                            className={`absolute flex items-center select-none border transition-shadow ${
                              node.isSummary ? 'h-6 rounded-md' : 'h-7 rounded-lg'
                            } ${colors.track} ${colors.border} ${
                              canEdit
                                ? isDraggingThis
                                  ? 'cursor-grabbing ring-2 ring-indigo-400 shadow-lg z-30'
                                  : 'cursor-grab hover:shadow-md'
                                : 'cursor-default'
                            } ${bar.isClampedLeft ? 'rounded-l-none border-l-0' : ''} ${
                              bar.isClampedRight ? 'rounded-r-none border-r-0' : ''
                            }`}
                          >
                            {/* Lớp fill thể hiện % tiến độ hoàn thành */}
                            <div
                              style={{ width: `${node.progressPercent}%` }}
                              className={`absolute inset-y-0 left-0 pointer-events-none transition-all ${colors.fill} ${
                                bar.isClampedLeft ? '' : 'rounded-l-md'
                              } ${node.progressPercent >= 100 && !bar.isClampedRight ? 'rounded-r-md' : ''}`}
                            />

                            {/* Handle kéo mép trái (resize-start) */}
                            {canEdit && !bar.isClampedLeft && (
                              <div
                                data-testid={`gantt-resize-start-${task.id}`}
                                onPointerDown={(e) => {
                                  if (origStart && origDue) {
                                    startDrag(e, task, origStart, origDue, 'resize-start')
                                  }
                                }}
                                className="absolute left-0 inset-y-0 w-2 cursor-ew-resize hover:bg-white/30 rounded-l-md z-20"
                                title="Kéo để chỉnh ngày bắt đầu"
                              />
                            )}

                            {/* Nội dung trên thanh */}
                            <div className="relative z-10 px-2 flex items-center justify-between gap-1.5 w-full min-w-0 text-[10px] font-semibold">
                              <span className="truncate">
                                {isDraggingThis
                                  ? `${displayStart} → ${displayDue}`
                                  : `${task.taskKey} · ${task.title}`}
                              </span>
                              <span className="text-[9px] font-mono opacity-90 shrink-0">
                                {node.progressPercent}%
                              </span>
                            </div>

                            {/* Handle kéo mép phải (resize-end) */}
                            {canEdit && !bar.isClampedRight && (
                              <div
                                data-testid={`gantt-resize-end-${task.id}`}
                                onPointerDown={(e) => {
                                  if (origStart && origDue) {
                                    startDrag(e, task, origStart, origDue, 'resize-end')
                                  }
                                }}
                                className="absolute right-0 inset-y-0 w-2 cursor-ew-resize hover:bg-white/30 rounded-r-md z-20"
                                title="Kéo để chỉnh ngày kết thúc"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Drawer */}
      {selectedTaskId && (
        <TaskDetailDrawer
          isOpen={Boolean(selectedTaskId)}
          onClose={() => setSelectedTaskId(null)}
          projectIdOrKey={projectParam}
          taskId={selectedTaskId}
          onTaskUpdated={() =>
            queryClient.invalidateQueries({ queryKey: ['project-tasks', projectParam] })
          }
          onTaskDeleted={() =>
            queryClient.invalidateQueries({ queryKey: ['project-tasks', projectParam] })
          }
        />
      )}
    </div>
  )
}

export default GanttView
