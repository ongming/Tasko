import { api } from '@/lib/api'
import type {
  AiAnalysisDetail,
  AiAnalysisSummary,
  AiDocumentFileType,
  AiHistoryQueryParams,
  AiSuggestedTask,
  ConfirmAiTasksPayload,
  ConfirmAiTasksResponse,
} from '@/types/aiDocument'

export const ALLOWED_AI_DOCUMENT_EXTENSIONS: AiDocumentFileType[] = ['pdf', 'docx', 'md', 'txt']
export const MAX_AI_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

interface AiHistoryApiResponse {
  items: AiAnalysisSummary[]
  pagination?: {
    total: number
    page: number
    limit: number
  }
}

export function getFileExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split('.')
  return parts.length > 1 ? parts[parts.length - 1] : ''
}

export function validateAiDocumentFile(file: File): string | null {
  const ext = getFileExtension(file.name)
  if (!ALLOWED_AI_DOCUMENT_EXTENSIONS.includes(ext as AiDocumentFileType)) {
    return 'Định dạng tệp không được hỗ trợ. Vui lòng chọn tệp .pdf, .docx, .md hoặc .txt.'
  }
  if (file.size > MAX_AI_DOCUMENT_SIZE_BYTES) {
    return 'Dung lượng tệp vượt quá giới hạn 10 MB. Vui lòng nén hoặc chia nhỏ tài liệu.'
  }
  if (file.size === 0) {
    return 'Tệp tài liệu đang trống (0 bytes). Vui lòng chọn tệp có nội dung.'
  }
  return null
}

export const aiDocumentService = {
  /**
   * AIDOC-01: Tải lên tệp tài liệu (.pdf, .docx, .md, .txt) để trích xuất văn bản
   */
  async uploadDocument(projectId: string, file: File): Promise<AiAnalysisDetail> {
    const validationError = validateAiDocumentFile(file)
    if (validationError) {
      throw new Error(validationError)
    }

    const formData = new FormData()
    formData.append('file', file)
    return api.post<AiAnalysisDetail>(
      `/projects/${encodeURIComponent(projectId)}/ai-document/upload`,
      formData,
    )
  },

  /**
   * AIDOC-02: Kích hoạt AI phân tích tài liệu đã tải lên thành danh sách Task đề xuất
   */
  async analyzeDocument(
    projectId: string,
    analysisId: string,
    hint?: string,
  ): Promise<AiAnalysisDetail> {
    return api.post<AiAnalysisDetail>(
      `/projects/${encodeURIComponent(projectId)}/ai-document/${encodeURIComponent(analysisId)}/analyze`,
      hint?.trim() ? { hint: hint.trim() } : {},
    )
  },

  /**
   * AIDOC-03: Lấy chi tiết một phiên phân tích kèm danh sách công việc đề xuất
   */
  async getAnalysisDetail(projectId: string, analysisId: string): Promise<AiAnalysisDetail> {
    return api.get<AiAnalysisDetail>(
      `/projects/${encodeURIComponent(projectId)}/ai-document/${encodeURIComponent(analysisId)}`,
    )
  },

  /**
   * AIDOC-04: Lưu bản nháp các chỉnh sửa của người dùng trên danh sách đề xuất
   */
  async updateSuggestions(
    projectId: string,
    analysisId: string,
    tasks: AiSuggestedTask[],
  ): Promise<AiAnalysisDetail> {
    return api.patch<AiAnalysisDetail>(
      `/projects/${encodeURIComponent(projectId)}/ai-document/${encodeURIComponent(analysisId)}/suggestions`,
      { suggestedTasks: tasks },
    )
  },

  /**
   * AIDOC-05: Xác nhận tạo hàng loạt Task thật vào Backlog / Sprint của dự án
   */
  async confirmTasks(
    projectId: string,
    analysisId: string,
    payload: ConfirmAiTasksPayload,
  ): Promise<ConfirmAiTasksResponse> {
    const selectedTasks = payload.tasks.filter((task) => task.selected)
    if (selectedTasks.length === 0) {
      throw new Error('Vui lòng chọn ít nhất 1 công việc để xác nhận tạo.')
    }

    return api.post<ConfirmAiTasksResponse>(
      `/projects/${encodeURIComponent(projectId)}/ai-document/${encodeURIComponent(analysisId)}/confirm`,
      payload,
    )
  },

  /**
   * AIDOC-06: Lấy lịch sử các lần phân tích tài liệu của dự án
   */
  async getHistory(
    projectId: string,
    params?: AiHistoryQueryParams,
  ): Promise<AiAnalysisSummary[]> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.status) query.set('status', params.status)
    const qs = query.toString() ? `?${query.toString()}` : ''

    const res = await api.get<AiHistoryApiResponse | AiAnalysisSummary[]>(
      `/projects/${encodeURIComponent(projectId)}/ai-document/history${qs}`,
    )

    if (Array.isArray(res)) {
      return res
    }
    return res?.items ?? []
  },
}
