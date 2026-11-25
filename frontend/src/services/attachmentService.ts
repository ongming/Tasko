import { api } from '@/lib/api'
import type { TaskAttachmentItem } from '@/types/collaboration'

export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.md',
  '.csv',
  '.zip',
])

export function validateAttachmentFile(file: File): string | null {
  if (!file) {
    return 'Vui lòng chọn tệp đính kèm.'
  }

  if (file.size <= 0) {
    return 'Tệp tải lên đang trống (0 bytes).'
  }

  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return 'Kích thước tệp vượt quá giới hạn tối đa 10 MB.'
  }

  const dotIdx = file.name.lastIndexOf('.')
  const ext = dotIdx >= 0 ? file.name.slice(dotIdx).toLowerCase() : ''

  if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
    return 'Định dạng tệp không được hỗ trợ. Chỉ chấp nhận ảnh (JPG, PNG, WEBP, GIF), tài liệu (PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, TXT, MD, CSV) và ZIP.'
  }

  return null
}

export const attachmentService = {
  /**
   * Lấy danh sách tệp đính kèm của một task
   */
  async getAttachments(
    projectIdOrKey: string,
    taskId: string,
  ): Promise<TaskAttachmentItem[]> {
    const res = await api.get<TaskAttachmentItem[]>(
      `/projects/${projectIdOrKey}/tasks/${taskId}/attachments`,
    )
    return res || []
  },

  /**
   * Tải tệp đính kèm mới lên task (multipart/form-data)
   */
  async uploadAttachment(
    projectIdOrKey: string,
    taskId: string,
    file: File,
  ): Promise<TaskAttachmentItem> {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<TaskAttachmentItem>(
      `/projects/${projectIdOrKey}/tasks/${taskId}/attachments`,
      formData,
    )
  },

  /**
   * Xóa tệp đính kèm khỏi task
   */
  async deleteAttachment(
    projectIdOrKey: string,
    taskId: string,
    attachmentId: string,
  ): Promise<void> {
    await api.delete(
      `/projects/${projectIdOrKey}/tasks/${taskId}/attachments/${attachmentId}`,
    )
  },
}
