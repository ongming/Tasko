import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TaskAttachmentsSection } from './TaskAttachmentsSection'
import {
  attachmentService,
  MAX_ATTACHMENT_SIZE_BYTES,
} from '@/services/attachmentService'
import { useAuthStore } from '@/stores/authStore'
import type { TaskAttachmentItem } from '@/types/collaboration'

vi.mock('@/services/attachmentService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/attachmentService')>()
  return {
    ...actual,
    attachmentService: {
      getAttachments: vi.fn(),
      uploadAttachment: vi.fn(),
      deleteAttachment: vi.fn(),
    },
  }
})

const renderWithQuery = (ui: React.ReactElement) => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

function createMockFile(name: string, sizeBytes: number, type = 'application/pdf'): File {
  const file = new File(['hello'], name, { type })
  Object.defineProperty(file, 'size', { value: sizeBytes })
  return file
}

const sampleAttachments: TaskAttachmentItem[] = [
  {
    id: 'att-1',
    taskId: 'task-1',
    userId: 'user-1',
    fileName: 'mockup.png',
    fileUrl: 'https://res.cloudinary.com/demo/image/upload/mockup.png',
    publicId: 'tasko/attachments/mockup_1',
    resourceType: 'image',
    mimeType: 'image/png',
    fileSize: 204800,
    uploader: {
      id: 'user-1',
      fullName: 'Alice Developer',
      avatarUrl: null,
    },
    createdAt: '2026-11-25T11:00:00.000Z',
  },
  {
    id: 'att-2',
    taskId: 'task-1',
    userId: 'user-2',
    fileName: 'dac-ta.pdf',
    fileUrl: 'https://res.cloudinary.com/demo/raw/upload/dac-ta.pdf',
    publicId: 'tasko/attachments/dac-ta_2',
    resourceType: 'raw',
    mimeType: 'application/pdf',
    fileSize: 1572864,
    uploader: {
      id: 'user-2',
      fullName: 'Bob PM',
      avatarUrl: null,
    },
    createdAt: '2026-11-25T11:05:00.000Z',
  },
]

describe('TaskAttachmentsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: {
        id: 'user-1',
        email: 'alice@tasko.dev',
        fullName: 'Alice Developer',
        avatarUrl: null,
        isActive: true,
      },
      accessToken: 'token-123',
      isAuthenticated: true,
    })
  })

  it('hiển thị danh sách tệp đính kèm với thumbnail ảnh, dung lượng và người tải', async () => {
    vi.mocked(attachmentService.getAttachments).mockResolvedValue(sampleAttachments)

    renderWithQuery(<TaskAttachmentsSection projectId="TASKO" taskId="task-1" />)

    await waitFor(() => {
      expect(screen.getByText('mockup.png')).toBeInTheDocument()
      expect(screen.getByText('dac-ta.pdf')).toBeInTheDocument()
      expect(screen.getByText('200.0 KB')).toBeInTheDocument()
      expect(screen.getByText('1.50 MB')).toBeInTheDocument()
      expect(screen.getByAltText('mockup.png')).toBeInTheDocument()
      expect(screen.getByText('Alice Developer')).toBeInTheDocument()
      expect(screen.getByText('Bob PM')).toBeInTheDocument()
    })
  })

  it('upload tệp hợp lệ gọi attachmentService.uploadAttachment', async () => {
    vi.mocked(attachmentService.getAttachments).mockResolvedValue([])
    vi.mocked(attachmentService.uploadAttachment).mockResolvedValue(sampleAttachments[0])

    renderWithQuery(<TaskAttachmentsSection projectId="TASKO" taskId="task-1" />)

    await waitFor(() => {
      expect(screen.getByLabelText('Chọn tệp đính kèm')).toBeInTheDocument()
    })

    const file = createMockFile('mockup.png', 2048, 'image/png')
    const input = screen.getByLabelText('Chọn tệp đính kèm')
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(attachmentService.uploadAttachment).toHaveBeenCalledWith(
        'TASKO',
        'task-1',
        file,
      )
    })
  })

  it('báo lỗi trên client khi chọn tệp lớn hơn 10 MB và không gọi API', async () => {
    vi.mocked(attachmentService.getAttachments).mockResolvedValue([])

    renderWithQuery(<TaskAttachmentsSection projectId="TASKO" taskId="task-1" />)

    await waitFor(() => {
      expect(screen.getByLabelText('Chọn tệp đính kèm')).toBeInTheDocument()
    })

    const hugeFile = createMockFile('video.pdf', MAX_ATTACHMENT_SIZE_BYTES + 10)
    const input = screen.getByLabelText('Chọn tệp đính kèm')
    fireEvent.change(input, { target: { files: [hugeFile] } })

    await waitFor(() => {
      expect(screen.getByText(/vượt quá giới hạn tối đa 10 MB/i)).toBeInTheDocument()
    })
    expect(attachmentService.uploadAttachment).not.toHaveBeenCalled()
  })

  it('xóa tệp đính kèm sau khi xác nhận', async () => {
    vi.mocked(attachmentService.getAttachments).mockResolvedValue(sampleAttachments)
    vi.mocked(attachmentService.deleteAttachment).mockResolvedValue(undefined)

    renderWithQuery(<TaskAttachmentsSection projectId="TASKO" taskId="task-1" />)

    await waitFor(() => {
      expect(screen.getByText('mockup.png')).toBeInTheDocument()
    })

    // User-1 chỉ thấy nút xóa cho att-1 (của chính mình), không thấy cho att-2 (của Bob)
    expect(screen.getByRole('button', { name: 'Xóa tệp mockup.png' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Xóa tệp dac-ta.pdf' }),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Xóa tệp mockup.png' }))
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận xóa tệp đính kèm' }))

    await waitFor(() => {
      expect(attachmentService.deleteAttachment).toHaveBeenCalledWith(
        'TASKO',
        'task-1',
        'att-1',
      )
    })
  })

  it('ẩn khu vực tải tệp và nút xóa khi user là VIEWER', async () => {
    vi.mocked(attachmentService.getAttachments).mockResolvedValue(sampleAttachments)

    renderWithQuery(
      <TaskAttachmentsSection projectId="TASKO" taskId="task-1" isViewer={true} />,
    )

    await waitFor(() => {
      expect(screen.getByText('mockup.png')).toBeInTheDocument()
    })

    expect(screen.queryByLabelText('Chọn tệp đính kèm')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Xóa tệp mockup.png' }),
    ).not.toBeInTheDocument()
  })
})
