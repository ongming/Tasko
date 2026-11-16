import { api } from '@/lib/api'
import type {
  Task,
  TaskItem,
  CreateTaskPayload,
  UpdateTaskPayload,
  MoveTaskPayload,
} from '@/types/task'

export type { CreateTaskPayload }

export const taskService = {
  /**
   * Lấy danh sách task của một dự án (hỗ trợ lọc theo sprintId hoặc isBacklog)
   */
  async getProjectTasks(
    projectIdOrKey: string,
    params?: { sprintId?: string; isBacklog?: boolean },
  ): Promise<TaskItem[]> {
    try {
      const query = new URLSearchParams()
      if (params?.sprintId) query.set('sprintId', params.sprintId)
      if (params?.isBacklog !== undefined) query.set('isBacklog', String(params.isBacklog))
      const qs = query.toString() ? `?${query.toString()}` : ''

      const res = await api.get<TaskItem[]>(`/projects/${projectIdOrKey}/tasks${qs}`)
      return res || []
    } catch {
      return []
    }
  },

  /**
   * Tạo task mới trong dự án (Backlog hoặc Sprint)
   */
  async createProjectTask(
    projectIdOrKey: string,
    payload: CreateTaskPayload,
  ): Promise<TaskItem> {
    return api.post<TaskItem>(`/projects/${projectIdOrKey}/tasks`, payload)
  },

  /**
   * Lấy chi tiết một task
   */
  async getTaskById(projectIdOrKey: string, taskId: string): Promise<TaskItem> {
    return api.get<TaskItem>(`/projects/${projectIdOrKey}/tasks/${taskId}`)
  },

  /**
   * Cập nhật thông tin task
   */
  async updateProjectTask(
    projectIdOrKey: string,
    taskId: string,
    payload: UpdateTaskPayload,
  ): Promise<TaskItem> {
    return api.patch<TaskItem>(`/projects/${projectIdOrKey}/tasks/${taskId}`, payload)
  },

  /**
   * Di chuyển task (đổi sprint, đổi status, đổi vị trí)
   */
  async moveProjectTask(
    projectIdOrKey: string,
    taskId: string,
    payload: MoveTaskPayload,
  ): Promise<TaskItem> {
    return api.patch<TaskItem>(`/projects/${projectIdOrKey}/tasks/${taskId}/move`, payload)
  },

  /**
   * Xóa task
   */
  async deleteProjectTask(projectIdOrKey: string, taskId: string): Promise<void> {
    await api.delete(`/projects/${projectIdOrKey}/tasks/${taskId}`)
  },

  // ==========================================
  // LEGACY FALLBACK METHODS (Cho các component cũ)
  // ==========================================
  getTasks: async (projectId?: string): Promise<Task[]> => {
    try {
      const endpoint = projectId ? `/tasks?projectId=${projectId}` : '/tasks'
      const response = await api.get<Task[]>(endpoint)
      return response || []
    } catch {
      return []
    }
  },

  createTask: async (payload: { title: string; projectId?: string; status?: string }): Promise<Task> => {
    return {
      id: `TSK-${Math.floor(100 + Math.random() * 900)}`,
      title: payload.title,
      status: payload.status || 'Backlog',
      statusColor: 'bg-slate-100 text-slate-700',
      tag: 'Chung',
      dueDate: 'Hôm nay',
      points: 1,
      assignees: [],
      isDone: false,
    }
  },

  updateTaskStatus: async (_taskId: string, _status: string): Promise<{ success: boolean }> => {
    return { success: true }
  },

  toggleTask: async (_taskId: string, _isDone: boolean): Promise<{ success: boolean }> => {
    return { success: true }
  },
}
