import React, { useRef, useState } from 'react'
import {
  UploadCloud,
  FileText,
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { validateAiDocumentFile } from '@/services/aiDocumentService'

export type UploadProgressPhase = 'idle' | 'uploading' | 'analyzing' | 'error'

export interface AiUploadStepProps {
  isViewer?: boolean
  phase: UploadProgressPhase
  errorMessage: string | null
  onSubmit: (file: File, hint: string) => Promise<void>
  onRetry: () => Promise<void>
  onClearError: () => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export const AiUploadStep: React.FC<AiUploadStepProps> = ({
  isViewer = false,
  phase,
  errorMessage,
  onSubmit,
  onRetry,
  onClearError,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [hint, setHint] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const isProcessing = phase === 'uploading' || phase === 'analyzing'
  const activeError = localError || errorMessage

  const handleFileSelected = (file: File | null) => {
    setLocalError(null)
    onClearError()
    if (!file) {
      setSelectedFile(null)
      return
    }
    const validationErr = validateAiDocumentFile(file)
    if (validationErr) {
      setSelectedFile(null)
      setLocalError(validationErr)
      return
    }
    setSelectedFile(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    handleFileSelected(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (isViewer || isProcessing) return
    const file = e.dataTransfer.files?.[0] ?? null
    handleFileSelected(file)
  }

  const handleStartAnalyze = async () => {
    if (!selectedFile || isViewer || isProcessing) return
    setLocalError(null)
    await onSubmit(selectedFile, hint)
  }

  if (isViewer) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-6 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Tài khoản chỉ xem (Viewer) không thể tải lên tài liệu
          </h3>
          <p className="text-xs text-slate-600 mt-1 max-w-md">
            Bạn đang giữ vai trò <strong>VIEWER</strong> trong dự án này. Bạn chỉ có thể xem lại các
            kết quả trong tab <strong>Lịch sử phân tích</strong>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Khu vực kéo-thả / chọn tệp */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!isProcessing) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!isProcessing) inputRef.current?.click()
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isProcessing) {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        aria-label="Khu vực tải lên tài liệu phân tích"
        className={`relative rounded-xl border-2 border-dashed p-7 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/70'
            : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/70 bg-slate-50/40'
        } ${isProcessing ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.md,.txt"
          onChange={handleInputChange}
          className="hidden"
          data-testid="ai-document-file-input"
        />
        <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-800">
          Kéo thả tệp tài liệu vào đây hoặc{' '}
          <span className="text-indigo-600 underline underline-offset-2">chọn từ máy tính</span>
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Hỗ trợ định dạng <span className="font-semibold text-slate-700">.pdf, .docx, .md, .txt</span> —
          Dung lượng tối đa <span className="font-semibold text-slate-700">10 MB</span>
        </p>
      </div>

      {/* Thông tin tệp đã chọn */}
      {selectedFile && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-indigo-200/80 bg-indigo-50/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-[11px] text-slate-500">
                {formatBytes(selectedFile.size)} • Sẵn sàng phân tích
              </p>
            </div>
          </div>
          {!isProcessing && (
            <button
              type="button"
              onClick={() => handleFileSelected(null)}
              aria-label="Gỡ tệp đã chọn"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Ô nhập ghi chú định hướng tùy chọn */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ai-doc-hint" className="text-xs font-semibold text-slate-700">
          Ghi chú định hướng cho AI <span className="font-normal text-slate-400">(tùy chọn)</span>
        </label>
        <textarea
          id="ai-doc-hint"
          rows={3}
          value={hint}
          disabled={isProcessing}
          onChange={(e) => setHint(e.target.value)}
          placeholder="Ví dụ: Tập trung tách các đầu việc Backend API và kiểm thử bảo mật, ước lượng Story Points theo thang Fibonacci..."
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-400 resize-none"
        />
      </div>

      {/* Thanh tiến trình 2 bước */}
      {isProcessing && (
        <div
          className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 flex flex-col gap-3"
          data-testid="ai-upload-progress"
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
            {phase === 'uploading' ? (
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>Bước 1/2: Đang tải lên & trích xuất nội dung văn bản...</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
            {phase === 'analyzing' ? (
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
            ) : (
              <span className="w-4 h-4 rounded-full border border-slate-300 inline-block shrink-0" />
            )}
            <span className={phase === 'analyzing' ? 'text-indigo-700' : 'text-slate-400'}>
              Bước 2/2: Đang phân tích tài liệu & đề xuất danh sách công việc bằng AI...
            </span>
          </div>
        </div>
      )}

      {/* Thông báo lỗi & nút thử lại */}
      {activeError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="font-medium leading-relaxed">{activeError}</span>
          </div>
          {phase === 'error' && selectedFile && (
            <Button
              variant="secondary"
              size="xs"
              leftIcon={<RotateCcw className="w-3 h-3" />}
              onClick={onRetry}
            >
              Thử lại
            </Button>
          )}
        </div>
      )}

      {/* Nút hành động chính */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          variant="primary"
          size="md"
          disabled={!selectedFile || isProcessing}
          loading={isProcessing}
          leftIcon={<Sparkles className="w-4 h-4" />}
          onClick={handleStartAnalyze}
        >
          Tải lên & Phân tích bằng AI
        </Button>
      </div>
    </div>
  )
}

export default AiUploadStep
