import React, { useState, useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  Info,
  X,
  CheckCircle2,
  Pencil,
  PlusSquare,
  CalendarClock,
  Maximize2,
  TrendingUp,
  ArrowUpRight,
  Target,
  Repeat,
  Loader2,
} from 'lucide-react'
import { projectService } from '@/services/projectService'
import { sprintService } from '@/services/sprintService'
import { taskService } from '@/services/taskService'
import type { Sprint } from '@/types/sprint'
import type { TaskItem } from '@/types/task'
import type { Project } from '@/types/workspace'

export function ControlBoardView() {
  const [showBanner, setShowBanner] = useState(true)
  const [project, setProject] = useState<Project | null>(null)
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { workspaceSlug, projectKey } = useParams<{ workspaceSlug?: string; projectKey?: string }>()
  const [searchParams] = useSearchParams()
  const projectParam = projectKey || searchParams.get('project') || searchParams.get('projectId') || ''

  useEffect(() => {
    if (!projectParam) return
    setIsLoading(true)
    Promise.all([
      projectService.getProjectById(projectParam).catch(() => null),
      sprintService.getSprints(projectParam).catch(() => []),
      taskService.getProjectTasks(projectParam).catch(() => []),
    ])
      .then(([projData, loadedSprints, loadedTasks]) => {
        if (projData) setProject(projData)
        setSprints(loadedSprints)
        setTasks(loadedTasks)
      })
      .finally(() => setIsLoading(false))
  }, [projectParam])

  const activeSprint = sprints.find((s) => s.status === 'ACTIVE') || null
  const completedTasks = tasks.filter((t) => t.status?.category === 'DONE')
  const inProgressTasks = tasks.filter((t) => t.status?.category === 'IN_PROGRESS')
  const todoTasks = tasks.filter((t) => t.status?.category === 'TODO' || !t.status?.category)
  const totalTasks = tasks.length

  const metrics = [
    {
      value: completedTasks.length,
      label: 'hoàn thành',
      subtext: 'tổng số việc đã xong',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      value: inProgressTasks.length,
      label: 'đang xử lý',
      subtext: 'đang được thực hiện',
      icon: Pencil,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
    },
    {
      value: todoTasks.length,
      label: 'chờ làm',
      subtext: 'trong backlog / sprint',
      icon: PlusSquare,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      value: activeSprint?.totalPoints || 0,
      label: 'Story Points',
      subtext: activeSprint ? `của ${activeSprint.name}` : 'chưa có sprint chạy',
      icon: CalendarClock,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
    },
  ]

  const boardLink = workspaceSlug && projectKey
    ? `/${workspaceSlug}/${projectKey}/board`
    : `/workspace/board?project=${projectParam}`

  const backlogLink = workspaceSlug && projectKey
    ? `/${workspaceSlug}/${projectKey}/backlog`
    : `/workspace/backlog?project=${projectParam}`

  return (
    <div className="flex flex-col gap-5 w-full flex-1">
      {/* 1. Top Banner Thông báo Tùy chỉnh */}
      {showBanner && (
        <div className="rounded-xl bg-slate-50 border border-slate-200/90 p-4 text-slate-800 shadow-2xs">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 max-w-2xl">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/80 shadow-2xs">
                <Info className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900">
                  Bảng điều khiển Control Board: {project?.name || projectParam}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Theo dõi báo cáo phân tích, tốc độ hoàn thành công việc và biểu đồ tiến độ được cập nhật trực tiếp theo thời gian thực.
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <Link
                    to={boardLink}
                    className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1"
                  >
                    <span>Mở Bảng thực thi</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowBanner(false)}
                    className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Bỏ qua
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowBanner(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Thống kê 4 thẻ tóm tắt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all flex items-center gap-3.5"
            >
              <div className={`w-9 h-9 rounded-lg ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {item.value}
                  </span>
                  <span className="text-xs font-bold text-slate-700 truncate">{item.label}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium truncate">{item.subtext}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 3. Khối nội dung chính: Tiến độ Sprint & Tổng quan trạng thái */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Cột trái: Tiến độ Active Sprint */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Repeat className="w-4 h-4 text-indigo-600" />
                <span>Tiến độ Sprint hiện tại</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeSprint ? activeSprint.name : 'Chưa có Sprint nào đang chạy'}
              </p>
            </div>
            <Link
              to={backlogLink}
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>Chi tiết Backlog</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeSprint ? (
            <div className="flex flex-col gap-3 py-2">
              {activeSprint.goal && (
                <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900">
                  <span className="font-semibold block mb-0.5">Mục tiêu Sprint (Goal):</span>
                  <p className="italic">{activeSprint.goal}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Hoàn thành Story Points:</span>
                <span className="font-bold font-mono text-slate-900">
                  {activeSprint.completedPoints || 0} / {activeSprint.totalPoints || 0} SP
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{
                    width: `${
                      activeSprint.totalPoints && activeSprint.totalPoints > 0
                        ? Math.min(100, Math.round(((activeSprint.completedPoints || 0) / activeSprint.totalPoints) * 100))
                        : 0
                    }%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Số công việc: {activeSprint.taskCount || 0}</span>
                <span>
                  Đã xong: {activeSprint.completedTaskCount || 0} (
                  {activeSprint.taskCount && activeSprint.taskCount > 0
                    ? Math.round(((activeSprint.completedTaskCount || 0) / activeSprint.taskCount) * 100)
                    : 0}
                  %)
                </span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Chưa kích hoạt Sprint nào. Hãy vào tab{' '}
              <Link to={backlogLink} className="text-indigo-600 font-semibold hover:underline">
                Backlog
              </Link>{' '}
              để lên kế hoạch và bấm Bắt đầu Sprint!
            </div>
          )}
        </div>

        {/* Cột phải: Status Distribution */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Phân bổ trạng thái công việc
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tổng cộng {totalTasks} công việc trong dự án
              </p>
            </div>
            <Link
              to={boardLink}
              className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
              title="Đi tới Bảng"
            >
              <Maximize2 className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex flex-col gap-2.5 py-2">
            {/* TODO */}
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>Chờ làm (To Do)</span>
              </span>
              <span className="font-bold font-mono text-slate-800">
                {todoTasks.length} ({totalTasks > 0 ? Math.round((todoTasks.length / totalTasks) * 100) : 0}%)
              </span>
            </div>

            {/* IN PROGRESS */}
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <span>Đang làm (In Progress)</span>
              </span>
              <span className="font-bold font-mono text-slate-800">
                {inProgressTasks.length} ({totalTasks > 0 ? Math.round((inProgressTasks.length / totalTasks) * 100) : 0}%)
              </span>
            </div>

            {/* DONE */}
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Hoàn thành (Done)</span>
              </span>
              <span className="font-bold font-mono text-slate-800">
                {completedTasks.length} ({totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ControlBoardView
