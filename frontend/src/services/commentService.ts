import { api } from '@/lib/api'
import type {
  TaskCommentItem,
  CreateCommentPayload,
  UpdateCommentPayload,
} from '@/types/collaboration'

export const commentService = {
  /**
   * Lấy danh sách bình luận của một task theo thứ tự thời gian tăng dần
   */
  async getComments(projectIdOrKey: string, taskId: string): Promise<TaskCommentItem[]> {
    const res = await api.get<TaskCommentItem[]>(
      `/projects/${projectIdOrKey}/tasks/${taskId}/comments`,
    )
    return res || []
  },

  /**
   * Tạo bình luận mới trong task
   */
  async createComment(
    projectIdOrKey: string,
    taskId: string,
    payload: CreateCommentPayload,
  ): Promise<TaskCommentItem> {
    return api.post<TaskCommentItem>(
      `/projects/${projectIdOrKey}/tasks/${taskId}/comments`,
      payload,
    )
  },

  /**
   * Chỉnh sửa bình luận (chỉ tác giả)
   */
  async updateComment(
    projectIdOrKey: string,
    taskId: string,
    commentId: string,
    payload: UpdateCommentPayload,
  ): Promise<TaskCommentItem> {
    return api.patch<TaskCommentItem>(
      `/projects/${projectIdOrKey}/tasks/${taskId}/comments/${commentId}`,
      payload,
    )
  },

  /**
   * Xóa mềm bình luận (tác giả hoặc Project Owner / Workspace Admin)
   */
  async deleteComment(
    projectIdOrKey: string,
    taskId: string,
    commentId: string,
  ): Promise<void> {
    await api.delete(`/projects/${projectIdOrKey}/tasks/${taskId}/comments/${commentId}`)
  },
}
