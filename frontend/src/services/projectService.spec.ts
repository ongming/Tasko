import { describe, it, expect, vi, beforeEach } from 'vitest'
import { projectService } from './projectService'
import { api } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('projectService - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gọi đúng endpoint POST /projects khi tạo dự án mới', async () => {
    const payload = {
      name: 'Tasko Web',
      key: 'TASKO',
      workspaceId: 'ws-123',
      color: 'bg-indigo-600',
    }

    const mockResponse = {
      id: 'proj-123',
      name: 'Tasko Web',
      key: 'TASKO',
      color: 'bg-indigo-600',
    }

    vi.mocked(api.post).mockResolvedValue(mockResponse)

    const result = await projectService.createProject(payload)

    expect(api.post).toHaveBeenCalledWith('/projects', payload)
    expect(result).toEqual(mockResponse)
  })

  it('gọi đúng endpoint GET /projects?workspaceId=... khi có truyền workspaceId', async () => {
    const mockList = [
      { id: 'p1', name: 'P1', key: 'P1', color: 'blue' },
      { id: 'p2', name: 'P2', key: 'P2', color: 'green' },
    ]

    vi.mocked(api.get).mockResolvedValue(mockList)

    const result = await projectService.getProjects('ws-abc-123')

    expect(api.get).toHaveBeenCalledWith('/projects?workspaceId=ws-abc-123')
    expect(result).toEqual(mockList)
  })

  it('gọi đúng endpoint GET /projects khi không truyền workspaceId', async () => {
    vi.mocked(api.get).mockResolvedValue([])

    const result = await projectService.getProjects()

    expect(api.get).toHaveBeenCalledWith('/projects')
    expect(result).toEqual([])
  })

  it('gọi đúng endpoint GET /projects/:id để lấy chi tiết dự án', async () => {
    const mockDetail = { id: 'p-999', name: 'Single Project', key: 'SP' }
    vi.mocked(api.get).mockResolvedValue(mockDetail)

    const result = await projectService.getProjectById('p-999')

    expect(api.get).toHaveBeenCalledWith('/projects/p-999')
    expect(result).toEqual(mockDetail)
  })
})
