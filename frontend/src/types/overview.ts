export type TaskPriority = 'high' | 'medium' | 'low'

export type TaskCategory = 'today' | 'in_progress' | 'overdue' | 'completed'

export interface OverviewStats {
  activeProjects: {
    count: number
    detail: string
    methodLabel: string
  }
  tasksToday: {
    count: number
    highPriorityCount: number
    overdueCount: number
  }
  sprintProgress: {
    sprintName: string
    percent: number
    currentPoints: number
    totalPoints: number
    daysLeft: number | null
    hasActiveSprint: boolean
  }
  workspaceMembers: {
    count: number
    avatars: {
      id: string
      name: string
      initials: string
      bg: string
    }[]
  }
}

export interface MyTaskItem {
  id: string
  key: string
  title: string
  project: string
  projectId: string
  boardRoute: string
  doneStatusId?: string
  todoStatusId?: string
  priority: TaskPriority
  dueTime: string
  assignee: {
    name: string
    initials: string
    bg: string
  }
  completed: boolean
  category: TaskCategory
}

export interface ProjectSummary {
  id: string
  code: string
  sprint: string
  statusTag: string
  statusColor: 'emerald' | 'indigo' | 'purple'
  title: string
  description: string
  progress: number
  tasksCount: number
  bugsCount: number
  lead: {
    name: string
    initials: string
    bg: string
  }
  boardRoute: string
}

export interface DailyVelocity {
  day: string
  tasks: number
  isPeak?: boolean
  isToday?: boolean
  isProjected?: boolean
}

export interface TeamMemberStatus {
  id: string
  name: string
  role: string
  initials: string
  bg: string
}

export interface NewTaskPayload {
  title: string
  projectId: string
  priority: TaskPriority
}
