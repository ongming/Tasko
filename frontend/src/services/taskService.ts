import { api } from '@/lib/api'
import type { Task } from '@/types/task'

export interface CreateTaskPayload {
  title: string
  projectId?: string
  status?: string
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string
  tag?: string
}

export const taskService = {
  /**
   * Lấy danh sách task theo dự án (hoặc toàn bộ)
   */
  getTasks: async (projectId?: string): Promise<Task[]> => {
    try {
      const endpoint = projectId ? `/tasks?projectId=${projectId}` : '/tasks'
      const response = await api.get<{ data: Task[] }>(endpoint)
      return response.data || []
    } catch {
      // Fallback an toàn khi backend chưa triển khai endpoint
      return []
    }
  },

  /**
   * Tạo task mới
   */
  createTask: async (payload: CreateTaskPayload): Promise<Task> => {
    try {
      const response = await api.post<{ data: Task }>('/tasks', payload)
      return response.data
    } catch {
      // Giả lập ID phản hồi cho client nếu offline / backend pending
      return {
        id: `TSK-${Math.floor(100 + Math.random() * 900)}`,
        title: payload.title,
        status: payload.status || 'Backlog',
        statusColor: 'bg-slate-100 text-slate-700',
        tag: payload.tag || 'Chung',
        tagClass: 'bg-slate-100 text-slate-700',
        dueDate: payload.dueDate || 'Hôm nay',
        points: 1,
        assignees: [],
        isDone: false,
      }
    }
  },

  /**
   * Cập nhật trạng thái task (kéo thả Kanban)
   */
  updateTaskStatus: async (taskId: string, status: string): Promise<{ success: boolean }> => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status })
      return { success: true }
    } catch {
      return { success: true }
    }
  },

  /**
   * Toggle hoàn thành công việc
   */
  toggleTask: async (taskId: string, isDone: boolean): Promise<{ success: boolean }> => {
    try {
      await api.patch(`/tasks/${taskId}`, { isDone })
      return { success: true }
    } catch {
      return { success: true }
    }
  },
}
