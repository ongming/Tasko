import { api } from '@/lib/api'
import type { Project } from '@/types/workspace'

export interface CreateProjectPayload {
  name: string
  key: string
  workspaceId: string
  color?: string
  description?: string
}

export const projectService = {
  /**
   * Lấy danh sách tất cả dự án trong một Workspace (hoặc toàn bộ dự án của user)
   */
  getProjects: (workspaceId?: string) =>
    api.get<Project[]>(workspaceId ? `/projects?workspaceId=${encodeURIComponent(workspaceId)}` : '/projects'),

  /**
   * Lấy chi tiết 1 dự án theo ID
   */
  getProjectById: (id: string) =>
    api.get<Project>(`/projects/${encodeURIComponent(id)}`),

  /**
   * Khởi tạo dự án mới
   */
  createProject: (payload: CreateProjectPayload) =>
    api.post<Project>('/projects', payload),
}
