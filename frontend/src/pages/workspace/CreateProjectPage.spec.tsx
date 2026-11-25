import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { CreateProjectPage } from './CreateProjectPage'
import { projectService } from '@/services/projectService'
import { workspaceService } from '@/services/workspaceService'

vi.mock('@/services/projectService', () => ({
  projectService: {
    createProject: vi.fn(),
    getProjects: vi.fn(),
    getProjectById: vi.fn(),
    getRoles: vi.fn().mockResolvedValue([
      { id: 'role-member', name: 'MEMBER', scope: 'PROJECT' },
      { id: 'role-admin', name: 'ADMIN', scope: 'PROJECT' },
    ]),
  },
}))

vi.mock('@/services/workspaceService', () => ({
  workspaceService: {
    getMyWorkspaces: vi.fn().mockResolvedValue([
      { id: 'ws-mock-id', name: 'Mock Workspace', slug: 'mock-ws' },
    ]),
    getMembers: vi.fn().mockResolvedValue([
      {
        id: 'wm-2',
        workspaceId: 'ws-mock-id',
        userId: 'user-ws-2',
        role: 'MEMBER',
        user: { id: 'user-ws-2', fullName: 'Trần Bảo', email: 'bao@tasko.dev' },
      },
    ]),
  },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('CreateProjectPage - Frontend Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderComponent = (initialEntries = ['/workspace/projects/create?workspaceId=ws-mock-id']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <CreateProjectPage />
      </MemoryRouter>,
    )
  }

  it('Bước 1: Render đầy đủ tiêu đề và danh sách 3 phương pháp Agile (Kanban, Scrum, Scrumban)', () => {
    renderComponent()

    expect(screen.getByText('Dành cho bạn (Made for you)')).toBeInTheDocument()
    expect(screen.getByText('Kanban')).toBeInTheDocument()
    expect(screen.getByText('Scrum')).toBeInTheDocument()
    expect(screen.getByText('Scrumban')).toBeInTheDocument()
    expect(screen.getByTitle('Khởi tạo dự án thông minh bằng AI')).toBeInTheDocument()
  })

  it('Bước 1 -> Bước 2: Chọn Kanban chuyển sang Bước 2 xem chi tiết mẫu và lưới mô hình', async () => {
    renderComponent()

    // Click vào thẻ Kanban
    const kanbanCard = screen.getByText('Kanban').closest('div[role="button"]') || screen.getByText('Kanban')
    fireEvent.click(kanbanCard)

    // Kiểm tra đã sang Bước 2
    expect(await screen.findByText('Bước 2 / 3')).toBeInTheDocument()
    expect(screen.getAllByText(/Chọn mô hình phù hợp/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /Sử dụng mẫu này/i })).toBeInTheDocument()
  })

  it('Bước 2 -> Bước 3: Nhấn Sử dụng mẫu này chuyển sang Bước 3 thiết lập Tên và Key', async () => {
    renderComponent()

    // Sang bước 2
    fireEvent.click(screen.getByText('Kanban'))

    // Sang bước 3
    const useTemplateBtn = await screen.findByRole('button', { name: /Sử dụng mẫu này/i })
    fireEvent.click(useTemplateBtn)

    // Kiểm tra đã sang Bước 3
    expect(await screen.findByText('Thiết lập dự án')).toBeInTheDocument()
    expect(screen.getByLabelText(/Tên dự án/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Mã dự án/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Tạo dự án$/i })).toBeInTheDocument()
  })

  it('Bước 3: Chặn submit và hiển thị lỗi khi tên dự án bị xóa rỗng', async () => {
    renderComponent()

    // Điều hướng tới bước 3
    fireEvent.click(screen.getByText('Kanban'))
    fireEvent.click(await screen.findByRole('button', { name: /Sử dụng mẫu này/i }))

    const nameInput = await screen.findByLabelText(/Tên dự án/i)
    fireEvent.change(nameInput, { target: { value: '   ' } }) // Xóa rỗng tên

    const submitBtn = screen.getByRole('button', { name: /^Tạo dự án$/i })
    const form = submitBtn.closest('form')!
    fireEvent.submit(form)

    expect(await screen.findByText('Vui lòng nhập tên dự án')).toBeInTheDocument()
    expect(projectService.createProject).not.toHaveBeenCalled()
  })

  it('Bước 3: Gọi API tạo dự án thành công và điều hướng sang Board', async () => {
    vi.mocked(projectService.createProject).mockResolvedValue({
      id: 'proj-new-id',
      name: 'Tasko Agile Kanban',
      key: 'TAK',
      color: 'bg-indigo-600',
    })

    renderComponent()

    // Tới bước 3
    fireEvent.click(screen.getByText('Kanban'))
    fireEvent.click(await screen.findByRole('button', { name: /Sử dụng mẫu này/i }))

    const nameInput = await screen.findByLabelText(/Tên dự án/i)
    fireEvent.change(nameInput, { target: { value: 'Tasko Agile Kanban' } })

    const submitBtn = screen.getByRole('button', { name: /^Tạo dự án$/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(projectService.createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Tasko Agile Kanban',
          workspaceId: 'ws-mock-id',
        }),
      )
      expect(mockNavigate).toHaveBeenCalledWith('/mock-ws/TAK/board')
    })
  })

  it('Bước 3: Cho phép mở bảng chọn biểu tượng (Icon Picker) và chọn trực tiếp icon cho loại công việc', async () => {
    vi.mocked(projectService.createProject).mockResolvedValue({
      id: 'proj-icon-id',
      name: 'Icon Project',
      key: 'IP',
      color: 'bg-indigo-600',
    })

    renderComponent()

    fireEvent.click(screen.getByText('Kanban'))
    fireEvent.click(await screen.findByRole('button', { name: /Sử dụng mẫu này/i }))

    const nameInput = await screen.findByLabelText(/Tên dự án/i)
    fireEvent.change(nameInput, { target: { value: 'Icon Project' } })

    const iconTrigger = screen.getByRole('button', { name: /Chọn biểu tượng cho Task/i })
    fireEvent.click(iconTrigger)

    const amberDot = await screen.findByRole('button', { name: 'Chọn màu biểu tượng Hổ phách' })
    fireEvent.click(amberDot)

    const flameOption = await screen.findByRole('option', { name: 'Khẩn cấp' })
    fireEvent.click(flameOption)

    fireEvent.click(screen.getByRole('button', { name: /^Tạo dự án$/i }))

    await waitFor(() => {
      expect(projectService.createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          workTypes: expect.arrayContaining([
            expect.objectContaining({
              label: 'Task',
              icon: 'Flame',
              color: 'bg-amber-100 text-amber-700 border-amber-200',
            }),
          ]),
        }),
      )
    })
  })

  it('Đóng trang tạo dự án khi nhấn nút X góc trên bên trái', () => {
    renderComponent()

    const closeBtn = screen.getByRole('button', { name: /Đóng trang tạo dự án/i })
    fireEvent.click(closeBtn)

    expect(mockNavigate).toHaveBeenCalledWith('/workspace/projects')
  })

  it('Bước 3: Mặc định thêm sẵn thành viên Workspace, có thể bỏ ra hoặc thêm lại rồi gửi kèm members', async () => {
    vi.mocked(projectService.createProject).mockResolvedValue({
      id: 'proj-team-id',
      name: 'Team Project',
      key: 'TEAM',
      color: 'bg-indigo-600',
    })

    renderComponent()

    fireEvent.click(screen.getByText('Kanban'))
    fireEvent.click(await screen.findByRole('button', { name: /Sử dụng mẫu này/i }))

    const nameInput = await screen.findByLabelText(/Tên dự án/i)
    fireEvent.change(nameInput, { target: { value: 'Team Project' } })

    expect(await screen.findByText('Trần Bảo')).toBeInTheDocument()
    expect(screen.getByText(/Sẽ thêm vào dự án \(1\)/i)).toBeInTheDocument()

    // Bỏ ra khỏi danh sách rồi bấm Thêm lại
    fireEvent.click(screen.getByRole('button', { name: /Bỏ thành viên này/i }))
    expect(screen.queryByText(/Sẽ thêm vào dự án/i)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^Thêm$/i }))
    expect(screen.getByText(/Sẽ thêm vào dự án \(1\)/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^Tạo dự án$/i }))

    await waitFor(() => {
      expect(projectService.createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Team Project',
          members: [{ userId: 'user-ws-2', roleId: 'role-member' }],
        }),
      )
    })
  })
})
