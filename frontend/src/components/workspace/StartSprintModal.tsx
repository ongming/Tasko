import React, { useState, useEffect } from 'react'
import { X, Calendar, Target, Clock, AlertCircle } from 'lucide-react'
import type { Sprint } from '@/types/sprint'

interface StartSprintModalProps {
  isOpen: boolean
  onClose: () => void
  sprint: Sprint | null
  onStart: (data: {
    name: string
    goal: string
    startDate: string
    endDate: string
  }) => Promise<void>
}

export const StartSprintModal: React.FC<StartSprintModalProps> = ({
  isOpen,
  onClose,
  sprint,
  onStart,
}) => {
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [durationWeeks, setDurationWeeks] = useState<number>(2)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (sprint) {
      setName(sprint.name || '')
      setGoal(sprint.goal || '')

      const today = new Date()
      const startIso = today.toISOString().split('T')[0]
      setStartDate(startIso)

      const end = new Date(today)
      end.setDate(end.getDate() + 14)
      setEndDate(end.toISOString().split('T')[0])
      setDurationWeeks(2)
      setError('')
    }
  }, [sprint, isOpen])

  const handleDurationChange = (weeks: number) => {
    setDurationWeeks(weeks)
    if (startDate) {
      const start = new Date(startDate)
      const end = new Date(start)
      end.setDate(end.getDate() + weeks * 7)
      setEndDate(end.toISOString().split('T')[0])
    }
  }

  const handleStartDateChange = (val: string) => {
    setStartDate(val)
    if (val && durationWeeks > 0) {
      const start = new Date(val)
      const end = new Date(start)
      end.setDate(end.getDate() + durationWeeks * 7)
      setEndDate(end.toISOString().split('T')[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Vui lòng nhập tên Sprint')
      return
    }
    if (!startDate || !endDate) {
      setError('Vui lòng chọn ngày bắt đầu và kết thúc')
      return
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError('Ngày kết thúc phải sau ngày bắt đầu')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      await onStart({
        name: name.trim(),
        goal: goal.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      })
      onClose()
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể bắt đầu Sprint. Vui lòng thử lại.'
      setError(Array.isArray(msg) ? msg.join(', ') : msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !sprint) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Bắt đầu Sprint: {sprint.name}
              </h2>
              <p className="text-xs text-slate-500">
                {sprint.taskCount || 0} công việc ({sprint.totalPoints || 0} Story Points)
              </p>
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
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tên Sprint */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên Sprint <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="Ví dụ: Sprint 1 - Xác thực & Menu"
            />
          </div>

          {/* Thời lượng (Duration) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Thời lượng chu kỳ
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => handleDurationChange(w)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    durationWeeks === w
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {w} tuần
                </button>
              ))}
            </div>
          </div>

          {/* Ngày bắt đầu & kết thúc */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày bắt đầu <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày kết thúc <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>

          {/* Mục tiêu Sprint (Sprint Goal) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mục tiêu Sprint (Sprint Goal)
            </label>
            <textarea
              rows={3}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="Ví dụ: Hoàn thiện tính năng đăng nhập và quản lý danh mục món ăn để người dùng có thể đặt hàng..."
            />
          </div>

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
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Đang kích hoạt...' : 'Bắt đầu Sprint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
