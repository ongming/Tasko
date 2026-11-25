import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TaskCommentsSection } from './TaskCommentsSection'
import { commentService } from '@/services/commentService'
import { useAuthStore } from '@/stores/authStore'
import type { TaskCommentItem } from '@/types/collaboration'

vi.mock('@/services/commentService', () => ({
  commentService: {
    getComments: vi.fn(),
    createComment: vi.fn(),
    updateComment: vi.fn(),
    deleteComment: vi.fn(),
  },
}))

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

const renderWithQuery = (ui: React.ReactElement) => {
  const client = createTestQueryClient()
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

const sampleComments: TaskCommentItem[] = [
  {
    id: 'cmt-1',
    taskId: 'task-1',
    userId: 'user-1',
    content: 'Bình luận của Alice',
    isEdited: false,
    author: {
      id: 'user-1',
      fullName: 'Alice Developer',
      email: 'alice@tasko.dev',
      avatarUrl: null,
    },
    createdAt: '2026-11-25T10:00:00.000Z',
    updatedAt: '2026-11-25T10:00:00.000Z',
  },
  {
    id: 'cmt-2',
    taskId: 'task-1',
    userId: 'user-2',
    content: 'Bình luận đã sửa của Bob',
    isEdited: true,
    author: {
      id: 'user-2',
      fullName: 'Bob Reviewer',
      email: 'bob@tasko.dev',
      avatarUrl: null,
    },
    createdAt: '2026-11-25T10:05:00.000Z',
    updatedAt: '2026-11-25T10:10:00.000Z',
  },
]

describe('TaskCommentsSection', () => {
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

  it('hiển thị danh sách bình luận và nhãn "Đã chỉnh sửa"', async () => {
    vi.mocked(commentService.getComments).mockResolvedValue(sampleComments)

    renderWithQuery(<TaskCommentsSection projectId="TASKO" taskId="task-1" />)

    await waitFor(() => {
      expect(screen.getByText('Bình luận của Alice')).toBeInTheDocument()
      expect(screen.getByText('Bình luận đã sửa của Bob')).toBeInTheDocument()
      expect(screen.getByText('Alice Developer')).toBeInTheDocument()
      expect(screen.getByText('Bob Reviewer')).toBeInTheDocument()
      expect(screen.getByText('Đã chỉnh sửa')).toBeInTheDocument()
    })
  })

  it('tạo bình luận mới khi nhấn nút Gửi', async () => {
    vi.mocked(commentService.getComments).mockResolvedValue([])
    vi.mocked(commentService.createComment).mockResolvedValue(sampleComments[0])

    renderWithQuery(<TaskCommentsSection projectId="TASKO" taskId="task-1" />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Viết bình luận/i)).toBeInTheDocument()
    })

    const textarea = screen.getByPlaceholderText(/Viết bình luận/i)
    fireEvent.change(textarea, { target: { value: 'Bình luận mới từ test' } })
    fireEvent.click(screen.getByRole('button', { name: /Gửi/i }))

    await waitFor(() => {
      expect(commentService.createComment).toHaveBeenCalledWith('TASKO', 'task-1', {
        content: 'Bình luận mới từ test',
      })
    })
  })

  it('chỉ hiện nút Sửa với bình luận của chính user và hỗ trợ sửa inline', async () => {
    vi.mocked(commentService.getComments).mockResolvedValue(sampleComments)
    vi.mocked(commentService.updateComment).mockResolvedValue({
      ...sampleComments[0],
      content: 'Nội dung sau khi sửa',
      isEdited: true,
    })

    renderWithQuery(<TaskCommentsSection projectId="TASKO" taskId="task-1" />)

    await waitFor(() => {
      expect(screen.getByText('Bình luận của Alice')).toBeInTheDocument()
    })

    // Chỉ có đúng 1 nút Sửa (cho cmt-1 của user-1, không có cho cmt-2 của user-2)
    const editButtons = screen.getAllByRole('button', { name: 'Sửa bình luận' })
    expect(editButtons).toHaveLength(1)

    fireEvent.click(editButtons[0])

    const editTextarea = screen.getByLabelText('Chỉnh sửa nội dung bình luận')
    fireEvent.change(editTextarea, { target: { value: 'Nội dung sau khi sửa' } })
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }))

    await waitFor(() => {
      expect(commentService.updateComment).toHaveBeenCalledWith('TASKO', 'task-1', 'cmt-1', {
        content: 'Nội dung sau khi sửa',
      })
    })
  })

  it('xóa bình luận sau khi xác nhận và cho phép Owner/Admin xóa bình luận của người khác', async () => {
    vi.mocked(commentService.getComments).mockResolvedValue(sampleComments)
    vi.mocked(commentService.deleteComment).mockResolvedValue(undefined)

    renderWithQuery(
      <TaskCommentsSection
        projectId="TASKO"
        taskId="task-1"
        canModerateComments={true}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('Bình luận đã sửa của Bob')).toBeInTheDocument()
    })

    // Với canModerateComments=true, cả 2 bình luận đều có nút Xóa
    const deleteButtons = screen.getAllByRole('button', { name: 'Xóa bình luận' })
    expect(deleteButtons).toHaveLength(2)

    // Bấm Xóa ở bình luận thứ 2 (của Bob)
    fireEvent.click(deleteButtons[1])
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận xóa bình luận' }))

    await waitFor(() => {
      expect(commentService.deleteComment).toHaveBeenCalledWith('TASKO', 'task-1', 'cmt-2')
    })
  })

  it('ẩn ô nhập bình luận và các nút Sửa/Xóa khi user có vai trò VIEWER', async () => {
    vi.mocked(commentService.getComments).mockResolvedValue(sampleComments)

    renderWithQuery(
      <TaskCommentsSection projectId="TASKO" taskId="task-1" isViewer={true} />,
    )

    await waitFor(() => {
      expect(screen.getByText('Bình luận của Alice')).toBeInTheDocument()
    })

    expect(screen.queryByPlaceholderText(/Viết bình luận/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sửa bình luận' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Xóa bình luận' })).not.toBeInTheDocument()
  })
})
