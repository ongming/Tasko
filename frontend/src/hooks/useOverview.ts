import { useState, useMemo, useCallback, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { workspaceService } from '@/services/workspaceService'
import type { WorkspaceResponse } from '@/types/workspace'
import type {
  OverviewStats,
  MyTaskItem,
  ProjectSummary,
  DailyVelocity,
  TeamMemberStatus,
  ActivityItem,
  TaskCategory,
  NewTaskPayload,
} from '../types/overview'

const EMPTY_STATS: OverviewStats = {
  activeProjects: {
    count: 0,
    change: 'Chưa có dự án',
    quarter: 'Q4/2026',
  },
  tasksToday: {
    count: 0,
    highPriorityCount: 0,
    deadline: 'Không có hạn chót',
  },
  sprintProgress: {
    sprintName: 'Sprint',
    percent: 0,
    currentPoints: 0,
    totalPoints: 0,
    daysLeft: 0,
  },
  onlineMembers: {
    count: 1,
    total: 1,
    avatars: [],
  },
}

export function useOverview() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TaskCategory>('today')
  const [tasks, setTasks] = useState<MyTaskItem[]>([])
  const [stats] = useState<OverviewStats>(EMPTY_STATS)
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [velocity] = useState<DailyVelocity[]>([])
  const [teamMembers] = useState<TeamMemberStatus[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false)
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceResponse | null>(null)
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true)

  // Tự động tải danh sách workspace của user khi vào trang
  useEffect(() => {
    let isMounted = true
    workspaceService
      .getMyWorkspaces()
      .then((workspaces) => {
        if (isMounted && workspaces && workspaces.length > 0) {
          setCurrentWorkspace(workspaces[0])
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
  }, [])

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
    []
  )

  // Toggle task completion
  const handleToggleTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed
          return {
            ...t,
            completed: nextCompleted,
            category: nextCompleted ? 'completed' : 'today',
          }
        }
        return t
      })
    )
  }, [])

  // Create task
  const handleCreateTask = useCallback((payload: NewTaskPayload) => {
    const nextKeyNum = 101 + Math.floor(Math.random() * 50)
    const authorName = user?.full_name || 'Tôi'
    const initials = authorName.slice(0, 2).toUpperCase()

    const newTask: MyTaskItem = {
      id: `task-${Date.now()}`,
      key: `TK-${nextKeyNum}`,
      title: payload.title,
      project: payload.project,
      priority: payload.priority,
      dueTime: 'Hôm nay',
      assignee: { name: authorName, initials, bg: 'bg-indigo-600' },
      completed: false,
      category: 'today',
    }

    setTasks((prev) => [newTask, ...prev])
    setIsCreateModalOpen(false)

    // Add activity record
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        user: authorName,
        action: 'vừa tạo nhiệm vụ mới',
        taskKey: newTask.key,
        time: 'Vừa xong',
        dotColor: 'bg-indigo-600',
      },
      ...prev,
    ])
  }, [user])

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
    activities,
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
