import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from './LoginPage'
import * as useLoginModule from '@/hooks/useLogin'

vi.mock('@/hooks/useLogin')

describe('LoginPage - Frontend Component Tests', () => {
  const defaultHookMock: ReturnType<typeof useLoginModule.useLogin> = {
    isLoading: false,
    errorMessage: null,
    isUnactivated: false,
    resendMessage: null,
    isResending: false,
    handleLogin: vi.fn(),
    handleGoogleLogin: vi.fn(),
    handleResend: vi.fn(),
    clearError: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useLoginModule.useLogin).mockReturnValue({ ...defaultHookMock })
  })

  const renderComponent = (initialEntries = ['/login']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <LoginPage />
      </MemoryRouter>,
    )
  }

  it('render đầy đủ các trường nhập liệu, nút bấm đăng nhập và Google login', () => {
    renderComponent()

    expect(screen.getByText('Chào mừng bạn trở lại')).toBeInTheDocument()
    expect(screen.getByLabelText(/Địa chỉ Email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nhập mật khẩu của bạn')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Đăng nhập/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Tiếp tục với Google/i })).toBeInTheDocument()
    expect(screen.getByText('Quên mật khẩu?')).toBeInTheDocument()
  })

  it('không gọi handleLogin nếu email hoặc password còn để trống khi nhấn submit', () => {
    renderComponent()

    const submitBtn = screen.getByRole('button', { name: /Đăng nhập/i })
    fireEvent.click(submitBtn)

    expect(defaultHookMock.handleLogin).not.toHaveBeenCalled()
  })

  it('gọi handleLogin với email và password khi người dùng nhập đầy đủ và nhấn submit', () => {
    renderComponent()

    const emailInput = screen.getByLabelText(/Địa chỉ Email/i)
    const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu của bạn')
    const submitBtn = screen.getByRole('button', { name: /Đăng nhập/i })

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Secret123!' } })
    fireEvent.click(submitBtn)

    expect(defaultHookMock.handleLogin).toHaveBeenCalledWith('user@example.com', 'Secret123!')
  })

  it('chống spam click / double-submit: vô hiệu hóa nút submit và các ô nhập khi isLoading = true', () => {
    vi.mocked(useLoginModule.useLogin).mockReturnValue({
      ...defaultHookMock,
      isLoading: true,
    })

    renderComponent()

    const submitBtn = screen.getByRole('button', { name: /Đang đăng nhập.../i })
    expect(submitBtn).toBeDisabled()

    const emailInput = screen.getByLabelText(/Địa chỉ Email/i)
    const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu của bạn')
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()

    // Cố gắng submit khi đang loading
    fireEvent.click(submitBtn)
    expect(defaultHookMock.handleLogin).not.toHaveBeenCalled()
  })

  it('hiển thị AlertBanner khi có lỗi đăng nhập và gọi clearError khi tắt banner', () => {
    vi.mocked(useLoginModule.useLogin).mockReturnValue({
      ...defaultHookMock,
      errorMessage: 'Email hoặc mật khẩu không chính xác!',
    })

    renderComponent()

    expect(screen.getByText('Email hoặc mật khẩu không chính xác!')).toBeInTheDocument()

    // Nút dismiss banner
    const closeBtn = screen.getByRole('button', { name: /Đóng/i })
    fireEvent.click(closeBtn)
    expect(defaultHookMock.clearError).toHaveBeenCalled()
  })

  it('hiển thị nút gửi lại email kích hoạt khi tài khoản chưa kích hoạt (isUnactivated = true)', () => {
    vi.mocked(useLoginModule.useLogin).mockReturnValue({
      ...defaultHookMock,
      errorMessage: 'Tài khoản chưa được kích hoạt',
      isUnactivated: true,
    })

    renderComponent()

    expect(screen.getByText('Chưa nhận được email xác nhận?')).toBeInTheDocument()
    const resendBtn = screen.getByRole('button', { name: /Gửi lại email/i })
    expect(resendBtn).toBeInTheDocument()

    // Nhập email và nhấn nút gửi lại
    const emailInput = screen.getByLabelText(/Địa chỉ Email/i)
    fireEvent.change(emailInput, { target: { value: 'pending@example.com' } })
    fireEvent.click(resendBtn)

    expect(defaultHookMock.handleResend).toHaveBeenCalledWith('pending@example.com')
  })

  it('kích hoạt handleGoogleLogin khi người dùng nhấn nút Tiếp tục với Google', () => {
    renderComponent()

    const googleBtn = screen.getByRole('button', { name: /Tiếp tục với Google/i })
    fireEvent.click(googleBtn)

    expect(defaultHookMock.handleGoogleLogin).toHaveBeenCalled()
  })

  it('hiển thị thông báo thành công khi truy cập trang login với query param verified=true', () => {
    renderComponent(['/login?verified=true'])

    expect(
      screen.getByText('Tài khoản của bạn đã được kích hoạt thành công! Hãy đăng nhập để bắt đầu.'),
    ).toBeInTheDocument()
  })
})
