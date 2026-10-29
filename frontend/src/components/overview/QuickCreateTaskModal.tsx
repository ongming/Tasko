import React, { useState } from 'react'
import { PlusCircle, X } from 'lucide-react'
import type { NewTaskPayload, TaskPriority } from '../../types/overview'

interface QuickCreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: NewTaskPayload) => void
}

export const QuickCreateTaskModal: React.FC<QuickCreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('')
  const [project, setProject] = useState('Website Redesign')
  const [priority, setPriority] = useState<TaskPriority>('medium')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      project,
      priority,
    })
    setTitle('')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-5 sm:p-6 flex flex-col gap-4 border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-600" />
            <h3 id="modal-title" className="text-base font-bold text-slate-900">
              Tạo công việc mới
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Đóng hộp thoại"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-title-input" className="text-xs font-semibold text-slate-700">
              Tên công việc <span className="text-red-500">*</span>
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Thiết kế trang thanh toán đa kênh..."
              className="w-full h-9 px-3 bg-slate-50 text-slate-900 text-sm rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="task-project-select" className="text-xs font-semibold text-slate-700">
                Dự án
              </label>
              <select
                id="task-project-select"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full h-9 px-3 bg-slate-50 text-slate-900 text-sm rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-600 transition-all"
              >
                <option value="Website Redesign">Website Redesign (WR)</option>
                <option value="Mobile App">Mobile App Flutter (MA)</option>
                <option value="Backend API">Backend API NestJS (BE)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="task-priority-select" className="text-xs font-semibold text-slate-700">
                Mức độ ưu tiên
              </label>
              <select
                id="task-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full h-9 px-3 bg-slate-50 text-slate-900 text-sm rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-600 transition-all"
              >
                <option value="high">Cao ⚠️</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end items-center gap-2.5 pt-3 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-slate-600 font-medium text-xs hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium text-xs shadow-2xs hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tạo ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
