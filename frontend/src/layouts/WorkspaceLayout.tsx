import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import WorkspaceSidebar from '@/components/workspace/WorkspaceSidebar'
import WorkspaceTopbar from '@/components/workspace/WorkspaceTopbar'

export function WorkspaceLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f8faff] text-slate-800">
      {/* Sidebar (Desktop fixed left 240px / Mobile drawer) */}
      <WorkspaceSidebar 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
      />

      {/* Main Workspace Frame */}
      <div className="lg:pl-60 flex flex-col min-h-screen">
        {/* Topbar */}
        <WorkspaceTopbar 
          onToggleMobileSidebar={() => setIsMobileOpen((prev) => !prev)} 
        />

        {/* Dynamic Page Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default WorkspaceLayout
