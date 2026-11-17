import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import {
  Plus,
  Play,
  ChevronDown,
  ChevronRight,
  Search,
  Package,
  CheckSquare,
  Bug,
  GripVertical,
  MoreHorizontal,
  CheckCircle2,
  Trash2,
  Calendar,
  Target,
  Sparkles,
  Loader2,
  Layers,
  Inbox,
  AlertCircle,
} from 'lucide-react'
import { sprintService } from '@/services/sprintService'
import { taskService } from '@/services/taskService'
import type { Sprint } from '@/types/sprint'
import type { TaskItem } from '@/types/task'
import { StartSprintModal } from '@/components/project/StartSprintModal'
import { CompleteSprintModal } from '@/components/project/CompleteSprintModal'

export function BacklogView() {
  const { projectKey } = useParams<{ projectKey?: string }>()
  const [searchParams] = useSearchParams()
  const projectParam = projectKey || searchParams.get('project') || searchParams.get('projectId') || ''

  const [sprints, setSprints] = useState<Sprint[]>([])
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [expandedSprints, setExpandedSprints] = useState<Record<string, boolean>>({})
  const [isBacklogExpanded, setIsBacklogExpanded] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'my' | 'active'>('all')

  // Quick Create inputs
  const [quickTitleBySection, setQuickTitleBySection] = useState<Record<string, string>>({})
  const [isAddingTaskFor, setIsAddingTaskFor] = useState<string | null>(null)

  // Modals state
  const [selectedSprintToStart, setSelectedSprintToStart] = useState<Sprint | null>(null)
  const [selectedSprintToComplete, setSelectedSprintToComplete] = useState<Sprint | null>(null)

  // Story point inline editing
  const [editingPointsTaskId, setEditingPointsTaskId] = useState<string | null>(null)
  const [tempPoints, setTempPoints] = useState<string>('')

  // Drag & drop state for backlog items
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverSection, setDragOverSection] = useState<string | null>(null)

  // Load Sprints & Tasks
  const loadData = useCallback(async () => {
    if (!projectParam) return
    try {
      setIsLoading(true)
      const [loadedSprints, loadedTasks] = await Promise.all([
        sprintService.getSprints(projectParam),
        taskService.getProjectTasks(projectParam),
      ])
      setSprints(loadedSprints)
      setTasks(loadedTasks)

      // Mặc định mở rộng tất cả sprint
      const initialExpanded: Record<string, boolean> = {}
      loadedSprints.forEach((s) => {
        initialExpanded[s.id] = true
      })
      setExpandedSprints(initialExpanded)
    } catch (err) {
      console.error('Failed to load backlog data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [projectParam])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Lọc task theo search query và filter
  const filterTask = (task: TaskItem) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchTitle = task.title.toLowerCase().includes(q)
      const matchKey = task.taskKey.toLowerCase().includes(q)
      if (!matchTitle && !matchKey) return false
    }
    return true
  }

  // Tạo Sprint mới
  const handleCreateSprint = async () => {
    if (!projectParam) return
    try {
      await sprintService.createSprint(projectParam)
      await loadData()
    } catch (err) {
      console.error('Failed to create sprint:', err)
    }
  }

  // Xóa Sprint
  const handleDeleteSprint = async (sprintId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa Sprint này? Các công việc sẽ được chuyển về Backlog.')) {
      return
    }
    try {
      await sprintService.deleteSprint(projectParam, sprintId)
      await loadData()
    } catch (err) {
      console.error('Failed to delete sprint:', err)
    }
  }

  // Bắt đầu Sprint
  const handleStartSprint = async (data: {
    name: string
    goal: string
    startDate: string
    endDate: string
  }) => {
    if (!selectedSprintToStart || !projectParam) return
    await sprintService.startSprint(projectParam, selectedSprintToStart.id, data)
    await loadData()
  }

  // Hoàn thành Sprint
  const handleCompleteSprint = async (targetSprintId: string | null) => {
    if (!selectedSprintToComplete || !projectParam) return
    await sprintService.completeSprint(projectParam, selectedSprintToComplete.id, {
      targetSprintId,
    })
    await loadData()
  }

  // Tạo Task nhanh (Inline Create)
  const handleQuickCreateTask = async (sprintId: string | null) => {
    const key = sprintId || 'backlog'
    const title = (quickTitleBySection[key] || '').trim()
    if (!title || !projectParam) return

    try {
      await taskService.createProjectTask(projectParam, {
        title,
        sprintId,
      })
      setQuickTitleBySection((prev) => ({ ...prev, [key]: '' }))
      setIsAddingTaskFor(null)
      await loadData()
    } catch (err) {
      console.error('Failed to create task:', err)
    }
  }

  // Di chuyển task sang Sprint khác hoặc về Backlog
  const handleMoveTask = async (taskId: string, targetSprintId: string | null) => {
    if (!projectParam) return
    try {
      await taskService.moveProjectTask(projectParam, taskId, {
        sprintId: targetSprintId,
      })
      await loadData()
    } catch (err) {
      console.error('Failed to move task:', err)
    }
  }

  // Drag & drop handlers
  const onDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId)
    e.dataTransfer.setData('taskId', taskId)
  }

  const onDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault()
    setDragOverSection(sectionId)
  }

  const onDragLeave = () => {
    setDragOverSection(null)
  }

  const onDrop = async (e: React.DragEvent, targetSprintId: string | null) => {
    e.preventDefault()
    setDragOverSection(null)
    const taskId = e.dataTransfer.getData('taskId') || draggedTaskId
    if (!taskId) return
    setDraggedTaskId(null)
    await handleMoveTask(taskId, targetSprintId)
  }

  // Lưu Story Points inline
  const handleSavePoints = async (taskId: string) => {
    if (!projectParam) return
    const pts = tempPoints.trim() === '' ? null : parseInt(tempPoints, 10)
    try {
      await taskService.updateProjectTask(projectParam, taskId, {
        storyPoints: isNaN(pts as number) ? null : pts,
      })
      setEditingPointsTaskId(null)
      await loadData()
    } catch (err) {
      console.error('Failed to save story points:', err)
    }
  }

  const renderIssueIcon = (type?: { name: string; icon: string } | null) => {
    const iconName = type?.icon?.toLowerCase() || ''
    if (iconName.includes('package') || type?.name?.toLowerCase().includes('module')) {
      return (
        <span title="Module chức năng" className="p-1 rounded-md bg-purple-50 text-purple-600 shrink-0 border border-purple-100">
          <Package className="w-3.5 h-3.5" />
        </span>
      )
    }
    if (iconName.includes('bug') || type?.name?.toLowerCase().includes('bug')) {
      return (
        <span title="Lỗi (Bug)" className="p-1 rounded-md bg-rose-50 text-rose-600 shrink-0 border border-rose-100">
          <Bug className="w-3.5 h-3.5" />
        </span>
      )
    }
    return (
      <span title="Công việc (Task)" className="p-1 rounded-md bg-blue-50 text-blue-600 shrink-0 border border-blue-100">
        <CheckSquare className="w-3.5 h-3.5" />
      </span>
    )
  }

  // Dòng render từng công việc theo tiêu chuẩn Linear / Jira
  const renderIssueRow = (issue: TaskItem) => {
    const isEditingPoints = editingPointsTaskId === issue.id

    return (
      <div
        key={issue.id}
        draggable
        onDragStart={(e) => onDragStart(e, issue.id)}
        className="px-3 py-2.5 flex items-center justify-between hover:bg-slate-50/90 transition-colors group cursor-grab active:cursor-grabbing border-b border-slate-100 last:border-b-0 select-none"
      >
        {/* Vùng bên trái: Grip + Icon + Key + Tiêu đề */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-4">
          <GripVertical className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -ml-1" />
          {renderIssueIcon(issue.type)}
          <span className="font-mono text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors shrink-0 w-20">
            {issue.taskKey}
          </span>
          <span className="text-xs sm:text-sm font-medium text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
            {issue.title}
          </span>
        </div>

        {/* Vùng bên phải: Quick Move + Trạng thái + Points + Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick move dropdown pill */}
          <div className="relative">
            <select
              value={issue.sprintId || 'backlog'}
              onChange={(e) => {
                const val = e.target.value === 'backlog' ? null : e.target.value
                handleMoveTask(issue.id, val)
              }}
              onClick={(e) => e.stopPropagation()}
              title="Chuyển công việc sang Sprint khác"
              className="text-[11px] font-medium h-6 px-2 rounded-md border border-slate-200/90 bg-white text-slate-600 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-all hover:border-slate-300 focus:opacity-100 shadow-2xs cursor-pointer"
            >
              <option value="backlog">📦 Backlog</option>
              {sprints
                .filter((s) => s.status !== 'COMPLETED')
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.status === 'ACTIVE' ? '⚡ ' : '📋 '}
                    {s.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Status badge */}
          <div className="w-24 text-center">
            <span
              className={`inline-block w-full px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight truncate border ${
                issue.status?.category === 'DONE'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                  : issue.status?.category === 'IN_PROGRESS'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                    : 'bg-slate-100 text-slate-600 border-slate-200/80'
              }`}
            >
              {issue.status?.name || 'Cần làm'}
            </span>
          </div>

          {/* Story Points inline edit */}
          {isEditingPoints ? (
            <input
              type="number"
              min={0}
              max={99}
              autoFocus
              value={tempPoints}
              onChange={(e) => setTempPoints(e.target.value)}
              onBlur={() => handleSavePoints(issue.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSavePoints(issue.id)
                if (e.key === 'Escape') setEditingPointsTaskId(null)
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-7 h-6 text-center text-xs font-bold font-mono border-2 border-indigo-500 rounded-md bg-white text-indigo-700 focus:outline-none shadow-2xs"
            />
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setEditingPointsTaskId(issue.id)
                setTempPoints(
                  issue.storyPoints !== null && issue.storyPoints !== undefined
                    ? String(issue.storyPoints)
                    : '',
                )
              }}
              title="Nhấn để sửa điểm Story Points"
              className="w-7 h-6 rounded-md bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200/60 text-xs font-bold flex items-center justify-center font-mono transition-colors cursor-pointer shadow-2xs"
            >
              {issue.storyPoints !== null && issue.storyPoints !== undefined ? issue.storyPoints : '-'}
            </button>
          )}

          {/* Avatar Assignee */}
          <div
            className="w-6 h-6 rounded-full bg-slate-700 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-2xs shrink-0"
            title={issue.assignee?.name || 'Chưa gán người làm'}
          >
            {issue.assignee?.name ? issue.assignee.name.charAt(0).toUpperCase() : '?'}
          </div>
        </div>
      </div>
    )
  }

  const plannedSprints = sprints.filter((s) => s.status === 'PLANNED')
  const backlogTasks = tasks.filter((t) => !t.sprintId).filter(filterTask)

  return (
    <div className="flex flex-col gap-4 w-full flex-1">
      {/* 1. Header Toolbar: Tìm kiếm, lọc và nút tạo Sprint */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-1">
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm công việc trong Backlog (mã hoặc tiêu đề)..."
              aria-label="Tìm kiếm trong Backlog"
              className="w-full h-9 pl-9 pr-4 bg-white border border-slate-200/90 rounded-lg text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === 'active' ? 'all' : 'active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
              activeFilter === 'active'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Sprint hiện tại
          </button>
          <button
            type="button"
            onClick={handleCreateSprint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo Sprint mới</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="py-16 flex flex-col items-center justify-center gap-2.5 text-slate-500 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span className="font-medium">Đang tải danh sách Sprint và kho Backlog...</span>
        </div>
      )}

      {/* 2. Danh sách các Sprint */}
      {!isLoading && (
        <div className="flex flex-col gap-4">
          {sprints.map((sprint) => {
            const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id).filter(filterTask)
            const isExpanded = expandedSprints[sprint.id] ?? true
            const isActive = sprint.status === 'ACTIVE'
            const isCompleted = sprint.status === 'COMPLETED'
            const isDropTarget = dragOverSection === sprint.id

            return (
              <div
                key={sprint.id}
                onDragOver={(e) => onDragOver(e, sprint.id)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, sprint.id)}
                className={`bg-white rounded-xl border transition-all overflow-hidden ${
                  isActive
                    ? 'border-indigo-200 shadow-xs'
                    : isDropTarget
                      ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-sm'
                      : 'border-slate-200/90 shadow-2xs'
                }`}
              >
                {/* Header Sprint */}
                <div
                  className={`px-4 py-3 border-b flex items-center justify-between flex-wrap gap-3 transition-colors ${
                    isActive ? 'bg-indigo-50/40 border-indigo-100' : 'bg-slate-50/80 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedSprints((prev) => ({
                          ...prev,
                          [sprint.id]: !isExpanded,
                        }))
                      }
                      className="p-1 rounded-md hover:bg-slate-200/60 text-slate-500 transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 tracking-tight">
                        {sprint.name}
                      </span>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                          Đang diễn ra
                        </span>
                      )}
                      {sprint.status === 'PLANNED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                          Kế hoạch
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                          Đã hoàn thành
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-medium">
                        • {sprintTasks.length} công việc
                      </span>

                      {/* Hiển thị ngày và Goal nếu có */}
                      {sprint.startDate && sprint.endDate && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>
                            {new Date(sprint.startDate).toLocaleDateString('vi-VN')} -{' '}
                            {new Date(sprint.endDate).toLocaleDateString('vi-VN')}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Story Points */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold font-mono">
                      <span
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60"
                        title="Tổng Story Points trong Sprint"
                      >
                        {sprint.totalPoints || 0} SP
                      </span>
                    </div>

                    {isActive && (
                      <button
                        type="button"
                        onClick={() => setSelectedSprintToComplete(sprint)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Hoàn thành Sprint</span>
                      </button>
                    )}

                    {sprint.status === 'PLANNED' && (
                      <button
                        type="button"
                        onClick={() => setSelectedSprintToStart(sprint)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-slate-700 text-slate-700" />
                        <span>Bắt đầu Sprint</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteSprint(sprint.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      title="Xóa Sprint này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Danh sách Task trong Sprint */}
                {isExpanded && (
                  <div>
                    {sprintTasks.length === 0 ? (
                      <div className="py-7 px-4 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-1">
                        <Inbox className="w-5 h-5 text-slate-300 mb-1" />
                        <span>Chưa có công việc nào trong {sprint.name}.</span>
                        <span className="text-[11px] text-slate-400">
                          Kéo thả công việc từ Backlog vào đây hoặc nhập bên dưới để tạo mới.
                        </span>
                      </div>
                    ) : (
                      sprintTasks.map(renderIssueRow)
                    )}

                    {/* Inline Quick Add Task */}
                    {!isCompleted && (
                      <div className="px-3.5 py-2 flex items-center gap-2 border-t border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                        <Plus className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <input
                          type="text"
                          value={quickTitleBySection[sprint.id] || ''}
                          onChange={(e) =>
                            setQuickTitleBySection((prev) => ({
                              ...prev,
                              [sprint.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleQuickCreateTask(sprint.id)
                          }}
                          placeholder={`+ Tạo công việc trong ${sprint.name} (nhấn Enter để tạo)...`}
                          className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none py-1"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* ================= PRODUCT BACKLOG SECTION ================= */}
          <div
            onDragOver={(e) => onDragOver(e, 'backlog')}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, null)}
            className={`bg-white rounded-xl border transition-all overflow-hidden ${
              dragOverSection === 'backlog'
                ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-sm'
                : 'border-slate-200/90 shadow-2xs'
            }`}
          >
            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsBacklogExpanded(!isBacklogExpanded)}
                  className="p-1 rounded-md hover:bg-slate-200/60 text-slate-500 transition-colors cursor-pointer"
                >
                  {isBacklogExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 tracking-tight">
                    Product Backlog
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    • {backlogTasks.length} công việc chưa phân vào Sprint
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateSprint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tạo Sprint mới</span>
              </button>
            </div>

            {isBacklogExpanded && (
              <div>
                {backlogTasks.length === 0 ? (
                  <div className="py-9 px-4 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-1.5">
                    <Layers className="w-6 h-6 text-slate-300 mb-1" />
                    <span className="font-medium text-slate-600">Kho Product Backlog đang trống</span>
                    <span className="text-[11px] text-slate-400">
                      Bắt đầu thêm các Modules, Tasks hoặc Bugs đầu tiên bên dưới!
                    </span>
                  </div>
                ) : (
                  backlogTasks.map(renderIssueRow)
                )}

                {/* Inline Quick Add Task for Backlog */}
                <div className="px-3.5 py-2 flex items-center gap-2 border-t border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                  <Plus className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <input
                    type="text"
                    value={quickTitleBySection['backlog'] || ''}
                    onChange={(e) =>
                      setQuickTitleBySection((prev) => ({
                        ...prev,
                        backlog: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuickCreateTask(null)
                    }}
                    placeholder="+ Tạo công việc trong Product Backlog (nhấn Enter để tạo)..."
                    className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none py-1"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Start Sprint Modal */}
      <StartSprintModal
        isOpen={Boolean(selectedSprintToStart)}
        onClose={() => setSelectedSprintToStart(null)}
        sprint={selectedSprintToStart}
        onStart={handleStartSprint}
      />

      {/* Complete Sprint Modal */}
      <CompleteSprintModal
        isOpen={Boolean(selectedSprintToComplete)}
        onClose={() => setSelectedSprintToComplete(null)}
        sprint={selectedSprintToComplete}
        plannedSprints={plannedSprints}
        onComplete={handleCompleteSprint}
      />
    </div>
  )
}

export default BacklogView
