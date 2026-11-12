import { describe, it, expect, vi, beforeEach } from 'vitest'
import { workspaceService } from './workspaceService'
import { api } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('workspaceService - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gọi đúng endpoint POST /workspaces khi tạo workspace mới', async () => {
    const payload = {
      name: 'Tasko Team',
      slug: 'tasko-team',
      description: 'Main dev team workspace',
    }

    const mockResponse = {
      data: {
        id: 'ws-123',
        name: 'Tasko Team',
        slug: 'tasko-team',
        role: 'owner',
      },
    }

    vi.mocked(api.post).mockResolvedValue(mockResponse)

    const result = await workspaceService.create(payload)

    expect(api.post).toHaveBeenCalledWith('/workspaces', payload)
    expect(result).toEqual(mockResponse)
  })

  it('gọi đúng endpoint GET /workspaces để lấy danh sách workspace của user', async () => {
    const mockList = {
      data: [
        { id: 'ws-1', name: 'WS 1', slug: 'ws-1' },
        { id: 'ws-2', name: 'WS 2', slug: 'ws-2' },
      ],
    }

    vi.mocked(api.get).mockResolvedValue(mockList)

    const result = await workspaceService.getMyWorkspaces()

    expect(api.get).toHaveBeenCalledWith('/workspaces')
    expect(result).toEqual(mockList)
  })

  it('gọi đúng endpoint GET /workspaces/:slug có mã hóa URL', async () => {
    const slug = 'phong-cong-nghe'
    const mockDetail = {
      data: { id: 'ws-99', name: 'Phòng Công Nghệ', slug },
    }

    vi.mocked(api.get).mockResolvedValue(mockDetail)

    const result = await workspaceService.getBySlug(slug)

    expect(api.get).toHaveBeenCalledWith('/workspaces/phong-cong-nghe')
    expect(result).toEqual(mockDetail)
  })
})
