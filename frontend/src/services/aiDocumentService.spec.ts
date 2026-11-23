import { describe, it, expect, beforeEach } from 'vitest'
import {
  aiDocumentService,
  validateAiDocumentFile,
  MAX_AI_DOCUMENT_SIZE_BYTES,
  __resetAiDocumentMockStore,
} from './aiDocumentService'

function createMockFile(name: string, sizeBytes: number, type = 'application/pdf'): File {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', { value: sizeBytes })
  return file
}

describe('aiDocumentService', () => {
  beforeEach(() => {
    __resetAiDocumentMockStore()
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

  describe('Mock workflow (AIDOC-01 -> AIDOC-06)', () => {
    const projectId = 'SHOPX'

    it('chạy trọn vẹn luồng upload -> analyze -> updateSuggestions -> confirmTasks -> getHistory', async () => {
      const file = createMockFile('DAC_TA_FLASH_SALE.pdf', 250_000)

      // 1. Upload
      const uploaded = await aiDocumentService.uploadDocument(projectId, file)
      expect(uploaded.status).toBe('UPLOADED')
      expect(uploaded.fileName).toBe('DAC_TA_FLASH_SALE.pdf')
      expect(uploaded.fileType).toBe('pdf')

      // 2. Analyze
      const analyzed = await aiDocumentService.analyzeDocument(
        projectId,
        uploaded.id,
        'Ưu tiên tách API Redis',
      )
      expect(analyzed.status).toBe('COMPLETED')
      expect(analyzed.suggestedTasks.length).toBeGreaterThanOrEqual(3)
      expect(analyzed.suggestedTasks[0].description).toContain('Ưu tiên tách API Redis')

      // 3. Lưu nháp (sửa tiêu đề và bỏ chọn 1 dòng)
      const editedTasks = analyzed.suggestedTasks.map((t, idx) => ({
        ...t,
        title: idx === 0 ? 'Tiêu đề đã chỉnh sửa thủ công' : t.title,
        selected: idx !== analyzed.suggestedTasks.length - 1,
      }))
      const drafted = await aiDocumentService.updateSuggestions(
        projectId,
        uploaded.id,
        editedTasks,
      )
      expect(drafted.suggestedTasks[0].title).toBe('Tiêu đề đã chỉnh sửa thủ công')

      // 4. Xác nhận tạo task
      const confirmRes = await aiDocumentService.confirmTasks(projectId, uploaded.id, {
        defaultSprintId: 'sprint-active-1',
        tasks: editedTasks,
      })
      expect(confirmRes.status).toBe('APPLIED')
      expect(confirmRes.createdCount).toBe(editedTasks.length - 1)

      // Không cho xác nhận lại phiên đã APPLIED
      await expect(
        aiDocumentService.confirmTasks(projectId, uploaded.id, {
          defaultSprintId: null,
          tasks: editedTasks,
        }),
      ).rejects.toThrow('đã được áp dụng')

      // 5. Lịch sử & Chi tiết
      const history = await aiDocumentService.getHistory(projectId)
      expect(history[0].id).toBe(uploaded.id)
      expect(history[0].status).toBe('APPLIED')
      expect(history[0].appliedTaskCount).toBe(editedTasks.length - 1)

      const detail = await aiDocumentService.getAnalysisDetail(projectId, uploaded.id)
      expect(detail.suggestedTasks[0].sprintId).toBe('sprint-active-1')
    })

    it('ném lỗi khi xác nhận nhưng không chọn công việc nào', async () => {
      const file = createMockFile('plan.md', 4096, 'text/markdown')
      const uploaded = await aiDocumentService.uploadDocument(projectId, file)
      const analyzed = await aiDocumentService.analyzeDocument(projectId, uploaded.id)
      const unselected = analyzed.suggestedTasks.map((t) => ({ ...t, selected: false }))

      await expect(
        aiDocumentService.confirmTasks(projectId, uploaded.id, {
          defaultSprintId: null,
          tasks: unselected,
        }),
      ).rejects.toThrow('chọn ít nhất 1 công việc')
    })
  })
})
