import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { projectService } from '@/services/projectService'
import { sprintService } from '@/services/sprintService'
import { taskService } from '@/services/taskService'
import type { Sprint } from '@/types/sprint'
import type { TaskItem, TaskFilterParams } from '@/types/task'
import type { Project } from '@/types/workspace'
import type { ProjectMember } from '@/types/member'
import type { ProjectLabel, ProjectWorkType } from '@/types/projectConfig'
import { useDragAndDrop } from '@/hooks/useDragAndDrop'
import { resolveDropPosition } from '@/utils/dragPosition'
import { isScrumProject } from '@/utils/projectMethod'

export interface BoardColumn {
  id: string
  title: string
  category: 'TODO' | 'IN_PROGRESS' | 'DONE'
  colorBadge: string
  countBadgeClass: string
  wrapperClass: string
  quickAddClass: string
  wipLimit?: number | null
  tasks: TaskItem[]
}

/**
 * Custom hook quản lý toàn bộ state, API, bộ lọc, Quick-Add và Kéo-Thả cho KanbanBoardView.
 */
export function useKanbanBoard(projectParam: string) {
  const [columns, setColumns] = useState<BoardColumn[]>([])
  const [allTasks, setAllTasks] = useState<TaskItem[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [workTypes, setWorkTypes] = useState<ProjectWorkType[]>([])
  const [labels, setLabels] = useState<ProjectLabel[]>([])
  const [filters, setFilters] = useState<TaskFilterParams>({})
  const [selectedSprintId, setSelectedSprintId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)

  // Quick-add state
  const [quickAddColumnId, setQuickAddColumnId] = useState<string | null>(null)
  const [quickTaskTitle, setQuickTaskTitle] = useState('')
  const [isSubmittingQuickAdd, setIsSubmittingQuickAdd] = useState(false)

  // Modals & drawer state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createTaskInitialStatusId, setCreateTaskInitialStatusId] = useState<string | undefined>(undefined)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const previousTasksRef = useRef<TaskItem[]>([])
  const scheduleDebouncedRef = useRef<
    (key: string, action: () => Promise<void> | void, delayMs?: number) => void
  >(() => {})

  const isScrum = isScrumProject(project)
  const methodId = project?.settings?.method_id?.toLowerCase() || project?.methodology?.toLowerCase()
  const isStrictScrum = methodId === 'scrum'
  const startedSprints = sprints.filter((s) => s.status === 'ACTIVE' || s.status === 'COMPLETED')
  const currentSprint =
    startedSprints.find((s) => s.id === selectedSprintId) || startedSprints[0] || null
  const plannedSprints = sprints.filter((s) => s.status === 'PLANNED')
  const isViewingCompletedSprint = Boolean(isScrum && currentSprint?.status === 'COMPLETED')
  const canMutateBoard =
    !isViewingCompletedSprint && (!isStrictScrum || currentSprint?.status === 'ACTIVE')

  // 1. Tải thông tin dự án, cột, sprints, thành viên, loại công việc
  const loadInitialData = useCallback(async () => {
    if (!projectParam) return
    try {
      setIsLoading(true)
      const [projData, statuses, loadedSprints, loadedMembers, loadedWorkTypes, loadedLabels] =
        await Promise.all([
          projectService.getProjectById(projectParam).catch(() => null),
          projectService.getProjectStatuses(projectParam).catch(() => []),
          sprintService.getSprints(projectParam).catch(() => []),
          projectService.getProjectMembers(projectParam).catch(() => []),
          projectService.getProjectWorkTypes(projectParam).catch(() => []),
          projectService.getProjectLabels?.(projectParam).catch(() => []) ?? Promise.resolve([]),
        ])

      if (projData) setProject(projData)
      setSprints(loadedSprints)
      setMembers(loadedMembers)
      setWorkTypes(loadedWorkTypes)
      setLabels(loadedLabels)

      const started = loadedSprints.filter((s) => s.status === 'ACTIVE' || s.status === 'COMPLETED')
      const activeSprint = started.find((s) => s.status === 'ACTIVE')
      const defaultSprint = activeSprint || started[0]

      if (defaultSprint && !selectedSprintId) {
        setSelectedSprintId(defaultSprint.id)
      }

      if (statuses && statuses.length > 0) {
        const dynamicCols: BoardColumn[] = statuses.map((st) => {
          let colorBadge = 'bg-slate-400'
          let countBadgeClass = 'bg-slate-200/90 text-slate-700'
          let quickAddClass =
            'border-slate-300/80 text-slate-500 hover:text-slate-800 hover:border-slate-400 hover:bg-white'

          if (st.category === 'IN_PROGRESS') {
            colorBadge = 'bg-indigo-600'
            countBadgeClass = 'bg-indigo-100 text-indigo-700'
          } else if (st.category === 'DONE') {
            colorBadge = 'bg-emerald-500'
            countBadgeClass = 'bg-emerald-100 text-emerald-800'
            quickAddClass =
              'border-emerald-200 text-emerald-700 hover:text-emerald-900 hover:border-emerald-400 hover:bg-white'
          }

          return {
            id: st.id,
            title: st.name,
            category: st.category,
            colorBadge,
            countBadgeClass,
            wrapperClass: 'bg-slate-100/60 border border-slate-200/70',
            quickAddClass,
            wipLimit: st.wipLimit ?? null,
            tasks: [],
          }
        })
        setColumns(dynamicCols)
      }
    } catch (err) {
      console.error('Failed to load initial board data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [projectParam, selectedSprintId])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  // 2. Tải tasks cho bảng
  const loadTasksForBoard = useCallback(async () => {
    if (!projectParam) return
    if (isStrictScrum && !selectedSprintId) {
      setAllTasks([])
      return
    }
    try {
      const params = isScrum && selectedSprintId ? { sprintId: selectedSprintId } : {}
      const loadedTasks = await taskService.getProjectTasks(projectParam, params)
      setAllTasks(loadedTasks)
    } catch (err) {
      console.error('Failed to load tasks for board:', err)
    }
  }, [projectParam, isScrum, isStrictScrum, selectedSprintId])

  useEffect(() => {
    if (columns.length > 0) {
      loadTasksForBoard()
    }
  }, [columns.length, loadTasksForBoard])

  // 3. Lọc tasks
  const filterTask = useCallback(
    (task: TaskItem) => {
      if (task.type?.isModule) return false
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
      if (filters.moduleId && task.moduleId !== filters.moduleId) return false
      if (filters.labelId && !task.labels?.some((lb) => lb.id === filters.labelId)) return false

      return true
    },
    [filters],
  )

  const modules = useMemo(
    () => allTasks.filter((t) => Boolean(t.type?.isModule)),
    [allTasks],
  )

  const filteredTasks = useMemo(() => allTasks.filter(filterTask), [allTasks, filterTask])

  const displayedColumns = useMemo(() => {
    return columns.map((col) => ({
      ...col,
      tasks: filteredTasks.filter((t) => t.statusId === col.id),
    }))
  }, [columns, filteredTasks])

  // 4. Kéo thả qua useDragAndDrop
  const findColumnIdOfItem = useCallback(
    (id: string): string | null => {
      if (columns.some((c) => c.id === id)) return id
      const task = allTasks.find((t) => t.id === id)
      return task ? task.statusId : null
    },
    [columns, allTasks],
  )

  const handleStartDrag = useCallback(() => {
    previousTasksRef.current = [...allTasks]
  }, [allTasks])

  const handleHoverMove = useCallback(
    (activeId: string, overId: string) => {
      const sourceColId = findColumnIdOfItem(activeId)
      const targetColId = findColumnIdOfItem(overId)

      if (!sourceColId || !targetColId || sourceColId === targetColId) return

      setAllTasks((prev) => {
        const activeIdx = prev.findIndex((t) => t.id === activeId)
        if (activeIdx === -1) return prev

        const targetColTasks = prev.filter((t) => t.statusId === targetColId && t.id !== activeId)
        const overIdxInCol = targetColTasks.findIndex((t) => t.id === overId)

        let targetPos = 1000
        if (overIdxInCol >= 0) {
          targetPos = targetColTasks[overIdxInCol].position ?? 1000
        } else if (targetColTasks.length > 0) {
          targetPos = (targetColTasks[targetColTasks.length - 1].position ?? 0) + 1000
        }

        const updated = [...prev]
        updated[activeIdx] = {
          ...updated[activeIdx],
          statusId: targetColId,
          position: targetPos,
        }
        return updated
      })
    },
    [findColumnIdOfItem],
  )

  const handleDropMove = useCallback(
    (activeId: string, overId: string) => {
      const targetColId = findColumnIdOfItem(overId)
      if (!targetColId) {
        setAllTasks(previousTasksRef.current)
        return
      }

      const pristineTasks = previousTasksRef.current
      const activeTaskPristine = pristineTasks.find((t) => t.id === activeId)
      if (!activeTaskPristine) return

      const colTasksSorted = allTasks
        .filter((t) => t.statusId === targetColId)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

      const calculatedPosition = resolveDropPosition(colTasksSorted, activeId, overId)

      setAllTasks((prev) => {
        const currentItem = prev.find((t) => t.id === activeId) || activeTaskPristine
        const withoutActive = prev.filter((t) => t.id !== activeId)
        const updatedActive = {
          ...currentItem,
          statusId: targetColId,
          position: calculatedPosition,
        }
        return [...withoutActive, updatedActive].sort(
          (a, b) => (a.position ?? 0) - (b.position ?? 0),
        )
      })

      scheduleDebouncedRef.current(activeId, async () => {
        try {
          const movedTask = await taskService.moveProjectTask(projectParam, activeId, {
            statusId: targetColId,
            position: calculatedPosition,
          })
          if (movedTask?.workflowWarning) {
            setWarningMessage(movedTask.workflowWarning)
            setTimeout(() => setWarningMessage(null), 6000)
          } else {
            setWarningMessage(null)
          }
        } catch (err: any) {
          console.error('Failed to persist task position:', err)
          setAllTasks(pristineTasks)
          const detailMsg =
            err?.response?.data?.message ||
            err?.message ||
            'Không thể di chuyển công việc theo quy trình hiện tại!'
          setErrorMessage(detailMsg)
          setTimeout(() => setErrorMessage(null), 6000)
        }
      })
    },
    [allTasks, findColumnIdOfItem, projectParam],
  )

  const handleCancelDrag = useCallback(() => {
    setAllTasks(previousTasksRef.current)
  }, [])

  const dragDrop = useDragAndDrop<TaskItem>({
    items: allTasks,
    getItemId: (t) => t.id,
    onStartDrag: handleStartDrag,
    onHoverMove: handleHoverMove,
    onDropMove: handleDropMove,
    onCancelDrag: handleCancelDrag,
    debounceMs: 0,
  })

  scheduleDebouncedRef.current = dragDrop.scheduleDebounced

  // 5. Thêm nhanh task vào cột
  const handleQuickAddTask = async (columnId: string) => {
    const title = quickTaskTitle.trim()
    if (!title || !projectParam || isSubmittingQuickAdd) return

    try {
      setIsSubmittingQuickAdd(true)
      await taskService.createProjectTask(projectParam, {
        title,
        statusId: columnId,
        sprintId: isScrum && currentSprint ? currentSprint.id : null,
      })
      setQuickTaskTitle('')
      setQuickAddColumnId(null)
      await loadTasksForBoard()
    } catch (err: any) {
      console.error('Failed to quick add task:', err)
      const msg = err?.response?.data?.message || err?.message || 'Không thể tạo công việc'
      setErrorMessage(msg)
      setTimeout(() => setErrorMessage(null), 5000)
    } finally {
      setIsSubmittingQuickAdd(false)
    }
  }

  return {
    columns,
    displayedColumns,
    allTasks,
    filteredTasks,
    members,
    workTypes,
    labels,
    modules,
    filters,
    setFilters,
    isScrum,
    isStrictScrum,
    isViewingCompletedSprint,
    canMutateBoard,
    startedSprints,
    currentSprint,
    plannedSprints,
    selectedSprintId,
    setSelectedSprintId,
    isLoading,
    errorMessage,
    setErrorMessage,
    warningMessage,
    setWarningMessage,
    quickAddColumnId,
    setQuickAddColumnId,
    quickTaskTitle,
    setQuickTaskTitle,
    isSubmittingQuickAdd,
    handleQuickAddTask,
    isCreateModalOpen,
    setIsCreateModalOpen,
    createTaskInitialStatusId,
    setCreateTaskInitialStatusId,
    isCompleteModalOpen,
    setIsCompleteModalOpen,
    selectedTaskId,
    setSelectedTaskId,
    loadInitialData,
    loadTasksForBoard,
    dragDrop,
  }
}

export default useKanbanBoard
