import { describe, it, expect, vi, beforeEach } from 'vitest'
import { workspaceService } from './workspaceService'
import { api } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
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

  it('gọi đúng endpoint PATCH /workspaces/:wsId khi cập nhật workspace', async () => {
    const wsId = 'ws-123'
    const payload = { name: 'New Name' }
    vi.mocked(api.patch).mockResolvedValue({ data: { id: wsId, name: 'New Name' } })

    await workspaceService.update(wsId, payload)
    expect(api.patch).toHaveBeenCalledWith('/workspaces/ws-123', payload)
  })

  it('gọi đúng endpoint POST /workspaces/:wsId/members khi thêm thành viên', async () => {
    const wsId = 'ws-123'
    const payload = { email: 'user@example.com', roleId: 'role-1' }
    vi.mocked(api.post).mockResolvedValue({ data: { id: 'wm-1' } })

    await workspaceService.addMember(wsId, payload)
    expect(api.post).toHaveBeenCalledWith('/workspaces/ws-123/members', payload)
  })

  it('gọi đúng endpoint DELETE /workspaces/:wsId/members/:userId khi xóa thành viên', async () => {
    const wsId = 'ws-123'
    const userId = 'user-456'
    vi.mocked(api.delete).mockResolvedValue({ data: { success: true } })

    await workspaceService.removeMember(wsId, userId)
    expect(api.delete).toHaveBeenCalledWith('/workspaces/ws-123/members/user-456')
  })
})
