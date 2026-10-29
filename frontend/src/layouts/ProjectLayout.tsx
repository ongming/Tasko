import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Star, Share2 } from 'lucide-react'
import ProjectTabBar from '@/components/workspace/ProjectTabBar'

export function ProjectLayout() {
  const [isFavorite, setIsFavorite] = useState(true)

  return (
    <div className="flex flex-col h-full w-full">
      {/* 1. Header dự án cố định trên đầu (Sticky / Fixed when scrolling) */}
      <div className=" shrink-0   pb-2  flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-4 p-4 sm:p-6 sm:pb-0">
          {/* Tên dự án, icon yêu thích, mã dự án */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Website Redesign
            </h1>
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              title={isFavorite ? 'Bỏ đánh dấu yêu thích' : 'Đánh dấu dự án yêu thích'}
              aria-label="Đánh dấu dự án yêu thích"
            >
              <Star 
                className={`w-5 h-5 transition-colors ${
                  isFavorite 
                    ? 'fill-amber-400 text-amber-500' 
                    : 'text-slate-400 hover:text-amber-500'
                }`} 
              />
            </button>
            <span className="px-2.5 py-1 rounded-md bg-slate-200/70 text-slate-700 font-mono text-xs font-semibold tracking-wider">
              WR-2024
            </span>
          </div>

          {/* Danh sách thành viên & nút Chia sẻ */}
          <div className="flex items-center gap-4">
            <div className="flex items-center -space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-white shadow-xs" title="Nguyễn An">NA</div>
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-white shadow-xs" title="Trần Bình">TB</div>
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-white shadow-xs" title="Lê Cúc">LC</div>
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center ring-2 ring-white shadow-xs">+5</div>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
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
