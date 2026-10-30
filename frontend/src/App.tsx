import React, { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppRoutes from '@/routes'
import { useAuthStore } from '@/stores/authStore'

export function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth)

  // Khởi tạo QueryClient 1 lần duy nhất cho toàn bộ app
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // Dữ liệu cache tươi trong 5 phút
            gcTime: 1000 * 60 * 15,   // Giữ bộ nhớ đệm 15 phút
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )

  useEffect(() => {
    // Khôi phục phiên làm việc qua Silent Refresh khi tải ứng dụng lần đầu
    checkAuth()
  }, [checkAuth])

  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  )
}

export default App
