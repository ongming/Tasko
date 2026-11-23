import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import type {
  AiAnalysisDetail,
  AiAnalysisSummary,
  AiDocumentFileType,
  AiHistoryQueryParams,
  AiSuggestedTask,
  ConfirmAiTasksPayload,
  ConfirmAiTasksResponse,
} from '@/types/aiDocument'

/**
 * Bật/tắt chế độ Mock Frontend-First.
 * Đổi thành `false` khi Backend triển khai hoàn tất các endpoint AIDOC-01 -> AIDOC-06.
 */
export const USE_MOCK_AI_DOCUMENT = true

export const ALLOWED_AI_DOCUMENT_EXTENSIONS: AiDocumentFileType[] = ['pdf', 'docx', 'md', 'txt']
export const MAX_AI_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

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

// ============================================================================
// MOCK IN-MEMORY STORE (Dùng khi USE_MOCK_AI_DOCUMENT === true)
// ============================================================================
const mockStoreByProject = new Map<string, AiAnalysisDetail[]>()

function addDaysIso(daysFromNow: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString().slice(0, 10)
}

function buildSeededMockHistory(projectId: string): AiAnalysisDetail[] {
  const seededTasks: AiSuggestedTask[] = [
    {
      tempId: `seed-${projectId}-1`,
      selected: true,
      title: 'Thiết kế luồng xác thực 2 lớp (2FA) qua email & ứng dụng Authenticator',
      description:
        'Bổ sung bước nhập mã OTP 6 chữ số sau khi đăng nhập cho vai trò quản trị viên, kèm mã khôi phục dự phòng.',
      priority: 'HIGH',
      storyPoints: 5,
      estimatedHours: 14,
      assigneeId: null,
      workTypeId: null,
      sprintId: null,
      startDate: addDaysIso(-5),
      dueDate: addDaysIso(2),
    },
    {
      tempId: `seed-${projectId}-2`,
      selected: true,
      title: 'Xây dựng API xuất báo cáo tiến độ Sprint định dạng PDF & Excel',
      description:
        'Tổng hợp velocity, danh sách công việc hoàn thành/trễ hạn và phân bổ tải thành viên theo chu kỳ Sprint.',
      priority: 'MEDIUM',
      storyPoints: 3,
      estimatedHours: 10,
      assigneeId: null,
      workTypeId: null,
      sprintId: null,
      startDate: addDaysIso(-3),
      dueDate: addDaysIso(4),
    },
    {
      tempId: `seed-${projectId}-3`,
      selected: true,
      title: 'Tối ưu truy vấn bảng Kanban giảm thời gian phản hồi xuống dưới 150ms',
      description:
        'Bổ sung composite index theo (project_id, sprint_id, status_id) và gom truy vấn đếm subtasks.',
      priority: 'URGENT',
      storyPoints: 5,
      estimatedHours: 12,
      assigneeId: null,
      workTypeId: null,
      sprintId: null,
      startDate: addDaysIso(-2),
      dueDate: addDaysIso(1),
    },
  ]

  const appliedAnalysis: AiAnalysisDetail = {
    id: `mock-analysis-${projectId}-seed-1`,
    fileName: 'BRD_NangCap_BaoMat_va_BaoCao_v2.pdf',
    fileType: 'pdf',
    fileSize: 1_845_200,
    status: 'APPLIED',
    suggestedTaskCount: seededTasks.length,
    appliedTaskCount: seededTasks.length,
    errorMessage: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    createdBy: {
      id: 'mock-pm-1',
      fullName: 'Nguyễn Đình Quang Minh',
      avatarUrl: null,
    },
    extractedTextPreview:
      'Tài liệu đặc tả nghiệp vụ v2.0: Tập trung nâng cấp bảo mật tài khoản quản trị, tự động hóa báo cáo Sprint và tối ưu hiệu năng truy vấn bảng Kanban.',
    suggestedTasks: seededTasks,
  }

  return [appliedAnalysis]
}

function getProjectMockList(projectId: string): AiAnalysisDetail[] {
  if (!mockStoreByProject.has(projectId)) {
    mockStoreByProject.set(projectId, buildSeededMockHistory(projectId))
  }
  return mockStoreByProject.get(projectId)!
}

function buildMockGeneratedTasks(fileName: string, hint?: string): AiSuggestedTask[] {
  const baseId = Date.now()
  const hintSuffix = hint?.trim() ? ` (Định hướng: ${hint.trim()})` : ''

  return [
    {
      tempId: `tmp-${baseId}-1`,
      selected: true,
      title: 'Phân tích lược đồ dữ liệu & thiết kế API RESTful theo tài liệu đặc tả',
      description: `Trích xuất từ "${fileName}": chuẩn hóa entity, DTO validation và hợp đồng phản hồi JSON cho phân hệ mới.${hintSuffix}`,
      priority: 'HIGH',
      storyPoints: 5,
      estimatedHours: 16,
      assigneeId: null,
      workTypeId: null,
      sprintId: null,
      startDate: addDaysIso(0),
      dueDate: addDaysIso(5),
    },
    {
      tempId: `tmp-${baseId}-2`,
      selected: true,
      title: 'Xây dựng giao diện quản trị & luồng tương tác người dùng trên React',
      description: `Triển khai màn hình danh sách, bộ lọc, modal tạo/sửa và trạng thái loading/empty theo đặc tả trong "${fileName}".`,
      priority: 'HIGH',
      storyPoints: 5,
      estimatedHours: 14,
      assigneeId: null,
      workTypeId: null,
      sprintId: null,
      startDate: addDaysIso(2),
      dueDate: addDaysIso(8),
    },
    {
      tempId: `tmp-${baseId}-3`,
      selected: true,
      title: 'Thiết lập kiểm soát phân quyền RBAC & kiểm tra ràng buộc nghiệp vụ',
      description:
        'Áp dụng @RequirePermission cho các endpoint ghi dữ liệu, chặn người dùng VIEWER và ghi nhận nhật ký thao tác.',
      priority: 'URGENT',
      storyPoints: 3,
      estimatedHours: 10,
      assigneeId: null,
      workTypeId: null,
      sprintId: null,
      startDate: addDaysIso(3),
      dueDate: addDaysIso(7),
    },
    {
      tempId: `tmp-${baseId}-4`,
      selected: true,
      title: 'Viết bộ kiểm thử tự động Unit Test & Integration Test cho luồng chính',
      description:
        'Đảm bảo độ phủ kiểm thử cho các trường hợp hợp lệ, lỗi nhập liệu, lỗi 403 Forbidden và tính ổn định dữ liệu.',
      priority: 'MEDIUM',
      storyPoints: 3,
      estimatedHours: 8,
      assigneeId: null,
      workTypeId: null,
      sprintId: null,
      startDate: addDaysIso(6),
      dueDate: addDaysIso(11),
    },
  ]
}

function toSummary(detail: AiAnalysisDetail): AiAnalysisSummary {
  const { extractedTextPreview: _preview, suggestedTasks: _tasks, ...summary } = detail
  return summary
}

function waitMock(ms: number): Promise<void> {
  if (import.meta.env.MODE === 'test') {
    return Promise.resolve()
  }
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Reset trạng thái mock trong unit test.
 */
export function __resetAiDocumentMockStore(): void {
  mockStoreByProject.clear()
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

    if (USE_MOCK_AI_DOCUMENT) {
      await waitMock(450)
      const ext = getFileExtension(file.name) as AiDocumentFileType
      const currentUser = useAuthStore.getState().user
      const newAnalysis: AiAnalysisDetail = {
        id: `mock-analysis-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        fileName: file.name,
        fileType: ext,
        fileSize: file.size,
        status: 'UPLOADED',
        suggestedTaskCount: 0,
        appliedTaskCount: 0,
        errorMessage: null,
        createdAt: new Date().toISOString(),
        createdBy: currentUser
          ? {
              id: currentUser.id,
              fullName: currentUser.fullName || currentUser.full_name || currentUser.email,
              avatarUrl: currentUser.avatarUrl || currentUser.avatar_url || null,
            }
          : {
              id: 'current-user',
              fullName: 'Thành viên dự án',
              avatarUrl: null,
            },
        extractedTextPreview: `Đã trích xuất nội dung từ tài liệu "${file.name}" (${(file.size / 1024).toFixed(1)} KB). Sẵn sàng chuyển sang bước phân tích bằng AI.`,
        suggestedTasks: [],
      }

      const list = getProjectMockList(projectId)
      list.unshift(newAnalysis)
      return { ...newAnalysis, suggestedTasks: [] }
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
    if (USE_MOCK_AI_DOCUMENT) {
      await waitMock(650)
      const list = getProjectMockList(projectId)
      const found = list.find((item) => item.id === analysisId)
      if (!found) {
        throw new Error('Không tìm thấy phiên phân tích tài liệu.')
      }

      const generated = buildMockGeneratedTasks(found.fileName, hint)
      found.status = 'COMPLETED'
      found.suggestedTasks = generated
      found.suggestedTaskCount = generated.length
      found.errorMessage = null

      return {
        ...found,
        suggestedTasks: generated.map((task) => ({ ...task })),
      }
    }

    return api.post<AiAnalysisDetail>(
      `/projects/${encodeURIComponent(projectId)}/ai-document/${encodeURIComponent(analysisId)}/analyze`,
      hint?.trim() ? { hint: hint.trim() } : {},
    )
  },

  /**
   * AIDOC-03: Lấy chi tiết một phiên phân tích kèm danh sách công việc đề xuất
   */
  async getAnalysisDetail(projectId: string, analysisId: string): Promise<AiAnalysisDetail> {
    if (USE_MOCK_AI_DOCUMENT) {
      await waitMock(150)
      const list = getProjectMockList(projectId)
      const found = list.find((item) => item.id === analysisId)
      if (!found) {
        throw new Error('Không tìm thấy chi tiết phiên phân tích.')
      }
      return {
        ...found,
        suggestedTasks: found.suggestedTasks.map((task) => ({ ...task })),
      }
    }

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
    if (USE_MOCK_AI_DOCUMENT) {
      await waitMock(200)
      const list = getProjectMockList(projectId)
      const found = list.find((item) => item.id === analysisId)
      if (!found) {
        throw new Error('Không tìm thấy phiên phân tích để lưu bản nháp.')
      }
      found.suggestedTasks = tasks.map((task) => ({ ...task }))
      found.suggestedTaskCount = tasks.length
      return {
        ...found,
        suggestedTasks: found.suggestedTasks.map((task) => ({ ...task })),
      }
    }

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

    if (USE_MOCK_AI_DOCUMENT) {
      await waitMock(350)
      const list = getProjectMockList(projectId)
      const found = list.find((item) => item.id === analysisId)
      if (!found) {
        throw new Error('Không tìm thấy phiên phân tích để xác nhận.')
      }
      if (found.status === 'APPLIED') {
        throw new Error('Phiên phân tích này đã được áp dụng tạo công việc trước đó.')
      }

      found.suggestedTasks = payload.tasks.map((task) => ({
        ...task,
        sprintId: task.sprintId ?? payload.defaultSprintId ?? null,
      }))
      found.suggestedTaskCount = found.suggestedTasks.length
      found.appliedTaskCount = selectedTasks.length
      found.status = 'APPLIED'

      return {
        analysisId,
        status: 'APPLIED',
        createdCount: selectedTasks.length,
        createdTaskIds: selectedTasks.map((_, idx) => `mock-created-task-${Date.now()}-${idx + 1}`),
      }
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
    if (USE_MOCK_AI_DOCUMENT) {
      await waitMock(150)
      let items = getProjectMockList(projectId).map(toSummary)
      if (params?.status) {
        items = items.filter((item) => item.status === params.status)
      }
      if (params?.limit && params.limit > 0) {
        items = items.slice(0, params.limit)
      }
      return items
    }

    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.status) query.set('status', params.status)
    const qs = query.toString() ? `?${query.toString()}` : ''

    const res = await api.get<AiAnalysisSummary[]>(
      `/projects/${encodeURIComponent(projectId)}/ai-document/history${qs}`,
    )
    return res || []
  },
}
