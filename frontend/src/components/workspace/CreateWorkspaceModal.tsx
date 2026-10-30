import React, { useState, useEffect, useRef } from 'react'
import { Building2, X, Plus, Globe, Loader2 } from 'lucide-react'

export interface CreateWorkspaceData {
  workspaceName: string
  workspaceSlug: string
}

interface CreateWorkspaceModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateWorkspaceData) => Promise<void> | void
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [workspaceName, setWorkspaceName] = useState('')
  const [workspaceSlug, setWorkspaceSlug] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input khi mở modal và reset form
  useEffect(() => {
    if (isOpen) {
      setError('')
      setWorkspaceName('')
      setWorkspaceSlug('')
      setIsSubmitting(false)
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [isOpen])

  // Tự động sinh slug tiếng Việt không dấu chuẩn URL khi người dùng gõ tên
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setWorkspaceName(val)
    if (error) setError('')

    // Chuẩn hóa tiếng Việt thành slug sạch
    const slug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')

    setWorkspaceSlug(slug)
  }

  // Xử lý phím Escape để đóng modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, isSubmitting])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = workspaceName.trim()
    if (!trimmedName) {
      setError('Vui lòng nhập tên không gian làm việc')
      inputRef.current?.focus()
      return
    }

    const trimmedSlug = workspaceSlug.trim() || 'my-workspace'

    try {
      setIsSubmitting(true)
      setError('')
      await onSubmit({
        workspaceName: trimmedName,
        workspaceSlug: trimmedSlug,
      })
      onClose()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể tạo không gian làm việc. Vui lòng thử lại.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-workspace-modal-title"
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      {/* Khung Modal đạt chuẩn Impeccable Craft */}
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/90 p-6 flex flex-col gap-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Icon + Tiêu đề + Nút Đóng */}
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="create-workspace-modal-title" className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                Tạo không gian làm việc mới
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Không gian nhóm để quản lý các dự án và thành viên của bạn
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            title="Đóng (Esc)"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body: Chỉ 2 trường Name và Slug */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-xs text-rose-600 font-medium animate-in fade-in duration-150">
              {error}
            </div>
          )}

          {/* 1. Tên Không gian làm việc */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="ws-name-input" className="text-xs font-semibold text-slate-700">
              Tên không gian làm việc <span className="text-rose-500">*</span>
            </label>
            <input
              ref={inputRef}
              id="ws-name-input"
              type="text"
              disabled={isSubmitting}
              value={workspaceName}
              onChange={handleNameChange}
              placeholder="VD: Tasko Engineering, Phòng Marketing..."
              maxLength={60}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all disabled:opacity-60"
            />
          </div>

          {/* 2. Đường dẫn định danh (Slug) */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="ws-slug-input" className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Đường dẫn định danh (Slug)</span>
              <span className="text-[11px] text-slate-400 font-normal">Tự động tạo</span>
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/70 overflow-hidden text-xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white transition-all">
              <span className="px-3 py-2.5 text-slate-400 select-none flex items-center gap-1 font-mono text-[11px] border-r border-slate-200/70 bg-slate-50/80">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                tasko.app/
              </span>
              <input
                id="ws-slug-input"
                type="text"
                disabled={isSubmitting}
                value={workspaceSlug}
                onChange={(e) => setWorkspaceSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="tasko-team"
                className="w-full py-2.5 px-3 bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none font-mono text-xs disabled:opacity-60"
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Đường dẫn cố định dùng để phân biệt không gian làm việc của bạn.
            </p>
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-xl shadow-xs shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang khởi tạo...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Tạo không gian</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateWorkspaceModal
