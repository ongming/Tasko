import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import {
  CalendarRange,
  Loader2,
  Package,
  Bug,
  CheckSquare,
  Clock,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react'
import { taskService } from '@/services/taskService'
import { sprintService } from '@/services/sprintService'
import type { TaskItem } from '@/types/task'
import type { Sprint } from '@/types/sprint'

export function TimelineView() {
  const { projectKey } = useParams<{ projectKey?: string }>()
  const [searchParams] = useSearchParams()
  const projectParam = projectKey || searchParams.get('project') || searchParams.get('projectId') || ''

  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Timeline window: default to 4 weeks centered on current date
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7) // 1 week ago
    return d
  })

  const loadData = useCallback(async () => {
    if (!projectParam) return
    try {
      setIsLoading(true)
      const [loadedTasks, loadedSprints] = await Promise.all([
        taskService.getProjectTasks(projectParam).catch(() => []),
        sprintService.getSprints(projectParam).catch(() => []),
      ])
      setTasks(loadedTasks)
      setSprints(loadedSprints)
    } catch (err) {
      console.error('Failed to load timeline data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [projectParam])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Total days to display on timeline (28 days / 4 weeks)
  const totalDays = 28

  const daysList = useMemo(() => {
    const list: Array<{ date: Date; dateStr: string; dayNumber: number; isToday: boolean; isWeekend: boolean }> = []
    const todayStr = new Date().toISOString().split('T')[0]

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      const dayOfWeek = d.getDay() // 0 = CN, 6 = T7

      list.push({
        date: d,
        dateStr,
        dayNumber: d.getDate(),
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      })
    }
    return list
  }, [startDate, totalDays])

  const handlePrevRange = () => {
    setStartDate((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() - 14)
      return d
    })
  }

  const handleNextRange = () => {
    setStartDate((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + 14)
      return d
    })
  }

  const handleToday = () => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    setStartDate(d)
  }

  // Helper tính vị trí % thanh ngang trên timeline
  const calculateBarPosition = (task: TaskItem) => {
    const startWindow = startDate.getTime()
    const endWindow = startWindow + totalDays * 24 * 60 * 60 * 1000

    // Mặc định: nếu không có dueDate thì lấy thời gian tạo + 3 ngày
    const taskStart = new Date(task.dueDate || new Date()).getTime()
    const taskEnd = task.dueDate ? new Date(task.dueDate).getTime() : taskStart + 3 * 24 * 60 * 60 * 1000

    // Tỉ lệ %
    const leftPercent = Math.max(0, Math.min(100, ((taskStart - startWindow) / (endWindow - startWindow)) * 100))
    const rightPercent = Math.max(leftPercent + 3, Math.min(100, ((taskEnd - startWindow) / (endWindow - startWindow)) * 100))
    const widthPercent = Math.max(3, rightPercent - leftPercent)

    return { leftPercent, widthPercent }
  }

  const renderWorkTypeIcon = (type?: { name: string; icon: string } | null) => {
    const iconName = type?.icon?.toLowerCase() || ''
    if (iconName.includes('package') || type?.name?.toLowerCase().includes('module')) {
      return <Package className="w-3.5 h-3.5 text-purple-600 shrink-0" />
    }
    if (iconName.includes('bug') || type?.name?.toLowerCase().includes('bug')) {
      return <Bug className="w-3.5 h-3.5 text-rose-600 shrink-0" />
    }
    return <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
  }

  const rangeLabel = useMemo(() => {
    const first = daysList[0]?.date
    const last = daysList[daysList.length - 1]?.date
    if (!first || !last) return ''
    return `${first.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${last.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
  }, [daysList])

  return (
    <div className="flex flex-col gap-4 w-full flex-1 max-w-full pb-10">
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3 py-1">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200/90 rounded-lg p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={handlePrevRange}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="2 tuần trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 px-3 select-none">
              {rangeLabel}
            </span>
            <button
              type="button"
              onClick={handleNextRange}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="2 tuần sau"
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

        {/* Info */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CalendarRange className="w-3.5 h-3.5 text-slate-400" />
          <span>
            <strong className="text-slate-800 font-semibold">{tasks.length}</strong> công việc trên lộ trình
          </span>
        </div>
      </div>

      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center gap-2.5 text-slate-500 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span className="font-medium">Đang tải lộ trình dự án...</span>
        </div>
      )}

      {/* 2. Timeline Grid & Horizontal Bars */}
      {!isLoading && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
          {/* Timeline Time Ruler */}
          <div className="flex border-b border-slate-200/80 bg-slate-50/80 text-[10px] font-bold text-slate-500 select-none">
            {/* Task Title Column (Fixed Left) */}
            <div className="w-64 min-w-[250px] shrink-0 px-4 py-2 border-r border-slate-200/80 uppercase tracking-wider">
              Công việc
            </div>

            {/* Days Ruler */}
            <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(0, 1fr))` }}>
              {daysList.map((d) => (
                <div
                  key={d.dateStr}
                  className={`text-center py-2 border-r border-slate-100 last:border-r-0 ${
                    d.isToday
                      ? 'bg-indigo-50/70 text-indigo-700 font-bold'
                      : d.isWeekend
                        ? 'bg-slate-100/50 text-slate-400'
                        : 'text-slate-600'
                  }`}
                >
                  <span>{d.dayNumber}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Task Rows with Bars */}
          <div className="divide-y divide-slate-100">
            {tasks.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                Chưa có công việc nào trên lộ trình
              </div>
            ) : (
              tasks.map((task) => {
                const { leftPercent, widthPercent } = calculateBarPosition(task)

                return (
                  <div key={task.id} className="flex items-center hover:bg-slate-50/60 transition-colors group">
                    {/* Left Task Key & Title */}
                    <div className="w-64 min-w-[250px] shrink-0 px-4 py-2.5 border-r border-slate-100 flex items-center gap-2 min-w-0">
                      {renderWorkTypeIcon(task.type)}
                      <span className="font-mono text-xs font-bold text-slate-500 group-hover:text-indigo-600 shrink-0">
                        {task.taskKey}
                      </span>
                      <span className="text-xs font-medium text-slate-800 truncate" title={task.title}>
                        {task.title}
                      </span>
                    </div>

                    {/* Right Timeline Bar Track */}
                    <div className="flex-1 relative h-9 flex items-center px-1">
                      {/* Background Day Columns */}
                      <div
                        className="absolute inset-0 grid pointer-events-none"
                        style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(0, 1fr))` }}
                      >
                        {daysList.map((d) => (
                          <div
                            key={d.dateStr}
                            className={`border-r border-slate-100/60 last:border-r-0 ${
                              d.isToday ? 'bg-indigo-50/30' : d.isWeekend ? 'bg-slate-50/40' : ''
                            }`}
                          />
                        ))}
                      </div>

                      {/* Interactive Horizontal Bar */}
                      <div
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                        }}
                        className="relative h-6 rounded-md bg-indigo-500 hover:bg-indigo-600 text-white px-2 flex items-center justify-between text-[10px] font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer truncate"
                        title={`${task.taskKey}: ${task.title}`}
                      >
                        <span className="truncate">{task.title}</span>
                        {task.storyPoints !== null && task.storyPoints !== undefined && (
                          <span className="ml-1 px-1 rounded bg-indigo-700/60 text-[9px] font-mono shrink-0">
                            {task.storyPoints} SP
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TimelineView
