import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { OverviewPage } from './OverviewPage'
import { workspaceService } from '@/services/workspaceService'
import { projectService } from '@/services/projectService'
import { taskService } from '@/services/taskService'
import { sprintService } from '@/services/sprintService'
import { useAuthStore } from '@/stores/authStore'

vi.mock('@/services/workspaceService', () => ({
  workspaceService: {
    getMyWorkspaces: vi.fn(),
    getMembers: vi.fn(),
    create: vi.fn(),
  },
}))

vi.mock('@/services/projectService', () => ({
  projectService: {
    getProjects: vi.fn(),
    getProjectStatuses: vi.fn(),
  },
}))

vi.mock('@/services/taskService', () => ({
  taskService: {
    getProjectTasks: vi.fn(),
    createProjectTask: vi.fn(),
    moveProjectTask: vi.fn(),
  },
}))

vi.mock('@/services/sprintService', () => ({
  sprintService: {
    getSprints: vi.fn(),
  },
}))

describe('OverviewPage - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: { id: 'u-1', full_name: 'Minh Nguyen', email: 'minh@tasko.vn' } as any,
    })

    vi.mocked(workspaceService.getMyWorkspaces).mockResolvedValue([
      { id: 'ws-1', name: 'Team Alpha', slug: 'team-alpha' },
    ] as any)

    vi.mocked(workspaceService.getMembers).mockResolvedValue([
      { id: 'm-1', userId: 'u-1', user: { id: 'u-1', fullName: 'Minh Nguyen', email: 'minh@tasko.vn' }, role: { name: 'Owner' } },
    ] as any)

    vi.mocked(projectService.getProjects).mockResolvedValue([
      { id: 'p-1', name: 'Tasko Core', key: 'TC', methodology: 'SCRUM', settings: { method_id: 'scrum' } },
    ] as any)

    vi.mocked(projectService.getProjectStatuses).mockResolvedValue([
      { id: 'st-todo', name: 'To Do', category: 'TODO' },
      { id: 'st-done', name: 'Done', category: 'DONE' },
    ] as any)

    vi.mocked(sprintService.getSprints).mockResolvedValue([
      { id: 'sp-1', name: 'Sprint 3', status: 'ACTIVE', totalPoints: 10, completedPoints: 5 },
    ] as any)

    vi.mocked(taskService.getProjectTasks).mockResolvedValue([
      {
        id: 'task-1',
        taskKey: 'TC-1',
        title: 'Hoàn thiện trang Tổng quan',
        assigneeId: 'u-1',
        priority: 'HIGH',
        statusId: 'st-todo',
        status: { id: 'st-todo', name: 'To Do', category: 'TODO' },
      },
    ] as any)
  })

  it('renders real workspace projects, my tasks, and workspace members without fake activity stream', async () => {
    render(
      <MemoryRouter initialEntries={['/team-alpha/overview']}>
        <Routes>
          <Route path="/:workspaceSlug/overview" element={<OverviewPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getAllByText('Tasko Core').length).toBeGreaterThan(0)
      expect(screen.getByText('Hoàn thiện trang Tổng quan')).toBeInTheDocument()
      expect(screen.getAllByText('Minh Nguyen').length).toBeGreaterThan(0)
      expect(screen.getByText(/Tiến độ Sprint 3/i)).toBeInTheDocument()
    })

    expect(screen.queryByText(/Hoạt động gần đây/i)).not.toBeInTheDocument()
  })
})
