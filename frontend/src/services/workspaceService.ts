import { api } from '@/lib/api'
import type {
  CreateWorkspacePayload,
  WorkspaceResponse,
} from '@/types/workspace'
import type { WorkspaceMemberItem } from '@/types/member'

export const workspaceService = {
  /**
   * Tạo không gian làm việc mới và lưu vào cơ sở dữ liệu
   */
  create: (payload: CreateWorkspacePayload) =>
    api.post<WorkspaceResponse>('/workspaces', payload),

  /**
   * Lấy danh sách tất cả các workspace mà người dùng hiện tại tham gia
   */
  getMyWorkspaces: () =>
    api.get<WorkspaceResponse[]>('/workspaces'),

  /**
   * Lấy chi tiết một workspace theo slug
   */
  getBySlug: (slug: string) =>
    api.get<WorkspaceResponse>(`/workspaces/${encodeURIComponent(slug)}`),

  /**
   * Lấy danh sách thành viên của workspace
   */
  getMembers: (wsId: string) =>
    api.get<WorkspaceMemberItem[]>(`/workspaces/${encodeURIComponent(wsId)}/members`),

  /**
   * Cập nhật thông tin workspace (tên, mô tả)
   */
  update: (wsId: string, payload: { name?: string; description?: string }) =>
    api.patch<WorkspaceResponse>(`/workspaces/${encodeURIComponent(wsId)}`, payload),

  /**
   * Xóa vĩnh viễn workspace (chỉ chủ sở hữu)
   */
  remove: (wsId: string) =>
    api.delete<{ success: boolean; message: string }>(`/workspaces/${encodeURIComponent(wsId)}`),

  /**
   * Thêm thành viên mới vào workspace bằng email và roleId
   */
  addMember: (wsId: string, payload: { email: string; roleId: string }) =>
    api.post<WorkspaceMemberItem>(`/workspaces/${encodeURIComponent(wsId)}/members`, payload),

  /**
   * Cập nhật vai trò thành viên trong workspace
   */
  updateMemberRole: (wsId: string, userId: string, payload: { roleId: string }) =>
    api.patch<WorkspaceMemberItem>(
      `/workspaces/${encodeURIComponent(wsId)}/members/${encodeURIComponent(userId)}/role`,
      payload
    ),

  /**
   * Xóa thành viên khỏi workspace
   */
  removeMember: (wsId: string, userId: string) =>
    api.delete<{ success: boolean; message: string }>(
      `/workspaces/${encodeURIComponent(wsId)}/members/${encodeURIComponent(userId)}`
    ),
}

export default workspaceService
