import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import {
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Loader2,
  Calendar,
  AlertCircle,
  Filter,
  User as UserIcon,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react'
import { projectService, type ProjectStatus } from '@/services/projectService'
import { sprintService } from '@/services/sprintService'
import { taskService } from '@/services/taskService'
import type { TaskItem, TaskPriority } from '@/types/task'
import type { Sprint } from '@/types/sprint'
import type { Project } from '@/types/workspace'
import { TaskDetailDrawer } from '@/components/project/TaskDetailDrawer'
import { WorkTypeIcon } from '@/components/project/WorkTypeIcon'

export function ListView() {
  const { workspaceSlug, projectKey } = useParams<{ workspaceSlug?: string; projectKey?: string }>()
  const [searchParams] = useSearchParams()
  const projectParam = projectKey || searchParams.get('project') || searchParams.get('projectId') || ''

  const [project, setProject] = useState<Project | null>(null)
  const [statuses, setStatuses] = useState<ProjectStatus[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSprintId, setSelectedSprintId] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Collapsible status groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})

  // Quick inline add task & detail drawer
  const [activeQuickAddStatusId, setActiveQuickAddStatusId] = useState<string | null>(null)
  const [quickTaskTitle, setQuickTaskTitle] = useState('')
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const isScrum =
    project?.settings?.method_id === 'scrum' ||
    project?.settings?.method_id === 'scrumban' ||
    project?.name?.toLowerCase().includes('scrum')

  // 1. Tải thông tin dự án, statuses, sprints và tasks
  const loadData = useCallback(async () => {
    if (!projectParam) return
    try {
      setIsLoading(true)
      const [projData, loadedStatuses, loadedSprints, loadedTasks] = await Promise.all([
        projectService.getProjectById(projectParam).catch(() => null),
        projectService.getProjectStatuses(projectParam).catch(() => []),
        sprintService.getSprints(projectParam).catch(() => []),
        taskService.getProjectTasks(projectParam).catch(() => []),
      ])

      if (projData) setProject(projData)
      setStatuses(loadedStatuses)
      setSprints(loadedSprints)
      setTasks(loadedTasks)
    } catch (err) {
      console.error('Failed to load list view data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [projectParam])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Lọc danh sách công việc
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Tìm kiếm theo tiêu đề hoặc key
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        const matchTitle = task.title?.toLowerCase().includes(query)
        const matchKey = task.taskKey?.toLowerCase().includes(query)
        if (!matchTitle && !matchKey) return false
      }

      // 2. Lọc theo Sprint
      if (selectedSprintId !== 'ALL') {
        if (selectedSprintId === 'BACKLOG') {
          if (task.sprintId) return false
        } else if (task.sprintId !== selectedSprintId) {
          return false
        }
      }

      // 3. Lọc theo Trạng thái
      if (statusFilter !== 'ALL') {
        if (task.statusId !== statusFilter) return false
      }

      return true
    })
  }, [tasks, searchQuery, selectedSprintId, statusFilter])

  // Nhóm tasks theo Status
  const tasksByStatus = useMemo(() => {
    const map = new Map<string, TaskItem[]>()
    statuses.forEach((st) => map.set(st.id, []))

    filteredTasks.forEach((t) => {
      const list = map.get(t.statusId)
      if (list) {
        list.push(t)
      } else {
        // Fallback status nếu có task mang statusId lạ
        if (!map.has(t.statusId)) {
          map.set(t.statusId, [])
        }
        map.get(t.statusId)!.push(t)
      }
    })

    return map
  }, [statuses, filteredTasks])

  // Toggle thu gọn nhóm
  const toggleGroup = (statusId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [statusId]: !prev[statusId],
    }))
  }

  // Thêm nhanh task vào nhóm
  const handleQuickAdd = async (statusId: string) => {
    const title = quickTaskTitle.trim()
    if (!title || !projectParam || isSubmittingQuick) return

    try {
      setIsSubmittingQuick(true)
      const targetSprintId =
        selectedSprintId !== 'ALL' && selectedSprintId !== 'BACKLOG'
          ? selectedSprintId
          : undefined

      const newTask = await taskService.createProjectTask(projectParam, {
        title,
        statusId,
        sprintId: targetSprintId,
      })

      setTasks((prev) => [newTask, ...prev])
      setQuickTaskTitle('')
      setActiveQuickAddStatusId(null)
    } catch (err) {
      console.error('Failed to quick add task in list view:', err)
    } finally {
      setIsSubmittingQuick(false)
    }
  }

  // Đổi trạng thái task trực tiếp từ danh sách (Inline Status Update)
  const handleUpdateTaskStatus = async (taskId: string, newStatusId: string) => {
    const previousTasks = [...tasks]
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, statusId: newStatusId } : t)),
    )

    try {
      await taskService.moveProjectTask(projectParam, taskId, {
        statusId: newStatusId,
      })
    } catch (err) {
      console.error('Failed to update task status:', err)
      setTasks(previousTasks)
    }
  }

  // Render Icon loại công việc
  const renderWorkTypeIcon = (type?: { name: string; icon: string } | null) => (
    <WorkTypeIcon type={type} />
  )

  // Render Badge độ ưu tiên
  const renderPriorityBadge = (priority?: TaskPriority) => {
    switch (priority) {
      case 'URGENT':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Khẩn cấp
          </span>
        )
      case 'HIGH':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Cao
          </span>
        )
      case 'MEDIUM':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Vừa
          </span>
        )
      case 'LOW':
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/80">
            Thấp
          </span>
        )
    }
  }

  // Tổng điểm Story Points & Tasks
  const totalStoryPoints = useMemo(() => {
    return filteredTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0)
  }, [filteredTasks])

  return (
    <div className="flex flex-col gap-4 w-full flex-1 max-w-full pb-10">
      {/* 1. Header Toolbar: Tìm kiếm, Bộ lọc & Chỉ số */}
      <div className="flex items-center justify-between flex-wrap gap-3 py-1">
        {/* Bên trái: Ô tìm kiếm & Bộ lọc */}
        <div className="flex items-center flex-wrap gap-2.5 flex-1 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 max-w-xs min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề hoặc mã công việc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8.5 pl-8 pr-3 rounded-lg border border-slate-200/90 bg-white hover:border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 placeholder-slate-400 transition-all shadow-2xs"
            />
          </div>

          {/* Lọc theo Sprint (nếu là Scrum) */}
          {isScrum && sprints.length > 0 && (
            <div className="relative">
              <select
                value={selectedSprintId}
                onChange={(e) => setSelectedSprintId(e.target.value)}
                className="h-8.5 pl-2.5 pr-7 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 font-medium text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer appearance-none shadow-2xs transition-all"
              >
                <option value="ALL">Tất cả Sprint ({sprints.length})</option>
                <option value="BACKLOG">Chỉ Product Backlog</option>
                {sprints.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.status === 'ACTIVE' ? '⚡ ' : ''}
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Lọc theo Trạng thái */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8.5 pl-2.5 pr-7 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 font-medium text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer appearance-none shadow-2xs transition-all"
            >
              <option value="ALL">Tất cả trạng thái</option>
              {statuses.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Bên phải: Tổng số việc & Story Points */}
        <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
          <span className="font-medium">
            <strong className="text-slate-800 font-semibold">{filteredTasks.length}</strong> công việc
          </span>
          {totalStoryPoints > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono font-bold border border-indigo-200/60">
              {totalStoryPoints} SP
            </span>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center gap-2.5 text-slate-500 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span className="font-medium">Đang tải danh sách công việc...</span>
        </div>
      )}

      {/* 2. Bảng Danh sách Công việc phẳng chuẩn Impeccable */}
      {!isLoading && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
          {/* Table Column Headers */}
          <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
            <div className="col-span-6 sm:col-span-5 flex items-center gap-2">
              <span>Công việc / Tiêu đề</span>
            </div>
            <div className="col-span-3 sm:col-span-2">
              <span>Trạng thái</span>
            </div>
            <div className="hidden sm:block sm:col-span-2">
              <span>Người phụ trách</span>
            </div>
            <div className="col-span-3 sm:col-span-2 text-center sm:text-left">
              <span>Hạn chót</span>
            </div>
            <div className="hidden sm:block sm:col-span-1 text-right">
              <span>Điểm SP</span>
            </div>
          </div>

          {/* Nếu không có task nào khớp */}
          {filteredTasks.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">Không tìm thấy công việc nào</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {searchQuery ? 'Thử thay đổi từ khóa tìm kiếm hoặc bỏ bộ lọc' : 'Chưa có công việc nào trong dự án này'}
              </p>
            </div>
          )}

          {/* Grouped Status Sections */}
          {filteredTasks.length > 0 &&
            statuses.map((status) => {
              const groupTasks = tasksByStatus.get(status.id) || []
              if (groupTasks.length === 0 && statusFilter !== 'ALL') return null

              const isCollapsed = collapsedGroups[status.id]
              const groupPoints = groupTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0)

              return (
                <div key={status.id} className="border-b border-slate-100 last:border-b-0">
                  {/* Status Group Header (Collapsible) */}
                  <div
                    onClick={() => toggleGroup(status.id)}
                    className="flex items-center justify-between px-4 py-2 bg-slate-50/50 hover:bg-slate-100/60 cursor-pointer transition-colors select-none group"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="text-slate-400 group-hover:text-slate-600 transition-colors p-0.5"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: status.color || '#94a3b8' }}
                      />
                      <span className="text-xs font-bold text-slate-800">{status.name}</span>
                      <span className="text-[11px] font-semibold text-slate-400 px-1.5 py-0.2 rounded-full bg-slate-200/60">
                        {groupTasks.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {groupPoints > 0 && (
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {groupPoints} SP
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveQuickAddStatusId(status.id)
                          setQuickTaskTitle('')
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-0.5 rounded transition-all cursor-pointer"
                        title="Thêm nhanh việc vào trạng thái này"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm việc</span>
                      </button>
                    </div>
                  </div>

                  {/* Task Rows inside Group */}
                  {!isCollapsed && (
                    <div className="divide-y divide-slate-100">
                      {groupTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTaskId(task.id)}
                          className="grid grid-cols-12 gap-3 px-4 py-2.5 items-center hover:bg-slate-50/70 transition-colors group/row cursor-pointer"
                        >
                          {/* Col 1: Icon, TaskKey, Title */}
                          <div className="col-span-6 sm:col-span-5 flex items-center gap-2.5 min-w-0">
                            {renderWorkTypeIcon(task.type)}
                            <span className="font-mono text-xs font-bold text-slate-500 group-hover/row:text-indigo-600 transition-colors shrink-0">
                              {task.taskKey}
                            </span>
                            <span className="text-xs sm:text-sm font-medium text-slate-800 truncate group-hover/row:text-indigo-600 transition-colors" title={task.title}>
                              {task.title}
                            </span>
                          </div>

                          {/* Col 2: Status Dropdown */}
                          <div
                            className="col-span-3 sm:col-span-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              value={task.statusId}
                              onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                              className="w-full max-w-[130px] h-7 px-2 text-[11px] font-semibold rounded-md border border-slate-200/80 bg-white hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-all truncate"
                            >
                              {statuses.map((st) => (
                                <option key={st.id} value={st.id}>
                                  {st.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Col 3: Assignee */}
                          <div className="hidden sm:flex sm:col-span-2 items-center gap-1.5 min-w-0">
                            {task.assignee ? (
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {task.assignee.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs text-slate-700 truncate">{task.assignee.name}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Chưa giao</span>
                            )}
                          </div>

                          {/* Col 4: Due Date */}
                          <div className="col-span-3 sm:col-span-2 flex items-center gap-1.5 text-xs text-slate-500">
                            {task.dueDate ? (
                              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{new Date(task.dueDate).toLocaleDateString('vi-VN')}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-300">-</span>
                            )}
                          </div>

                          {/* Col 5: Story Points */}
                          <div className="hidden sm:flex sm:col-span-1 justify-end">
                            {task.storyPoints !== null && task.storyPoints !== undefined ? (
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-bold font-mono border border-slate-200/60">
                                {task.storyPoints} SP
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-300">-</span>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Inline Quick Add Input */}
                      {activeQuickAddStatusId === status.id && (
                        <div className="px-4 py-2 bg-indigo-50/30 flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Nhập tiêu đề công việc mới và nhấn Enter..."
                            value={quickTaskTitle}
                            onChange={(e) => setQuickTaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleQuickAdd(status.id)
                              if (e.key === 'Escape') setActiveQuickAddStatusId(null)
                            }}
                            autoFocus
                            disabled={isSubmittingQuick}
                            className="flex-1 h-8 px-3 rounded-md border border-indigo-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(status.id)}
                            disabled={isSubmittingQuick || !quickTaskTitle.trim()}
                            className="h-8 px-3 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs disabled:opacity-50 cursor-pointer"
                          >
                            {isSubmittingQuick ? 'Đang thêm...' : 'Thêm'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveQuickAddStatusId(null)}
                            className="h-8 px-2.5 rounded-md hover:bg-slate-200/60 text-slate-500 text-xs font-medium cursor-pointer"
                          >
                            Hủy
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      )}

      {/* Task Detail Drawer */}
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

export default ListView
