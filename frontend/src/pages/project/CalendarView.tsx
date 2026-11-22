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
  Loader2,
} from 'lucide-react'
import { taskService } from '@/services/taskService'
import type { TaskItem } from '@/types/task'
import { useDragAndDrop } from '@/hooks/useDragAndDrop'
import { TaskDetailDrawer } from '@/components/project/TaskDetailDrawer'
import { WorkTypeIcon } from '@/components/project/WorkTypeIcon'
import { formatLocalDateKey } from '@/utils/dateFormat'

interface CalendarTaskPillProps {
  task: TaskItem
  renderWorkTypeIcon: (type?: { name: string; icon: string } | null) => React.ReactNode
  onClickTask?: (taskId: string) => void
  isOverlay?: boolean
}

function CalendarTaskPill({
  task,
  renderWorkTypeIcon,
  onClickTask,
  isOverlay = false,
}: CalendarTaskPillProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: isOverlay,
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClickTask?.(task.id)}
      className={`px-1.5 py-1 rounded bg-slate-50 hover:bg-indigo-50/80 border border-slate-200/70 hover:border-indigo-200 text-left transition-all cursor-pointer active:cursor-grabbing group flex items-center gap-1 shadow-2xs select-none ${
        isDragging ? 'opacity-30 border-dashed border-indigo-400' : ''
      }`}
      title={`${task.taskKey}: ${task.title}`}
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
  dayTasks: TaskItem[]
  renderWorkTypeIcon: (type?: { name: string; icon: string } | null) => React.ReactNode
  onClickTask: (taskId: string) => void
}

function CalendarDayCell({
  dateKey,
  dayNumber,
  isCurrentMonth,
  isToday,
  dayTasks,
  renderWorkTypeIcon,
  onClickTask,
}: CalendarDayCellProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: dateKey,
  })

  return (
    <div
      ref={setNodeRef}
      className={`p-1.5 sm:p-2 min-h-[105px] flex flex-col transition-colors ${
        isOver
          ? 'bg-indigo-50/70 ring-2 ring-inset ring-indigo-300'
          : isCurrentMonth
            ? 'bg-white hover:bg-slate-50/50'
            : 'bg-slate-50/40 text-slate-300'
      }`}
    >
      {/* Ngày & Badge hôm nay */}
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

        {dayTasks.length > 0 && (
          <span className="text-[10px] font-bold px-1 rounded bg-indigo-50 text-indigo-600">
            {dayTasks.length}
          </span>
        )}
      </div>

      {/* Danh sách Thẻ công việc trong ngày */}
      <div className="flex flex-col gap-1 overflow-y-auto max-h-[120px] scrollbar-none">
        {dayTasks.map((t) => (
          <CalendarTaskPill
            key={t.id}
            task={t}
            renderWorkTypeIcon={renderWorkTypeIcon}
            onClickTask={onClickTask}
          />
        ))}
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

  // Gom tasks theo ngày hạn chót ("YYYY-MM-DD")
  const tasksByDate = useMemo(() => {
    const map = new Map<string, TaskItem[]>()

    tasks.forEach((task) => {
      if (!task.dueDate) return
      // Trích xuất YYYY-MM-DD từ dueDate (ví dụ "2026-05-20T00:00:00.000Z")
      const dateKey = task.dueDate.split('T')[0]
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)!.push(task)
    })

    return map
  }, [tasks])

  const renderWorkTypeIcon = (type?: { name: string; icon: string } | null) => (
    <WorkTypeIcon type={type} sizeClass="w-3 h-3" />
  )

  const tasksWithDueDateCount = useMemo(() => {
    return tasks.filter((t) => !!t.dueDate).length
  }, [tasks])

  const handleStartDrag = useCallback(() => {
    previousTasksRef.current = [...tasks]
  }, [tasks])

  const handleDropMove = useCallback(
    (activeId: string, overId: string, activeTaskItem: TaskItem) => {
      // overId là dateKey dạng "YYYY-MM-DD"
      if (!/^\d{4}-\d{2}-\d{2}$/.test(overId)) return
      const currentDateKey = activeTaskItem.dueDate ? activeTaskItem.dueDate.split('T')[0] : null
      if (currentDateKey === overId) return

      const pristineTasks = previousTasksRef.current
      const newDueDate = `${overId}T00:00:00.000Z`

      // Optimistic Update tức thì trên Lịch
      setTasks((prev) =>
        prev.map((t) => (t.id === activeId ? { ...t, dueDate: newDueDate } : t)),
      )

      // Debounce 600ms mới gọi API cập nhật dueDate
      scheduleDebouncedRef.current(activeId, async () => {
        if (!projectParam) return
        try {
          await taskService.updateProjectTask(projectParam, activeId, {
            dueDate: newDueDate,
          })
        } catch (err) {
          console.error('Failed to persist calendar task dueDate:', err)
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

        {/* Bên phải: Tổng số việc có hạn chót */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
          <span>
            <strong className="text-slate-800 font-semibold">{tasksWithDueDateCount}</strong> / {tasks.length} công việc có hạn chót
          </span>
        </div>
      </div>

      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center gap-2.5 text-slate-500 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span className="font-medium">Đang tải lịch công việc...</span>
        </div>
      )}

      {/* 2. Lưới Lịch Công việc phẳng chuẩn Impeccable (hỗ trợ kéo thả đổi ngày hạn chót) */}
      {!isLoading && (
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
            {/* Header 7 Ngày trong tuần */}
            <div className="grid grid-cols-7 border-b border-slate-200/80 bg-slate-50/70 text-center py-2 text-xs font-bold text-slate-600 select-none">
              {weekDays.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Lưới các ô Ngày */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[580px]">
              {calendarCells.map((cell) => {
                const dayTasks = tasksByDate.get(cell.dateKey) || []

                return (
                  <CalendarDayCell
                    key={cell.dateKey}
                    dateKey={cell.dateKey}
                    dayNumber={cell.dayNumber}
                    isCurrentMonth={cell.isCurrentMonth}
                    isToday={cell.isToday}
                    dayTasks={dayTasks}
                    renderWorkTypeIcon={renderWorkTypeIcon}
                    onClickTask={(taskId) => {
                      if (!shouldIgnoreClick()) setSelectedTaskId(taskId)
                    }}
                  />
                )
              })}
            </div>
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
