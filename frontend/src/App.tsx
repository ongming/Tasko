import React, { useEffect } from 'react'
import AppRoutes from '@/routes'
import { useAuthStore } from '@/stores/authStore'

export function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth)

  useEffect(() => {
    // Khôi phục phiên làm việc qua Silent Refresh khi tải ứng dụng lần đầu
    checkAuth()
  }, [checkAuth])

  return <AppRoutes />
}

export default App
