import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBacklogBoard } from './useBacklogBoard'
import { sprintService } from '@/services/sprintService'
import { taskService } from '@/services/taskService'
import { projectService } from '@/services/projectService'

vi.mock('@/services/sprintService', () => ({
  sprintService: {
    getSprints: vi.fn(),
    createSprint: vi.fn(),
    deleteSprint: vi.fn(),
    startSprint: vi.fn(),
    completeSprint: vi.fn(),
  },
}))

vi.mock('@/services/taskService', () => ({
  taskService: {
    getProjectTasks: vi.fn(),
    createProjectTask: vi.fn(),
    updateProjectTask: vi.fn(),
    moveProjectTask: vi.fn(),
  },
}))

vi.mock('@/services/projectService', () => ({
  projectService: {
    getProjectMembers: vi.fn(),
    getProjectWorkTypes: vi.fn(),
  },
}))

describe('useBacklogBoard - Custom Hook Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(sprintService.getSprints).mockResolvedValue([
      { id: 'sp-1', name: 'Sprint 1', status: 'ACTIVE' } as any,
      { id: 'sp-2', name: 'Sprint 2', status: 'PLANNED' } as any,
    ])
    vi.mocked(taskService.getProjectTasks).mockResolvedValue([
      { id: 't1', title: 'Sprint Task', taskKey: 'BL-1', sprintId: 'sp-1', priority: 'HIGH' } as any,
      { id: 't2', title: 'Backlog Task', taskKey: 'BL-2', sprintId: null, priority: 'LOW' } as any,
    ])
    vi.mocked(projectService.getProjectMembers).mockResolvedValue([])
    vi.mocked(projectService.getProjectWorkTypes).mockResolvedValue([])
  })

  it('loads sprints, splits plannedSprints & backlogTasks and expands sprints by default', async () => {
    const { result } = renderHook(() => useBacklogBoard('BL'))

    await waitFor(() => {
      expect(result.current.sprints).toHaveLength(2)
      expect(result.current.tasks).toHaveLength(2)
    })

    expect(result.current.plannedSprints).toHaveLength(1)
    expect(result.current.backlogTasks).toHaveLength(1)
    expect(result.current.expandedSprints['sp-1']).toBe(true)
  })

  it('filters tasks by search keyword across sprints and backlog', async () => {
    const { result } = renderHook(() => useBacklogBoard('BL'))

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(2)
    })

    act(() => {
      result.current.setFilters({ search: 'Backlog Task' })
    })

    expect(result.current.filteredTasks).toHaveLength(1)
    expect(result.current.backlogTasks).toHaveLength(1)
  })
})
