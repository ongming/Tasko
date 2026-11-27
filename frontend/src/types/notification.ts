export type NotificationType =
  | 'ASSIGNED'
  | 'COMMENTED'
  | 'STATUS_CHANGED'
  | 'DUE_SOON'
  | 'PROJECT_INVITED'
  | string

export interface NotificationDataPayload {
  workspaceSlug?: string
  projectId?: string
  projectKey?: string
  taskId?: string
  taskKey?: string
  remindDate?: string
}

export interface NotificationItem {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: NotificationDataPayload | null
  isRead: boolean
  createdAt: string
}

export interface NotificationListResponse {
  items: NotificationItem[]
  unreadCount: number
}
