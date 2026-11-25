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
