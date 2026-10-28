import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface GuestRouteProps {
  children?: React.ReactNode
}

/**
 * Ngăn chặn người dùng đã đăng nhập truy cập lại các trang /login, /register
 * Nếu đã đăng nhập -> Chuyển hướng thẳng vào /workspace/board
 */
export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore()

  // Trong lúc đang kiểm tra phiên làm việc ban đầu (Silent Refresh)
  if (isLoading) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate to="/workspace/board" replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export default GuestRoute
