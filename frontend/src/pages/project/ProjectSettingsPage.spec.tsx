import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProjectSettingsPage } from './ProjectSettingsPage'
import { projectService } from '@/services/projectService'

vi.mock('@/services/projectService', () => ({
  projectService: {
    getProjectById: vi.fn(),
    getProjectStatuses: vi.fn(),
    getProjectWorkTypes: vi.fn(),
    getWorkflows: vi.fn(),
    getCustomFields: vi.fn(),
    updateProjectSettings: vi.fn(),
    deleteProject: vi.fn(),
    createStatus: vi.fn(),
    updateStatus: vi.fn(),
    deleteStatus: vi.fn(),
    createWorkType: vi.fn(),
    updateWorkType: vi.fn(),
    deleteWorkType: vi.fn(),
    createWorkflow: vi.fn(),
    updateWorkflow: vi.fn(),
    deleteWorkflow: vi.fn(),
    updateWorkflowTransitions: vi.fn(),
    createCustomField: vi.fn(),
    updateCustomField: vi.fn(),
    deleteCustomField: vi.fn(),
  },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('ProjectSettingsPage - Component Tests', () => {
  let queryClient: QueryClient

  const mockProject = {
    id: 'proj-1',
    key: 'TASK',
    name: 'Tasko Core Project',
    description: 'Dự án quản lý tác vụ Tasko',
    methodology: 'KANBAN' as const,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    workspaceId: 'ws-1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }

  const mockStatuses = [
    {
      id: 'st-todo',
      projectId: 'proj-1',
      name: 'To Do',
      category: 'TO_DO' as const,
      color: '#64748b',
      position: 0,
      wipLimit: null,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'st-inprog',
      projectId: 'proj-1',
      name: 'In Progress',
      category: 'IN_PROGRESS' as const,
      color: '#3b82f6',
      position: 1,
      wipLimit: 3,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ]

  const mockWorkTypes = [
    {
      id: 'wt-task',
      projectId: 'proj-1',
      name: 'Task',
      icon: 'check-square',
      color: '#3b82f6',
      isSubtask: false,
      workflowId: 'wf-1',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ]

  const mockWorkflows = [
    {
      id: 'wf-1',
      projectId: 'proj-1',
      name: 'Quy trình Chuẩn',
      transitions: [
        {
          id: 'tr-1',
          workflowId: 'wf-1',
          fromStatusId: 'st-todo',
          toStatusId: 'st-inprog',
        },
      ],
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ]

  const mockCustomFields = [
    {
      id: 'cf-sp',
      projectId: 'proj-1',
      name: 'Story Points',
      fieldType: 'NUMBER' as const,
      isRequired: false,
      options: null,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject as any)
    vi.mocked(projectService.getProjectStatuses).mockResolvedValue(mockStatuses)
    vi.mocked(projectService.getProjectWorkTypes).mockResolvedValue(mockWorkTypes)
    vi.mocked(projectService.getWorkflows).mockResolvedValue(mockWorkflows)
    vi.mocked(projectService.getCustomFields).mockResolvedValue(mockCustomFields)
  })

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/workspace/TASK/settings']}>
          <Routes>
            <Route path="/workspace/:projectKey/settings" element={<ProjectSettingsPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )
  }

  it('1. Render đầy đủ tiêu đề và thông tin Tab Chung (General Settings)', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Cài đặt dự án')).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue('Tasko Core Project')).toBeInTheDocument()
    expect(screen.getByDisplayValue('TASK')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Dự án quản lý tác vụ Tasko')).toBeInTheDocument()
    expect(screen.getByText('Vùng nguy hiểm')).toBeInTheDocument()
  })

  it('2. Lưu thông tin dự án gọi updateProjectSettings', async () => {
    vi.mocked(projectService.updateProjectSettings).mockResolvedValue({} as any)
    renderComponent()

    await waitFor(() => {
      expect(screen.getByDisplayValue('Tasko Core Project')).toBeInTheDocument()
    })

    const nameInput = screen.getByDisplayValue('Tasko Core Project')
    fireEvent.change(nameInput, { target: { value: 'Tasko Updated' } })

    const saveButtons = screen.getAllByRole('button', { name: /Lưu thay đổi/i })
    fireEvent.click(saveButtons[0])

    await waitFor(() => {
      expect(projectService.updateProjectSettings).toHaveBeenCalledWith(
        'proj-1',
        expect.objectContaining({
          name: 'Tasko Updated',
        }),
      )
    })
  })

  it('3. Danger Zone: Xác nhận mã dự án để kích hoạt nút xóa', async () => {
    vi.mocked(projectService.deleteProject).mockResolvedValue({} as any)
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Xóa dự án này')).toBeInTheDocument()
    })

    // Click nút Xóa dự án này để mở modal xác nhận
    fireEvent.click(screen.getByText('Xóa dự án này'))

    expect(screen.getByText('Xác nhận xóa dự án')).toBeInTheDocument()
    expect(screen.getByText('Hành động này sẽ xóa dự án khỏi hệ thống.')).toBeInTheDocument()

    // Tìm nút xóa trong modal xác nhận
    const confirmDeleteBtn = screen.getByRole('button', { name: /Xác nhận xóa/i })
    expect(confirmDeleteBtn).toBeDisabled()

    // Nhập sai key
    const confirmInput = screen.getByPlaceholderText('Nhập mã "TASK" để xác nhận...')
    fireEvent.change(confirmInput, { target: { value: 'WRONG' } })
    expect(confirmDeleteBtn).toBeDisabled()

    // Nhập đúng key
    fireEvent.change(confirmInput, { target: { value: 'TASK' } })
    expect(confirmDeleteBtn).not.toBeDisabled()

    // Bấm nút xóa
    fireEvent.click(confirmDeleteBtn)

    await waitFor(() => {
      expect(projectService.deleteProject).toHaveBeenCalledWith('proj-1')
    })
  })

  it('4. Chuyển sang Tab Trạng thái & WIP Limit: hiển thị danh sách trạng thái', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Cột trạng thái & WIP')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Cột trạng thái & WIP'))

    await waitFor(() => {
      expect(screen.getByText('To Do')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
    })

    // In Progress có WIP Limit = 3
    expect(screen.getByText(/3 thẻ/i)).toBeInTheDocument()
  })

  it('5. Chuyển sang Tab Loại công việc (Work Types): hiển thị danh sách loại', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Loại công việc')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Loại công việc'))

    await waitFor(() => {
      expect(screen.getByText('Task')).toBeInTheDocument()
    })
  })

  it('6. Chuyển sang Tab Quy trình (Workflows): hiển thị ma trận và lưu chuyển trạng thái', async () => {
    vi.mocked(projectService.updateWorkflowTransitions).mockResolvedValue([] as any)
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Luồng quy trình')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Luồng quy trình'))

    await waitFor(() => {
      expect(screen.getByText('Chọn quy trình:')).toBeInTheDocument()
      expect(screen.getByText(/Từ \\ Sang trạng thái/i)).toBeInTheDocument()
    })

    const saveMatrixBtn = screen.getByRole('button', { name: /Lưu ma trận chuyển trạng thái/i })
    expect(saveMatrixBtn).toBeInTheDocument()

    fireEvent.click(saveMatrixBtn)

    await waitFor(() => {
      expect(projectService.updateWorkflowTransitions).toHaveBeenCalledWith(
        'proj-1',
        'wf-1',
        expect.any(Array),
      )
    })
  })

  it('7. Chuyển sang Tab Trường tùy chỉnh (Custom Fields): hiển thị danh sách trường', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Trường tùy chỉnh')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Trường tùy chỉnh'))

    await waitFor(() => {
      expect(screen.getByText('Story Points')).toBeInTheDocument()
      expect(screen.getByText('NUMBER')).toBeInTheDocument()
    })
  })
})
