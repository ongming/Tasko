import React, { useState, useEffect } from 'react'
import { Outlet, useSearchParams } from 'react-router-dom'
import { Star, Share2 } from 'lucide-react'
import ProjectTabBar from '@/components/workspace/ProjectTabBar'
import { useAuthStore } from '@/stores/authStore'
import { projectService } from '@/services/projectService'
import type { Project } from '@/types/workspace'

export function ProjectLayout() {
  const [isFavorite, setIsFavorite] = useState(false)
  const [project, setProject] = useState<Project | null>(null)
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')
  const { user } = useAuthStore()

  useEffect(() => {
    if (!projectId) {
      setProject(null)
      return
    }

    projectService
      .getProjectById(projectId)
      .then((data) => {
        setProject(data)
      })
      .catch((err) => {
        console.error('Failed to load project details:', err)
      })
  }, [projectId])

  const userInitials = user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : 'U'
  const displayName = project?.name || 'Website Redesign'
  const displayKey = project?.key || 'WR-2024'

  return (
    <div className="flex flex-col h-full w-full">
      {/* 1. Header dự án cố định trên đầu (Sticky / Fixed when scrolling) */}
      <div className="shrink-0 pb-2 flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-4 p-4 sm:p-6 sm:pb-0">
          {/* Tên dự án, icon yêu thích, mã dự án */}
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {displayName}
            </h1>
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
              title={isFavorite ? 'Bỏ đánh dấu yêu thích' : 'Đánh dấu dự án yêu thích'}
              aria-label="Đánh dấu dự án yêu thích"
            >
              <Star 
                className={`w-4 h-4 transition-colors ${
                  isFavorite 
                    ? 'fill-amber-400 text-amber-500' 
                    : 'text-slate-400'
                }`} 
              />
            </button>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-[11px] font-semibold tracking-wider">
              {displayKey}
            </span>
          </div>

          {/* Danh sách thành viên & nút Chia sẻ (Chuẩn Linear secondary action) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center -space-x-1.5">
              <div
                className="w-7 h-7 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-white shadow-2xs"
                title={user?.full_name || 'Bạn'}
              >
                {userInitials}
              </div>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/90 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Chia sẻ</span>
            </button>
          </div>
        </div>

        {/* Thanh Tab chuyển đổi chế độ xem: Control Board | Bảng Kanban | Backlog... */}
        <ProjectTabBar />
      </div>

      {/* 2. Vùng nội dung cuộn bên dưới: Thay đổi linh hoạt theo Tab đang chọn */}
      <div className="flex-1 overflow-y-auto pt-3 min-h-0 flex flex-col p-4 sm:p-6">
        <Outlet />
      </div>
    </div>
  )
}

export default ProjectLayout
