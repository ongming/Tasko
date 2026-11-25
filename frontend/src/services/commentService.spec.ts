import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import { commentService } from './commentService'
import type { TaskCommentItem } from '@/types/collaboration'

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const sampleComment: TaskCommentItem = {
  id: 'cmt-1',
  taskId: 'task-1',
  userId: 'user-1',
  content: 'Đã kiểm tra PR này',
  isEdited: false,
  author: {
    id: 'user-1',
    fullName: 'Alice Developer',
    email: 'alice@tasko.dev',
    avatarUrl: null,
  },
  createdAt: '2026-11-25T10:00:00.000Z',
  updatedAt: '2026-11-25T10:00:00.000Z',
}

describe('commentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getComments gọi GET /projects/:projectId/tasks/:taskId/comments', async () => {
    vi.mocked(api.get).mockResolvedValue([sampleComment])

    const res = await commentService.getComments('TASKO', 'task-1')

    expect(api.get).toHaveBeenCalledWith('/projects/TASKO/tasks/task-1/comments')
    expect(res).toEqual([sampleComment])
  })

  it('createComment gọi POST /projects/:projectId/tasks/:taskId/comments', async () => {
    vi.mocked(api.post).mockResolvedValue(sampleComment)

    const res = await commentService.createComment('TASKO', 'task-1', {
      content: 'Đã kiểm tra PR này',
    })

    expect(api.post).toHaveBeenCalledWith('/projects/TASKO/tasks/task-1/comments', {
      content: 'Đã kiểm tra PR này',
    })
    expect(res.id).toBe('cmt-1')
  })

  it('updateComment gọi PATCH /projects/:projectId/tasks/:taskId/comments/:commentId', async () => {
    const edited = { ...sampleComment, content: 'Nội dung mới', isEdited: true }
    vi.mocked(api.patch).mockResolvedValue(edited)

    const res = await commentService.updateComment('TASKO', 'task-1', 'cmt-1', {
      content: 'Nội dung mới',
    })

    expect(api.patch).toHaveBeenCalledWith('/projects/TASKO/tasks/task-1/comments/cmt-1', {
      content: 'Nội dung mới',
    })
    expect(res.isEdited).toBe(true)
  })

  it('deleteComment gọi DELETE /projects/:projectId/tasks/:taskId/comments/:commentId', async () => {
    vi.mocked(api.delete).mockResolvedValue({ deleted: true, id: 'cmt-1' })

    await commentService.deleteComment('TASKO', 'task-1', 'cmt-1')

    expect(api.delete).toHaveBeenCalledWith('/projects/TASKO/tasks/task-1/comments/cmt-1')
  })
})
