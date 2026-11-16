export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED'

export interface Sprint {
  id: string
  projectId: string
  name: string
  goal?: string | null
  status: SprintStatus
  startDate?: string | null
  endDate?: string | null
  position: number
  taskCount?: number
  completedTaskCount?: number
  totalPoints?: number
  completedPoints?: number
}

export interface CreateSprintPayload {
  name?: string
  goal?: string
  startDate?: string
  endDate?: string
  position?: number
}

export interface StartSprintPayload {
  name?: string
  goal?: string
  startDate: string
  endDate: string
}

export interface CompleteSprintPayload {
  targetSprintId?: string | null
}
