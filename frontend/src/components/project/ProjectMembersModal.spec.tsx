import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProjectMembersModal } from './ProjectMembersModal'
import { projectService } from '@/services/projectService'
import { workspaceService } from '@/services/workspaceService'
import { userService } from '@/services/userService'
import { useAuthStore } from '@/stores/authStore'
import type { ProjectMember, Role } from '@/types/member'

vi.mock('@/services/projectService')
vi.mock('@/services/workspaceService')
vi.mock('@/services/userService')
vi.mock('@/stores/authStore')

describe('ProjectMembersModal - Component Tests', () => {
  let queryClient: QueryClient

  const mockCurrentUser = {
    id: 'user-owner',
    email: 'owner@tasko.dev',
    full_name: 'Project Owner',
  }

  const mockRoles: Role[] = [
    { id: 'role-owner', name: 'OWNER', description: 'Chủ dự án', scope: 'PROJECT' },
    { id: 'role-member', name: 'MEMBER', description: 'Thành viên dự án', scope: 'PROJECT' },
    { id: 'role-viewer', name: 'VIEWER', description: 'Người xem dự án', scope: 'PROJECT' },
  ]

  const mockProjectMembers: ProjectMember[] = [
    {
      id: 'pm-1',
      projectId: 'proj-123',
      userId: 'user-owner',
      roleId: 'role-owner',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      user: {
        id: 'user-owner',
        email: 'owner@tasko.dev',
        fullName: 'Project Owner',
        avatarUrl: null,
      },
      role: {
        id: 'role-owner',
        name: 'OWNER',
      },
    },
    {
      id: 'pm-2',
      projectId: 'proj-123',
      userId: 'user-member',
      roleId: 'role-member',
      createdAt: '2026-01-02',
      updatedAt: '2026-01-02',
      user: {
        id: 'user-member',
        email: 'member@tasko.dev',
        fullName: 'Alice Member',
        avatarUrl: 'https://example.com/alice.png',
      },
      role: {
        id: 'role-member',
        name: 'MEMBER',
      },
    },
    {
      id: 'pm-3',
      projectId: 'proj-123',
      userId: 'user-viewer',
      roleId: 'role-viewer',
      createdAt: '2026-01-03',
      updatedAt: '2026-01-03',
      user: {
        id: 'user-viewer',
        email: 'viewer@tasko.dev',
        fullName: 'Bob Viewer',
        avatarUrl: null,
      },
      role: {
        id: 'role-viewer',
        name: 'VIEWER',
      },
    },
  ]

  const mockWorkspaceMembers = [
    {
      id: 'wm-1',
      workspaceId: 'ws-123',
      userId: 'user-owner',
      user: { id: 'user-owner', email: 'owner@tasko.dev', fullName: 'Project Owner' },
      role: { id: 'ws-admin', name: 'ADMIN' },
    },
    {
      id: 'wm-2',
      workspaceId: 'ws-123',
      userId: 'user-member',
      user: { id: 'user-member', email: 'member@tasko.dev', fullName: 'Alice Member' },
      role: { id: 'ws-member', name: 'MEMBER' },
    },
    {
      id: 'wm-4',
      workspaceId: 'ws-123',
      userId: 'user-new',
      user: { id: 'user-new', email: 'newbie@tasko.dev', fullName: 'Charlie Newbie' },
      role: { id: 'ws-member', name: 'MEMBER' },
    },
  ]

  const mockProject = {
    id: 'proj-123',
    name: 'Website Redesign',
    key: 'WR',
    ownerId: 'user-owner',
    workspaceId: 'ws-123',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    vi.mocked(useAuthStore).mockReturnValue({
      user: mockCurrentUser as any,
    } as any)

    vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject as any)
    vi.mocked(projectService.getProjectMembers).mockResolvedValue(mockProjectMembers)
    vi.mocked(projectService.getRoles).mockResolvedValue(mockRoles)
    vi.mocked(workspaceService.getMembers).mockResolvedValue(mockWorkspaceMembers as any)
  })

  const renderModal = (props: Partial<Parameters<typeof ProjectMembersModal>[0]> = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ProjectMembersModal
          isOpen={true}
          onClose={vi.fn()}
          projectId="proj-123"
          workspaceId="ws-123"
          {...props}
        />
      </QueryClientProvider>,
    )
  }

  it('không render gì khi isOpen là false', () => {
    const { container } = renderModal({ isOpen: false })
    expect(container.firstChild).toBeNull()
  })

  it('render đầy đủ danh sách thành viên và huy hiệu Chủ sở hữu', async () => {
    renderModal()

    expect(await screen.findByText('Thành viên Dự án')).toBeInTheDocument()
    expect(await screen.findByText('Alice Member')).toBeInTheDocument()
    expect(screen.getByText('member@tasko.dev')).toBeInTheDocument()
    expect(screen.getByText('Bob Viewer')).toBeInTheDocument()
    expect(screen.getByText('viewer@tasko.dev')).toBeInTheDocument()

    // Owner badge
    expect(screen.getByText('Chủ sở hữu')).toBeInTheDocument()
  })

  it('hiển thị giao diện quản lý khi người dùng là Chủ sở hữu dự án', async () => {
    renderModal()

    // Có phần form thêm thành viên
    expect(await screen.findByText('Thêm thành viên mới')).toBeInTheDocument()
    // Có nút thêm
    expect(screen.getByRole('button', { name: /Thêm vào dự án/i })).toBeInTheDocument()

    // Có nút chuyển quyền sở hữu và xóa cho các thành viên khác
    expect(await screen.findByLabelText('Chuyển quyền sở hữu cho Alice Member')).toBeInTheDocument()
    expect(screen.getByLabelText('Xóa Alice Member khỏi dự án')).toBeInTheDocument()
  })

  it('hiển thị chế độ chỉ đọc (read-only) khi người dùng là Viewer thường không có quyền quản lý', async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: 'user-viewer', email: 'viewer@tasko.dev', full_name: 'Bob Viewer' } as any,
    } as any)

    renderModal()

    // Thông báo chỉ đọc
    expect(
      await screen.findByText(/Bạn đang xem danh sách ở chế độ chỉ đọc/i),
    ).toBeInTheDocument()

    // Không có form thêm thành viên
    expect(screen.queryByText('Thêm thành viên mới')).not.toBeInTheDocument()

    // Không có nút xóa hay chuyển quyền
    expect(screen.queryByLabelText(/Xóa Alice Member/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Chuyển quyền sở hữu cho Alice Member/i)).not.toBeInTheDocument()
  })

  it('thêm thành viên mới thành công từ danh sách tìm kiếm Autosuggest', async () => {
    vi.mocked(projectService.addProjectMember).mockResolvedValue({} as any)
    vi.mocked(userService.searchUsers).mockResolvedValue([
      {
        id: 'user-new',
        email: 'bob@tasko.dev',
        fullName: 'Bob New',
        avatarUrl: null,
      },
    ])

    renderModal()

    expect(await screen.findByText('Thêm thành viên mới')).toBeInTheDocument()

    // Nhập từ khóa tìm kiếm vào ô input
    const searchInput = screen.getByPlaceholderText('Nhập email hoặc họ tên thành viên...')
    fireEvent.change(searchInput, { target: { value: 'bob@tasko.dev' } })

    // Đợi popup gợi ý hiển thị kết quả sau khi debounce
    const userOption = await screen.findByText('Bob New')
    expect(userOption).toBeInTheDocument()

    // Bấm chọn user từ popup
    fireEvent.click(userOption)

    const addBtn = screen.getByRole('button', { name: /Thêm vào dự án/i })
    fireEvent.click(addBtn)

    await waitFor(() => {
      expect(projectService.addProjectMember).toHaveBeenCalledWith('proj-123', {
        userId: 'user-new',
        email: undefined,
        roleId: 'role-member',
      })
    })

    expect(await screen.findByText('Thêm thành viên vào dự án thành công!')).toBeInTheDocument()
  })

  it('cập nhật vai trò thành viên khi thay đổi dropdown vai trò', async () => {
    vi.mocked(projectService.updateProjectMemberRole).mockResolvedValue({} as any)

    renderModal()

    // Chờ danh sách thành viên load xong
    const aliceName = await screen.findByText('Alice Member')
    // Tìm phần tử container chứa thông tin Alice Member
    const aliceRow = aliceName.closest('.hover\\:bg-slate-50\\/70') || aliceName.parentElement?.parentElement?.parentElement
    expect(aliceRow).not.toBeNull()

    const roleSelect = aliceRow!.querySelector('[role="combobox"]')
    expect(roleSelect).not.toBeNull()

    fireEvent.click(roleSelect!)
    fireEvent.click(screen.getByRole('option', { name: 'Viewer' }))

    await waitFor(() => {
      expect(projectService.updateProjectMemberRole).toHaveBeenCalledWith(
        'proj-123',
        'user-member',
        'role-viewer',
      )
    })

    expect(await screen.findByText('Cập nhật vai trò thành công!')).toBeInTheDocument()
  })

  it('mở modal xác nhận xóa và xóa thành viên thành công', async () => {
    vi.mocked(projectService.removeProjectMember).mockResolvedValue({} as any)

    renderModal()

    const deleteBtn = await screen.findByLabelText('Xóa Alice Member khỏi dự án')
    fireEvent.click(deleteBtn)

    // Hiển thị dialog xác nhận
    expect(screen.getByText('Xóa thành viên khỏi dự án?')).toBeInTheDocument()
    expect(screen.getByText(/Bạn có chắc chắn muốn xóa/i)).toBeInTheDocument()

    // Nhấn nút xác nhận xóa
    const confirmDeleteBtn = screen.getByRole('button', { name: /Xác nhận xóa/i })
    fireEvent.click(confirmDeleteBtn)

    await waitFor(() => {
      expect(projectService.removeProjectMember).toHaveBeenCalledWith('proj-123', 'user-member')
    })

    expect(await screen.findByText('Đã xóa thành viên khỏi dự án!')).toBeInTheDocument()
  })

  it('mở modal xác nhận chuyển giao quyền sở hữu và chuyển giao thành công', async () => {
    vi.mocked(projectService.transferProjectOwnership).mockResolvedValue({} as any)

    renderModal()

    const transferBtn = await screen.findByLabelText('Chuyển quyền sở hữu cho Alice Member')
    fireEvent.click(transferBtn)

    // Hiển thị dialog xác nhận chuyển quyền
    expect(screen.getByText('Chuyển quyền sở hữu dự án?')).toBeInTheDocument()
    expect(screen.getByText(/Hành động này không thể hoàn tác/i)).toBeInTheDocument()

    // Nhấn nút xác nhận chuyển
    const confirmTransferBtn = screen.getByRole('button', { name: /Xác nhận chuyển/i })
    fireEvent.click(confirmTransferBtn)

    await waitFor(() => {
      expect(projectService.transferProjectOwnership).toHaveBeenCalledWith(
        'proj-123',
        'user-member',
      )
    })

    expect(
      await screen.findByText('Đã chuyển giao quyền sở hữu dự án thành công!'),
    ).toBeInTheDocument()
  })

  it('lọc danh sách thành viên theo từ khóa tìm kiếm', async () => {
    renderModal()

    await screen.findByText('Alice Member')
    expect(screen.getByText('Bob Viewer')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Tìm thành viên...')
    fireEvent.change(searchInput, { target: { value: 'alice' } })

    expect(screen.getByText('Alice Member')).toBeInTheDocument()
    expect(screen.queryByText('Bob Viewer')).not.toBeInTheDocument()
  })

  it('gọi onClose khi nhấn nút Đóng hoặc icon X', async () => {
    const onCloseMock = vi.fn()
    renderModal({ onClose: onCloseMock })

    await screen.findByText('Thành viên Dự án')

    // 2 nút có text/aria-label "Đóng": icon X và nút Đóng footer
    const closeButtons = screen.getAllByRole('button', { name: 'Đóng' })
    expect(closeButtons.length).toBeGreaterThanOrEqual(2)

    // Nhấn icon X
    fireEvent.click(closeButtons[0])
    expect(onCloseMock).toHaveBeenCalledTimes(1)

    // Nhấn nút Đóng footer
    fireEvent.click(closeButtons[1])
    expect(onCloseMock).toHaveBeenCalledTimes(2)
  })
})
