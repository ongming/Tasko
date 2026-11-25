import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import {
  attachmentService,
  validateAttachmentFile,
  MAX_ATTACHMENT_SIZE_BYTES,
} from './attachmentService'
import type { TaskAttachmentItem } from '@/types/collaboration'

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

function createMockFile(name: string, sizeBytes: number, type = 'application/pdf'): File {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', { value: sizeBytes })
  return file
}

const sampleAttachment: TaskAttachmentItem = {
  id: 'att-1',
  taskId: 'task-1',
  userId: 'user-1',
  fileName: 'design.png',
  fileUrl: 'https://res.cloudinary.com/demo/image/upload/design.png',
  publicId: 'tasko/attachments/design_1',
  resourceType: 'image',
  mimeType: 'image/png',
  fileSize: 51200,
  uploader: {
    id: 'user-1',
    fullName: 'Alice Developer',
    avatarUrl: null,
  },
  createdAt: '2026-11-25T11:00:00.000Z',
}

describe('attachmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validateAttachmentFile', () => {
    it('chấp nhận ảnh, tài liệu và zip dưới 10 MB', () => {
      expect(validateAttachmentFile(createMockFile('ui.png', 2048, 'image/png'))).toBeNull()
      expect(validateAttachmentFile(createMockFile('spec.pdf', 4096))).toBeNull()
      expect(validateAttachmentFile(createMockFile('archive.zip', 8192))).toBeNull()
    })

    it('từ chối tệp lớn hơn 10 MB', () => {
      const err = validateAttachmentFile(
        createMockFile('huge.pdf', MAX_ATTACHMENT_SIZE_BYTES + 1),
      )
      expect(err).toContain('10 MB')
    })

    it('từ chối tệp định dạng nguy hiểm', () => {
      const err = validateAttachmentFile(createMockFile('run.exe', 1024))
      expect(err).toContain('không được hỗ trợ')
    })
  })

  describe('REST API', () => {
    it('getAttachments gọi GET /projects/:projectId/tasks/:taskId/attachments', async () => {
      vi.mocked(api.get).mockResolvedValue([sampleAttachment])

      const res = await attachmentService.getAttachments('TASKO', 'task-1')

      expect(api.get).toHaveBeenCalledWith('/projects/TASKO/tasks/task-1/attachments')
      expect(res).toEqual([sampleAttachment])
    })

    it('uploadAttachment gửi FormData tới POST /projects/:projectId/tasks/:taskId/attachments', async () => {
      const file = createMockFile('design.png', 2048, 'image/png')
      vi.mocked(api.post).mockResolvedValue(sampleAttachment)

      const res = await attachmentService.uploadAttachment('TASKO', 'task-1', file)

      expect(api.post).toHaveBeenCalledWith(
        '/projects/TASKO/tasks/task-1/attachments',
        expect.any(FormData),
      )
      expect(res.id).toBe('att-1')
    })

    it('deleteAttachment gọi DELETE /projects/:projectId/tasks/:taskId/attachments/:attachmentId', async () => {
      vi.mocked(api.delete).mockResolvedValue({ deleted: true, id: 'att-1' })

      await attachmentService.deleteAttachment('TASKO', 'task-1', 'att-1')

      expect(api.delete).toHaveBeenCalledWith(
        '/projects/TASKO/tasks/task-1/attachments/att-1',
      )
    })
  })
})
