import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CalendarOff,
  Loader2,
} from 'lucide-react'
import { taskService } from '@/services/taskService'
import type { TaskItem } from '@/types/task'
import { useDragAndDrop } from '@/hooks/useDragAndDrop'
import { TaskDetailDrawer } from '@/components/project/TaskDetailDrawer'
import { WorkTypeIcon } from '@/components/project/WorkTypeIcon'
import { formatLocalDateKey } from '@/utils/dateFormat'

type CalendarPillRole = 'start-only' | 'due-only' | 'start' | 'middle' | 'end'

interface CalendarCellEntry {
  task: TaskItem
  role: CalendarPillRole
  isDraggable: boolean
}

function toDateKey(value?: string | null): string | null {
  if (!value) return null
  return value.split('T')[0] || null
}

function diffDateKeys(fromKey: string, toKey: string): number {
  const [fy, fm, fd] = fromKey.split('-').map(Number)
  const [ty, tm, td] = toKey.split('-').map(Number)
  const fromUtc = Date.UTC(fy, fm - 1, fd)
  const toUtc = Date.UTC(ty, tm - 1, td)
  return Math.round((toUtc - fromUtc) / (24 * 60 * 60 * 1000))
}

function shiftDateKey(dateKey: string, deltaDays: number): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays))
  return dt.toISOString().split('T')[0]
}

interface CalendarTaskPillProps {
  task: TaskItem
  role?: CalendarPillRole
  isDraggable?: boolean
  renderWorkTypeIcon: (type?: { name: string; icon: string } | null) => React.ReactNode
  onClickTask?: (taskId: string) => void
  isOverlay?: boolean
}

function CalendarTaskPill({
  task,
  role = 'due-only',
  isDraggable = true,
  renderWorkTypeIcon,
  onClickTask,
  isOverlay = false,
}: CalendarTaskPillProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: isOverlay || !isDraggable,
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
  }

  if (isOverlay) {
    return (
      <div className="px-2 py-1 rounded bg-white border-2 border-indigo-500 shadow-xl flex items-center gap-1.5 w-[160px] cursor-grabbing select-none">
        {renderWorkTypeIcon(task.type)}
        <span className="font-mono text-[10px] font-bold text-indigo-600 shrink-0">
          {task.taskKey}
        </span>
        <span className="text-[11px] text-slate-800 font-semibold truncate flex-1">
          {task.title}
        </span>
      </div>
    )
  }

  const roleStyle =
    role === 'middle'
      ? 'bg-indigo-50/60 hover:bg-indigo-100/70 border-indigo-200/70'
      : role === 'start' || role === 'start-only'
        ? 'bg-slate-50 hover:bg-indigo-50/80 border-slate-200/80 border-l-2 border-l-indigo-500'
        : 'bg-slate-50 hover:bg-indigo-50/80 border-slate-200/80 border-r-2 border-r-rose-400'

  const roleHint =
    role === 'start-only'
      ? 'Ngày bắt đầu'
      : role === 'start'
        ? 'Bắt đầu khoảng thời gian'
        : role === 'middle'
          ? 'Đang trong khoảng thời gian'
          : 'Hạn hoàn thành'

  return (
    <div
      ref={isDraggable ? setNodeRef : undefined}
      style={isDraggable ? style : undefined}
      {...(isDraggable ? attributes : {})}
      {...(isDraggable ? listeners : {})}
      onClick={() => onClickTask?.(task.id)}
      className={`px-1.5 py-1 rounded border text-left transition-all cursor-pointer ${
        isDraggable ? 'active:cursor-grabbing' : ''
      } group flex items-center gap-1 shadow-2xs select-none ${roleStyle} ${
        isDragging ? 'opacity-30 border-dashed border-indigo-400' : ''
      }`}
      title={`${task.taskKey}: ${task.title} (${roleHint})`}
    >
      {renderWorkTypeIcon(task.type)}
      <span className="font-mono text-[10px] font-bold text-slate-500 group-hover:text-indigo-600 shrink-0">
        {task.taskKey}
      </span>
      <span className="text-[11px] text-slate-800 font-medium truncate flex-1">
        {task.title}
      </span>
    </div>
  )
}

interface CalendarDayCellProps {
  dateKey: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  entries: CalendarCellEntry[]
  isExpanded: boolean
  onToggleExpand: (dateKey: string) => void
  renderWorkTypeIcon: (type?: { name: string; icon: string } | null) => React.ReactNode
  onClickTask: (taskId: string) => void
}

function CalendarDayCell({
  dateKey,
  dayNumber,
  isCurrentMonth,
  isToday,
  entries,
  isExpanded,
  onToggleExpand,
  renderWorkTypeIcon,
  onClickTask,
}: CalendarDayCellProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: dateKey,
  })

  const MAX_VISIBLE = 3
  const visibleEntries = isExpanded ? entries : entries.slice(0, MAX_VISIBLE)
  const hiddenCount = entries.length - MAX_VISIBLE

  return (
    <div
      ref={setNodeRef}
      className={`p-1.5 sm:p-2 min-h-[108px] flex flex-col transition-colors ${
        isOver
          ? 'bg-indigo-50/70 ring-2 ring-inset ring-indigo-300'
          : isCurrentMonth
            ? 'bg-white hover:bg-slate-50/50'
            : 'bg-slate-50/40 text-slate-300'
      }`}
    >
      {/* Ngày & Badge số lượng */}
      <div className="flex items-center justify-between mb-1.5 select-none">
        <span
          className={`text-xs font-semibold inline-flex items-center justify-center ${
            isToday
              ? 'w-5 h-5 rounded-full bg-indigo-600 text-white font-bold'
              : isCurrentMonth
                ? 'text-slate-700'
                : 'text-slate-400'
          }`}
        >
          {dayNumber}
        </span>

        {entries.length > 0 && (
          <span className="text-[10px] font-bold px-1 rounded bg-indigo-50 text-indigo-600">
            {entries.length}
          </span>
        )}
      </div>

      {/* Danh sách Thẻ công việc trong ngày */}
      <div className="flex flex-col gap-1">
        {visibleEntries.map((entry) => (
          <CalendarTaskPill
            key={`${entry.task.id}-${dateKey}`}
            task={entry.task}
            role={entry.role}
            isDraggable={entry.isDraggable}
            renderWorkTypeIcon={renderWorkTypeIcon}
            onClickTask={onClickTask}
          />
        ))}
        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => onToggleExpand(dateKey)}
            className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-700 text-left px-1 py-0.5 rounded hover:bg-indigo-50/70 transition-colors cursor-pointer"
          >
            {isExpanded ? 'Thu gọn' : `+${hiddenCount} khác`}
          </button>
        )}
      </div>
    </div>
  )
}

export function CalendarView() {
  const { projectKey } = useParams<{ projectKey?: string }>()
  const [searchParams] = useSearchParams()
  const projectParam = projectKey || searchParams.get('project') || searchParams.get('projectId') || ''

  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [expandedDayKey, setExpandedDayKey] = useState<string | null>(null)
  const [showUnscheduled, setShowUnscheduled] = useState(true)
  const previousTasksRef = useRef<TaskItem[]>([])
  const scheduleDebouncedRef = useRef<
    (key: string, action: () => Promise<void> | void, delayMs?: number) => void
  >(() => {})

  // Current viewed month and year
  const [currentDate, setCurrentDate] = useState(() => new Date())

  const loadTasks = useCallback(async () => {
    if (!projectParam) return
    try {
      setIsLoading(true)
      const data = await taskService.getProjectTasks(projectParam)
      setTasks(data)
    } catch (err) {
      console.error('Failed to load tasks for calendar:', err)
    } finally {
      setIsLoading(false)
    }
  }, [projectParam])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() // 0-indexed (0 = Jan, 4 = May)

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Days in week: T2 to CN
  const weekDays = ['Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'CN']

  // Tính toán các ngày trong lưới lịch (Monday-based)
  const calendarCells = useMemo(() => {
    // Ngày đầu tiên của tháng
    const firstDayOfMonth = new Date(year, month, 1)
    // Ngày trong tuần của ngày 1 (0 = CN, 1 = T2, ..., 6 = T7)
    let startDayOfWeek = firstDayOfMonth.getDay()
    // Đổi sang Monday-based (0 = T2, 1 = T3, ..., 6 = CN)
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

    // Tổng số ngày trong tháng hiện tại
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Tổng số ngày trong tháng trước
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const cells: Array<{
      date: Date
      dayNumber: number
      isCurrentMonth: boolean
      isToday: boolean
      dateKey: string // "YYYY-MM-DD"
    }> = []

    const todayStr = formatLocalDateKey(new Date())

    // 1. Các ngày của tháng trước đệm vào đầu
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i
      const dateObj = new Date(year, month - 1, d)
      const dateKey = formatLocalDateKey(dateObj)
      cells.push({
        date: dateObj,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateKey === todayStr,
        dateKey,
      })
    }

    // 2. Các ngày của tháng hiện tại
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d)
      const dateKey = formatLocalDateKey(dateObj)
      cells.push({
        date: dateObj,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateKey === todayStr,
        dateKey,
      })
    }

    // 3. Các ngày của tháng sau đệm vào cuối cho đủ bội số của 7
    const remaining = 7 - (cells.length % 7)
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const dateObj = new Date(year, month + 1, d)
        const dateKey = formatLocalDateKey(dateObj)
        cells.push({
          date: dateObj,
          dayNumber: d,
          isCurrentMonth: false,
          isToday: dateKey === todayStr,
          dateKey,
        })
      }
    }

    return cells
  }, [year, month])

  // Gom tasks theo dải ngày startDate -> dueDate trên lưới lịch đang xem
  const tasksByDate = useMemo(() => {
    const map = new Map<string, CalendarCellEntry[]>()
    const visibleKeys = new Set(calendarCells.map((c) => c.dateKey))

    const pushEntry = (dateKey: string, entry: CalendarCellEntry) => {
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)!.push(entry)
    }

    tasks.forEach((task) => {
      const startKey = toDateKey(task.startDate)
      const dueKey = toDateKey(task.dueDate)
      if (!startKey && !dueKey) return

      if (startKey && dueKey) {
        if (startKey >= dueKey) {
          if (visibleKeys.has(dueKey)) {
            pushEntry(dueKey, { task, role: 'due-only', isDraggable: true })
          }
          return
        }

        const isEndVisible = visibleKeys.has(dueKey)
        let assignedAnchor = false
        calendarCells.forEach((cell) => {
          if (cell.dateKey < startKey || cell.dateKey > dueKey) return
          const role: CalendarPillRole =
            cell.dateKey === startKey ? 'start' : cell.dateKey === dueKey ? 'end' : 'middle'
          const isDraggable = isEndVisible
            ? role === 'end'
            : !assignedAnchor
          if (isDraggable) assignedAnchor = true
          pushEntry(cell.dateKey, { task, role, isDraggable })
        })
        return
      }

      if (dueKey && visibleKeys.has(dueKey)) {
        pushEntry(dueKey, { task, role: 'due-only', isDraggable: true })
      } else if (startKey && visibleKeys.has(startKey)) {
        pushEntry(startKey, { task, role: 'start-only', isDraggable: true })
      }
    })

    return map
  }, [tasks, calendarCells])

  const unscheduledTasks = useMemo(() => {
    return tasks.filter((t) => !toDateKey(t.startDate) && !toDateKey(t.dueDate))
  }, [tasks])

  const renderWorkTypeIcon = (type?: { name: string; icon: string } | null) => (
    <WorkTypeIcon type={type} sizeClass="w-3 h-3" />
  )

  const scheduledTasksCount = useMemo(() => {
    return tasks.filter((t) => Boolean(toDateKey(t.startDate) || toDateKey(t.dueDate))).length
  }, [tasks])

  const handleStartDrag = useCallback(() => {
    previousTasksRef.current = [...tasks]
  }, [tasks])

  const handleDropMove = useCallback(
    (activeId: string, overId: string, activeTaskItem: TaskItem) => {
      // overId là dateKey dạng "YYYY-MM-DD"
      if (!/^\d{4}-\d{2}-\d{2}$/.test(overId)) return

      const startKey = toDateKey(activeTaskItem.startDate)
      const dueKey = toDateKey(activeTaskItem.dueDate)
      const anchorKey = dueKey || startKey

      if (anchorKey === overId) return

      const pristineTasks = previousTasksRef.current
      let nextStartDate = activeTaskItem.startDate ?? null
      let nextDueDate = activeTaskItem.dueDate ?? null
      const payload: { startDate?: string; dueDate?: string } = {}

      if (startKey && dueKey) {
        const delta = diffDateKeys(dueKey, overId)
        const shiftedStart = shiftDateKey(startKey, delta)
        nextStartDate = `${shiftedStart}T00:00:00.000Z`
        nextDueDate = `${overId}T00:00:00.000Z`
        payload.startDate = nextStartDate
        payload.dueDate = nextDueDate
      } else if (startKey && !dueKey) {
        nextStartDate = `${overId}T00:00:00.000Z`
        payload.startDate = nextStartDate
      } else {
        nextDueDate = `${overId}T00:00:00.000Z`
        payload.dueDate = nextDueDate
      }

      // Optimistic Update tức thì trên Lịch
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeId ? { ...t, startDate: nextStartDate, dueDate: nextDueDate } : t,
        ),
      )

      // Debounce 600ms mới gọi API cập nhật ngày
      scheduleDebouncedRef.current(activeId, async () => {
        if (!projectParam) return
        try {
          await taskService.updateProjectTask(projectParam, activeId, payload)
        } catch (err) {
          console.error('Failed to persist calendar task dates:', err)
          setTasks(pristineTasks)
        }
      })
    },
    [projectParam],
  )

  const {
    sensors,
    activeItem: activeTask,
    shouldIgnoreClick,
    scheduleDebounced,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop<TaskItem>({
    items: tasks,
    getItemId: (t) => t.id,
    onStartDrag: handleStartDrag,
    onDropMove: handleDropMove,
    debounceMs: 600,
  })

  scheduleDebouncedRef.current = scheduleDebounced

  return (
    <div className="flex flex-col gap-4 w-full flex-1 max-w-full pb-10">
      {/* 1. Header Toolbar: Điều hướng Tháng / Năm + Chỉ số */}
      <div className="flex items-center justify-between flex-wrap gap-3 py-1">
        {/* Bên trái: Điều hướng tháng */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200/90 rounded-lg p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 px-3 select-none">
              Tháng {month + 1}, {year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleToday}
            className="h-8 px-2.5 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer"
          >
            Hôm nay
          </button>
        </div>

        {/* Bên phải: Tổng số việc đã lên lịch & nút bật/tắt khu Chưa lên lịch */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>
              <strong className="text-slate-800 font-semibold">{scheduledTasksCount}</strong> / {tasks.length} công việc đã lên lịch
            </span>
          </div>
          {unscheduledTasks.length > 0 && (
            <button
              type="button"
              onClick={() => setShowUnscheduled((prev) => !prev)}
              className={`h-8 px-2.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                showUnscheduled
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <CalendarOff className="w-3.5 h-3.5" />
              <span>Chưa lên lịch ({unscheduledTasks.length})</span>
            </button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center gap-2.5 text-slate-500 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span className="font-medium">Đang tải lịch công việc...</span>
        </div>
      )}

      {/* 2. Lưới Lịch Công việc phẳng chuẩn Impeccable + Khu Chưa lên lịch */}
      {!isLoading && (
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start">
            <div className="flex-1 min-w-0 w-full bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
              {/* Header 7 Ngày trong tuần */}
              <div className="grid grid-cols-7 border-b border-slate-200/80 bg-slate-50/70 text-center py-2 text-xs font-bold text-slate-600 select-none">
                {weekDays.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              {/* Lưới các ô Ngày */}
              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[580px]">
                {calendarCells.map((cell) => {
                  const entries = tasksByDate.get(cell.dateKey) || []

                  return (
                    <CalendarDayCell
                      key={cell.dateKey}
                      dateKey={cell.dateKey}
                      dayNumber={cell.dayNumber}
                      isCurrentMonth={cell.isCurrentMonth}
                      isToday={cell.isToday}
                      entries={entries}
                      isExpanded={expandedDayKey === cell.dateKey}
                      onToggleExpand={(key) =>
                        setExpandedDayKey((prev) => (prev === key ? null : key))
                      }
                      renderWorkTypeIcon={renderWorkTypeIcon}
                      onClickTask={(taskId) => {
                        if (!shouldIgnoreClick()) setSelectedTaskId(taskId)
                      }}
                    />
                  )
                })}
              </div>
            </div>

            {showUnscheduled && unscheduledTasks.length > 0 && (
              <aside className="w-full lg:w-64 shrink-0 bg-white rounded-xl border border-slate-200/80 shadow-2xs p-3 h-fit self-start">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">
                    Chưa lên lịch ({unscheduledTasks.length})
                  </span>
                  <span className="text-[10px] text-slate-400">Kéo vào lịch</span>
                </div>
                <div className="flex flex-col gap-1.5 max-h-[520px] overflow-y-auto">
                  {unscheduledTasks.map((task) => (
                    <CalendarTaskPill
                      key={task.id}
                      task={task}
                      role="due-only"
                      isDraggable={true}
                      renderWorkTypeIcon={renderWorkTypeIcon}
                      onClickTask={(taskId) => {
                        if (!shouldIgnoreClick()) setSelectedTaskId(taskId)
                      }}
                    />
                  ))}
                </div>
              </aside>
            )}
          </div>

          <DragOverlay>
            {activeTask ? (
              <CalendarTaskPill
                task={activeTask}
                renderWorkTypeIcon={renderWorkTypeIcon}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Task Detail Drawer */}
      {selectedTaskId && (
        <TaskDetailDrawer
          isOpen={Boolean(selectedTaskId)}
          onClose={() => setSelectedTaskId(null)}
          projectIdOrKey={projectParam}
          taskId={selectedTaskId}
          onTaskUpdated={loadTasks}
          onTaskDeleted={loadTasks}
        />
      )}
    </div>
  )
}

export default CalendarView
