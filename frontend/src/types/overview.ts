export type TaskPriority = 'high' | 'medium' | 'low'

export type TaskCategory = 'today' | 'in_progress' | 'overdue' | 'completed'

export interface OverviewStats {
  activeProjects: {
    count: number
    change: string
    quarter: string
  }
  tasksToday: {
    count: number
    highPriorityCount: number
    deadline: string
  }
  sprintProgress: {
    sprintName: string
    percent: number
    currentPoints: number
    totalPoints: number
    daysLeft: number
  }
  onlineMembers: {
    count: number
    total: number
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
  statusText: string
  statusDotColor: string
  statusBadgeColor: string
}

export interface ActivityItem {
  id: string
  user?: string
  action: string
  taskKey?: string
  target?: string
  status?: string
  time: string
  dotColor: string
  isAi?: boolean
  aiDescription?: string
}

export interface NewTaskPayload {
  title: string
  project: string
  priority: TaskPriority
}
