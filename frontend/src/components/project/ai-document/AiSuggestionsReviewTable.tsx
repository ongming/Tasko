import React, { useState, useMemo } from 'react'
import {
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Sparkles,
  Lock,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { AiAnalysisDetail, AiSuggestedTask } from '@/types/aiDocument'
import type { ProjectMember } from '@/types/member'
import type { ProjectWorkType } from '@/types/projectConfig'
import type { Sprint } from '@/types/sprint'
import type { TaskPriority } from '@/types/task'

export interface AiSuggestionsReviewTableProps {
  analysis: AiAnalysisDetail
  members: ProjectMember[]
  workTypes: ProjectWorkType[]
  sprints: Sprint[]
  isViewer?: boolean
  isSavingDraft?: boolean
  isConfirming?: boolean
  onSaveDraft: (tasks: AiSuggestedTask[]) => Promise<void>
  onConfirm: (tasks: AiSuggestedTask[], defaultSprintId: string | null) => Promise<void>
  onBackToUpload?: () => void
}

const PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string; badgeClass: string }> = [
  { value: 'LOW', label: 'Thấp', badgeClass: 'text-slate-600 bg-slate-100' },
  { value: 'MEDIUM', label: 'Trung bình', badgeClass: 'text-blue-700 bg-blue-50' },
  { value: 'HIGH', label: 'Cao', badgeClass: 'text-amber-700 bg-amber-50' },
  { value: 'URGENT', label: 'Khẩn cấp', badgeClass: 'text-rose-700 bg-rose-50' },
]

export const AiSuggestionsReviewTable: React.FC<AiSuggestionsReviewTableProps> = ({
  analysis,
  members,
  workTypes,
  sprints,
  isViewer = false,
  isSavingDraft = false,
  isConfirming = false,
  onSaveDraft,
  onConfirm,
  onBackToUpload,
}) => {
  const [tasks, setTasks] = useState<AiSuggestedTask[]>(() =>
    analysis.suggestedTasks.map((t) => ({ ...t })),
  )
  const [defaultSprintId, setDefaultSprintId] = useState<string>('')
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isApplied = analysis.status === 'APPLIED'
  const isReadOnly = isViewer || isApplied

  const selectedCount = useMemo(() => tasks.filter((t) => t.selected).length, [tasks])
  const allSelected = tasks.length > 0 && selectedCount === tasks.length

  const assignableSprints = useMemo(
    () => sprints.filter((s) => s.status !== 'COMPLETED'),
    [sprints],
  )

  const toggleAll = () => {
    if (isReadOnly) return
    const nextVal = !allSelected
    setTasks((prev) => prev.map((item) => ({ ...item, selected: nextVal })))
  }

  const updateRow = <K extends keyof AiSuggestedTask>(
    tempId: string,
    field: K,
    value: AiSuggestedTask[K],
  ) => {
    if (isReadOnly) return
    setTasks((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, [field]: value } : item)),
    )
  }

  const handleAddRow = () => {
    if (isReadOnly) return
    const defaultWorkTypeId = workTypes.find((w) => w.is_default)?.id ?? workTypes[0]?.id ?? null
    const newRow: AiSuggestedTask = {
      tempId: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      selected: true,
      title: 'Công việc mới bổ sung',
      description: '',
      priority: 'MEDIUM',
      storyPoints: 2,
      estimatedHours: 4,
      assigneeId: null,
      workTypeId: defaultWorkTypeId,
      sprintId: defaultSprintId || null,
      startDate: new Date().toISOString().slice(0, 10),
      dueDate: null,
    }
    setTasks((prev) => [...prev, newRow])
    setExpandedIds((prev) => ({ ...prev, [newRow.tempId]: true }))
  }

  const handleDeleteRow = (tempId: string) => {
    if (isReadOnly) return
    setTasks((prev) => prev.filter((item) => item.tempId !== tempId))
  }

  const handleSaveDraftClick = async () => {
    if (isReadOnly) return
    setFeedback(null)
    try {
      await onSaveDraft(tasks)
      setFeedback({ type: 'success', text: 'Đã lưu bản nháp danh sách đề xuất thành công.' })
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Không thể lưu bản nháp.',
      })
    }
  }

  const handleConfirmClick = async () => {
    if (isReadOnly || selectedCount === 0) return
    const invalidTitle = tasks.find((t) => t.selected && !t.title.trim())
    if (invalidTitle) {
      setFeedback({
        type: 'error',
        text: 'Vui lòng nhập đầy đủ tiêu đề cho tất cả công việc được chọn.',
      })
      return
    }
    setFeedback(null)
    try {
      await onConfirm(tasks, defaultSprintId || null)
      setFeedback({
        type: 'success',
        text: `Đã tạo thành công ${selectedCount} công việc vào dự án!`,
      })
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Không thể xác nhận tạo công việc.',
      })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Banner thông tin tệp & trạng thái */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {onBackToUpload && !isViewer && (
            <button
              type="button"
              onClick={onBackToUpload}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Tải lên tài liệu khác"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {analysis.fileName}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isApplied
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {isApplied ? `Đã tạo ${analysis.appliedTaskCount} công việc` : 'Chờ duyệt'}
              </span>
            </div>
            {analysis.extractedTextPreview && (
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                {analysis.extractedTextPreview}
              </p>
            )}
          </div>
        </div>

        {/* Bộ chọn Sprint đích mặc định */}
        <div className="flex items-center gap-2">
          <label htmlFor="ai-default-sprint" className="text-xs font-semibold text-slate-600">
            Đích mặc định:
          </label>
          <select
            id="ai-default-sprint"
            value={defaultSprintId}
            disabled={isReadOnly}
            onChange={(e) => setDefaultSprintId(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">Kho Backlog (Chưa gán Sprint)</option>
            {assignableSprints.map((sp) => (
              <option key={sp.id} value={sp.id}>
                {sp.name} {sp.status === 'ACTIVE' ? '(Đang chạy)' : '(Kế hoạch)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cảnh báo quyền VIEWER hoặc trạng thái APPLIED */}
      {isViewer && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 flex items-center gap-2 text-xs text-amber-800">
          <Lock className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            Chế độ chỉ xem (<strong>VIEWER</strong>): bạn không thể chỉnh sửa, lưu nháp hay xác nhận
            tạo công việc.
          </span>
        </div>
      )}

      {isApplied && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-2.5 flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>
            Phiên phân tích này đã được xác nhận và tạo <strong>{analysis.appliedTaskCount}</strong>{' '}
            công việc vào dự án.
          </span>
        </div>
      )}

      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`rounded-xl border px-3.5 py-2.5 flex items-center gap-2 text-xs font-medium ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Thanh công cụ bộ đếm + Thêm dòng */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className="text-xs font-semibold text-slate-700"
            data-testid="ai-selected-counter"
          >
            Đã chọn <span className="text-indigo-600 font-bold">{selectedCount}</span> /{' '}
            {tasks.length} công việc
          </span>
        </div>
        {!isReadOnly && (
          <Button
            variant="secondary"
            size="xs"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleAddRow}
          >
            Thêm dòng
          </Button>
        )}
      </div>

      {/* Bảng duyệt Human-in-the-Loop */}
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    disabled={isReadOnly || tasks.length === 0}
                    onChange={toggleAll}
                    aria-label="Chọn tất cả công việc"
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                </th>
                <th className="py-2.5 px-2 min-w-[260px]">Tiêu đề & Mô tả</th>
                <th className="py-2.5 px-2 w-28">Loại</th>
                <th className="py-2.5 px-2 w-28">Ưu tiên</th>
                <th className="py-2.5 px-2 w-40">Người phụ trách</th>
                <th className="py-2.5 px-2 w-32">Hạn chót</th>
                <th className="py-2.5 px-2 w-20 text-center">Điểm</th>
                {!isReadOnly && <th className="py-2.5 px-2 w-10 text-center" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={isReadOnly ? 7 : 8} className="py-10 text-center text-slate-400">
                    Chưa có công việc đề xuất nào. Nhấn &ldquo;Thêm dòng&rdquo; để bổ sung thủ công.
                  </td>
                </tr>
              ) : (
                tasks.map((row, idx) => {
                  const isExpanded = Boolean(expandedIds[row.tempId])
                  return (
                    <React.Fragment key={row.tempId}>
                      <tr
                        className={`transition-colors ${
                          row.selected ? 'bg-white hover:bg-slate-50/70' : 'bg-slate-50/50 opacity-70'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center align-top">
                          <input
                            type="checkbox"
                            checked={row.selected}
                            disabled={isReadOnly}
                            onChange={(e) => updateRow(row.tempId, 'selected', e.target.checked)}
                            aria-label={`Chọn công việc ${idx + 1}`}
                            className="mt-1.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="py-2 px-2 align-top">
                          <div className="flex items-start gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedIds((prev) => ({
                                  ...prev,
                                  [row.tempId]: !prev[row.tempId],
                                }))
                              }
                              aria-label={isExpanded ? 'Thu gọn mô tả' : 'Mở rộng mô tả'}
                              className="mt-1 p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <input
                                type="text"
                                value={row.title}
                                disabled={isReadOnly}
                                aria-label={`Tiêu đề công việc ${idx + 1}`}
                                onChange={(e) => updateRow(row.tempId, 'title', e.target.value)}
                                className="w-full rounded-lg border border-transparent hover:border-slate-200 focus:border-indigo-400 focus:bg-white bg-transparent px-2 py-1 text-xs font-semibold text-slate-900 focus:outline-none disabled:hover:border-transparent"
                              />
                              {!isExpanded && row.description && (
                                <p className="text-[11px] text-slate-500 px-2 line-clamp-1">
                                  {row.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-2 align-top">
                          <select
                            value={row.workTypeId || ''}
                            disabled={isReadOnly}
                            aria-label={`Loại công việc ${idx + 1}`}
                            onChange={(e) =>
                              updateRow(row.tempId, 'workTypeId', e.target.value || null)
                            }
                            className="w-full h-7 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-400 disabled:bg-slate-100"
                          >
                            <option value="">Mặc định</option>
                            {workTypes.map((wt) => (
                              <option key={wt.id} value={wt.id}>
                                {wt.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-2 align-top">
                          <select
                            value={row.priority}
                            disabled={isReadOnly}
                            aria-label={`Độ ưu tiên công việc ${idx + 1}`}
                            onChange={(e) =>
                              updateRow(row.tempId, 'priority', e.target.value as TaskPriority)
                            }
                            className="w-full h-7 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-400 disabled:bg-slate-100"
                          >
                            {PRIORITY_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-2 align-top">
                          <select
                            value={row.assigneeId || ''}
                            disabled={isReadOnly}
                            aria-label={`Người phụ trách công việc ${idx + 1}`}
                            onChange={(e) =>
                              updateRow(row.tempId, 'assigneeId', e.target.value || null)
                            }
                            className="w-full h-7 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-400 disabled:bg-slate-100"
                          >
                            <option value="">Chưa phân công</option>
                            {members.map((m) => (
                              <option key={m.user.id} value={m.user.id}>
                                {m.user.fullName}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-2 align-top">
                          <input
                            type="date"
                            value={row.dueDate ? row.dueDate.slice(0, 10) : ''}
                            disabled={isReadOnly}
                            aria-label={`Hạn chót công việc ${idx + 1}`}
                            onChange={(e) =>
                              updateRow(row.tempId, 'dueDate', e.target.value || null)
                            }
                            className="w-full h-7 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-400 disabled:bg-slate-100"
                          />
                        </td>
                        <td className="py-2 px-2 align-top">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={row.storyPoints ?? ''}
                            disabled={isReadOnly}
                            aria-label={`Điểm công việc ${idx + 1}`}
                            onChange={(e) => {
                              const raw = e.target.value
                              updateRow(
                                row.tempId,
                                'storyPoints',
                                raw === '' ? null : Math.max(0, Number(raw)),
                              )
                            }}
                            className="w-full h-7 rounded-lg border border-slate-200 bg-white px-2 text-xs text-center font-mono text-slate-700 focus:outline-none focus:border-indigo-400 disabled:bg-slate-100"
                          />
                        </td>
                        {!isReadOnly && (
                          <td className="py-2 px-2 text-center align-top">
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(row.tempId)}
                              aria-label={`Xóa công việc ${idx + 1}`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50/60">
                          <td />
                          <td colSpan={isReadOnly ? 6 : 7} className="px-2 pb-3 pt-1">
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                              Mô tả chi tiết
                            </label>
                            <textarea
                              rows={2}
                              value={row.description}
                              disabled={isReadOnly}
                              onChange={(e) => updateRow(row.tempId, 'description', e.target.value)}
                              placeholder="Nhập mô tả chi tiết cho công việc..."
                              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-400 disabled:bg-slate-100 resize-none"
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer hành động Lưu nháp & Xác nhận */}
      <div className="flex items-center justify-end flex-wrap gap-2.5 pt-2 border-t border-slate-100">
        <Button
          variant="secondary"
          size="md"
          disabled={isReadOnly || isSavingDraft || isConfirming}
          loading={isSavingDraft}
          leftIcon={<Save className="w-4 h-4" />}
          onClick={handleSaveDraftClick}
        >
          Lưu bản nháp
        </Button>
        <Button
          variant="primary"
          size="md"
          disabled={isReadOnly || selectedCount === 0 || isConfirming || isSavingDraft}
          loading={isConfirming}
          leftIcon={<Sparkles className="w-4 h-4" />}
          onClick={handleConfirmClick}
        >
          Xác nhận tạo {selectedCount} công việc
        </Button>
      </div>
    </div>
  )
}

export default AiSuggestionsReviewTable
