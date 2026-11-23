import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { GanttView } from './GanttView'
import { taskService } from '@/services/taskService'
import { sprintService } from '@/services/sprintService'
import { projectService } from '@/services/projectService'
import { workspaceService } from '@/services/workspaceService'
import { formatLocalDateKey } from '@/utils/dateFormat'
import { addDaysToKey } from '@/utils/ganttUtils'
import type { TaskItem } from '@/types/task'

vi.mock('@/services/taskService', () => ({
  taskService: {
    getProjectTasks: vi.fn(),
    updateProjectTask: vi.fn(),
  },
}))

vi.mock('@/services/sprintService', () => ({
  sprintService: {
    getSprints: vi.fn(),
  },
}))

vi.mock('@/services/projectService', () => ({
  projectService: {
    getProjectById: vi.fn(),
    getProjectMembers: vi.fn(),
  },
}))

vi.mock('@/services/workspaceService', () => ({
  workspaceService: {
    getMyWorkspaces: vi.fn(),
  },
}))

vi.mock('@/components/project/TaskDetailDrawer', () => ({
  TaskDetailDrawer: ({ isOpen, taskId }: { isOpen: boolean; taskId: string }) =>
    isOpen ? <div data-testid="mock-task-drawer">Drawer: {taskId}</div> : null,
}))

const mockAuthState = {
  user: {
    id: 'user-1',
    email: 'dev@tasko.vn',
    fullName: 'Dev User',
    avatarUrl: null,
  },
}

vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector?: (s: typeof mockAuthState) => any) =>
    selector ? selector(mockAuthState) : mockAuthState,
}))

describe('GanttView - Component Tests', () => {
  let queryClient: QueryClient
  const today = formatLocalDateKey(new Date())
  const startA = addDaysToKey(today, 0)
  const dueA = addDaysToKey(today, 4)
  const startB = addDaysToKey(today, 1)
  const dueB = addDaysToKey(today, 3)

  const mockTasks: TaskItem[] = [
    {
      id: 'parent-1',
      projectId: 'proj-1',
      sprintId: 'sprint-1',
      taskKey: 'TSK-1',
      title: 'Xây dựng phân hệ Gantt',
      statusId: 'st-prog',
      status: { id: 'st-prog', name: 'In Progress', category: 'IN_PROGRESS', color: '#4f46e5' },
      priority: 'HIGH',
      position: 1000,
      parentTaskId: null,
      startDate: null,
      dueDate: null,
      createdAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z',
    },
    {
      id: 'child-1',
      projectId: 'proj-1',
      sprintId: 'sprint-1',
      taskKey: 'TSK-2',
      title: 'Thiết kế ganttUtils',
      statusId: 'st-done',
      status: { id: 'st-done', name: 'Done', category: 'DONE', color: '#10b981' },
      priority: 'MEDIUM',
      position: 2000,
      parentTaskId: 'parent-1',
      startDate: startA,
      dueDate: dueA,
      createdAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z',
    },
    {
      id: 'child-2',
      projectId: 'proj-1',
      sprintId: 'sprint-1',
      taskKey: 'TSK-3',
      title: 'Vẽ SVG connectors',
      statusId: 'st-todo',
      status: { id: 'st-todo', name: 'To Do', category: 'TODO', color: '#94a3b8' },
      priority: 'LOW',
      position: 3000,
      parentTaskId: 'parent-1',
      startDate: startB,
      dueDate: dueB,
      createdAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z',
    },
    {
      id: 'backlog-1',
      projectId: 'proj-1',
      sprintId: null,
      taskKey: 'TSK-4',
      title: 'Công việc Backlog',
      statusId: 'st-todo',
      status: { id: 'st-todo', name: 'To Do', category: 'TODO', color: '#94a3b8' },
      priority: 'LOW',
      position: 4000,
      parentTaskId: null,
      startDate: null,
      dueDate: null,
      createdAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    })

    vi.mocked(taskService.getProjectTasks).mockResolvedValue(mockTasks)
    vi.mocked(taskService.updateProjectTask).mockImplementation(async (_p, taskId, payload) => ({
      ...mockTasks.find((t) => t.id === taskId)!,
      ...payload,
    }))
    vi.mocked(sprintService.getSprints).mockResolvedValue([
      {
        id: 'sprint-1',
        projectId: 'proj-1',
        name: 'Sprint 1',
        status: 'ACTIVE',
        position: 1,
        createdAt: '2026-11-01T00:00:00Z',
        updatedAt: '2026-11-01T00:00:00Z',
      } as any,
    ])
    vi.mocked(projectService.getProjectById).mockResolvedValue({
      id: 'proj-1',
      key: 'TSK',
      name: 'Tasko Core',
      workspaceId: 'ws-1',
    } as any)
    vi.mocked(projectService.getProjectMembers).mockResolvedValue([
      {
        id: 'pm-1',
        userId: 'user-1',
        user: { id: 'user-1', email: 'dev@tasko.vn', fullName: 'Dev User', avatarUrl: null },
        roleId: 'role-member',
        role: { id: 'role-member', name: 'MEMBER' },
        joinedAt: '2026-11-01T00:00:00Z',
      },
    ])
    vi.mocked(workspaceService.getMyWorkspaces).mockResolvedValue([
      {
        id: 'ws-1',
        name: 'Tasko WS',
        slug: 'tasko-ws',
        role: 'MEMBER',
        ownerId: 'owner-999',
      } as any,
    ])
  })

  const renderGantt = (props?: { readOnly?: boolean }) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/tasko-ws/TSK/gantt']}>
          <Routes>
            <Route
              path="/:workspaceSlug/:projectKey/gantt"
              element={<GanttView {...props} />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

  it('1. Render cây Task cha-con, tiến độ tổng hợp và SVG connectors', async () => {
    renderGantt()

    await waitFor(() => {
      expect(screen.getByText('Xây dựng phân hệ Gantt')).toBeInTheDocument()
      expect(screen.getByText('Thiết kế ganttUtils')).toBeInTheDocument()
      expect(screen.getByText('Vẽ SVG connectors')).toBeInTheDocument()
    })

    // 1/2 task con DONE => 50%
    expect(screen.getByText('2 · 50%')).toBeInTheDocument()
    // SVG đường nối cha-con được vẽ khi đang mở rộng
    expect(screen.getByTestId('gantt-svg-connectors')).toBeInTheDocument()
  })

  it('2. Thu gọn và mở rộng nhánh Task cha ẩn/hiện đúng các Task con', async () => {
    renderGantt()

    await screen.findByText('Thiết kế ganttUtils')

    // Thu gọn TSK-1
    fireEvent.click(screen.getByRole('button', { name: /Thu gọn TSK-1/i }))
    expect(screen.queryByText('Thiết kế ganttUtils')).not.toBeInTheDocument()
    expect(screen.queryByText('Vẽ SVG connectors')).not.toBeInTheDocument()

    // Mở rộng lại TSK-1
    fireEvent.click(screen.getByRole('button', { name: /Mở rộng TSK-1/i }))
    expect(screen.getByText('Thiết kế ganttUtils')).toBeInTheDocument()
    expect(screen.getByText('Vẽ SVG connectors')).toBeInTheDocument()
  })

  it('3. Lọc theo Sprint (Backlog) và theo Trạng thái hiển thị đúng tập task', async () => {
    renderGantt()

    await screen.findByText('Công việc Backlog')

    // Lọc chỉ Backlog
    const sprintSelect = screen.getByLabelText('Lọc theo Sprint')
    fireEvent.change(sprintSelect, { target: { value: 'BACKLOG' } })

    expect(screen.getByText('Công việc Backlog')).toBeInTheDocument()
    expect(screen.queryByText('Xây dựng phân hệ Gantt')).not.toBeInTheDocument()

    // Quay về Tất cả Sprint rồi lọc theo trạng thái Done
    fireEvent.change(sprintSelect, { target: { value: 'ALL' } })
    const statusSelect = screen.getByLabelText('Lọc theo trạng thái')
    fireEvent.change(statusSelect, { target: { value: 'st-done' } })

    expect(screen.getByText('Thiết kế ganttUtils')).toBeInTheDocument()
    expect(screen.queryByText('Công việc Backlog')).not.toBeInTheDocument()
  })

  it('4. Kéo thanh Gantt (move) gọi taskService.updateProjectTask với startDate/dueDate mới', async () => {
    renderGantt()

    const bar = await screen.findByTestId('gantt-bar-child-1')

    // Zoom mặc định 'month' => dayWidthPx = 40px. Kéo sang phải 80px => +2 ngày
    fireEvent.pointerDown(bar, { clientX: 100 })
    fireEvent.pointerMove(window, { clientX: 180 })
    fireEvent.pointerUp(window, { clientX: 180 })

    const expectedStart = addDaysToKey(startA, 2)
    const expectedDue = addDaysToKey(dueA, 2)

    await waitFor(() => {
      expect(taskService.updateProjectTask).toHaveBeenCalledWith('TSK', 'child-1', {
        startDate: expectedStart,
        dueDate: expectedDue,
      })
    })
  })

  it('5. Chặn kéo thả và ẩn handle chỉnh sửa khi người dùng có vai trò VIEWER (read-only)', async () => {
    vi.mocked(projectService.getProjectMembers).mockResolvedValue([
      {
        id: 'pm-viewer',
        userId: 'user-1',
        user: { id: 'user-1', email: 'dev@tasko.vn', fullName: 'Dev User', avatarUrl: null },
        roleId: 'role-viewer',
        role: { id: 'role-viewer', name: 'VIEWER' },
        joinedAt: '2026-11-01T00:00:00Z',
      },
    ])

    renderGantt()

    const bar = await screen.findByTestId('gantt-bar-child-1')
    await waitFor(() => {
      expect(screen.getByText('Chế độ chỉ xem')).toBeInTheDocument()
    })

    expect(bar).toHaveAttribute('data-readonly', 'true')
    expect(screen.queryByTestId('gantt-resize-start-child-1')).not.toBeInTheDocument()
    expect(screen.queryByTestId('gantt-resize-end-child-1')).not.toBeInTheDocument()

    // Thử kéo thả => không được gọi API updateProjectTask
    fireEvent.pointerDown(bar, { clientX: 100 })
    fireEvent.pointerMove(window, { clientX: 220 })
    fireEvent.pointerUp(window, { clientX: 220 })

    expect(taskService.updateProjectTask).not.toHaveBeenCalled()
  })
})
