import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NotificationBell } from './NotificationBell'
import { notificationService } from '@/services/notificationService'

vi.mock('@/services/notificationService', () => ({
  notificationService: {
    getNotifications: vi.fn(),
    markAsRead: vi.fn().mockResolvedValue({}),
    markAllAsRead: vi.fn().mockResolvedValue({ success: true }),
  },
}))

describe('NotificationBell - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(notificationService.getNotifications).mockResolvedValue({
      unreadCount: 1,
      items: [
        {
          id: 'n-1',
          userId: 'u-1',
          type: 'DUE_SOON',
          title: 'Sắp hết hạn: DADDK-1',
          message: 'Công việc "tassk1" sẽ đến hạn vào ngày mai.',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: { workspaceSlug: 'ws', projectKey: 'DADDK', taskId: 't-1' },
        },
        {
          id: 'n-2',
          userId: 'u-1',
          type: 'ASSIGNED',
          title: 'Được giao việc: DADDK-2',
          message: 'Bạn vừa được giao công việc mới.',
          isRead: true,
          createdAt: new Date().toISOString(),
        },
      ],
    })
  })

  it('hiển thị badge số chưa đọc, mở popup và đánh dấu tất cả đã đọc', async () => {
    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Xem thông báo' }))

    await waitFor(() => {
      expect(screen.getByText('Sắp hết hạn: DADDK-1')).toBeInTheDocument()
      expect(screen.getByText('Được giao việc: DADDK-2')).toBeInTheDocument()
    })

    // Lọc tab Chưa đọc
    fireEvent.click(screen.getByRole('button', { name: /Chưa đọc/i }))
    expect(screen.getByText('Sắp hết hạn: DADDK-1')).toBeInTheDocument()
    expect(screen.queryByText('Được giao việc: DADDK-2')).not.toBeInTheDocument()

    // Đọc tất cả
    fireEvent.click(screen.getByRole('button', { name: /Đọc tất cả/i }))
    await waitFor(() => {
      expect(notificationService.markAllAsRead).toHaveBeenCalled()
    })
  })
})
