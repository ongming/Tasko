import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CreateWorkspaceModal } from './CreateWorkspaceModal'

describe('CreateWorkspaceModal - Frontend Unit Tests', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
  }

  it('không render gì khi isOpen là false', () => {
    const { container } = render(<CreateWorkspaceModal {...defaultProps} isOpen={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('render đầy đủ tiêu đề, các trường nhập liệu và nút bấm khi mở modal', () => {
    render(<CreateWorkspaceModal {...defaultProps} />)

    expect(screen.getByText('Tạo không gian làm việc mới')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/VD: Tasko Engineering/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('tasko-team')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Tạo không gian/i })).toBeInTheDocument()
  })

  it('tự động chuẩn hóa tiếng Việt thành slug URL sạch khi người dùng gõ tên', () => {
    render(<CreateWorkspaceModal {...defaultProps} />)

    const nameInput = screen.getByPlaceholderText(/VD: Tasko Engineering/i)
    const slugInput = screen.getByPlaceholderText('tasko-team') as HTMLInputElement

    fireEvent.change(nameInput, { target: { value: 'Công Ty Phần Mềm Á Châu' } })

    expect(slugInput.value).toBe('cong-ty-phan-mem-a-chau')
  })

  it('hiển thị thông báo lỗi khi submit với tên để trống', async () => {
    render(<CreateWorkspaceModal {...defaultProps} />)

    const submitBtn = screen.getByRole('button', { name: /Tạo không gian/i })
    fireEvent.click(submitBtn)

    expect(await screen.findByText('Vui lòng nhập tên không gian làm việc')).toBeInTheDocument()
    expect(defaultProps.onSubmit).not.toHaveBeenCalled()
  })

  it('gọi hàm onSubmit với đúng dữ liệu workspaceName và workspaceSlug khi hợp lệ', async () => {
    const onSubmitMock = vi.fn().mockResolvedValue(undefined)
    const onCloseMock = vi.fn()

    render(
      <CreateWorkspaceModal
        isOpen={true}
        onClose={onCloseMock}
        onSubmit={onSubmitMock}
      />
    )

    const nameInput = screen.getByPlaceholderText(/VD: Tasko Engineering/i)
    fireEvent.change(nameInput, { target: { value: 'Tasko Innovation' } })

    const submitBtn = screen.getByRole('button', { name: /Tạo không gian/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({
        workspaceName: 'Tasko Innovation',
        workspaceSlug: 'tasko-innovation',
      })
      expect(onCloseMock).toHaveBeenCalled()
    })
  })

  it('hiển thị lỗi từ backend khi onSubmit ném ra Exception', async () => {
    const onSubmitMock = vi.fn().mockRejectedValue(new Error('Slug "tasko" đã tồn tại'))

    render(
      <CreateWorkspaceModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmitMock}
      />
    )

    const nameInput = screen.getByPlaceholderText(/VD: Tasko Engineering/i)
    fireEvent.change(nameInput, { target: { value: 'Tasko' } })

    const submitBtn = screen.getByRole('button', { name: /Tạo không gian/i })
    fireEvent.click(submitBtn)

    expect(await screen.findByText('Slug "tasko" đã tồn tại')).toBeInTheDocument()
  })

  it('gọi onClose khi nhấn nút đóng (X)', () => {
    const onCloseMock = vi.fn()
    render(<CreateWorkspaceModal {...defaultProps} onClose={onCloseMock} />)

    const closeBtn = screen.getByTitle('Đóng (Esc)')
    fireEvent.click(closeBtn)

    expect(onCloseMock).toHaveBeenCalledTimes(1)
  })
})
