import { useState, useMemo, useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { workspaceService } from '@/services/workspaceService'
import { projectService } from '@/services/projectService'
import { sprintService } from '@/services/sprintService'
import { taskService } from '@/services/taskService'
import { isScrumProject } from '@/utils/projectMethod'
import { formatLocalDateKey } from '@/utils/dateFormat'
import type { WorkspaceResponse } from '@/types/workspace'
import type {
  OverviewStats,
  MyTaskItem,
  ProjectSummary,
  DailyVelocity,
  TeamMemberStatus,
  TaskCategory,
  TaskPriority,
  NewTaskPayload,
} from '../types/overview'

const EMPTY_STATS: OverviewStats = {
  activeProjects: {
    count: 0,
    detail: 'Chưa có dự án',
    methodLabel: 'Workspace',
  },
  tasksToday: {
    count: 0,
    highPriorityCount: 0,
    overdueCount: 0,
  },
  sprintProgress: {
    sprintName: 'Sprint',
    percent: 0,
    currentPoints: 0,
    totalPoints: 0,
    daysLeft: null,
    hasActiveSprint: false,
  },
  workspaceMembers: {
    count: 1,
    avatars: [],
  },
}

const AVATAR_COLORS = [
  'bg-indigo-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-purple-600',
  'bg-sky-600',
]

function mapPriority(priority?: string): TaskPriority {
  const p = priority?.toUpperCase()
  if (p === 'URGENT' || p === 'HIGH') return 'high'
  if (p === 'LOW') return 'low'
  return 'medium'
}

export function useOverview() {
  const { user } = useAuthStore()
  const { workspaceSlug } = useParams<{ workspaceSlug?: string }>()
  const [activeTab, setActiveTab] = useState<TaskCategory>('today')
  const [tasks, setTasks] = useState<MyTaskItem[]>([])
  const [stats, setStats] = useState<OverviewStats>(EMPTY_STATS)
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [velocity, setVelocity] = useState<DailyVelocity[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMemberStatus[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false)
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceResponse | null>(null)
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true)

  // Tự động tải danh sách workspace và chọn đúng workspace theo URL slug (nếu có)
  useEffect(() => {
    let isMounted = true
    workspaceService
      .getMyWorkspaces()
      .then((workspaces) => {
        if (isMounted && workspaces && workspaces.length > 0) {
          const matched = workspaceSlug
            ? workspaces.find((w) => w.slug === workspaceSlug) || workspaces[0]
            : workspaces[0]
          setCurrentWorkspace(matched)
        }
      })
      .catch(() => {
        // Giữ null nếu chưa có workspace
      })
      .finally(() => {
        if (isMounted) setIsLoadingWorkspaces(false)
      })

    return () => {
      isMounted = false
    }
  }, [workspaceSlug])

  // Đồng bộ khi có workspace tạo từ Sidebar
  useEffect(() => {
    const handleWorkspaceUpdated = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail) {
        setCurrentWorkspace(customEvent.detail)
      }
    }
    window.addEventListener('workspace-updated', handleWorkspaceUpdated)
    return () => window.removeEventListener('workspace-updated', handleWorkspaceUpdated)
  }, [])

  // Tải toàn bộ dữ liệu thật cho Workspace: dự án, tasks, sprints, thành viên
  const loadWorkspaceOverview = useCallback(async () => {
    if (!currentWorkspace?.id) {
      setProjects([])
      setTasks([])
      setVelocity([])
      setTeamMembers([])
      setStats(EMPTY_STATS)
      return
    }

    try {
      const [loadedProjects, loadedMembers] = await Promise.all([
        projectService.getProjects(currentWorkspace.id).catch(() => []),
        workspaceService.getMembers(currentWorkspace.id).catch(() => []),
      ])

      const projectList = loadedProjects || []
      const memberList = Array.isArray(loadedMembers) ? loadedMembers : []

      // Map danh sách thành viên thật
      const mappedMembers: TeamMemberStatus[] = memberList.map((m, idx) => {
        const name = m.user?.fullName || m.user?.email || 'Thành viên'
        return {
          id: m.userId || m.id,
          name,
          role: m.role?.name || 'Thành viên',
          initials: name.slice(0, 2).toUpperCase(),
          bg: AVATAR_COLORS[idx % AVATAR_COLORS.length],
        }
      })
      setTeamMembers(mappedMembers)

      // Tải tasks, statuses, sprints song song cho từng dự án
      const projectDetails = await Promise.all(
        projectList.map(async (p) => {
          const isScrum = isScrumProject(p)
          const [projTasks, projStatuses, projSprints] = await Promise.all([
            taskService.getProjectTasks(p.id).catch(() => []),
            projectService.getProjectStatuses(p.id).catch(() => []),
            isScrum ? sprintService.getSprints(p.id).catch(() => []) : Promise.resolve([]),
          ])
          return { project: p, isScrum, projTasks, projStatuses, projSprints }
        }),
      )

      const now = new Date()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      const endOfToday = startOfToday + 24 * 60 * 60 * 1000 - 1

      let scrumProjectCount = 0
      let kanbanProjectCount = 0
      let primaryActiveSprint: {
        name: string
        completedPoints: number
        totalPoints: number
        daysLeft: number | null
      } | null = null

      const allMyTasks: MyTaskItem[] = []
      const allDoneTasksForVelocity: Array<{ updatedAt?: string }> = []

      const mappedProjects: ProjectSummary[] = projectDetails.map(
        ({ project: p, isScrum, projTasks, projStatuses, projSprints }) => {
          if (isScrum) scrumProjectCount += 1
          else kanbanProjectCount += 1

          const activeSprint = projSprints.find((s) => s.status === 'ACTIVE') || null
          if (activeSprint && !primaryActiveSprint) {
            const daysLeft = activeSprint.endDate
              ? Math.ceil(
                  (new Date(activeSprint.endDate).setHours(23, 59, 59, 999) - Date.now()) /
                    (1000 * 60 * 60 * 24),
                )
              : null
            primaryActiveSprint = {
              name: activeSprint.name,
              completedPoints: activeSprint.completedPoints || 0,
              totalPoints: activeSprint.totalPoints || 0,
              daysLeft,
            }
          }

          const totalCount = projTasks.length
          const doneCount = projTasks.filter((t) => t.status?.category === 'DONE').length
          const bugsCount = projTasks.filter(
            (t) =>
              t.status?.category !== 'DONE' &&
              t.type?.name?.toLowerCase().includes('bug'),
          ).length
          const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

          const doneStatus = projStatuses.find((s) => s.category === 'DONE')
          const todoStatus = projStatuses.find((s) => s.category === 'TODO') || projStatuses[0]
          const slug = currentWorkspace.slug || 'workspace'
          const boardRoute = `/${slug}/${p.key || p.id}/${isScrum && !activeSprint ? 'backlog' : 'board'}`

          projTasks.forEach((t) => {
            if (t.status?.category === 'DONE') {
              allDoneTasksForVelocity.push({ updatedAt: t.updatedAt })
            }

            if (user?.id && t.assigneeId !== user.id) return

            const isDone = t.status?.category === 'DONE'
            const isInProgress = t.status?.category === 'IN_PROGRESS'
            const dueMs = t.dueDate ? new Date(t.dueDate).getTime() : null

            let category: TaskCategory = 'today'
            if (isDone) {
              category = 'completed'
            } else if (dueMs !== null && dueMs < startOfToday) {
              category = 'overdue'
            } else if (isInProgress) {
              category = 'in_progress'
            } else {
              category = 'today'
            }

            let dueTime = 'Chưa đặt hạn'
            if (t.dueDate) {
              if (dueMs !== null && dueMs >= startOfToday && dueMs <= endOfToday) {
                dueTime = 'Hôm nay'
              } else {
                dueTime = new Date(t.dueDate).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                })
              }
            }

            const assigneeName = t.assignee?.name || user?.full_name || 'Tôi'
            allMyTasks.push({
              id: t.id,
              key: t.taskKey,
              title: t.title,
              project: p.name,
              projectId: p.id,
              boardRoute,
              doneStatusId: doneStatus?.id,
              todoStatusId: todoStatus?.id,
              priority: mapPriority(t.priority),
              dueTime,
              assignee: {
                name: assigneeName,
                initials: assigneeName.slice(0, 2).toUpperCase(),
                bg: p.color || 'bg-indigo-600',
              },
              completed: isDone,
              category,
            })
          })

          return {
            id: p.id,
            code: p.key || 'PROJ',
            sprint: activeSprint
              ? activeSprint.name
              : isScrum
                ? 'Chưa chạy Sprint'
                : 'Kanban',
            statusTag: isScrum ? (activeSprint ? 'Đang chạy Sprint' : 'Scrum') : 'Kanban',
            statusColor: isScrum ? 'indigo' : 'emerald',
            title: p.name,
            description: p.description || 'Dự án quản lý công việc và quy trình Agile',
            progress,
            tasksCount: totalCount,
            bugsCount,
            lead: {
              name: user?.full_name || 'Project Lead',
              initials: (user?.full_name || 'PL').slice(0, 2).toUpperCase(),
              bg: p.color || 'bg-indigo-600',
            },
            boardRoute,
          }
        },
      )

      setProjects(mappedProjects)
      setTasks(allMyTasks)

      // Tính năng suất 5 ngày gần nhất từ task DONE thật
      const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
      const velocityDays: DailyVelocity[] = []
      for (let offset = 4; offset >= 0; offset -= 1) {
        const d = new Date()
        d.setDate(d.getDate() - offset)
        const key = formatLocalDateKey(d)
        const count = allDoneTasksForVelocity.filter(
          (item) => item.updatedAt && formatLocalDateKey(new Date(item.updatedAt)) === key,
        ).length
        velocityDays.push({
          day: offset === 0 ? 'H.nay' : dayLabels[d.getDay()],
          tasks: count,
          isToday: offset === 0,
        })
      }
      const maxTasks = Math.max(...velocityDays.map((v) => v.tasks), 0)
      const totalVel = velocityDays.reduce((s, v) => s + v.tasks, 0)
      setVelocity(
        totalVel > 0
          ? velocityDays.map((v) => ({ ...v, isPeak: maxTasks > 0 && v.tasks === maxTasks }))
          : [],
      )

      // Tính KPIs tổng quan
      const openTasks = allMyTasks.filter((t) => !t.completed)
      const highPriorityCount = openTasks.filter((t) => t.priority === 'high').length
      const overdueCount = allMyTasks.filter((t) => t.category === 'overdue').length

      const activeSprintInfo = primaryActiveSprint as {
        name: string
        completedPoints: number
        totalPoints: number
        daysLeft: number | null
      } | null

      const allTasksCount = mappedProjects.reduce((s, p) => s + p.tasksCount, 0)
      const avgProgress =
        mappedProjects.length > 0
          ? Math.round(mappedProjects.reduce((s, p) => s + p.progress, 0) / mappedProjects.length)
          : 0

      setStats({
        activeProjects: {
          count: mappedProjects.length,
          detail: `${scrumProjectCount} Scrum · ${kanbanProjectCount} Kanban`,
          methodLabel: `${allTasksCount} công việc`,
        },
        tasksToday: {
          count: openTasks.length,
          highPriorityCount,
          overdueCount,
        },
        sprintProgress: activeSprintInfo
          ? {
              sprintName: activeSprintInfo.name,
              percent:
                activeSprintInfo.totalPoints > 0
                  ? Math.round((activeSprintInfo.completedPoints / activeSprintInfo.totalPoints) * 100)
                  : 0,
              currentPoints: activeSprintInfo.completedPoints,
              totalPoints: activeSprintInfo.totalPoints,
              daysLeft: activeSprintInfo.daysLeft,
              hasActiveSprint: true,
            }
          : {
              sprintName: 'tiến độ chung',
              percent: avgProgress,
              currentPoints: 0,
              totalPoints: 0,
              daysLeft: null,
              hasActiveSprint: false,
            },
        workspaceMembers: {
          count: Math.max(1, mappedMembers.length),
          avatars: mappedMembers.slice(0, 4).map((m) => ({
            id: m.id,
            name: m.name,
            initials: m.initials,
            bg: m.bg,
          })),
        },
      })
    } catch (err) {
      console.error('Failed to load overview data:', err)
    }
  }, [currentWorkspace?.id, currentWorkspace?.slug, user?.id, user?.full_name])

  useEffect(() => {
    loadWorkspaceOverview()
    const handleProjectCreated = () => loadWorkspaceOverview()
    window.addEventListener('project-created', handleProjectCreated)
    return () => window.removeEventListener('project-created', handleProjectCreated)
  }, [loadWorkspaceOverview])

  // Tạo workspace mới và lưu vào cơ sở dữ liệu qua Backend API
  const handleCreateWorkspace = useCallback(
    async (data: { workspaceName: string; workspaceSlug: string }) => {
      const created = await workspaceService.create({
        name: data.workspaceName,
        slug: data.workspaceSlug,
      })
      setCurrentWorkspace(created)
      setIsWorkspaceModalOpen(false)
      window.dispatchEvent(new CustomEvent('workspace-updated', { detail: created }))
    },
    [],
  )

  // Toggle task completion qua API thật
  const handleToggleTask = useCallback(
    async (taskId: string) => {
      const target = tasks.find((t) => t.id === taskId)
      if (!target) return
      const nextCompleted = !target.completed
      const nextStatusId = nextCompleted ? target.doneStatusId : target.todoStatusId

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                completed: nextCompleted,
                category: nextCompleted ? 'completed' : 'today',
              }
            : t,
        ),
      )

      if (nextStatusId) {
        try {
          await taskService.moveProjectTask(target.projectId, target.id, {
            statusId: nextStatusId,
          })
        } catch (err) {
          console.error('Failed to toggle task status:', err)
          await loadWorkspaceOverview()
        }
      }
    },
    [tasks, loadWorkspaceOverview],
  )

  // Tạo công việc thật qua API
  const handleCreateTask = useCallback(
    async (payload: NewTaskPayload) => {
      if (!payload.projectId) return
      const priorityMap: Record<TaskPriority, 'HIGH' | 'MEDIUM' | 'LOW'> = {
        high: 'HIGH',
        medium: 'MEDIUM',
        low: 'LOW',
      }
      await taskService.createProjectTask(payload.projectId, {
        title: payload.title,
        priority: priorityMap[payload.priority],
        assigneeId: user?.id,
      })
      setIsCreateModalOpen(false)
      await loadWorkspaceOverview()
    },
    [user?.id, loadWorkspaceOverview],
  )

  // Counts for tabs
  const tabCounts = useMemo(() => {
    return {
      today: tasks.filter((t) => t.category === 'today' && !t.completed).length,
      in_progress: tasks.filter((t) => t.category === 'in_progress' && !t.completed).length,
      overdue: tasks.filter((t) => t.category === 'overdue' && !t.completed).length,
      completed: tasks.filter((t) => t.completed || t.category === 'completed').length,
    }
  }, [tasks])

  // Filtered tasks based on activeTab
  const filteredTasks = useMemo(() => {
    if (activeTab === 'completed') {
      return tasks.filter((t) => t.completed || t.category === 'completed')
    }
    return tasks.filter((t) => t.category === activeTab && !t.completed)
  }, [tasks, activeTab])

  return {
    stats,
    projects,
    velocity,
    teamMembers,
    activeTab,
    tabCounts,
    filteredTasks,
    isCreateModalOpen,
    isWorkspaceModalOpen,
    currentWorkspace,
    isLoadingWorkspaces,
    setActiveTab,
    handleToggleTask,
    handleCreateTask,
    handleCreateWorkspace,
    openCreateModal: () => setIsCreateModalOpen(true),
    closeCreateModal: () => setIsCreateModalOpen(false),
    openWorkspaceModal: () => setIsWorkspaceModalOpen(true),
    closeWorkspaceModal: () => setIsWorkspaceModalOpen(false),
  }
}
