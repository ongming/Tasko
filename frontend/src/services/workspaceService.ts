import { api } from '@/lib/api'
import type {
  CreateWorkspacePayload,
  WorkspaceResponse,
} from '@/types/workspace'

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
}

export default workspaceService
