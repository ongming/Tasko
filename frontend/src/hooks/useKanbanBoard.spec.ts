import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useKanbanBoard } from './useKanbanBoard'
import { projectService } from '@/services/projectService'
import { sprintService } from '@/services/sprintService'
import { taskService } from '@/services/taskService'

vi.mock('@/services/projectService', () => ({
  projectService: {
    getProjectById: vi.fn(),
    getProjectStatuses: vi.fn(),
    getProjectMembers: vi.fn(),
    getProjectWorkTypes: vi.fn(),
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
    createProjectTask: vi.fn(),
    moveProjectTask: vi.fn(),
  },
}))

describe('useKanbanBoard - Custom Hook Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(projectService.getProjectById).mockResolvedValue({
      id: 'p1',
      name: 'Kanban Proj',
      key: 'KAN',
      settings: { method_id: 'kanban' },
    } as any)
    vi.mocked(projectService.getProjectStatuses).mockResolvedValue([
      { id: 'st-todo', name: 'Cần Làm', category: 'TODO' },
      { id: 'st-done', name: 'Hoàn Thành', category: 'DONE' },
    ] as any)
    vi.mocked(sprintService.getSprints).mockResolvedValue([])
    vi.mocked(projectService.getProjectMembers).mockResolvedValue([])
    vi.mocked(projectService.getProjectWorkTypes).mockResolvedValue([])
    vi.mocked(taskService.getProjectTasks).mockResolvedValue([
      { id: 't1', title: 'Task 1', taskKey: 'KAN-1', statusId: 'st-todo', priority: 'MEDIUM' },
    ] as any)
  })

  it('loads columns and tasks and distributes them into displayedColumns', async () => {
    const { result } = renderHook(() => useKanbanBoard('KAN'))

    await waitFor(() => {
      expect(result.current.columns).toHaveLength(2)
      expect(result.current.allTasks).toHaveLength(1)
    })

    expect(result.current.displayedColumns[0].tasks).toHaveLength(1)
    expect(result.current.displayedColumns[1].tasks).toHaveLength(0)
  })

  it('filters tasks by search query', async () => {
    const { result } = renderHook(() => useKanbanBoard('KAN'))

    await waitFor(() => {
      expect(result.current.allTasks).toHaveLength(1)
    })

    act(() => {
      result.current.setFilters({ search: 'non-existent' })
    })

    expect(result.current.filteredTasks).toHaveLength(0)
    expect(result.current.displayedColumns[0].tasks).toHaveLength(0)
  })
})
