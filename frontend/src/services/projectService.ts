import { api } from '@/lib/api'
import type { Project } from '@/types/workspace'
import type {
  ProjectMember,
  AddProjectMemberPayload,
  Role,
} from '@/types/member'
import type {
  ProjectStatus,
  ProjectWorkType,
  Workflow,
  WorkflowTransition,
  CustomField,
  CreateStatusPayload,
  UpdateStatusPayload,
  CreateWorkTypePayload,
  UpdateWorkTypePayload,
  CreateCustomFieldPayload,
  UpdateCustomFieldPayload,
  UpdateProjectSettingsPayload,
} from '@/types/projectConfig'

export type {
  ProjectStatus,
  ProjectWorkType,
  Workflow,
  WorkflowTransition,
  CustomField,
  CreateStatusPayload,
  UpdateStatusPayload,
  CreateWorkTypePayload,
  UpdateWorkTypePayload,
  CreateCustomFieldPayload,
  UpdateCustomFieldPayload,
  UpdateProjectSettingsPayload,
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
  members?: Array<{
    userId: string
    roleId?: string
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
   * Lấy chi tiết 1 dự án theo ID hoặc Key
   */
  getProjectById: (id: string) =>
    api.get<Project>(`/projects/${encodeURIComponent(id)}`),

  /**
   * Khởi tạo dự án mới
   */
  createProject: (payload: CreateProjectPayload) =>
    api.post<Project>('/projects', payload),

  /**
   * Cập nhật cấu hình dự án (views, methodology, thông tin chung)
   */
  updateProjectSettings: (projectId: string, payload: UpdateProjectSettingsPayload | Record<string, any>) =>
    api.patch<Project>(`/projects/${encodeURIComponent(projectId)}/settings`, payload),

  /**
   * Xóa mềm một dự án theo ID hoặc Key
   */
  deleteProject: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/projects/${encodeURIComponent(id)}`),

  // ==========================================
  // STATUSES & WIP LIMIT
  // ==========================================
  /**
   * Lấy danh sách Status (cột Kanban) của dự án
   */
  getProjectStatuses: (projectId: string) =>
    api.get<ProjectStatus[]>(`/projects/${encodeURIComponent(projectId)}/statuses`),

  /**
   * Tạo cột Status mới
   */
  createStatus: (projectId: string, payload: CreateStatusPayload) =>
    api.post<ProjectStatus>(`/projects/${encodeURIComponent(projectId)}/statuses`, payload),

  /**
   * Cập nhật cột Status & WIP Limit
   */
  updateStatus: (projectId: string, statusId: string, payload: UpdateStatusPayload) =>
    api.patch<ProjectStatus>(
      `/projects/${encodeURIComponent(projectId)}/statuses/${encodeURIComponent(statusId)}`,
      payload,
    ),

  /**
   * Xóa cột Status (kèm fallbackStatusId nếu cột đang có task)
   */
  deleteStatus: (projectId: string, statusId: string, fallbackStatusId?: string) => {
    const qs = fallbackStatusId ? `?fallbackStatusId=${encodeURIComponent(fallbackStatusId)}` : ''
    return api.delete<{ success: boolean; message: string }>(
      `/projects/${encodeURIComponent(projectId)}/statuses/${encodeURIComponent(statusId)}${qs}`,
      fallbackStatusId ? { body: JSON.stringify({ fallbackStatusId }) } : undefined,
    )
  },

  // ==========================================
  // WORK TYPES
  // ==========================================
  /**
   * Lấy danh sách WorkType của dự án
   */
  getProjectWorkTypes: (projectId: string) =>
    api.get<ProjectWorkType[]>(`/projects/${encodeURIComponent(projectId)}/work-types`),

  /**
   * Tạo loại công việc mới
   */
  createWorkType: (projectId: string, payload: CreateWorkTypePayload) =>
    api.post<ProjectWorkType>(`/projects/${encodeURIComponent(projectId)}/work-types`, payload),

  /**
   * Cập nhật loại công việc hoặc gán workflowId
   */
  updateWorkType: (projectId: string, workTypeId: string, payload: UpdateWorkTypePayload) =>
    api.patch<ProjectWorkType>(
      `/projects/${encodeURIComponent(projectId)}/work-types/${encodeURIComponent(workTypeId)}`,
      payload,
    ),

  /**
   * Xóa loại công việc (kèm fallbackWorkTypeId nếu đang có task)
   */
  deleteWorkType: (projectId: string, workTypeId: string, fallbackWorkTypeId?: string) => {
    const qs = fallbackWorkTypeId ? `?fallbackWorkTypeId=${encodeURIComponent(fallbackWorkTypeId)}` : ''
    return api.delete<{ success: boolean; message: string }>(
      `/projects/${encodeURIComponent(projectId)}/work-types/${encodeURIComponent(workTypeId)}${qs}`,
      fallbackWorkTypeId ? { body: JSON.stringify({ fallbackWorkTypeId }) } : undefined,
    )
  },

  // ==========================================
  // WORKFLOWS & TRANSITIONS
  // ==========================================
  /**
   * Lấy danh sách Workflows kèm Transitions của dự án
   */
  getWorkflows: (projectId: string) =>
    api.get<Workflow[]>(`/projects/${encodeURIComponent(projectId)}/workflows`),

  /**
   * Tạo Workflow mới
   */
  createWorkflow: (projectId: string, name: string) =>
    api.post<Workflow>(`/projects/${encodeURIComponent(projectId)}/workflows`, { name }),

  /**
   * Đổi tên Workflow
   */
  updateWorkflow: (projectId: string, workflowId: string, name: string) =>
    api.patch<Workflow>(
      `/projects/${encodeURIComponent(projectId)}/workflows/${encodeURIComponent(workflowId)}`,
      { name },
    ),

  /**
   * Xóa Workflow
   */
  deleteWorkflow: (projectId: string, workflowId: string) =>
    api.delete<{ success: boolean; message: string }>(
      `/projects/${encodeURIComponent(projectId)}/workflows/${encodeURIComponent(workflowId)}`,
    ),

  /**
   * Cập nhật ma trận Transitions cho Workflow
   */
  updateWorkflowTransitions: (
    projectId: string,
    workflowId: string,
    transitions: Array<{ fromStatusId: string; toStatusId: string; conditions?: Record<string, any> }>,
  ) =>
    api.put<WorkflowTransition[]>(
      `/projects/${encodeURIComponent(projectId)}/workflows/${encodeURIComponent(workflowId)}/transitions`,
      { transitions },
    ),

  // ==========================================
  // CUSTOM FIELDS
  // ==========================================
  /**
   * Lấy danh sách trường tùy chỉnh (Custom Fields)
   */
  getCustomFields: (projectId: string) =>
    api.get<CustomField[]>(`/projects/${encodeURIComponent(projectId)}/custom-fields`),

  /**
   * Tạo trường tùy chỉnh mới
   */
  createCustomField: (projectId: string, payload: CreateCustomFieldPayload) =>
    api.post<CustomField>(`/projects/${encodeURIComponent(projectId)}/custom-fields`, payload),

  /**
   * Cập nhật trường tùy chỉnh
   */
  updateCustomField: (projectId: string, fieldId: string, payload: UpdateCustomFieldPayload) =>
    api.patch<CustomField>(
      `/projects/${encodeURIComponent(projectId)}/custom-fields/${encodeURIComponent(fieldId)}`,
      payload,
    ),

  /**
   * Xóa trường tùy chỉnh
   */
  deleteCustomField: (projectId: string, fieldId: string) =>
    api.delete<{ success: boolean; message: string }>(
      `/projects/${encodeURIComponent(projectId)}/custom-fields/${encodeURIComponent(fieldId)}`,
    ),

  // ==========================================
  // PROJECT MEMBERS & ROLES
  // ==========================================
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
