import React, { useState, useEffect } from 'react'
import { PlusCircle, X } from 'lucide-react'
import { Select } from '@/components/ui/Select'
import type { NewTaskPayload, ProjectSummary, TaskPriority } from '../../types/overview'

interface QuickCreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: NewTaskPayload) => Promise<void> | void
  projects: ProjectSummary[]
}

export const QuickCreateTaskModal: React.FC<QuickCreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projects,
}) => {
  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && projects.length > 0 && !projects.some((p) => p.id === projectId)) {
      setProjectId(projects[0].id)
    }
  }, [isOpen, projects, projectId])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !projectId || isSubmitting) return
    try {
      setIsSubmitting(true)
      await onSubmit({
        title: title.trim(),
        projectId,
        priority,
      })
      setTitle('')
    } finally {
      setIsSubmitting(false)
    }
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
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
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
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Thiết kế trang thanh toán đa kênh..."
              className="w-full h-9 px-3 bg-slate-50 text-slate-900 text-sm rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Dự án</label>
              <Select
                size="md"
                value={projectId}
                onChange={setProjectId}
                ariaLabel="Dự án"
                options={projects.map((p) => ({
                  value: p.id,
                  label: `[${p.code}] ${p.title}`,
                }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Mức độ ưu tiên</label>
              <Select
                size="md"
                value={priority}
                onChange={(val) => setPriority(val as TaskPriority)}
                ariaLabel="Mức độ ưu tiên"
                options={[
                  { value: 'high', label: 'Cao', dotColor: 'bg-orange-500' },
                  { value: 'medium', label: 'Trung bình', dotColor: 'bg-amber-400' },
                  { value: 'low', label: 'Thấp', dotColor: 'bg-blue-500' },
                ]}
              />
            </div>
          </div>

          <div className="flex justify-end items-center gap-2.5 pt-3 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-slate-600 font-medium text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !projectId || isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium text-xs shadow-2xs hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
