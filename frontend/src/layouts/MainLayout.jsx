import React from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8faff] text-slate-800 selection:bg-indigo-500 selection:text-white">
      {/* Header dùng chung */}
      <Header />

      {/* Nội dung trang thay đổi linh hoạt */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer dùng chung */}
      <Footer />
    </div>
  )
}

export default MainLayout
