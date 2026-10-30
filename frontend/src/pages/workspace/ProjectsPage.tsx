import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ArrowRight, FolderKanban } from 'lucide-react'
import { Project } from '@/types/workspace'

export function ProjectsPage() {
  const [projects] = useState<Project[]>([])

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Danh sách dự án
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý tất cả dự án Agile và phân quyền trong workspace của bạn.
          </p>
        </div>
        <Link
          to="/workspace/projects/new"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo dự án mới</span>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-12 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <FolderKanban className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Chưa có dự án nào</h2>
          <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">
            Bắt đầu bằng cách tạo dự án đầu tiên để quản lý các đầu việc, bảng Kanban, chu kỳ Sprint và phân quyền thành viên.
          </p>
          <Link
            to="/workspace/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo dự án mới</span>
          </Link>
        </div>
      ) : (
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
      )}
    </div>
  )
}

export default ProjectsPage
