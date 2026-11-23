import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ControlBoardView } from './ControlBoardView'
import { projectService } from '@/services/projectService'
import { sprintService } from '@/services/sprintService'
import { taskService } from '@/services/taskService'

vi.mock('@/services/projectService', () => ({
  projectService: {
    getProjectById: vi.fn(),
  },
}))

vi.mock('@/services/sprintService', () => ({
  sprintService: {
    getSprints: vi.fn(),
  },
}))

vi.mock('@/services/taskService', () => ({
  taskService: {
    getProjectTasks: vi.fn(),
  },
}))

describe('ControlBoardView - Component Tests', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  it('renders scoped Scrum KPIs, priority tasks, member workload, and sprint velocity', async () => {
    vi.mocked(projectService.getProjectById).mockResolvedValue({
      id: 'proj-1',
      name: 'Tasko Scrum',
      key: 'TSK',
      methodology: 'SCRUM',
      settings: { method_id: 'scrum' },
    } as any)

    vi.mocked(sprintService.getSprints).mockResolvedValue([
      {
        id: 'sp-1',
        name: 'Sprint 1',
        status: 'ACTIVE',
        totalPoints: 13,
        completedPoints: 5,
        taskCount: 2,
        completedTaskCount: 1,
        goal: 'Hoàn thiện API',
      },
    ] as any)

    vi.mocked(taskService.getProjectTasks).mockResolvedValue([
      {
        id: 't-1',
        taskKey: 'TSK-1',
        title: 'Thiết kế DB',
        sprintId: 'sp-1',
        priority: 'MEDIUM',
        storyPoints: 5,
        assigneeId: 'u-1',
        assignee: { id: 'u-1', name: 'Alice' },
        status: { id: 's-done', name: 'Done', category: 'DONE' },
      },
      {
        id: 't-2',
        taskKey: 'TSK-2',
        title: 'Sửa lỗi đăng nhập',
        sprintId: 'sp-1',
        priority: 'URGENT',
        storyPoints: 8,
        assigneeId: 'u-1',
        assignee: { id: 'u-1', name: 'Alice' },
        status: { id: 's-todo', name: 'To Do', category: 'TODO' },
      },
    ] as any)

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/ws/TSK/control']}>
          <Routes>
            <Route path="/:workspaceSlug/:projectKey/control" element={<ControlBoardView />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText(/Control Board: Tasko Scrum/i)).toBeInTheDocument()
      expect(screen.getByText('Sửa lỗi đăng nhập')).toBeInTheDocument()
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText(/Vận tốc các Sprint/i)).toBeInTheDocument()
      expect(screen.getAllByText('5 / 13 SP').length).toBeGreaterThan(0)
    })
  })
})
