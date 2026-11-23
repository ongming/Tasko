import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { sprintService } from '@/services/sprintService'
import { taskService } from '@/services/taskService'
import { projectService } from '@/services/projectService'
import type { Sprint } from '@/types/sprint'
import type { TaskItem, TaskFilterParams } from '@/types/task'
import type { ProjectMember } from '@/types/member'
import type { ProjectWorkType } from '@/types/projectConfig'
import { useDragAndDrop } from '@/hooks/useDragAndDrop'
import { resolveDropPosition } from '@/utils/dragPosition'

/**
 * Custom hook quản lý toàn bộ state, tải dữ liệu, bộ lọc, CRUD Sprint/Task và Kéo-Thả cho BacklogView.
 */
export function useBacklogBoard(projectParam: string) {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [workTypes, setWorkTypes] = useState<ProjectWorkType[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [filters, setFilters] = useState<TaskFilterParams>({})

  // Expand / collapse
  const [expandedSprints, setExpandedSprints] = useState<Record<string, boolean>>({})
  const [isBacklogExpanded, setIsBacklogExpanded] = useState<boolean>(true)

  // Modals & drawer
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [createTaskInitialSprintId, setCreateTaskInitialSprintId] = useState<string | null>(null)
  const [isCreateSprintModalOpen, setIsCreateSprintModalOpen] = useState(false)
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null)
  const [newSprintName, setNewSprintName] = useState('')
  const [newSprintGoal, setNewSprintGoal] = useState('')
  const [newSprintStartDate, setNewSprintStartDate] = useState('')
  const [newSprintEndDate, setNewSprintEndDate] = useState('')
  const [selectedSprintToStart, setSelectedSprintToStart] = useState<Sprint | null>(null)
  const [selectedSprintToComplete, setSelectedSprintToComplete] = useState<Sprint | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  // Quick create & inline story points
  const [quickTitleBySection, setQuickTitleBySection] = useState<Record<string, string>>({})
  const [isAddingTaskFor, setIsAddingTaskFor] = useState<string | null>(null)
  const [editingPointsTaskId, setEditingPointsTaskId] = useState<string | null>(null)
  const [tempPoints, setTempPoints] = useState<string>('')

  const previousTasksRef = useRef<TaskItem[]>([])
  const scheduleDebouncedRef = useRef<
    (key: string, action: () => Promise<void> | void, delayMs?: number) => void
  >(() => {})

  const loadData = useCallback(async () => {
    if (!projectParam) return
    try {
      setIsLoading(true)
      const [loadedSprints, loadedTasks, loadedMembers, loadedWorkTypes] = await Promise.all([
        sprintService.getSprints(projectParam),
        taskService.getProjectTasks(projectParam),
        projectService.getProjectMembers(projectParam).catch(() => []),
        projectService.getProjectWorkTypes(projectParam).catch(() => []),
      ])
      setSprints(loadedSprints)
      setTasks(loadedTasks)
      setMembers(loadedMembers)
      setWorkTypes(loadedWorkTypes)

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

  const filterTask = useCallback(
    (task: TaskItem) => {
      if (filters.search?.trim()) {
        const q = filters.search.toLowerCase()
        const matchTitle = task.title.toLowerCase().includes(q)
        const matchKey = task.taskKey.toLowerCase().includes(q)
        if (!matchTitle && !matchKey) return false
      }

      if (filters.assigneeId) {
        if (filters.assigneeId === 'unassigned') {
          if (task.assigneeId) return false
        } else if (task.assigneeId !== filters.assigneeId) {
          return false
        }
      }

      if (filters.priority && task.priority !== filters.priority) return false
      if (filters.workTypeId && task.typeId !== filters.workTypeId) return false

      return true
    },
    [filters],
  )

  const filteredTasks = useMemo(() => tasks.filter(filterTask), [tasks, filterTask])
  const plannedSprints = useMemo(() => sprints.filter((s) => s.status === 'PLANNED'), [sprints])
  const activeAndPlannedSprints = useMemo(
    () => sprints.filter((s) => s.status !== 'COMPLETED'),
    [sprints],
  )
  const completedSprints = useMemo(
    () => sprints.filter((s) => s.status === 'COMPLETED'),
    [sprints],
  )
  const hasActiveSprint = useMemo(
    () => sprints.some((s) => s.status === 'ACTIVE'),
    [sprints],
  )
  const backlogTasks = useMemo(() => filteredTasks.filter((t) => !t.sprintId), [filteredTasks])

  // CRUD Sprint
  const handleOpenCreateSprintModal = () => {
    setEditingSprint(null)
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

  const handleOpenEditSprintModal = (sprint: Sprint) => {
    setEditingSprint(sprint)
    setNewSprintName(sprint.name || '')
    setNewSprintGoal(sprint.goal || '')
    setNewSprintStartDate(sprint.startDate ? sprint.startDate.split('T')[0] : '')
    setNewSprintEndDate(sprint.endDate ? sprint.endDate.split('T')[0] : '')
    setIsCreateSprintModalOpen(true)
  }

  const handleConfirmCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectParam) return
    try {
      const payload = {
        name: newSprintName.trim() || `Sprint ${sprints.length + 1}`,
        goal: newSprintGoal.trim() || undefined,
        startDate: newSprintStartDate ? new Date(newSprintStartDate).toISOString() : undefined,
        endDate: newSprintEndDate ? new Date(newSprintEndDate).toISOString() : undefined,
      }
      if (editingSprint) {
        await sprintService.updateSprint(projectParam, editingSprint.id, payload)
      } else {
        await sprintService.createSprint(projectParam, payload)
      }
      setIsCreateSprintModalOpen(false)
      setEditingSprint(null)
      await loadData()
    } catch (err) {
      console.error('Failed to save sprint:', err)
    }
  }

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

  const handleCompleteSprint = async (targetSprintId: string | null) => {
    if (!selectedSprintToComplete || !projectParam) return
    await sprintService.completeSprint(projectParam, selectedSprintToComplete.id, {
      targetSprintId,
    })
    await loadData()
  }

  // Task actions
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

  // Kéo thả @dnd-kit qua useDragAndDrop
  const findContainerId = useCallback(
    (id: string): string | null => {
      if (id === 'backlog') return 'backlog'
      if (sprints.some((s) => s.id === id)) return id
      const task = tasks.find((t) => t.id === id)
      return task ? task.sprintId || 'backlog' : null
    },
    [sprints, tasks],
  )

  const handleStartDrag = useCallback(() => {
    previousTasksRef.current = [...tasks]
  }, [tasks])

  const handleHoverMove = useCallback(
    (activeId: string, overId: string) => {
      const sourceContainerId = findContainerId(activeId)
      const targetContainerId = findContainerId(overId)

      if (!sourceContainerId || !targetContainerId || sourceContainerId === targetContainerId) {
        return
      }

      const targetSprintId = targetContainerId === 'backlog' ? null : targetContainerId

      setTasks((prev) => {
        const activeIdx = prev.findIndex((t) => t.id === activeId)
        if (activeIdx === -1) return prev

        const targetTasks = prev.filter(
          (t) => (t.sprintId || 'backlog') === targetContainerId && t.id !== activeId,
        )
        const overIdx = targetTasks.findIndex((t) => t.id === overId)

        let targetPos = 1000
        if (overIdx >= 0) {
          targetPos = targetTasks[overIdx].position ?? 1000
        } else if (targetTasks.length > 0) {
          targetPos = (targetTasks[targetTasks.length - 1].position ?? 0) + 1000
        }

        const updated = [...prev]
        updated[activeIdx] = {
          ...updated[activeIdx],
          sprintId: targetSprintId,
          position: targetPos,
        }
        return updated
      })
    },
    [findContainerId],
  )

  const handleDropMove = useCallback(
    (activeId: string, overId: string) => {
      const targetContainerId = findContainerId(overId)
      if (!targetContainerId) {
        setTasks(previousTasksRef.current)
        return
      }

      const targetSprintId = targetContainerId === 'backlog' ? null : targetContainerId
      const pristineTasks = previousTasksRef.current
      const activeTaskPristine = pristineTasks.find((t) => t.id === activeId)
      if (!activeTaskPristine) return

      const containerTasksSorted = tasks
        .filter((t) => (t.sprintId || 'backlog') === targetContainerId)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

      const calculatedPosition = resolveDropPosition(containerTasksSorted, activeId, overId)

      setTasks((prev) => {
        const currentItem = prev.find((t) => t.id === activeId) || activeTaskPristine
        const withoutActive = prev.filter((t) => t.id !== activeId)
        const updatedActive = {
          ...currentItem,
          sprintId: targetSprintId,
          position: calculatedPosition,
        }
        return [...withoutActive, updatedActive].sort(
          (a, b) => (a.position ?? 0) - (b.position ?? 0),
        )
      })

      scheduleDebouncedRef.current(activeId, async () => {
        if (!projectParam) return
        try {
          await taskService.moveProjectTask(projectParam, activeId, {
            sprintId: targetSprintId,
            position: calculatedPosition,
          })
        } catch (err) {
          console.error('Failed to persist backlog task move:', err)
          setTasks(pristineTasks)
        }
      })
    },
    [findContainerId, projectParam, tasks],
  )

  const handleCancelDrag = useCallback(() => {
    setTasks(previousTasksRef.current)
  }, [])

  const dragDrop = useDragAndDrop<TaskItem>({
    items: tasks,
    getItemId: (t) => t.id,
    onStartDrag: handleStartDrag,
    onHoverMove: handleHoverMove,
    onDropMove: handleDropMove,
    onCancelDrag: handleCancelDrag,
    debounceMs: 600,
  })

  scheduleDebouncedRef.current = dragDrop.scheduleDebounced

  return {
    sprints,
    tasks,
    members,
    workTypes,
    isLoading,
    filters,
    setFilters,
    filteredTasks,
    plannedSprints,
    activeAndPlannedSprints,
    completedSprints,
    hasActiveSprint,
    backlogTasks,
    expandedSprints,
    setExpandedSprints,
    isBacklogExpanded,
    setIsBacklogExpanded,
    isCreateTaskModalOpen,
    setIsCreateTaskModalOpen,
    createTaskInitialSprintId,
    setCreateTaskInitialSprintId,
    isCreateSprintModalOpen,
    setIsCreateSprintModalOpen,
    editingSprint,
    setEditingSprint,
    newSprintName,
    setNewSprintName,
    newSprintGoal,
    setNewSprintGoal,
    newSprintStartDate,
    setNewSprintStartDate,
    newSprintEndDate,
    setNewSprintEndDate,
    selectedSprintToStart,
    setSelectedSprintToStart,
    selectedSprintToComplete,
    setSelectedSprintToComplete,
    selectedTaskId,
    setSelectedTaskId,
    quickTitleBySection,
    setQuickTitleBySection,
    isAddingTaskFor,
    setIsAddingTaskFor,
    editingPointsTaskId,
    setEditingPointsTaskId,
    tempPoints,
    setTempPoints,
    loadData,
    handleOpenCreateSprintModal,
    handleOpenEditSprintModal,
    handleConfirmCreateSprint,
    handleDeleteSprint,
    handleStartSprint,
    handleCompleteSprint,
    handleMoveTask,
    handleQuickCreateTask,
    handleSavePoints,
    dragDrop,
  }
}

export default useBacklogBoard
