import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { SettingsPage } from './SettingsPage'
import { workspaceService } from '@/services/workspaceService'
import { projectService } from '@/services/projectService'
import { userService } from '@/services/userService'

vi.mock('@/services/workspaceService', () => ({
  workspaceService: {
    getMyWorkspaces: vi.fn(),
    getMembers: vi.fn(),
    update: vi.fn(),
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
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
  },
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    user: {
      id: 'current-user-id',
      email: 'minh@tasko.vn',
      fullName: 'Nguyễn Minh',
      avatarUrl: null,
      hasPassword: true,
      emailVerified: true,
    },
    updateUser: vi.fn(),
  }),
}))

describe('SettingsPage - Component Tests', () => {
  let queryClient: QueryClient

  const mockWorkspaces = [
    {
      id: 'ws-1',
      name: 'Lập trình web',
      slug: 'lap-trinh-web',
      description: 'Workspace for web development',
      role: 'OWNER' as const,
      ownerId: 'current-user-id',
      memberCount: 2,
      createdAt: '2026-10-27T10:00:00Z',
      updatedAt: '2026-10-27T10:00:00Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    })
    vi.mocked(workspaceService.getMyWorkspaces).mockResolvedValue(mockWorkspaces as any)
    vi.mocked(workspaceService.getMembers).mockResolvedValue([] as any)
    vi.mocked(projectService.getRoles).mockResolvedValue([] as any)
  })

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SettingsPage />
        </BrowserRouter>
      </QueryClientProvider>
    )

  it('1. Render đầy đủ tiêu đề và 3 Tab chức năng', async () => {
    renderComponent()

    expect(screen.getByText('Cài đặt tài khoản & Hệ thống')).toBeInTheDocument()
    expect(screen.getByText('Hồ sơ & Bảo mật')).toBeInTheDocument()
    expect(screen.getByText('Không gian làm việc')).toBeInTheDocument()
    expect(screen.getByText('Thành viên')).toBeInTheDocument()
  })

  it('2. Chuyển sang Tab Không gian làm việc hiển thị cấu hình động', async () => {
    renderComponent()

    const wsTabButton = screen.getByRole('button', { name: /Không gian làm việc/i })
    fireEvent.click(wsTabButton)

    await waitFor(() => {
      expect(screen.getByText('Cấu hình Không gian làm việc')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Lập trình web')).toBeInTheDocument()
      expect(screen.getByDisplayValue('lap-trinh-web')).toBeInTheDocument()
    })
  })

  it('3. Chuyển sang Tab Thành viên hiển thị danh sách thành viên', async () => {
    renderComponent()

    const membersTabButton = screen.getByRole('button', { name: /Thành viên/i })
    fireEvent.click(membersTabButton)

    await waitFor(() => {
      expect(screen.getByText(/Thêm thành viên vào Không gian làm việc/i)).toBeInTheDocument()
      expect(screen.getByText(/Danh sách thành viên/i)).toBeInTheDocument()
    })
  })
})
