import React from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, Plus, MoreHorizontal, ArrowRight } from 'lucide-react'

export function ProjectsPage() {
  const projects = [
    { id: 'website-redesign', name: 'Website Redesign', key: 'WR-2024', tasks: 18, lead: 'Nguyễn Đình Quang Minh', status: 'Đang hoạt động', color: 'bg-indigo-600' },
    { id: 'mobile-app', name: 'Mobile App', key: 'MA-2024', tasks: 9, lead: 'Nguyễn Đăng Khoa', status: 'Đang hoạt động', color: 'bg-emerald-500' },
    { id: 'marketing-campaign', name: 'Marketing Campaign', key: 'MC-2024', tasks: 5, lead: 'Lê Cúc', status: 'Đang lập kế hoạch', color: 'bg-amber-500' },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Danh sách dự án
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý tất cả dự án Agile và phân quyền trong workspace của bạn.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo dự án mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {projects.map((proj) => (
          <div key={proj.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`w-3 h-3 rounded-full ${proj.color}`} />
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {proj.key}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{proj.name}</h3>
              <p className="text-xs text-slate-500 mt-1">Lead: {proj.lead}</p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">{proj.tasks} công việc</span>
              <Link
                to="/workspace/board"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <span>Mở Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectsPage
