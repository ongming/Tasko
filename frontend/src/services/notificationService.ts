import { api } from '@/lib/api'
import type { NotificationItem, NotificationListResponse } from '@/types/notification'

export const notificationService = {
  async getNotifications(unreadOnly = false): Promise<NotificationListResponse> {
    const qs = unreadOnly ? '?unreadOnly=true' : ''
    return api.get<NotificationListResponse>(`/notifications${qs}`)
  },

  async markAsRead(id: string): Promise<NotificationItem> {
    return api.patch<NotificationItem>(`/notifications/${id}/read`)
  },

  async markAllAsRead(): Promise<{ success: boolean }> {
    return api.patch<{ success: boolean }>('/notifications/read-all')
  },

  async checkDueSoon(): Promise<{
    checkedCount: number
    notifiedCount: number
    emailedUsers: number
  }> {
    return api.post('/notifications/check-due-soon')
  },
}
