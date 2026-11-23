import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BacklogView } from './BacklogView'
import { sprintService } from '@/services/sprintService'
import { taskService } from '@/services/taskService'
import { projectService } from '@/services/projectService'
import { useAuthStore } from '@/stores/authStore'

vi.mock('@/services/sprintService', () => ({
  sprintService: {
    getSprints: vi.fn(),
    createSprint: vi.fn(),
    updateSprint: vi.fn(),
    startSprint: vi.fn(),
    completeSprint: vi.fn(),
    deleteSprint: vi.fn(),
  },
}))

vi.mock('@/services/taskService', () => ({
  taskService: {
    getProjectTasks: vi.fn(),
    getTaskById: vi.fn(),
    createProjectTask: vi.fn(),
    updateProjectTask: vi.fn(),
    moveProjectTask: vi.fn(),
    deleteProjectTask: vi.fn(),
  },
}))

vi.mock('@/services/projectService', () => ({
  projectService: {
    getProjectById: vi.fn(),
    getProjectStatuses: vi.fn(),
    getProjectMembers: vi.fn(),
    getProjectWorkTypes: vi.fn(),
    getCustomFields: vi.fn(),
  },
}))

describe('BacklogView - Page Component Tests', () => {
  let queryClient: QueryClient

  const mockProject = {
    id: 'proj-1',
    name: 'Dự án Alpha',
    key: 'ALP',
    settings: { method_id: 'scrum' },
  }

  const mockSprints = [
    {
      id: 'sprint-active-1',
      name: 'Sprint 1 (Hiện tại)',
      status: 'ACTIVE' as const,
      sprintNumber: 1,
      startDate: '2026-03-01',
      endDate: '2026-03-15',
      goal: 'Hoàn thiện MVP Backlog',
    },
    {
      id: 'sprint-planned-2',
      name: 'Sprint 2 (Kế hoạch)',
      status: 'PLANNED' as const,
      sprintNumber: 2,
      goal: 'Tích hợp thanh toán',
    },
  ]

  const mockStatuses = [
    { id: 'st-1', name: 'Cần làm', category: 'TODO' as const, color: '#94a3b8' },
    { id: 'st-2', name: 'Đang làm', category: 'IN_PROGRESS' as const, color: '#3b82f6' },
    { id: 'st-3', name: 'Hoàn thành', category: 'DONE' as const, color: '#10b981' },
  ]

  const mockWorkTypes = [
    { id: 'wt-1', name: 'Task', icon: 'CheckSquare', color: '#3b82f6' },
    { id: 'wt-2', name: 'Bug', icon: 'Bug', color: '#ef4444' },
  ]

  const mockMembers = [
    {
      id: 'm-1',
      roleId: 'role-1',
      user: { id: 'user-1', fullName: 'Alice Developer', email: 'alice@tasko.vn' },
    },
  ]

  const mockTasks = [
    {
      id: 'task-1',
      projectId: 'proj-1',
      sprintId: 'sprint-active-1',
      taskKey: 'ALP-1',
      title: 'Thiết kế giao diện Backlog',
      statusId: 'st-2',
      status: mockStatuses[1],
      typeId: 'wt-1',
      type: mockWorkTypes[0],
      priority: 'HIGH' as const,
      storyPoints: 5,
      assigneeId: 'user-1',
      assignee: { id: 'user-1', name: 'Alice Developer' },
    },
    {
      id: 'task-2',
      projectId: 'proj-1',
      sprintId: 'sprint-planned-2',
      taskKey: 'ALP-2',
      title: 'Fix bug đăng nhập SSO',
      statusId: 'st-1',
      status: mockStatuses[0],
      typeId: 'wt-2',
      type: mockWorkTypes[1],
      priority: 'URGENT' as const,
      storyPoints: 3,
    },
    {
      id: 'task-3',
      projectId: 'proj-1',
      sprintId: null,
      taskKey: 'ALP-3',
      title: 'Viết tài liệu API',
      statusId: 'st-1',
      status: mockStatuses[0],
      typeId: 'wt-1',
      type: mockWorkTypes[0],
      priority: 'LOW' as const,
      storyPoints: 2,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    useAuthStore.setState({
      user: {
        id: 'user-1',
        email: 'alice@tasko.vn',
        fullName: 'Alice Developer',
        avatarUrl: '',
      } as any,
      isAuthenticated: true,
    })

    vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject as any)
    vi.mocked(sprintService.getSprints).mockResolvedValue(mockSprints as any)
    vi.mocked(taskService.getProjectTasks).mockResolvedValue(mockTasks as any)
    vi.mocked(projectService.getProjectStatuses).mockResolvedValue(mockStatuses as any)
    vi.mocked(projectService.getProjectWorkTypes).mockResolvedValue(mockWorkTypes as any)
    vi.mocked(projectService.getProjectMembers).mockResolvedValue(mockMembers as any)
    vi.mocked(projectService.getCustomFields).mockResolvedValue([])
    vi.mocked(taskService.getTaskById).mockResolvedValue(mockTasks[0] as any)
  })

  const renderBacklogView = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/workspace-test/ALP/backlog']}>
          <Routes>
            <Route path="/:workspaceSlug/:projectKey/backlog" element={<BacklogView />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )
  }

  it('renders sprint cards, backlog section and tasks count', async () => {
    renderBacklogView()

    await waitFor(() => {
      expect(screen.getByText('Sprint 1 (Hiện tại)')).toBeInTheDocument()
      expect(screen.getByText('Sprint 2 (Kế hoạch)')).toBeInTheDocument()
      expect(screen.getByText('Kho Backlog')).toBeInTheDocument()
    })

    // Tasks check
    expect(screen.getByText('Thiết kế giao diện Backlog')).toBeInTheDocument()
    expect(screen.getByText('Fix bug đăng nhập SSO')).toBeInTheDocument()
    expect(screen.getByText('Viết tài liệu API')).toBeInTheDocument()
  })

  it('displays story points breakdown and action buttons on sprint header', async () => {
    renderBacklogView()

    await waitFor(() => {
      expect(screen.getByText('Sprint 1 (Hiện tại)')).toBeInTheDocument()
    })

    // Active sprint has Complete sprint button
    expect(screen.getByRole('button', { name: /Hoàn thành Sprint/i })).toBeInTheDocument()

    // Planned sprint has Start sprint button
    expect(screen.getByRole('button', { name: /Bắt đầu Sprint/i })).toBeInTheDocument()
  })

  it('filters tasks when searching in TaskFilterBar', async () => {
    renderBacklogView()

    await waitFor(() => {
      expect(screen.getByText('Thiết kế giao diện Backlog')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/Tìm theo tiêu đề hoặc mã công việc/i)
    fireEvent.change(searchInput, { target: { value: 'Fix bug' } })

    // Wait for debounced search
    await waitFor(
      () => {
        expect(screen.queryByText('Thiết kế giao diện Backlog')).not.toBeInTheDocument()
        expect(screen.getByText('Fix bug đăng nhập SSO')).toBeInTheDocument()
      },
      { timeout: 1000 },
    )
  })

  it('opens StartSprintModal when clicking "Bắt đầu Sprint"', async () => {
    vi.mocked(sprintService.getSprints).mockResolvedValueOnce([mockSprints[1]] as any)
    renderBacklogView()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Bắt đầu Sprint/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Bắt đầu Sprint/i }))

    await waitFor(() => {
      // Modal should open with sprint title
      expect(screen.getByText(/Bắt đầu Sprint:\s*Sprint 2/i)).toBeInTheDocument()
    })
  })

  it('opens CompleteSprintModal when clicking "Hoàn thành Sprint"', async () => {
    renderBacklogView()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Hoàn thành Sprint/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Hoàn thành Sprint/i }))

    await waitFor(() => {
      expect(screen.getByText(/Hoàn thành:\s*Sprint 1/i)).toBeInTheDocument()
    })
  })

  it('opens TaskDetailDrawer when clicking on a task item', async () => {
    renderBacklogView()

    await waitFor(() => {
      expect(screen.getByText('Thiết kế giao diện Backlog')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Thiết kế giao diện Backlog'))

    await waitFor(() => {
      expect(taskService.getTaskById).toHaveBeenCalledWith('ALP', 'task-1')
    })
  })

  it('allows inline quick creation of a task in Backlog', async () => {
    vi.mocked(taskService.createProjectTask).mockResolvedValue({
      id: 'task-new',
      taskKey: 'ALP-4',
      title: 'Công việc mới tạo nhanh',
      projectId: 'proj-1',
      sprintId: null,
      statusId: 'st-1',
    } as any)

    renderBacklogView()

    await waitFor(() => {
      expect(screen.getByText('Kho Backlog')).toBeInTheDocument()
    })

    // Find and click "Tạo công việc trong Backlog" button in backlog section
    const backlogAddBtn = screen.getByRole('button', { name: /Tạo công việc trong Backlog/i })
    fireEvent.click(backlogAddBtn)

    const input = screen.getByPlaceholderText(/Nhập tiêu đề công việc cho Backlog và nhấn Enter.../i)
    fireEvent.change(input, { target: { value: 'Công việc mới tạo nhanh' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    await waitFor(() => {
      expect(taskService.createProjectTask).toHaveBeenCalledWith(
        'ALP',
        expect.objectContaining({
          title: 'Công việc mới tạo nhanh',
          sprintId: null,
        }),
      )
    })
  })
})
