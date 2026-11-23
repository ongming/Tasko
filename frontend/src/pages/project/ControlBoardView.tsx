import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  CheckCircle2,
  Pencil,
  PlusSquare,
  CalendarClock,
  ArrowUpRight,
  Repeat,
  AlertTriangle,
  Users,
  BarChart3,
  Loader2,
  Sliders,
  Sparkles,
} from 'lucide-react'
import { projectService } from '@/services/projectService'
import { sprintService } from '@/services/sprintService'
import { taskService } from '@/services/taskService'
import { isScrumProject } from '@/utils/projectMethod'
import { TaskDetailDrawer } from '@/components/project/TaskDetailDrawer'
import { AiDocumentAnalyzerModal } from '@/components/project/ai-document/AiDocumentAnalyzerModal'
import type { Sprint } from '@/types/sprint'
import type { TaskItem } from '@/types/task'
import type { Project } from '@/types/workspace'

export function ControlBoardView() {
  const [project, setProject] = useState<Project | null>(null)
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)

  const { workspaceSlug, projectKey } = useParams<{ workspaceSlug?: string; projectKey?: string }>()
  const [searchParams] = useSearchParams()
  const projectParam = projectKey || searchParams.get('project') || searchParams.get('projectId') || ''

  const loadData = useCallback(async () => {
    if (!projectParam) return
    setIsLoading(true)
    try {
      const [projData, loadedSprints, loadedTasks] = await Promise.all([
        projectService.getProjectById(projectParam).catch(() => null),
        sprintService.getSprints(projectParam).catch(() => []),
        taskService.getProjectTasks(projectParam).catch(() => []),
      ])
      if (projData) setProject(projData)
      setSprints(loadedSprints)
      setTasks(loadedTasks)
    } finally {
      setIsLoading(false)
    }
  }, [projectParam])

  useEffect(() => {
    loadData()
  }, [loadData])

  const isScrum = isScrumProject(project)
  const methodLabel =
    project?.methodology === 'SCRUMBAN' || project?.settings?.method_id === 'scrumban'
      ? 'Scrumban'
      : isScrum
        ? 'Scrum'
        : 'Kanban'

  const activeSprint = sprints.find((s) => s.status === 'ACTIVE') || null
  const scopedTasks = isScrum && activeSprint ? tasks.filter((t) => t.sprintId === activeSprint.id) : tasks
  const scopeSubtext = isScrum && activeSprint ? `trong ${activeSprint.name}` : 'trên toàn dự án'

  const completedTasks = scopedTasks.filter((t) => t.status?.category === 'DONE')
  const inProgressTasks = scopedTasks.filter((t) => t.status?.category === 'IN_PROGRESS')
  const todoTasks = scopedTasks.filter((t) => t.status?.category === 'TODO' || !t.status?.category)
  const totalTasks = scopedTasks.length
  const totalProjectPoints = scopedTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0)
  const completedProjectPoints = completedTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0)

  const activeSprintRemainingDays = activeSprint?.endDate
    ? Math.ceil(
        (new Date(activeSprint.endDate).setHours(23, 59, 59, 999) - Date.now()) /
          (1000 * 60 * 60 * 24),
      )
    : null

  // Việc ưu tiên cao / khẩn cấp chưa hoàn thành
  const urgentOrHighOpenTasks = useMemo(() => {
    return scopedTasks
      .filter(
        (t) =>
          t.status?.category !== 'DONE' &&
          (t.priority === 'URGENT' || t.priority === 'HIGH'),
      )
      .sort((a, b) => (a.priority === 'URGENT' ? -1 : b.priority === 'URGENT' ? 1 : 0))
      .slice(0, 5)
  }, [scopedTasks])

  // Khối lượng công việc theo thành viên
  const workloadByMember = useMemo(() => {
    const map = new Map<string, { id: string; name: string; open: number; done: number }>()
    scopedTasks.forEach((t) => {
      const id = t.assigneeId || 'unassigned'
      const name = t.assignee?.name || 'Chưa phân công'
      const entry = map.get(id) || { id, name, open: 0, done: 0 }
      if (t.status?.category === 'DONE') entry.done += 1
      else entry.open += 1
      map.set(id, entry)
    })
    return Array.from(map.values()).sort((a, b) => b.open + b.done - (a.open + a.done))
  }, [scopedTasks])

  const velocitySprints = useMemo(
    () => sprints.filter((s) => s.status === 'COMPLETED' || s.status === 'ACTIVE').slice(-6),
    [sprints],
  )

  const metrics = [
    {
      value: completedTasks.length,
      label: 'hoàn thành',
      subtext: scopeSubtext,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      value: inProgressTasks.length,
      label: 'đang xử lý',
      subtext: scopeSubtext,
      icon: Pencil,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
    },
    {
      value: todoTasks.length,
      label: 'chờ làm',
      subtext: scopeSubtext,
      icon: PlusSquare,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      value: isScrum ? activeSprint?.totalPoints || 0 : totalProjectPoints,
      label: 'Story Points',
      subtext: isScrum
        ? activeSprint
          ? `của ${activeSprint.name}`
          : 'chưa có sprint chạy'
        : 'tổng điểm toàn bảng',
      icon: CalendarClock,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
    },
  ]

  const boardLink =
    workspaceSlug && projectKey
      ? `/${workspaceSlug}/${projectKey}/board`
      : `/workspace/board?project=${projectParam}`

  const backlogLink =
    workspaceSlug && projectKey
      ? `/${workspaceSlug}/${projectKey}/backlog`
      : `/workspace/backlog?project=${projectParam}`

  if (isLoading && !project) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        <span>Đang tải Control Board...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 w-full flex-1 pb-10">
      {/* 1. Header gọn nhẹ */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Control Board: {project?.name || projectParam}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                {methodLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Theo dõi tiến độ thực thi, khối lượng công việc và các đầu việc cần ưu tiên.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/80 text-indigo-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Phân tích tài liệu</span>
          </button>
          {isScrum && (
            <Link
              to={backlogLink}
              className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all"
            >
              <span>Backlog</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          )}
          <Link
            to={boardLink}
            className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-all"
          >
            <span>Mở Bảng thực thi</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

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

      {/* 3. Hàng chính: Tiến độ Sprint & Phân bổ trạng thái */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Repeat className="w-4 h-4 text-indigo-600" />
                <span>{isScrum ? 'Tiến độ Sprint hiện tại' : 'Tiến độ hoàn thành bảng'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isScrum
                  ? activeSprint
                    ? activeSprint.name
                    : 'Chưa có Sprint nào đang chạy'
                  : 'Theo dõi luồng công việc Kanban liên tục'}
              </p>
            </div>
            <Link
              to={isScrum ? backlogLink : boardLink}
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>{isScrum ? 'Chi tiết Backlog' : 'Mở Bảng Kanban'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isScrum ? (
            activeSprint ? (
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
                  <span>
                    Đã xong: {activeSprint.completedTaskCount || 0} / {activeSprint.taskCount || 0} việc (
                    {activeSprint.taskCount && activeSprint.taskCount > 0
                      ? Math.round(((activeSprint.completedTaskCount || 0) / activeSprint.taskCount) * 100)
                      : 0}
                    %)
                  </span>
                  {activeSprintRemainingDays !== null && (
                    <span
                      className={`font-semibold ${
                        activeSprintRemainingDays < 0
                          ? 'text-rose-600'
                          : activeSprintRemainingDays <= 2
                            ? 'text-amber-600'
                            : 'text-indigo-600'
                      }`}
                    >
                      {activeSprintRemainingDays < 0
                        ? `Quá hạn ${Math.abs(activeSprintRemainingDays)} ngày`
                        : activeSprintRemainingDays === 0
                          ? 'Hết hạn hôm nay'
                          : `Còn ${activeSprintRemainingDays} ngày`}
                    </span>
                  )}
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
            )
          ) : (
            <div className="flex flex-col gap-3 py-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Tỷ lệ hoàn thành công việc:</span>
                <span className="font-bold font-mono text-slate-900">
                  {completedTasks.length} / {totalTasks} việc
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{
                    width: `${totalTasks > 0 ? Math.min(100, Math.round((completedTasks.length / totalTasks) * 100)) : 0}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Đang xử lý: {inProgressTasks.length}</span>
                <span>
                  Đã hoàn thành: {completedProjectPoints} / {totalProjectPoints} SP
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Phân bổ trạng thái */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Phân bổ trạng thái công việc
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tổng cộng {totalTasks} công việc ({scopeSubtext})
              </p>
            </div>
            <Link
              to={boardLink}
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>Xem trên Bảng</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-2.5 py-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>Chờ làm (To Do)</span>
              </span>
              <span className="font-bold font-mono text-slate-800">
                {todoTasks.length} ({totalTasks > 0 ? Math.round((todoTasks.length / totalTasks) * 100) : 0}%)
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <span>Đang làm (In Progress)</span>
              </span>
              <span className="font-bold font-mono text-slate-800">
                {inProgressTasks.length} ({totalTasks > 0 ? Math.round((inProgressTasks.length / totalTasks) * 100) : 0}%)
              </span>
            </div>

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

      {/* 4. Hàng điều hành: Việc ưu tiên cao & Khối lượng theo Thành viên */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Việc ưu tiên cao / Khẩn cấp</span>
            </h2>
            <span className="text-[11px] font-semibold text-slate-500">
              {urgentOrHighOpenTasks.length} việc nổi bật
            </span>
          </div>

          {urgentOrHighOpenTasks.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">
              Không có công việc Khẩn cấp hoặc Ưu tiên cao nào đang mở.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {urgentOrHighOpenTasks.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTaskId(t.id)}
                  className="w-full py-2.5 px-2 -mx-2 rounded-lg hover:bg-slate-50 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[11px] font-bold text-slate-500 shrink-0">
                      {t.taskKey}
                    </span>
                    <span className="text-xs font-medium text-slate-800 truncate">{t.title}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      t.priority === 'URGENT'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {t.priority === 'URGENT' ? 'Khẩn cấp' : 'Cao'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Khối lượng theo Thành viên</span>
            </h2>
            <span className="text-[11px] text-slate-400">Chưa xong / Đã xong</span>
          </div>

          {workloadByMember.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">
              Chưa có công việc nào được phân bổ.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {workloadByMember.map((m) => {
                const total = m.open + m.done
                const donePct = total > 0 ? Math.round((m.done / total) * 100) : 0
                return (
                  <div key={m.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 truncate">{m.name}</span>
                      <span className="font-mono text-[11px] text-slate-600 shrink-0">
                        {m.open} mở · {m.done} xong
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all"
                        style={{ width: `${donePct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. Velocity các Sprint (chỉ hiện cho Scrum/Scrumban khi có Sprint đã chạy) */}
      {isScrum && velocitySprints.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Vận tốc các Sprint (Velocity)</span>
            </h2>
            <span className="text-[11px] text-slate-500">So sánh Story Points hoàn thành / cam kết</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {velocitySprints.map((sp) => {
              const committed = sp.totalPoints || 0
              const completed = sp.completedPoints || 0
              const pct = committed > 0 ? Math.min(100, Math.round((completed / committed) * 100)) : 0
              return (
                <div key={sp.id} className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 truncate">{sp.name}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        sp.status === 'ACTIVE'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {sp.status === 'ACTIVE' ? 'Đang chạy' : 'Hoàn thành'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>
                      {completed} / {committed} SP
                    </span>
                    <span className="font-mono font-semibold text-slate-800">{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal AI Phân tích tài liệu */}
      <AiDocumentAnalyzerModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        projectIdOrKey={projectParam}
        sprints={sprints}
        onTasksCreated={loadData}
      />

      {/* Drawer chi tiết công việc khi click vào việc ưu tiên cao */}
      {selectedTaskId && (
        <TaskDetailDrawer
          isOpen={Boolean(selectedTaskId)}
          onClose={() => setSelectedTaskId(null)}
          projectIdOrKey={projectParam}
          taskId={selectedTaskId}
          onTaskUpdated={loadData}
          onTaskDeleted={loadData}
        />
      )}
    </div>
  )
}

export default ControlBoardView
