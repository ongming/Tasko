import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AiDocumentAnalyzerModal } from './AiDocumentAnalyzerModal'
import {
  aiDocumentService,
  MAX_AI_DOCUMENT_SIZE_BYTES,
} from '@/services/aiDocumentService'
import type { AiAnalysisDetail, AiAnalysisSummary, AiSuggestedTask } from '@/types/aiDocument'
import type { ProjectMember } from '@/types/member'
import type { ProjectWorkType } from '@/types/projectConfig'
import type { Sprint } from '@/types/sprint'

function createFile(name: string, sizeBytes: number, type = 'application/pdf'): File {
  const file = new File(['mock content'], name, { type })
  Object.defineProperty(file, 'size', { value: sizeBytes })
  return file
}

const mockMembers: ProjectMember[] = [
  {
    id: 'pm-1',
    userId: 'u-dev1',
    user: { id: 'u-dev1', email: 'dev1@tasko.vn', fullName: 'Phạm Quốc Bảo', avatarUrl: null },
    roleId: 'r-member',
    role: { id: 'r-member', name: 'MEMBER' },
    joinedAt: '2026-01-01T00:00:00Z',
  },
]

const mockWorkTypes: ProjectWorkType[] = [
  {
    id: 'wt-task',
    project_id: 'proj-1',
    name: 'Task',
    icon: 'CheckSquare',
    color: 'bg-blue-100 text-blue-700',
    is_default: true,
  },
  {
    id: 'wt-bug',
    project_id: 'proj-1',
    name: 'Bug',
    icon: 'Bug',
    color: 'bg-rose-100 text-rose-700',
    is_default: false,
  },
]

const mockSprints: Sprint[] = [
  {
    id: 'sp-active',
    projectId: 'proj-1',
    name: 'Sprint 3: Flash Sale',
    status: 'ACTIVE',
    position: 1000,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

const mockGeneratedTasks: AiSuggestedTask[] = [
  {
    tempId: 'tmp-1',
    selected: true,
    title: 'Thiết kế API thanh toán VNPay',
    description: 'Chuẩn hóa DTO và xác thực chữ ký IPN.',
    priority: 'HIGH',
    storyPoints: 5,
    estimatedHours: 14,
    assigneeId: null,
    workTypeId: 'wt-task',
    sprintId: null,
    startDate: '2026-11-24',
    dueDate: '2026-11-29',
  },
  {
    tempId: 'tmp-2',
    selected: true,
    title: 'Xây dựng giao diện chọn phương thức thanh toán',
    description: 'Hỗ trợ QR và ví điện tử.',
    priority: 'MEDIUM',
    storyPoints: 3,
    estimatedHours: 10,
    assigneeId: null,
    workTypeId: 'wt-task',
    sprintId: null,
    startDate: '2026-11-25',
    dueDate: '2026-11-30',
  },
  {
    tempId: 'tmp-3',
    selected: true,
    title: 'Thiết lập kiểm soát phân quyền RBAC',
    description: 'Chặn tài khoản VIEWER ghi dữ liệu.',
    priority: 'URGENT',
    storyPoints: 3,
    estimatedHours: 8,
    assigneeId: null,
    workTypeId: 'wt-task',
    sprintId: null,
    startDate: '2026-11-26',
    dueDate: '2026-11-28',
  },
  {
    tempId: 'tmp-4',
    selected: true,
    title: 'Viết kiểm thử tự động E2E',
    description: 'Kiểm thử toàn trình luồng đặt hàng.',
    priority: 'MEDIUM',
    storyPoints: 3,
    estimatedHours: 8,
    assigneeId: null,
    workTypeId: 'wt-task',
    sprintId: null,
    startDate: '2026-11-27',
    dueDate: '2026-12-01',
  },
]

const seededHistorySummary: AiAnalysisSummary = {
  id: 'hist-1',
  fileName: 'BRD_NangCap_BaoMat_va_BaoCao_v2.pdf',
  fileType: 'pdf',
  fileSize: 1_845_200,
  status: 'APPLIED',
  suggestedTaskCount: 3,
  appliedTaskCount: 3,
  errorMessage: null,
  createdAt: '2026-11-23T00:00:00.000Z',
  createdBy: { id: 'pm-1', fullName: 'Nguyễn Đình Quang Minh', avatarUrl: null },
}

const seededHistoryDetail: AiAnalysisDetail = {
  ...seededHistorySummary,
  extractedTextPreview: 'Tài liệu nâng cấp bảo mật và báo cáo.',
  suggestedTasks: mockGeneratedTasks.slice(0, 3),
}

function renderModal(props: Partial<React.ComponentProps<typeof AiDocumentAnalyzerModal>> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AiDocumentAnalyzerModal
        isOpen={true}
        onClose={vi.fn()}
        projectIdOrKey="SHOPX"
        members={mockMembers}
        workTypes={mockWorkTypes}
        sprints={mockSprints}
        isViewer={false}
        {...props}
      />
    </QueryClientProvider>,
  )
}

describe('AiDocumentAnalyzerModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(aiDocumentService, 'getHistory').mockResolvedValue([seededHistorySummary])
    vi.spyOn(aiDocumentService, 'getAnalysisDetail').mockResolvedValue(seededHistoryDetail)
  })

  it('hiển thị lỗi validation khi chọn file sai định dạng hoặc vượt quá 10 MB', () => {
    renderModal()

    const fileInput = screen.getByTestId('ai-document-file-input')

    // Sai định dạng (.exe)
    fireEvent.change(fileInput, {
      target: { files: [createFile('malware.exe', 1024, 'application/octet-stream')] },
    })
    expect(screen.getByRole('alert')).toHaveTextContent('Định dạng tệp không được hỗ trợ')

    // Quá 10 MB
    fireEvent.change(fileInput, {
      target: { files: [createFile('big-spec.pdf', MAX_AI_DOCUMENT_SIZE_BYTES + 100)] },
    })
    expect(screen.getByRole('alert')).toHaveTextContent('vượt quá giới hạn 10 MB')
  })

  it('chạy luồng upload -> phân tích -> sửa tiêu đề & bỏ tick dòng -> xác nhận -> xem trong Lịch sử', async () => {
    const newAnalysis: AiAnalysisDetail = {
      id: 'new-analysis-1',
      fileName: 'YeuCau_ThanhToan_VNPay.pdf',
      fileType: 'pdf',
      fileSize: 320_000,
      status: 'COMPLETED',
      suggestedTaskCount: 4,
      appliedTaskCount: 0,
      errorMessage: null,
      createdAt: '2026-11-24T04:00:00.000Z',
      extractedTextPreview: 'Đặc tả cổng thanh toán VNPay.',
      suggestedTasks: mockGeneratedTasks.map((t) => ({ ...t })),
    }

    vi.spyOn(aiDocumentService, 'uploadDocument').mockResolvedValue({
      ...newAnalysis,
      status: 'UPLOADED',
      suggestedTasks: [],
    })
    vi.spyOn(aiDocumentService, 'analyzeDocument').mockResolvedValue(newAnalysis)
    vi.spyOn(aiDocumentService, 'confirmTasks').mockResolvedValue({
      analysisId: 'new-analysis-1',
      status: 'APPLIED',
      createdCount: 3,
      createdTaskIds: ['t-1', 't-2', 't-3'],
    })
    vi.spyOn(aiDocumentService, 'getHistory').mockResolvedValue([
      {
        id: 'new-analysis-1',
        fileName: 'YeuCau_ThanhToan_VNPay.pdf',
        fileType: 'pdf',
        fileSize: 320_000,
        status: 'APPLIED',
        suggestedTaskCount: 4,
        appliedTaskCount: 3,
        createdAt: '2026-11-24T04:00:00.000Z',
      },
      seededHistorySummary,
    ])

    const onTasksCreated = vi.fn()
    renderModal({ onTasksCreated })

    // 1. Chọn tệp hợp lệ và nhập hint
    const fileInput = screen.getByTestId('ai-document-file-input')
    fireEvent.change(fileInput, {
      target: { files: [createFile('YeuCau_ThanhToan_VNPay.pdf', 320_000)] },
    })
    expect(screen.getByText('YeuCau_ThanhToan_VNPay.pdf')).toBeInTheDocument()

    const hintBox = screen.getByLabelText(/Ghi chú định hướng cho AI/i)
    fireEvent.change(hintBox, { target: { value: 'Tách rõ các đầu việc Backend & QA' } })

    // 2. Bấm Tải lên & Phân tích bằng AI
    fireEvent.click(screen.getByRole('button', { name: /Tải lên & Phân tích bằng AI/i }))

    // 3. Chờ bảng Review hiện ra với 4 công việc đề xuất
    await waitFor(() => {
      expect(screen.getByTestId('ai-selected-counter')).toHaveTextContent('Đã chọn 4 / 4 công việc')
    })

    // 4. Sửa tiêu đề dòng 1 và bỏ tick dòng 2
    const firstTitleInput = screen.getByLabelText('Tiêu đề công việc 1') as HTMLInputElement
    fireEvent.change(firstTitleInput, {
      target: { value: 'Tích hợp cổng thanh toán VNPay QR v2' },
    })
    expect(firstTitleInput.value).toBe('Tích hợp cổng thanh toán VNPay QR v2')

    const secondCheckbox = screen.getByLabelText('Chọn công việc 2')
    fireEvent.click(secondCheckbox)

    expect(screen.getByTestId('ai-selected-counter')).toHaveTextContent('Đã chọn 3 / 4 công việc')

    // 5. Bấm Xác nhận tạo 3 công việc
    const confirmBtn = screen.getByRole('button', { name: /Xác nhận tạo 3 công việc/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(onTasksCreated).toHaveBeenCalledTimes(1)
    })
    expect(screen.getByText(/Đã tạo thành công 3 công việc vào dự án/i)).toBeInTheDocument()
    expect(confirmBtn).toBeDisabled()

    // 6. Chuyển sang tab Lịch sử phân tích và xác nhận file vừa phân tích xuất hiện
    fireEvent.click(screen.getByRole('button', { name: /Lịch sử phân tích/i }))
    await waitFor(() => {
      expect(screen.getByText('YeuCau_ThanhToan_VNPay.pdf')).toBeInTheDocument()
    })
  })

  it('khóa tải lên, chỉnh sửa và xác nhận đối với vai trò VIEWER nhưng vẫn cho xem lịch sử', async () => {
    renderModal({ isViewer: true })

    // Mặc định mở thẳng tab Lịch sử cho VIEWER và hiển thị lịch sử mẫu
    await waitFor(() => {
      expect(screen.getByText('BRD_NangCap_BaoMat_va_BaoCao_v2.pdf')).toBeInTheDocument()
    })

    // Bấm Xem chi tiết từ lịch sử -> các nút Lưu bản nháp và Xác nhận đều bị khóa
    fireEvent.click(screen.getByRole('button', { name: /Xem chi tiết/i }))
    await waitFor(() => {
      expect(screen.getByText(/Chế độ chỉ xem/i)).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /Lưu bản nháp/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Xác nhận tạo/i })).toBeDisabled()
    expect(screen.getByLabelText('Tiêu đề công việc 1')).toBeDisabled()

    // Kiểm tra khi chưa có analysis đang mở trên tab Phân tích tài liệu -> hiện thông báo khóa upload
    renderModal({ isViewer: true })
    const analyzeTabs = screen.getAllByRole('button', { name: /Phân tích tài liệu/i })
    fireEvent.click(analyzeTabs[analyzeTabs.length - 1])
    expect(
      screen.getByText(/Tài khoản chỉ xem \(Viewer\) không thể tải lên tài liệu/i),
    ).toBeInTheDocument()
  })
})
