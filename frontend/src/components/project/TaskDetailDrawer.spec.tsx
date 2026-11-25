import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TaskDetailDrawer } from './TaskDetailDrawer'
import { taskService } from '@/services/taskService'
import { projectService } from '@/services/projectService'
import { sprintService } from '@/services/sprintService'
import { commentService } from '@/services/commentService'
import { attachmentService } from '@/services/attachmentService'

vi.mock('@/services/commentService', () => ({
  commentService: {
    getComments: vi.fn(),
    createComment: vi.fn(),
    updateComment: vi.fn(),
    deleteComment: vi.fn(),
  },
}))

vi.mock('@/services/attachmentService', () => ({
  attachmentService: {
    getAttachments: vi.fn(),
    uploadAttachment: vi.fn(),
    deleteAttachment: vi.fn(),
  },
  validateAttachmentFile: vi.fn(() => null),
}))

const renderWithQuery = (ui: React.ReactElement) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

vi.mock('@/services/taskService', () => ({
  taskService: {
    getTaskById: vi.fn(),
    updateProjectTask: vi.fn(),
    createProjectTask: vi.fn(),
    deleteProjectTask: vi.fn(),
  },
}))

vi.mock('@/services/sprintService', () => ({
  sprintService: {
    getSprints: vi.fn(),
  },
}))

vi.mock('@/services/projectService', () => ({
  projectService: {
    getProjectStatuses: vi.fn(),
    getProjectWorkTypes: vi.fn(),
    getProjectMembers: vi.fn(),
    getCustomFields: vi.fn(),
  },
}))

describe('TaskDetailDrawer - Component Tests', () => {
  const mockProjectId = 'proj-123'
  const mockTaskId = 'task-456'
  const onCloseMock = vi.fn()

  const mockTask = {
    id: mockTaskId,
    projectId: mockProjectId,
    taskKey: 'TASK-42',
    title: 'Xây dựng giao diện Drawer Chi tiết Task',
    description: 'Mô tả chi tiết công việc',
    statusId: 'status-todo',
    status: { id: 'status-todo', name: 'Cần làm', category: 'TODO' as const, color: '#94a3b8' },
    typeId: 'wt-1',
    type: { id: 'wt-1', name: 'Task', icon: 'CheckSquare', color: '#3b82f6' },
    priority: 'HIGH' as const,
    storyPoints: 5,
    estimatedHours: 8,
    assigneeId: 'user-1',
    assignee: { id: 'user-1', name: 'Alice Developer', avatarUrl: '' },
    subtasks: [
      {
        id: 'sub-1',
        projectId: mockProjectId,
        taskKey: 'TASK-43',
        title: 'Thiết kế Mockup',
        statusId: 'status-done',
        status: { id: 'status-done', name: 'Hoàn thành', category: 'DONE' as const, color: '#10b981' },
      },
    ],
    customFields: [
      {
        id: 'cfv-1',
        customFieldId: 'cf-env',
        name: 'Môi trường',
        fieldType: 'SELECT',
        options: ['Staging', 'Production'],
        value: 'Staging',
      },
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }

  const mockStatuses = [
    { id: 'status-todo', name: 'Cần làm', category: 'TODO' as const, color: '#94a3b8', position: 0 },
    { id: 'status-done', name: 'Hoàn thành', category: 'DONE' as const, color: '#10b981', position: 1 },
  ]

  const mockWorkTypes = [
    { id: 'wt-1', name: 'Task', icon: 'CheckSquare', color: '#3b82f6' },
  ]

  const mockMembers = [
    {
      id: 'm-1',
      projectId: mockProjectId,
      userId: 'user-1',
      roleId: 'role-dev',
      user: { id: 'user-1', fullName: 'Alice Developer', email: 'alice@tasko.dev' },
    },
  ]

  const mockCustomFields = [
    {
      id: 'cf-env',
      projectId: mockProjectId,
      name: 'Môi trường',
      fieldType: 'SELECT' as const,
      options: ['Staging', 'Production'],
      isRequired: false,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(projectService.getProjectStatuses).mockResolvedValue(mockStatuses as any)
    vi.mocked(projectService.getProjectWorkTypes).mockResolvedValue(mockWorkTypes as any)
    vi.mocked(projectService.getProjectMembers).mockResolvedValue(mockMembers as any)
    vi.mocked(sprintService.getSprints).mockResolvedValue([])
    vi.mocked(projectService.getCustomFields).mockResolvedValue(mockCustomFields as any)
    vi.mocked(taskService.getTaskById).mockResolvedValue(mockTask as any)
    vi.mocked(commentService.getComments).mockResolvedValue([])
    vi.mocked(attachmentService.getAttachments).mockResolvedValue([])
  })

  it('1. Render đầy đủ thông tin Task khi mở Drawer', async () => {
    renderWithQuery(
      <TaskDetailDrawer
        isOpen={true}
        onClose={onCloseMock}
        projectIdOrKey={mockProjectId}
        taskId={mockTaskId}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('TASK-42')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Xây dựng giao diện Drawer Chi tiết Task')).toBeInTheDocument()
      expect(screen.getByText('Mô tả chi tiết công việc')).toBeInTheDocument()
      expect(screen.getByText('Thiết kế Mockup')).toBeInTheDocument()
      expect(screen.getByText('TASK-43')).toBeInTheDocument()
      expect(screen.getByText('Môi trường')).toBeInTheDocument()
      expect(screen.getByText('Staging')).toBeInTheDocument()
    })
  })

  it('2. Thêm nhanh Subtask gọi createProjectTask', async () => {
    vi.mocked(taskService.createProjectTask).mockResolvedValue({ id: 'sub-new' } as any)

    renderWithQuery(
      <TaskDetailDrawer
        isOpen={true}
        onClose={onCloseMock}
        projectIdOrKey={mockProjectId}
        taskId={mockTaskId}
      />,
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('+ Nhập tiêu đề công việc con và nhấn Enter...')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('+ Nhập tiêu đề công việc con và nhấn Enter...')
    fireEvent.change(input, { target: { value: 'Viết tài liệu API' } })

    const addBtn = screen.getByRole('button', { name: 'Thêm' })
    fireEvent.click(addBtn)

    await waitFor(() => {
      expect(taskService.createProjectTask).toHaveBeenCalledWith(
        mockProjectId,
        expect.objectContaining({
          title: 'Viết tài liệu API',
          parentTaskId: mockTaskId,
        }),
      )
    })
  })

  it('3. Đóng Drawer khi nhấn nút X', async () => {
    renderWithQuery(
      <TaskDetailDrawer
        isOpen={true}
        onClose={onCloseMock}
        projectIdOrKey={mockProjectId}
        taskId={mockTaskId}
      />,
    )

    await waitFor(() => {
      expect(screen.getByTitle('Đóng bảng chi tiết')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTitle('Đóng bảng chi tiết'))
    expect(onCloseMock).toHaveBeenCalled()
  })
})
