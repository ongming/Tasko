import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import {
  aiDocumentService,
  validateAiDocumentFile,
  MAX_AI_DOCUMENT_SIZE_BYTES,
} from './aiDocumentService'
import type { AiSuggestedTask } from '@/types/aiDocument'

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

function createMockFile(name: string, sizeBytes: number, type = 'application/pdf'): File {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', { value: sizeBytes })
  return file
}

const sampleTask: AiSuggestedTask = {
  tempId: 'tmp-1',
  selected: true,
  title: 'Tích hợp cổng thanh toán VNPay QR',
  description: 'Xác thực chữ ký IPN và cập nhật đơn hàng.',
  priority: 'HIGH',
  storyPoints: 5,
  estimatedHours: 12,
  assigneeId: null,
  workTypeId: null,
  sprintId: null,
  startDate: '2026-11-24',
  dueDate: '2026-11-29',
}

describe('aiDocumentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validateAiDocumentFile', () => {
    it('chấp nhận các định dạng hợp lệ .pdf, .docx, .md, .txt dưới 10 MB', () => {
      expect(validateAiDocumentFile(createMockFile('spec.pdf', 1024))).toBeNull()
      expect(validateAiDocumentFile(createMockFile('brd.docx', 2048))).toBeNull()
      expect(validateAiDocumentFile(createMockFile('notes.md', 512))).toBeNull()
      expect(validateAiDocumentFile(createMockFile('readme.txt', 256))).toBeNull()
    })

    it('từ chối tệp sai định dạng', () => {
      const err = validateAiDocumentFile(createMockFile('diagram.png', 1024, 'image/png'))
      expect(err).toContain('Định dạng tệp không được hỗ trợ')
    })

    it('từ chối tệp vượt quá 10 MB', () => {
      const err = validateAiDocumentFile(
        createMockFile('huge.pdf', MAX_AI_DOCUMENT_SIZE_BYTES + 1),
      )
      expect(err).toContain('vượt quá giới hạn 10 MB')
    })

    it('từ chối tệp rỗng 0 bytes', () => {
      const err = validateAiDocumentFile(createMockFile('empty.txt', 0, 'text/plain'))
      expect(err).toContain('đang trống')
    })
  })

  describe('REST API integration (AIDOC-01 -> AIDOC-06)', () => {
    it('uploadDocument gửi FormData đúng endpoint POST /upload', async () => {
      const file = createMockFile('DAC_TA.pdf', 2048)
      vi.mocked(api.post).mockResolvedValue({ id: 'a-1', status: 'UPLOADED' })

      const res = await aiDocumentService.uploadDocument('SHOPX', file)

      expect(api.post).toHaveBeenCalledWith(
        '/projects/SHOPX/ai-document/upload',
        expect.any(FormData),
      )
      expect(res.id).toBe('a-1')
    })

    it('analyzeDocument gửi POST /:analysisId/analyze kèm hint', async () => {
      vi.mocked(api.post).mockResolvedValue({ id: 'a-1', status: 'COMPLETED' })

      await aiDocumentService.analyzeDocument('SHOPX', 'a-1', '  Ưu tiên API  ')

      expect(api.post).toHaveBeenCalledWith('/projects/SHOPX/ai-document/a-1/analyze', {
        hint: 'Ưu tiên API',
      })
    })

    it('getAnalysisDetail gửi GET /:analysisId', async () => {
      vi.mocked(api.get).mockResolvedValue({ id: 'a-1', suggestedTasks: [sampleTask] })

      const res = await aiDocumentService.getAnalysisDetail('SHOPX', 'a-1')

      expect(api.get).toHaveBeenCalledWith('/projects/SHOPX/ai-document/a-1')
      expect(res.suggestedTasks).toHaveLength(1)
    })

    it('updateSuggestions gửi PATCH /:analysisId/suggestions với { suggestedTasks }', async () => {
      vi.mocked(api.patch).mockResolvedValue({ id: 'a-1', suggestedTasks: [sampleTask] })

      await aiDocumentService.updateSuggestions('SHOPX', 'a-1', [sampleTask])

      expect(api.patch).toHaveBeenCalledWith('/projects/SHOPX/ai-document/a-1/suggestions', {
        suggestedTasks: [sampleTask],
      })
    })

    it('confirmTasks chặn khi không có task nào được chọn và gửi POST /:analysisId/confirm khi hợp lệ', async () => {
      await expect(
        aiDocumentService.confirmTasks('SHOPX', 'a-1', {
          defaultSprintId: null,
          tasks: [{ ...sampleTask, selected: false }],
        }),
      ).rejects.toThrow('chọn ít nhất 1 công việc')

      vi.mocked(api.post).mockResolvedValue({
        analysisId: 'a-1',
        status: 'APPLIED',
        createdCount: 1,
        createdTaskIds: ['t-1'],
      })

      const res = await aiDocumentService.confirmTasks('SHOPX', 'a-1', {
        defaultSprintId: 'sp-1',
        tasks: [sampleTask],
      })

      expect(api.post).toHaveBeenCalledWith('/projects/SHOPX/ai-document/a-1/confirm', {
        defaultSprintId: 'sp-1',
        tasks: [sampleTask],
      })
      expect(res.createdCount).toBe(1)
    })

    it('getHistory unwrap đúng { items, pagination } từ Backend và truyền query params', async () => {
      vi.mocked(api.get).mockResolvedValue({
        items: [
          {
            id: 'a-1',
            fileName: 'BRD.pdf',
            fileType: 'pdf',
            fileSize: 1024,
            status: 'APPLIED',
            suggestedTaskCount: 3,
            appliedTaskCount: 3,
            createdAt: '2026-11-24T00:00:00.000Z',
          },
        ],
        pagination: { total: 1, page: 1, limit: 20 },
      })

      const history = await aiDocumentService.getHistory('SHOPX', {
        page: 1,
        limit: 20,
        status: 'APPLIED',
      })

      expect(api.get).toHaveBeenCalledWith(
        '/projects/SHOPX/ai-document/history?page=1&limit=20&status=APPLIED',
      )
      expect(history).toHaveLength(1)
      expect(history[0].fileName).toBe('BRD.pdf')
    })
  })
})
