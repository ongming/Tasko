import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
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

  /* --- CÁC TÌNH HUỐNG CỰC ĐOAN & AN TOÀN GIAO DIỆN --- */

  it('Cực đoan: Nhập tên toàn dấu cách "   " -> Phải chặn submit và hiển thị lỗi', async () => {
    const onSubmitMock = vi.fn()
    render(<CreateWorkspaceModal {...defaultProps} onSubmit={onSubmitMock} />)

    const nameInput = screen.getByPlaceholderText(/VD: Tasko Engineering/i)
    fireEvent.change(nameInput, { target: { value: '       ' } })

    const submitBtn = screen.getByRole('button', { name: /Tạo không gian/i })
    fireEvent.click(submitBtn)

    expect(await screen.findByText('Vui lòng nhập tên không gian làm việc')).toBeInTheDocument()
    expect(onSubmitMock).not.toHaveBeenCalled()
  })

  it('Độc hại: Tự động loại bỏ hoàn toàn Emoji và Ký tự đặc biệt nguy hiểm khi sinh slug', () => {
    render(<CreateWorkspaceModal {...defaultProps} />)

    const nameInput = screen.getByPlaceholderText(/VD: Tasko Engineering/i)
    const slugInput = screen.getByPlaceholderText('tasko-team') as HTMLInputElement

    fireEvent.change(nameInput, {
      target: { value: '🚀 Tasko @#$ Pro 2026! (Beta) & Tech' },
    })

    // Kỳ vọng: loại sạch emoji và ký tự lạ, nối chuẩn gạch ngang duy nhất
    expect(slugInput.value).toBe('tasko-pro-2026-beta-tech')
  })

  it('Chống Spam Click (Double Submit): Nút Tạo không gian phải bị disabled trong lúc đang gửi request', async () => {
    let resolveSubmit: () => void
    const pendingPromise = new Promise<void>((resolve) => {
      resolveSubmit = resolve
    })
    const onSubmitMock = vi.fn().mockReturnValue(pendingPromise)

    render(<CreateWorkspaceModal {...defaultProps} onSubmit={onSubmitMock} />)

    const nameInput = screen.getByPlaceholderText(/VD: Tasko Engineering/i)
    fireEvent.change(nameInput, { target: { value: 'Anti Spam WS' } })

    const submitBtn = screen.getByRole('button', { name: /Tạo không gian/i })
    fireEvent.click(submitBtn)

    // Trong lúc pending, nút submit phải bị disabled
    expect(submitBtn).toBeDisabled()

    // Bấm thêm lần nữa trong lúc đang submitting
    fireEvent.click(submitBtn)

    // onSubmit chỉ được gọi đúng 1 lần duy nhất
    expect(onSubmitMock).toHaveBeenCalledTimes(1)

    // Giải phóng promise trong act
    await act(async () => {
      resolveSubmit!()
    })
  })

  it('An toàn: Hiển thị thông báo lỗi mặc định thân thiện khi backend ném lỗi không xác định (non-Error object)', async () => {
    const onSubmitMock = vi.fn().mockRejectedValue('Server unexpected 500 error string')

    render(<CreateWorkspaceModal {...defaultProps} onSubmit={onSubmitMock} />)

    const nameInput = screen.getByPlaceholderText(/VD: Tasko Engineering/i)
    fireEvent.change(nameInput, { target: { value: 'Crash WS' } })

    const submitBtn = screen.getByRole('button', { name: /Tạo không gian/i })
    fireEvent.click(submitBtn)

    expect(
      await screen.findByText('Không thể tạo không gian làm việc. Vui lòng thử lại.'),
    ).toBeInTheDocument()
  })

  it('Bảo vệ tiến trình: Không đóng modal khi nhấn phím Escape nếu đang trong quá trình submit', () => {
    const onCloseMock = vi.fn()
    const pendingPromise = new Promise<void>(() => {}) // Không bao giờ resolve
    const onSubmitMock = vi.fn().mockReturnValue(pendingPromise)

    render(
      <CreateWorkspaceModal
        isOpen={true}
        onClose={onCloseMock}
        onSubmit={onSubmitMock}
      />,
    )

    const nameInput = screen.getByPlaceholderText(/VD: Tasko Engineering/i)
    fireEvent.change(nameInput, { target: { value: 'Submitting WS' } })

    const submitBtn = screen.getByRole('button', { name: /Tạo không gian/i })
    fireEvent.click(submitBtn)

    // Người dùng bấm Escape trong lúc đang submit
    fireEvent.keyDown(window, { key: 'Escape' })

    // Modal không được phép đóng
    expect(onCloseMock).not.toHaveBeenCalled()
  })
})
