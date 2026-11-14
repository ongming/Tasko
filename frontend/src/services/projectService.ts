import { api } from '@/lib/api'
import type { Project } from '@/types/workspace'

export interface ProjectStatus {
  id: string
  project_id: string
  name: string
  category: 'TODO' | 'IN_PROGRESS' | 'DONE'
  color: string
  position: number
  is_default: boolean
}

export interface ProjectWorkType {
  id: string
  project_id: string
  name: string
  icon: string
  color: string
  is_default: boolean
}

export interface CreateProjectPayload {
  name: string
  key: string
  workspaceId: string
  color?: string
  description?: string
  workflow?: Array<{
    label: string
    category?: 'TODO' | 'IN_PROGRESS' | 'DONE'
    color?: string
  }>
  workTypes?: Array<{
    label: string
    icon?: string
    color?: string
  }>
  settings?: Record<string, any>
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
   * Lấy danh sách Status (cột Kanban) của dự án
   */
  getProjectStatuses: (projectId: string) =>
    api.get<ProjectStatus[]>(`/projects/${encodeURIComponent(projectId)}/statuses`),

  /**
   * Lấy danh sách WorkType của dự án
   */
  getProjectWorkTypes: (projectId: string) =>
    api.get<ProjectWorkType[]>(`/projects/${encodeURIComponent(projectId)}/work-types`),

  /**
   * Khởi tạo dự án mới
   */
  createProject: (payload: CreateProjectPayload) =>
    api.post<Project>('/projects', payload),
}
