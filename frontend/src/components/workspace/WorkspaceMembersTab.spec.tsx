import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WorkspaceMembersTab } from './WorkspaceMembersTab'
import { workspaceService } from '@/services/workspaceService'
import { projectService } from '@/services/projectService'
import { userService } from '@/services/userService'

vi.mock('@/services/workspaceService', () => ({
  workspaceService: {
    getMembers: vi.fn(),
    addMember: vi.fn(),
    updateMemberRole: vi.fn(),
    removeMember: vi.fn(),
  },
}))

vi.mock('@/services/projectService', () => ({
  projectService: {
    getRoles: vi.fn(),
  },
}))

vi.mock('@/services/userService', () => ({
  userService: {
    searchUsers: vi.fn(),
  },
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    user: {
      id: 'current-user-id',
      email: 'current@tasko.vn',
      fullName: 'Current User',
    },
  }),
}))

describe('WorkspaceMembersTab - Component Tests', () => {
  let queryClient: QueryClient

  const mockWorkspace = {
    id: 'ws-123',
    name: 'Marketing Team',
    slug: 'marketing-team',
    description: 'Workspace for marketing',
    role: 'OWNER' as const,
    ownerId: 'current-user-id',
    memberCount: 2,
    createdAt: '2026-10-27T10:00:00Z',
    updatedAt: '2026-10-27T10:00:00Z',
  }

  const mockMembers = [
    {
      id: 'wm-1',
      userId: 'current-user-id',
      user: {
        id: 'current-user-id',
        email: 'current@tasko.vn',
        fullName: 'Current User',
        avatarUrl: null,
      },
      roleId: 'role-owner',
      role: { id: 'role-owner', name: 'OWNER' },
      joinedAt: '2026-10-27T10:00:00Z',
    },
    {
      id: 'wm-2',
      userId: 'user-2',
      user: {
        id: 'user-2',
        email: 'colleague@tasko.vn',
        fullName: 'Colleague Dev',
        avatarUrl: null,
      },
      roleId: 'role-member',
      role: { id: 'role-member', name: 'MEMBER' },
      joinedAt: '2026-10-28T10:00:00Z',
    },
  ]

  const mockRoles = [
    { id: 'role-admin', name: 'ADMIN', scope: 'WORKSPACE' as const },
    { id: 'role-member', name: 'MEMBER', scope: 'WORKSPACE' as const },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    })
    vi.mocked(workspaceService.getMembers).mockResolvedValue(mockMembers as any)
    vi.mocked(projectService.getRoles).mockResolvedValue(mockRoles as any)
  })

  const renderComponent = (canManage = true) =>
    render(
      <QueryClientProvider client={queryClient}>
        <WorkspaceMembersTab workspace={mockWorkspace} canManage={canManage} />
      </QueryClientProvider>
    )

  it('1. Render danh sách thành viên hiện tại của Workspace', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Danh sách thành viên (2)')).toBeInTheDocument()
      expect(screen.getByText('Current User')).toBeInTheDocument()
      expect(screen.getByText('Colleague Dev')).toBeInTheDocument()
      expect(screen.getAllByText('Chủ sở hữu').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('2. Tìm kiếm với debounce và thêm thành viên mới', async () => {
    const searchUser = {
      id: 'user-new',
      email: 'newbie@tasko.vn',
      fullName: 'Newbie User',
      avatarUrl: null,
    }
    vi.mocked(userService.searchUsers).mockResolvedValue([searchUser])
    vi.mocked(workspaceService.addMember).mockResolvedValue({ id: 'wm-new' } as any)

    renderComponent(true)

    // Nhập vào ô tìm kiếm
    const searchInput = screen.getByPlaceholderText(/Nhập email hoặc họ tên thành viên để tìm kiếm/i)
    fireEvent.change(searchInput, { target: { value: 'newbie' } })

    // Đợi debounce 300ms và popup hiển thị
    await waitFor(
      () => {
        expect(userService.searchUsers).toHaveBeenCalledWith('newbie')
        expect(screen.getByText('Newbie User')).toBeInTheDocument()
      },
      { timeout: 1500 }
    )

    // Click chọn người dùng từ popup gợi ý
    fireEvent.click(screen.getByText('Newbie User'))

    // Nút Thêm bây giờ đã được kích hoạt
    const addButton = screen.getByRole('button', { name: /Thêm/i })
    expect(addButton).not.toBeDisabled()
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(workspaceService.addMember).toHaveBeenCalledWith('ws-123', {
        email: 'newbie@tasko.vn',
        roleId: 'role-member',
      })
    })
  })

  it('3. Đổi vai trò của thành viên', async () => {
    vi.mocked(workspaceService.updateMemberRole).mockResolvedValue({} as any)

    renderComponent(true)

    await waitFor(() => {
      expect(screen.getByText('Colleague Dev')).toBeInTheDocument()
    })

    // Colleague Dev có vai trò MEMBER, mở select để đổi sang ADMIN
    const selects = screen.getAllByRole('combobox')
    const memberRoleSelect = selects[selects.length - 1] // Select trong danh sách thành viên

    fireEvent.change(memberRoleSelect, { target: { value: 'role-admin' } })

    await waitFor(() => {
      expect(workspaceService.updateMemberRole).toHaveBeenCalledWith(
        'ws-123',
        'user-2',
        { roleId: 'role-admin' }
      )
    })
  })
})
