import React from 'react'
import { X, Sparkles, UploadCloud, Sparkle } from 'lucide-react'

interface AiCreateModalProps {
  isOpen: boolean
  projectName: string
  aiPrompt: string
  aiUploadedFile: File | null
  onClose: () => void
  onProjectNameChange: (val: string) => void
  onAiPromptChange: (val: string) => void
  onFileUpload: (file: File | null) => void
  onSubmit: () => void
}

export const AiCreateModal: React.FC<AiCreateModalProps> = ({
  isOpen,
  projectName,
  aiPrompt,
  aiUploadedFile,
  onClose,
  onProjectNameChange,
  onAiPromptChange,
  onFileUpload,
  onSubmit,
}) => {
  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-modal-title"
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200/90 p-6 flex flex-col gap-5 animate-in zoom-in-95 duration-150 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal AI */}
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="ai-modal-title" className="text-base font-bold text-slate-900 leading-snug">
                Khởi tạo dự án thông minh bằng AI
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                AI sẽ đọc tài liệu để tự động đề xuất luồng việc và các nhãn phù hợp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ AI"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Tên dự án dự kiến */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="aiProjectName" className="text-xs font-semibold text-slate-700">
              Tên dự án
            </label>
            <input
              id="aiProjectName"
              type="text"
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              placeholder="VD: Dự án Số hóa Vận hành 2026..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          {/* Upload file tài liệu */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Tải lên tài liệu kế hoạch (.pdf, .docx, .txt, .md)
            </label>
            <div
              onClick={() => document.getElementById('ai-file-input')?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition-all"
            >
              <UploadCloud className="w-6 h-6 text-slate-400" />
              <div className="text-center">
                <span className="text-xs font-semibold text-indigo-600 hover:underline">
                  {aiUploadedFile ? aiUploadedFile.name : 'Nhấn để chọn file'}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Kéo thả hoặc duyệt file từ máy tính
                </p>
              </div>
              <input
                id="ai-file-input"
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt,.md"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    onFileUpload(e.target.files[0])
                  }
                }}
              />
            </div>
          </div>

          {/* Nhập prompt mô tả */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="aiPromptInput" className="text-xs font-semibold text-slate-700">
              Hoặc nhập tóm tắt yêu cầu dự án
            </label>
            <textarea
              id="aiPromptInput"
              rows={3}
              value={aiPrompt}
              onChange={(e) => onAiPromptChange(e.target.value)}
              placeholder="Mô tả mục tiêu, sản phẩm bàn giao, thời gian dự kiến..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
            />
          </div>
        </div>

        {/* Actions AI Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-xl shadow-xs shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Sparkle className="w-3.5 h-3.5" />
            <span>Tiến hành phân tích & tạo</span>
          </button>
        </div>
      </div>
    </div>
  )
}
