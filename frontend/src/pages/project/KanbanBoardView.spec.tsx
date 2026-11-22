import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { KanbanBoardView, calculateNewPosition } from './KanbanBoardView'
import { sprintService } from '@/services/sprintService'
import { taskService } from '@/services/taskService'
import { projectService } from '@/services/projectService'

vi.mock('@/services/sprintService', () => ({
  sprintService: {
    getSprints: vi.fn(),
    createSprint: vi.fn(),
    updateSprint: vi.fn(),
    startSprint: vi.fn(),
    completeSprint: vi.fn(),
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
  },
}))

describe('KanbanBoardView - Quick Add & Create Task Tests', () => {
  let queryClient: QueryClient

  const mockProject = {
    id: 'proj-1',
    name: 'Dự án Kanban Test',
    key: 'KAN',
    settings: { method_id: 'kanban' },
  }

  const mockStatuses = [
    { id: 'status-todo', name: 'Cần Làm', category: 'TODO', position: 1 },
    { id: 'status-inprogress', name: 'Đang Làm', category: 'IN_PROGRESS', position: 2 },
    { id: 'status-done', name: 'Hoàn Thành', category: 'DONE', position: 3 },
  ]

  const mockTasks = [
    {
      id: 'task-1',
      title: 'Task số 1',
      taskKey: 'KAN-1',
      statusId: 'status-todo',
      priority: 'MEDIUM',
      storyPoints: 3,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject as any)
    vi.mocked(projectService.getProjectStatuses).mockResolvedValue(mockStatuses as any)
    vi.mocked(projectService.getProjectMembers).mockResolvedValue([])
    vi.mocked(projectService.getProjectWorkTypes).mockResolvedValue([])
    vi.mocked(sprintService.getSprints).mockResolvedValue([])
    vi.mocked(taskService.getProjectTasks).mockResolvedValue(mockTasks as any)
  })

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/workspace/KAN/kanban']}>
          <Routes>
            <Route path="/workspace/:projectKey/kanban" element={<KanbanBoardView />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

  it('renders columns and the primary "Tạo công việc" button on the toolbar', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText(/cần làm/i)).toBeInTheDocument()
      expect(screen.getByText(/đang làm/i)).toBeInTheDocument()
      expect(screen.getByText(/hoàn thành/i)).toBeInTheDocument()
    })

    const primaryCreateBtn = screen.getByRole('button', { name: /Tạo công việc/i })
    expect(primaryCreateBtn).toBeInTheDocument()
  })

  it('renders bottom plus [+] button on each column', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText(/cần làm/i)).toBeInTheDocument()
    })

    const todoBottomAddBtn = screen.getByRole('button', {
      name: /Thêm công việc vào cột Cần Làm/i,
    })
    expect(todoBottomAddBtn).toBeInTheDocument()

    const inProgressBottomAddBtn = screen.getByRole('button', {
      name: /Thêm công việc vào cột Đang Làm/i,
    })
    expect(inProgressBottomAddBtn).toBeInTheDocument()
  })

  it('opens quick add form when clicking bottom [+] button and cancels on Escape', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText(/cần làm/i)).toBeInTheDocument()
    })

    const todoBottomAddBtn = screen.getByRole('button', {
      name: /Thêm công việc vào cột Cần Làm/i,
    })
    fireEvent.click(todoBottomAddBtn)

    const textarea = screen.getByPlaceholderText('Nhập tiêu đề công việc...')
    expect(textarea).toBeInTheDocument()

    // Test Escape to cancel
    fireEvent.keyDown(textarea, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Nhập tiêu đề công việc...')).not.toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /Thêm công việc vào cột Cần Làm/i }),
      ).toBeInTheDocument()
    })
  })

  it('creates task via Enter key when typing in quick add form', async () => {
    vi.mocked(taskService.createProjectTask).mockResolvedValue({
      id: 'task-new',
      title: 'Task vừa thêm',
      taskKey: 'KAN-2',
      statusId: 'status-todo',
    } as any)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText(/cần làm/i)).toBeInTheDocument()
    })

    const todoBottomAddBtn = screen.getByRole('button', {
      name: /Thêm công việc vào cột Cần Làm/i,
    })
    fireEvent.click(todoBottomAddBtn)

    const textarea = screen.getByPlaceholderText('Nhập tiêu đề công việc...')
    fireEvent.change(textarea, { target: { value: 'Task vừa thêm' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false })

    await waitFor(() => {
      expect(taskService.createProjectTask).toHaveBeenCalledWith(
        'KAN',
        expect.objectContaining({
          title: 'Task vừa thêm',
          statusId: 'status-todo',
        }),
      )
    })
  })

  it('creates task when clicking "Thêm thẻ" button in quick add form', async () => {
    vi.mocked(taskService.createProjectTask).mockResolvedValue({
      id: 'task-new-2',
      title: 'Task bấm nút thêm',
      taskKey: 'KAN-3',
      statusId: 'status-todo',
    } as any)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText(/cần làm/i)).toBeInTheDocument()
    })

    const todoBottomAddBtn = screen.getByRole('button', {
      name: /Thêm công việc vào cột Cần Làm/i,
    })
    fireEvent.click(todoBottomAddBtn)

    const textarea = screen.getByPlaceholderText('Nhập tiêu đề công việc...')
    fireEvent.change(textarea, { target: { value: 'Task bấm nút thêm' } })

    const submitBtn = screen.getByRole('button', { name: /Thêm thẻ/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(taskService.createProjectTask).toHaveBeenCalledWith(
        'KAN',
        expect.objectContaining({
          title: 'Task bấm nút thêm',
          statusId: 'status-todo',
        }),
      )
    })
  })
})

describe('calculateNewPosition - Midpoint Indexing Algorithm', () => {
  it('returns 1000 for an empty column', () => {
    expect(calculateNewPosition([], 0)).toBe(1000)
  })

  it('calculates position when dragged to the top (index 0)', () => {
    const tasks = [
      { id: '1', position: 2000 } as any,
      { id: '2', position: 4000 } as any,
    ]
    expect(calculateNewPosition(tasks, 0)).toBe(1000)
  })

  it('calculates position when dragged to top of a task with position 1', () => {
    const tasks = [{ id: '1', position: 1 } as any]
    expect(calculateNewPosition(tasks, 0)).toBe(-999)
  })

  it('calculates position when dragged to the end of the column', () => {
    const tasks = [
      { id: '1', position: 1000 } as any,
      { id: '2', position: 2500 } as any,
    ]
    expect(calculateNewPosition(tasks, 2)).toBe(3500)
    expect(calculateNewPosition(tasks, 99)).toBe(3500)
  })

  it('calculates midpoint position when dragged in between two tasks', () => {
    const tasks = [
      { id: '1', position: 1000 } as any,
      { id: '2', position: 2000 } as any,
    ]
    // Dragged to index 1 (between task 1 and task 2)
    expect(calculateNewPosition(tasks, 1)).toBe(1500)
  })
})
