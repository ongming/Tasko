import { api } from '@/lib/api'
import type { Project } from '@/types/workspace'
import type {
  ProjectMember,
  AddProjectMemberPayload,
  Role,
} from '@/types/member'

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

  /**
   * Cập nhật cấu hình dự án (ví dụ views, tabs)
   */
  updateProjectSettings: (projectId: string, settings: Record<string, any>) =>
    api.patch<Project>(`/projects/${encodeURIComponent(projectId)}/settings`, settings),

  /**
   * Xóa một dự án theo ID
   */
  deleteProject: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/projects/${encodeURIComponent(id)}`),

  /**
   * Lấy danh sách thành viên Dự án
   */
  getProjectMembers: (projectId: string) =>
    api.get<ProjectMember[]>(`/projects/${encodeURIComponent(projectId)}/members`),

  /**
   * Thêm thành viên vào Dự án
   */
  addProjectMember: (projectId: string, payload: AddProjectMemberPayload) =>
    api.post<ProjectMember>(`/projects/${encodeURIComponent(projectId)}/members`, payload),

  /**
   * Thay đổi vai trò thành viên Dự án
   */
  updateProjectMemberRole: (projectId: string, userId: string, roleId: string) =>
    api.patch<ProjectMember>(`/projects/${encodeURIComponent(projectId)}/members/${encodeURIComponent(userId)}/role`, {
      roleId,
    }),

  /**
   * Xóa thành viên khỏi Dự án
   */
  removeProjectMember: (projectId: string, userId: string) =>
    api.delete<{ success: boolean; message: string }>(
      `/projects/${encodeURIComponent(projectId)}/members/${encodeURIComponent(userId)}`,
    ),

  /**
   * Chuyển quyền sở hữu Dự án
   */
  transferProjectOwnership: (projectId: string, targetUserId: string) =>
    api.patch<{ success: boolean; message: string }>(
      `/projects/${encodeURIComponent(projectId)}/transfer-ownership`,
      { targetUserId },
    ),

  /**
   * Lấy danh sách Vai trò (Role)
   */
  getRoles: (scope?: 'WORKSPACE' | 'PROJECT') =>
    api.get<Role[]>(scope ? `/roles?scope=${encodeURIComponent(scope)}` : '/roles'),
}
