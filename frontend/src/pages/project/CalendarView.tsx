import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Loader2,
  Clock,
  CheckSquare,
  Bug,
  Package,
} from 'lucide-react'
import { taskService } from '@/services/taskService'
import type { TaskItem } from '@/types/task'

export function CalendarView() {
  const { projectKey } = useParams<{ projectKey?: string }>()
  const [searchParams] = useSearchParams()
  const projectParam = projectKey || searchParams.get('project') || searchParams.get('projectId') || ''

  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

    const todayStr = new Date().toISOString().split('T')[0]

    // 1. Các ngày của tháng trước đệm vào đầu
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i
      const dateObj = new Date(year, month - 1, d)
      const dateKey = dateObj.toISOString().split('T')[0]
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
      // Format YYYY-MM-DD
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
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
        const dateKey = dateObj.toISOString().split('T')[0]
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

  const renderWorkTypeIcon = (type?: { name: string; icon: string } | null) => {
    const iconName = type?.icon?.toLowerCase() || ''
    if (iconName.includes('package') || type?.name?.toLowerCase().includes('module')) {
      return <Package className="w-3 h-3 text-purple-600 shrink-0" />
    }
    if (iconName.includes('bug') || type?.name?.toLowerCase().includes('bug')) {
      return <Bug className="w-3 h-3 text-rose-600 shrink-0" />
    }
    return <CheckSquare className="w-3 h-3 text-blue-600 shrink-0" />
  }

  const tasksWithDueDateCount = useMemo(() => {
    return tasks.filter((t) => !!t.dueDate).length
  }, [tasks])

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

      {/* 2. Lưới Lịch Công việc phẳng chuẩn Impeccable */}
      {!isLoading && (
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
                <div
                  key={cell.dateKey}
                  className={`p-1.5 sm:p-2 min-h-[105px] flex flex-col transition-colors ${
                    cell.isCurrentMonth ? 'bg-white hover:bg-slate-50/50' : 'bg-slate-50/40 text-slate-300'
                  }`}
                >
                  {/* Ngày & Badge hôm nay */}
                  <div className="flex items-center justify-between mb-1.5 select-none">
                    <span
                      className={`text-xs font-semibold inline-flex items-center justify-center ${
                        cell.isToday
                          ? 'w-5 h-5 rounded-full bg-indigo-600 text-white font-bold'
                          : cell.isCurrentMonth
                            ? 'text-slate-700'
                            : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNumber}
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
                      <div
                        key={t.id}
                        className="px-1.5 py-1 rounded bg-slate-50 hover:bg-indigo-50/80 border border-slate-200/70 hover:border-indigo-200 text-left transition-all cursor-pointer group flex items-center gap-1 shadow-2xs"
                        title={`${t.taskKey}: ${t.title}`}
                      >
                        {renderWorkTypeIcon(t.type)}
                        <span className="font-mono text-[10px] font-bold text-slate-500 group-hover:text-indigo-600 shrink-0">
                          {t.taskKey}
                        </span>
                        <span className="text-[11px] text-slate-800 font-medium truncate flex-1">
                          {t.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarView
