import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import WorkspaceSidebar from '@/components/workspace/WorkspaceSidebar'
import WorkspaceTopbar from '@/components/workspace/WorkspaceTopbar'

export function WorkspaceLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="h-screen w-screen overflow-hidden bg-white text-slate-800 flex flex-col">
      {/* 1. Header trên cùng: chiếm h-14 cố định trong luồng, không trôi dạt */}
      <WorkspaceTopbar 
        onToggleMobileSidebar={() => setIsMobileOpen((prev) => !prev)} 
      />

      {/* 2. Vùng dưới: chia đôi bằng Flexbox tự nhiên (Sidebar trái + BoardView phải) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Cột trái: Sidebar điều hướng */}
        <WorkspaceSidebar 
          isMobileOpen={isMobileOpen} 
          setIsMobileOpen={setIsMobileOpen} 
        />

        {/* Cột phải: Main Content chiếm trọn 100% diện tích còn lại, đồng bộ màu nền trắng đồng nhất */}
        <main className="flex-1 overflow-y-auto min-w-0 flex flex-col bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default WorkspaceLayout
