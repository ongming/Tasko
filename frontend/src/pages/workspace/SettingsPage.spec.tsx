import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { SettingsPage } from './SettingsPage'
import { workspaceService } from '@/services/workspaceService'
import { projectService } from '@/services/projectService'
import { userService } from '@/services/userService'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/services/workspaceService', () => ({
  workspaceService: {
    getMyWorkspaces: vi.fn(),
    getMembers: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
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

const mockAuthState = {
  user: {
    id: 'current-user-id',
    email: 'minh@tasko.vn',
    fullName: 'Nguyễn Minh',
    avatarUrl: null,
    hasPassword: true,
    emailVerified: true,
  },
  updateUser: vi.fn(),
}

vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector?: (state: typeof mockAuthState) => any) =>
    selector ? selector(mockAuthState) : mockAuthState,
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

  it('4. Chỉ Chủ sở hữu (OWNER) mới thấy và dùng được nút xóa Workspace', async () => {
    // 4a. Trường hợp user là ADMIN (không phải ownerId) -> ẩn nút xóa
    vi.mocked(workspaceService.getMyWorkspaces).mockResolvedValue([
      {
        ...mockWorkspaces[0],
        role: 'ADMIN' as const,
        ownerId: 'another-owner-id',
      },
    ] as any)

    const { unmount } = renderComponent()
    fireEvent.click(screen.getByRole('button', { name: /Không gian làm việc/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/Chỉ Chủ sở hữu Workspace mới có quyền xóa không gian làm việc này/i),
      ).toBeInTheDocument()
    })
    expect(
      screen.queryByRole('button', { name: /Xóa không gian làm việc/i }),
    ).not.toBeInTheDocument()

    unmount()

    // 4b. Trường hợp user là OWNER -> thấy nút xóa
    vi.mocked(workspaceService.getMyWorkspaces).mockResolvedValue(mockWorkspaces as any)
    renderComponent()
    fireEvent.click(screen.getByRole('button', { name: /Không gian làm việc/i }))

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Xóa không gian làm việc/i }),
      ).toBeInTheDocument()
    })
  })

  it('5. Nút xác nhận xóa bị khóa khi nhập sai tên Workspace và mở khóa khi nhập đúng tên', async () => {
    renderComponent()
    fireEvent.click(screen.getByRole('button', { name: /Không gian làm việc/i }))

    const openDeleteBtn = await screen.findByRole('button', { name: /Xóa không gian làm việc/i })
    fireEvent.click(openDeleteBtn)

    const confirmBtn = screen.getByRole('button', { name: /Xóa vĩnh viễn Workspace/i })
    const input = screen.getByPlaceholderText(/Nhập "Lập trình web" để xác nhận/i)

    expect(confirmBtn).toBeDisabled()

    // Nhập sai tên
    fireEvent.change(input, { target: { value: 'lập trình web' } })
    expect(confirmBtn).toBeDisabled()

    // Nhập đúng tên Workspace
    fireEvent.change(input, { target: { value: 'Lập trình web' } })
    expect(confirmBtn).toBeEnabled()
  })

  it('6. Gọi workspaceService.remove(wsId) và điều hướng sang Workspace khác nếu còn', async () => {
    vi.mocked(workspaceService.getMyWorkspaces).mockResolvedValue([
      mockWorkspaces[0],
      {
        id: 'ws-2',
        name: 'Dự án khác',
        slug: 'du-an-khac',
        description: null,
        role: 'OWNER' as const,
        ownerId: 'current-user-id',
        memberCount: 1,
        createdAt: '2026-10-28T10:00:00Z',
        updatedAt: '2026-10-28T10:00:00Z',
      },
    ] as any)
    vi.mocked(workspaceService.remove).mockResolvedValue({
      success: true,
      message: 'Đã xóa không gian làm việc thành công',
    } as any)

    renderComponent()
    fireEvent.click(screen.getByRole('button', { name: /Không gian làm việc/i }))

    const openDeleteBtn = await screen.findByRole('button', { name: /Xóa không gian làm việc/i })
    fireEvent.click(openDeleteBtn)

    const input = screen.getByPlaceholderText(/Nhập "Lập trình web" để xác nhận/i)
    fireEvent.change(input, { target: { value: 'Lập trình web' } })

    fireEvent.click(screen.getByRole('button', { name: /Xóa vĩnh viễn Workspace/i }))

    await waitFor(() => {
      expect(workspaceService.remove).toHaveBeenCalledWith('ws-1')
      expect(mockNavigate).toHaveBeenCalledWith('/du-an-khac/overview', { replace: true })
    })
  })

  it('7. Điều hướng về "/" sau khi xóa Workspace duy nhất của người dùng', async () => {
    vi.mocked(workspaceService.remove).mockResolvedValue({
      success: true,
      message: 'Đã xóa không gian làm việc thành công',
    } as any)

    renderComponent()
    fireEvent.click(screen.getByRole('button', { name: /Không gian làm việc/i }))

    const openDeleteBtn = await screen.findByRole('button', { name: /Xóa không gian làm việc/i })
    fireEvent.click(openDeleteBtn)

    const input = screen.getByPlaceholderText(/Nhập "Lập trình web" để xác nhận/i)
    fireEvent.change(input, { target: { value: 'Lập trình web' } })

    fireEvent.click(screen.getByRole('button', { name: /Xóa vĩnh viễn Workspace/i }))

    await waitFor(() => {
      expect(workspaceService.remove).toHaveBeenCalledWith('ws-1')
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })
})
