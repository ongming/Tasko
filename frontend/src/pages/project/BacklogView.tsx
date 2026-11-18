import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import {
  Plus,
  Play,
  ChevronDown,
  ChevronRight,
  Package,
  CheckSquare,
  Bug,
  GripVertical,
  MoreHorizontal,
  CheckCircle2,
  Trash2,
  Calendar,
  Target,
  Loader2,
  Inbox,
  ArrowRight,
  ArrowDown,
  Edit2,
  X,
} from 'lucide-react'
import { sprintService } from '@/services/sprintService'
import { taskService } from '@/services/taskService'
import { projectService } from '@/services/projectService'
import type { Sprint } from '@/types/sprint'
import type { TaskItem, TaskFilterParams } from '@/types/task'
import type { ProjectMember } from '@/types/member'
import type { ProjectWorkType, ProjectStatus } from '@/types/projectConfig'
import { StartSprintModal } from '@/components/project/StartSprintModal'
import { CompleteSprintModal } from '@/components/project/CompleteSprintModal'
import { TaskDetailDrawer } from '@/components/project/TaskDetailDrawer'
import { CreateTaskModal } from '@/components/project/CreateTaskModal'
import { TaskFilterBar } from '@/components/project/TaskFilterBar'

export function BacklogView() {
  const { projectKey } = useParams<{ projectKey?: string }>()
  const [searchParams] = useSearchParams()
  const projectParam = projectKey || searchParams.get('project') || searchParams.get('projectId') || ''

  const [sprints, setSprints] = useState<Sprint[]>([])
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [workTypes, setWorkTypes] = useState<ProjectWorkType[]>([])
  const [statuses, setStatuses] = useState<ProjectStatus[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Filters state
  const [filters, setFilters] = useState<TaskFilterParams>({})

  const [expandedSprints, setExpandedSprints] = useState<Record<string, boolean>>({})
  const [isBacklogExpanded, setIsBacklogExpanded] = useState<boolean>(true)

  // Modals state
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [createTaskInitialSprintId, setCreateTaskInitialSprintId] = useState<string | null>(null)

  const [isCreateSprintModalOpen, setIsCreateSprintModalOpen] = useState(false)
  const [newSprintName, setNewSprintName] = useState('')
  const [newSprintGoal, setNewSprintGoal] = useState('')
  const [newSprintStartDate, setNewSprintStartDate] = useState('')
  const [newSprintEndDate, setNewSprintEndDate] = useState('')

  const [selectedSprintToStart, setSelectedSprintToStart] = useState<Sprint | null>(null)
  const [selectedSprintToComplete, setSelectedSprintToComplete] = useState<Sprint | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  // Quick Create inputs for inline row
  const [quickTitleBySection, setQuickTitleBySection] = useState<Record<string, string>>({})
  const [isAddingTaskFor, setIsAddingTaskFor] = useState<string | null>(null)

  // Story point inline editing
  const [editingPointsTaskId, setEditingPointsTaskId] = useState<string | null>(null)
  const [tempPoints, setTempPoints] = useState<string>('')

  // Drag & drop state for backlog items
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverSection, setDragOverSection] = useState<string | null>(null)

  // Load Sprints, Tasks, and Project Configurations
  const loadData = useCallback(async () => {
    if (!projectParam) return
    try {
      setIsLoading(true)
      const [loadedSprints, loadedTasks, loadedMembers, loadedWorkTypes, loadedStatuses] =
        await Promise.all([
          sprintService.getSprints(projectParam),
          taskService.getProjectTasks(projectParam),
          projectService.getProjectMembers(projectParam).catch(() => []),
          projectService.getProjectWorkTypes(projectParam).catch(() => []),
          projectService.getProjectStatuses(projectParam).catch(() => []),
        ])
      setSprints(loadedSprints)
      setTasks(loadedTasks)
      setMembers(loadedMembers)
      setWorkTypes(loadedWorkTypes)
      setStatuses(loadedStatuses)

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

  // Filter tasks based on TaskFilterParams
  const filterTask = useCallback(
    (task: TaskItem) => {
      // 1. Search (Title or taskKey)
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

  const filteredTasks = useMemo(() => tasks.filter(filterTask), [tasks, filterTask])

  // Tạo Sprint mới
  const handleOpenCreateSprintModal = () => {
    const nextNumber = sprints.length + 1
    setNewSprintName(`Sprint ${nextNumber}`)
    setNewSprintGoal('')
    const today = new Date().toISOString().split('T')[0]
    setNewSprintStartDate(today)
    const end = new Date()
    end.setDate(end.getDate() + 14)
    setNewSprintEndDate(end.toISOString().split('T')[0])
    setIsCreateSprintModalOpen(true)
  }

  const handleConfirmCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectParam) return
    try {
      await sprintService.createSprint(projectParam, {
        name: newSprintName.trim() || `Sprint ${sprints.length + 1}`,
        goal: newSprintGoal.trim() || undefined,
        startDate: newSprintStartDate ? new Date(newSprintStartDate).toISOString() : undefined,
        endDate: newSprintEndDate ? new Date(newSprintEndDate).toISOString() : undefined,
      })
      setIsCreateSprintModalOpen(false)
      await loadData()
    } catch (err) {
      console.error('Failed to create sprint:', err)
    }
  }

  // Xóa Sprint
  const handleDeleteSprint = async (sprintId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa Sprint này? Toàn bộ công việc sẽ được chuyển về Backlog.')) {
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

  // Di chuyển Task sang Sprint hoặc Backlog
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
      console.error('Failed to quick create task:', err)
    }
  }

  // Drag and Drop
  const onDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId)
    setDraggedTaskId(taskId)
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
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId
    if (!taskId) return

    await handleMoveTask(taskId, targetSprintId)
    setDraggedTaskId(null)
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
        onClick={() => setSelectedTaskId(issue.id)}
        className="px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50/90 transition-colors group cursor-pointer border-b border-slate-100 last:border-b-0 select-none"
      >
        {/* Vùng bên trái: Grip + Icon + Key + Tiêu đề */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-4">
          <GripVertical className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -ml-1 cursor-grab" />
          {renderIssueIcon(issue.type)}
          <span className="font-mono text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition-colors shrink-0 w-20">
            {issue.taskKey}
          </span>
          <span className="text-xs sm:text-sm font-medium text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
            {issue.title}
          </span>
          {issue.subtasks && issue.subtasks.length > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0">
              {issue.subtasks.length} subtasks
            </span>
          )}
        </div>

        {/* Vùng bên phải: Quick Move + Trạng thái + Points + Avatar */}
        <div
          className="flex items-center gap-2 sm:gap-3 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quick move dropdown pill */}
          <div className="relative">
            <select
              value={issue.sprintId || 'backlog'}
              onChange={(e) => {
                const val = e.target.value === 'backlog' ? null : e.target.value
                handleMoveTask(issue.id, val)
              }}
              title="Chuyển công việc sang Sprint khác hoặc Backlog"
              className="text-[11px] font-medium h-6 px-2 rounded-md border border-slate-200/90 bg-white text-slate-600 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-all hover:border-slate-300 focus:opacity-100 shadow-2xs cursor-pointer"
            >
              <option value="backlog">📦 Về Backlog</option>
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
              className="w-7 h-6 text-center text-xs font-bold font-mono border-2 border-indigo-500 rounded-md bg-white text-indigo-700 focus:outline-none shadow-2xs"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
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
  const backlogTasks = filteredTasks.filter((t) => !t.sprintId)

  return (
    <div className="flex flex-col gap-4 w-full flex-1 pb-16">
      {/* 1. Header Toolbar: Nút Tạo Sprint, Nút Tạo Task và Thanh lọc dùng chung */}
      <div className="flex flex-col gap-3 pb-1 border-b border-slate-100">
        <div className="flex items-center justify-between flex-wrap gap-2.5">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Backlog & Kế hoạch Sprint
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân bổ công việc vào các chu kỳ Sprint hoặc lưu trữ trong kho Backlog dự án
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenCreateSprintModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo Sprint</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCreateTaskInitialSprintId(null)
                setIsCreateTaskModalOpen(true)
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo công việc</span>
            </button>
          </div>
        </div>

        {/* Thanh lọc chuẩn Agile TaskFilterBar */}
        <TaskFilterBar
          filters={filters}
          onFilterChange={setFilters}
          members={members}
          workTypes={workTypes}
          totalCount={tasks.length}
          filteredCount={filteredTasks.length}
        />
      </div>

      {isLoading && (
        <div className="py-16 flex flex-col items-center justify-center gap-2.5 text-slate-500 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span className="font-medium">Đang tải danh sách Sprint và kho Backlog...</span>
        </div>
      )}

      {/* 2. Danh sách các Sprint (ACTIVE & PLANNED) */}
      {!isLoading && (
        <div className="flex flex-col gap-4">
          {sprints.map((sprint) => {
            const sprintTasks = filteredTasks.filter((t) => t.sprintId === sprint.id)
            const isExpanded = expandedSprints[sprint.id] ?? true
            const isActive = sprint.status === 'ACTIVE'
            const isCompleted = sprint.status === 'COMPLETED'
            const isDropTarget = dragOverSection === sprint.id

            // Tính toán tổng điểm Story Points theo từng nhóm trạng thái (To Do, In Progress, Done)
            const todoPoints = sprintTasks
              .filter((t) => t.status?.category === 'TODO')
              .reduce((sum, t) => sum + (t.storyPoints || 0), 0)
            const inProgressPoints = sprintTasks
              .filter((t) => t.status?.category === 'IN_PROGRESS')
              .reduce((sum, t) => sum + (t.storyPoints || 0), 0)
            const donePoints = sprintTasks
              .filter((t) => t.status?.category === 'DONE')
              .reduce((sum, t) => sum + (t.storyPoints || 0), 0)

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
                    isActive ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50/80 border-slate-200/80'
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
                      <span className="font-bold text-sm text-slate-900 tracking-tight">
                        {sprint.name}
                      </span>

                      {/* Badge trạng thái Sprint */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : isCompleted
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isActive ? '⚡ ĐANG CHẠY' : isCompleted ? '🏆 ĐÃ HOÀN THÀNH' : 'LÊN KẾ HOẠCH'}
                      </span>

                      {/* Ngày bắt đầu - Ngày kết thúc */}
                      {sprint.startDate && sprint.endDate && (
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(sprint.startDate).toLocaleDateString('vi-VN')} -{' '}
                            {new Date(sprint.endDate).toLocaleDateString('vi-VN')}
                          </span>
                        </span>
                      )}

                      {/* Mục tiêu Sprint (Goal) */}
                      {sprint.goal && (
                        <span
                          className="text-[11px] text-slate-500 italic max-w-xs truncate hidden sm:inline"
                          title={sprint.goal}
                        >
                          • "{sprint.goal}"
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cụm Thống kê Story Points theo nhóm & Nút hành động */}
                  <div className="flex items-center gap-2.5">
                    {/* Story Points Breakdown Badges (To Do / In Progress / Done) */}
                    <div className="flex items-center gap-1 text-[10px] font-bold">
                      <span
                        title="Điểm cần làm (To Do)"
                        className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700"
                      >
                        {todoPoints}
                      </span>
                      <span
                        title="Điểm đang làm (In Progress)"
                        className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700"
                      >
                        {inProgressPoints}
                      </span>
                      <span
                        title="Điểm hoàn thành (Done)"
                        className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700"
                      >
                        {donePoints}
                      </span>
                      <span className="text-slate-400 text-[11px] font-medium ml-1">
                        ({sprintTasks.length} việc)
                      </span>
                    </div>

                    {/* Nút Bắt đầu Sprint (nếu PLANNED) */}
                    {!isActive && !isCompleted && (
                      <button
                        type="button"
                        onClick={() => setSelectedSprintToStart(sprint)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Bắt đầu Sprint</span>
                      </button>
                    )}

                    {/* Nút Hoàn thành Sprint (nếu ACTIVE) */}
                    {isActive && (
                      <button
                        type="button"
                        onClick={() => setSelectedSprintToComplete(sprint)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Hoàn thành Sprint</span>
                      </button>
                    )}

                    {/* Nút Xóa Sprint */}
                    <button
                      type="button"
                      onClick={() => handleDeleteSprint(sprint.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Xóa Sprint này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Danh sách Task trong Sprint */}
                {isExpanded && (
                  <div className="flex flex-col">
                    {sprintTasks.length > 0 ? (
                      sprintTasks.map(renderIssueRow)
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400 italic">
                        Kéo thả công việc từ kho Backlog hoặc tạo mới để lập kế hoạch cho Sprint này.
                      </div>
                    )}

                    {/* Form tạo nhanh task vào Sprint */}
                    <div className="p-2 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                      {isAddingTaskFor === sprint.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            type="text"
                            autoFocus
                            placeholder="Nhập tiêu đề công việc và nhấn Enter..."
                            value={quickTitleBySection[sprint.id] || ''}
                            onChange={(e) =>
                              setQuickTitleBySection((prev) => ({
                                ...prev,
                                [sprint.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleQuickCreateTask(sprint.id)
                              if (e.key === 'Escape') setIsAddingTaskFor(null)
                            }}
                            className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuickCreateTask(sprint.id)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
                          >
                            Thêm
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAddingTaskFor(null)}
                            className="px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-200/60 rounded-lg"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingTaskFor(sprint.id)
                            setQuickTitleBySection((prev) => ({
                              ...prev,
                              [sprint.id]: '',
                            }))
                          }}
                          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tạo công việc trong {sprint.name}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* 3. Khu vực Kho Backlog (Công việc chưa đưa vào Sprint) */}
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
            {/* Header Kho Backlog */}
            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
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
                  <Inbox className="w-4 h-4 text-slate-600" />
                  <span className="font-bold text-sm text-slate-900 tracking-tight">
                    Kho Backlog
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {backlogTasks.length} công việc
                  </span>
                  <span className="text-[11px] text-slate-400">
                    (Tổng{' '}
                    {backlogTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0)}{' '}
                    Story Points)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreateTaskInitialSprintId(null)
                    setIsCreateTaskModalOpen(true)
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm vào Backlog</span>
                </button>
              </div>
            </div>

            {/* Danh sách Task trong Backlog */}
            {isBacklogExpanded && (
              <div className="flex flex-col">
                {backlogTasks.length > 0 ? (
                  backlogTasks.map(renderIssueRow)
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                    <Inbox className="w-6 h-6 text-slate-300" />
                    <span>Kho Backlog hiện đang trống.</span>
                  </div>
                )}

                {/* Form tạo nhanh task vào Backlog */}
                <div className="p-2 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  {isAddingTaskFor === 'backlog' ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Nhập tiêu đề công việc cho Backlog và nhấn Enter..."
                        value={quickTitleBySection['backlog'] || ''}
                        onChange={(e) =>
                          setQuickTitleBySection((prev) => ({
                            ...prev,
                            backlog: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleQuickCreateTask(null)
                          if (e.key === 'Escape') setIsAddingTaskFor(null)
                        }}
                        className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuickCreateTask(null)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs cursor-pointer"
                      >
                        Thêm
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingTaskFor(null)}
                        className="px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-200/60 rounded-lg cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingTaskFor('backlog')
                        setQuickTitleBySection((prev) => ({
                          ...prev,
                          backlog: '',
                        }))
                      }}
                      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Tạo công việc trong Backlog</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Tạo Sprint Mới */}
      {isCreateSprintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Tạo Sprint mới</h3>
              <button
                type="button"
                onClick={() => setIsCreateSprintModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCreateSprint} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Tên Sprint <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newSprintName}
                  onChange={(e) => setNewSprintName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Mục tiêu Sprint (Goal)
                </label>
                <textarea
                  rows={2}
                  value={newSprintGoal}
                  onChange={(e) => setNewSprintGoal(e.target.value)}
                  placeholder="Mục tiêu chính cần hoàn thành trong Sprint này..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    value={newSprintStartDate}
                    onChange={(e) => setNewSprintStartDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    value={newSprintEndDate}
                    onChange={(e) => setNewSprintEndDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateSprintModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!newSprintName.trim()}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  Tạo Sprint
                </button>
              </div>
            </form>
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

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        projectIdOrKey={projectParam}
        initialSprintId={createTaskInitialSprintId}
        onTaskCreated={() => {
          setIsCreateTaskModalOpen(false)
          loadData()
        }}
      />

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

export default BacklogView
