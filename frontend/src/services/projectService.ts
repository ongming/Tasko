import { api } from '@/lib/api'
import type { Project } from '@/types/workspace'

export interface CreateProjectPayload {
  name: string
  key: string
  color?: string
}

export const projectService = {
  /**
   * Lấy danh sách tất cả dự án trong Workspace
   */
  getProjects: async (): Promise<Project[]> => {
    try {
      const response = await api.get<{ data: Project[] }>('/projects')
      return response.data || []
    } catch {
      // Fallback khi backend chưa mở rộng endpoint projects
      return []
    }
  },

  /**
   * Lấy chi tiết 1 dự án theo ID
   */
  getProjectById: async (id: string): Promise<Project | null> => {
    try {
      const response = await api.get<{ data: Project }>(`/projects/${id}`)
      return response.data
    } catch {
      return null
    }
  },

  /**
   * Tạo dự án mới
   */
  createProject: async (payload: CreateProjectPayload): Promise<Project> => {
    const response = await api.post<{ data: Project }>('/projects', payload)
    return response.data
  },
}
