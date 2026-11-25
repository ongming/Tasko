export interface TaskCommentAuthor {
  id: string
  fullName: string
  email: string
  avatarUrl: string | null
}

export interface TaskCommentItem {
  id: string
  taskId: string
  userId: string | null
  content: string
  isEdited: boolean
  author: TaskCommentAuthor | null
  createdAt: string
  updatedAt: string
}

export interface CreateCommentPayload {
  content: string
}

export interface UpdateCommentPayload {
  content: string
}

export type AttachmentResourceType = 'image' | 'video' | 'raw'

export interface TaskAttachmentUploader {
  id: string
  fullName: string
  avatarUrl: string | null
}

export interface TaskAttachmentItem {
  id: string
  taskId: string
  userId: string | null
  fileName: string
  fileUrl: string
  publicId: string
  resourceType: AttachmentResourceType
  mimeType: string
  fileSize: number
  uploader: TaskAttachmentUploader | null
  createdAt: string
}
