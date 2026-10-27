import React from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children?: React.ReactNode
}

/**
 * Component bảo vệ các tuyến đường nội bộ (như /workspace/*)
 * - Nếu đang khôi phục phiên (isLoading): Hiển thị màn hình chờ mượt mà
 * - Nếu chưa đăng nhập: Chuyển hướng về trang /login kèm vị trí trang trước đó
 * - Nếu đã đăng nhập: Render nội dung được bảo vệ
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  // Màn hình chờ khi đang check phiên đăng nhập (Silent Refresh)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 animate-pulse">
            <span className="text-white font-extrabold text-xl tracking-tight">T</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Đang xác thực phiên làm việc...</span>
          </div>
        </div>
      </div>
    )
  }

  // Chưa đăng nhập -> Chuyển hướng về trang login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children ? <>{children}</> : <Outlet />
}

export default ProtectedRoute
