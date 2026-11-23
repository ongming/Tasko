import React, { useState } from 'react'
import { X, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'
import { Select } from '@/components/ui/Select'
import type { Sprint } from '@/types/sprint'

interface CompleteSprintModalProps {
  isOpen: boolean
  onClose: () => void
  sprint: Sprint | null
  plannedSprints: Sprint[]
  onComplete: (targetSprintId: string | null) => Promise<void>
}

export const CompleteSprintModal: React.FC<CompleteSprintModalProps> = ({
  isOpen,
  onClose,
  sprint,
  plannedSprints,
  onComplete,
}) => {
  const [targetSprintId, setTargetSprintId] = useState<string>('backlog')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !sprint) return null

  const completedCount = sprint.completedTaskCount || 0
  const uncompletedCount = (sprint.taskCount || 0) - completedCount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      setError('')
      const dest = targetSprintId === 'backlog' ? null : targetSprintId
      await onComplete(dest)
      onClose()
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể hoàn thành Sprint. Vui lòng thử lại.'
      setError(Array.isArray(msg) ? msg.join(', ') : msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Hoàn thành: {sprint.name}
              </h2>
              <p className="text-xs text-slate-500">Nghiệm thu và đóng chu kỳ Sprint</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Thống kê hoàn thành */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Công việc hoàn thành:</span>
              <span className="font-bold text-emerald-600 font-mono">
                {completedCount} ({sprint.completedPoints || 0} Story Points)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Công việc chưa hoàn thành:</span>
              <span className="font-bold text-amber-600 font-mono">
                {uncompletedCount} ({Math.max(0, (sprint.totalPoints || 0) - (sprint.completedPoints || 0))} Story Points)
              </span>
            </div>
          </div>

          {/* Lựa chọn di chuyển việc chưa xong */}
          {uncompletedCount > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Chuyển {uncompletedCount} công việc dở dang sang:
              </label>
              <Select
                size="md"
                value={targetSprintId}
                onChange={setTargetSprintId}
                options={[
                  { value: 'backlog', label: 'Product Backlog (Mặc định)', dotColor: 'bg-slate-400' },
                  ...plannedSprints
                    .filter((s) => s.id !== sprint.id)
                    .map((s) => ({
                      value: s.id,
                      label: s.name,
                      dotColor: 'bg-indigo-600',
                      badge: 'Sprint kế hoạch',
                    })),
                ]}
              />
            </div>
          )}

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Sau khi hoàn thành, Sprint này sẽ được chuyển vào lịch sử lưu trữ để tính toán Vận tốc (Velocity) và biểu đồ tiến độ.
          </p>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>{isSubmitting ? 'Đang đóng...' : 'Xác nhận hoàn thành'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
