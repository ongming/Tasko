import React from 'react'
import { FolderPlus, Check, ArrowRight, Loader2 } from 'lucide-react'

interface ProjectConfigFormProps {
  methodTitle: string
  projectName: string
  projectKey: string
  projectColor: string
  error: string
  isSubmitting: boolean
  onProjectNameChange: (val: string) => void
  onProjectKeyChange: (val: string) => void
  onProjectColorChange: (val: string) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

const AVAILABLE_COLORS = [
  'bg-indigo-600',
  'bg-purple-600',
  'bg-blue-600',
  'bg-emerald-600',
  'bg-amber-500',
  'bg-pink-600',
]

export const ProjectConfigForm: React.FC<ProjectConfigFormProps> = ({
  methodTitle,
  projectName,
  projectKey,
  projectColor,
  error,
  isSubmitting,
  onProjectNameChange,
  onProjectKeyChange,
  onProjectColorChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
        <FolderPlus className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm font-bold text-slate-900">
          Thông tin khởi tạo dự án
        </h3>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {error && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium animate-in fade-in duration-150 flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tên Dự án */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="projectNameInput" className="text-xs font-semibold text-slate-700">
              Tên dự án <span className="text-rose-500">*</span>
            </label>
            <input
              id="projectNameInput"
              name="projectName"
              type="text"
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              placeholder="VD: Core Website Redesign..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              required
              autoFocus
            />
          </div>

          {/* Mã dự án (Key) */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="projectKeyInput" className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Mã dự án (Key)</span>
              <span className="text-[11px] text-slate-400 font-normal">Tự động sinh</span>
            </label>
            <input
              id="projectKeyInput"
              name="projectKey"
              type="text"
              value={projectKey}
              onChange={(e) => onProjectKeyChange(e.target.value.toUpperCase())}
              placeholder="VD: CWR, SPR"
              maxLength={10}
              className="w-full px-3.5 py-2 text-sm bg-slate-100/70 border border-slate-200 rounded-xl font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all uppercase"
            />
            <p className="text-[11px] text-slate-400">
              Mã tiền tố hiển thị trên thẻ nhiệm vụ (ví dụ: {projectKey || 'PROJ'}-101).
            </p>
          </div>
        </div>

        {/* Chọn màu đại diện */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">Màu đại diện dự án</label>
          <div className="flex items-center gap-2.5">
            {AVAILABLE_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onProjectColorChange(color)}
                aria-label={`Chọn màu ${color.replace('bg-', '')}`}
                className={`w-6 h-6 rounded-full ${color} flex items-center justify-center transition-transform cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  projectColor === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                }`}
              >
                {projectColor === color && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Đổi mẫu khác
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-xl shadow-xs shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FolderPlus className="w-4 h-4" />
            )}
            <span>
              {isSubmitting ? 'Đang khởi tạo...' : `Tạo dự án theo mẫu ${methodTitle}`}
            </span>
            {!isSubmitting && <ArrowRight className="w-3.5 h-3.5 ml-0.5" />}
          </button>
        </div>
      </form>
    </div>
  )
}
