import { describe, it, expect, vi, beforeEach } from 'vitest'
import { taskService } from './taskService'
import { api } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('taskService - Unit Tests', () => {
  const mockProjectId = 'proj-123'
  const mockTaskId = 'task-456'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('1. getProjectTasks gọi đúng endpoint với search và sprintId', async () => {
    vi.mocked(api.get).mockResolvedValue([])

    await taskService.getProjectTasks(mockProjectId, {
      search: 'login',
      sprintId: 'sprint-1',
      statusId: 'status-todo',
      priority: 'HIGH',
      sortBy: 'dueDate',
      sortOrder: 'DESC',
    })

    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-123/tasks?'),
    )
    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining('search=login'),
    )
    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining('sprintId=sprint-1'),
    )
    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining('statusId=status-todo'),
    )
    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining('priority=HIGH'),
    )
    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining('sortBy=dueDate'),
    )
    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining('sortOrder=DESC'),
    )
  })

  it('2. createProjectTask gọi POST với payload tạo task / subtask', async () => {
    const payload = {
      title: 'Viết Unit Test cho Subtask',
      parentTaskId: 'task-parent-1',
      storyPoints: 3,
      estimatedHours: 4,
    }
    vi.mocked(api.post).mockResolvedValue({ id: 'task-new', ...payload })

    const result = await taskService.createProjectTask(mockProjectId, payload)

    expect(api.post).toHaveBeenCalledWith('/projects/proj-123/tasks', payload)
    expect(result.id).toBe('task-new')
  })

  it('3. getTaskById gọi GET lấy chi tiết task', async () => {
    vi.mocked(api.get).mockResolvedValue({ id: mockTaskId, title: 'Task Chi Tiết' })

    const result = await taskService.getTaskById(mockProjectId, mockTaskId)

    expect(api.get).toHaveBeenCalledWith('/projects/proj-123/tasks/task-456')
    expect(result.title).toBe('Task Chi Tiết')
  })

  it('4. updateProjectTask gọi PATCH cập nhật thông tin task', async () => {
    const payload = { title: 'Tiêu đề mới', priority: 'URGENT' as const }
    vi.mocked(api.patch).mockResolvedValue({ id: mockTaskId, ...payload })

    const result = await taskService.updateProjectTask(mockProjectId, mockTaskId, payload)

    expect(api.patch).toHaveBeenCalledWith('/projects/proj-123/tasks/task-456', payload)
    expect(result.priority).toBe('URGENT')
  })

  it('5. moveProjectTask gọi PATCH /move di chuyển task', async () => {
    const payload = { statusId: 'status-done', position: 2000 }
    vi.mocked(api.patch).mockResolvedValue({ id: mockTaskId, ...payload })

    const result = await taskService.moveProjectTask(mockProjectId, mockTaskId, payload)

    expect(api.patch).toHaveBeenCalledWith('/projects/proj-123/tasks/task-456/move', payload)
    expect(result.statusId).toBe('status-done')
  })

  it('6. deleteProjectTask gọi DELETE xóa task', async () => {
    vi.mocked(api.delete).mockResolvedValue({ success: true })

    await taskService.deleteProjectTask(mockProjectId, mockTaskId)

    expect(api.delete).toHaveBeenCalledWith('/projects/proj-123/tasks/task-456')
  })
})
