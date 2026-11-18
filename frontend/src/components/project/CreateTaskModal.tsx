import React, { useState, useEffect } from 'react'
import {
  X,
  PlusCircle,
  Loader2,
  AlertTriangle,
  Calendar,
  CheckSquare,
  Bug,
  Package,
  Layers,
  Clock,
  User,
  Hash,
} from 'lucide-react'
import { taskService } from '@/services/taskService'
import { projectService } from '@/services/projectService'
import { sprintService } from '@/services/sprintService'
import type { TaskItem, TaskPriority } from '@/types/task'
import type { ProjectStatus, ProjectWorkType, CustomField } from '@/types/projectConfig'
import type { ProjectMember } from '@/types/member'
import type { Sprint } from '@/types/sprint'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  projectIdOrKey: string
  initialSprintId?: string | null
  initialStatusId?: string
  onTaskCreated?: (task: TaskItem) => void
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  projectIdOrKey,
  initialSprintId = null,
  initialStatusId,
  onTaskCreated,
}) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [workTypeId, setWorkTypeId] = useState('')
  const [statusId, setStatusId] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM')
  const [assigneeId, setAssigneeId] = useState('')
  const [sprintId, setSprintId] = useState<string | null>(initialSprintId)
  const [storyPoints, setStoryPoints] = useState<string>('')
  const [estimatedHours, setEstimatedHours] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')
  const [cfValues, setCfValues] = useState<Record<string, any>>({})

  // Cấu hình dự án
  const [statuses, setStatuses] = useState<ProjectStatus[]>([])
  const [workTypes, setWorkTypes] = useState<ProjectWorkType[]>([])
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [customFields, setCustomFields] = useState<CustomField[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !projectIdOrKey) return

    const fetchConfig = async () => {
      try {
        setIsLoading(true)
        const [loadedStatuses, loadedTypes, loadedMembers, loadedSprints, loadedCfs] =
          await Promise.all([
            projectService.getProjectStatuses(projectIdOrKey).catch(() => []),
            projectService.getProjectWorkTypes(projectIdOrKey).catch(() => []),
            projectService.getProjectMembers(projectIdOrKey).catch(() => []),
            sprintService.getSprints(projectIdOrKey).catch(() => []),
            projectService.getCustomFields(projectIdOrKey).catch(() => []),
          ])

        setStatuses(loadedStatuses)
        setWorkTypes(loadedTypes)
        setMembers(loadedMembers)
        setSprints(loadedSprints)
        setCustomFields(loadedCfs)

        // Set default values
        if (loadedStatuses.length > 0) {
          setStatusId(initialStatusId || loadedStatuses[0].id)
        }
        if (loadedTypes.length > 0) {
          setWorkTypeId(loadedTypes[0].id)
        }
        setSprintId(initialSprintId ?? null)
      } catch (err) {
        console.error('Failed to load project config for create task modal:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConfig()
  }, [isOpen, projectIdOrKey, initialSprintId, initialStatusId])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setErrorMessage('Tiêu đề công việc không được để trống!')
      return
    }

    // Validate các trường CustomField bắt buộc (isRequired)
    for (const cf of customFields) {
      if (cf.isRequired) {
        const val = cfValues[cf.id]
        if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
          setErrorMessage(`Trường bắt buộc '${cf.name}' không được để trống!`)
          return
        }
      }
    }

    try {
      setIsSubmitting(true)
      setErrorMessage(null)

      const parsedStoryPoints =
        storyPoints.trim() === '' ? null : parseInt(storyPoints, 10)
      const parsedHours =
        estimatedHours.trim() === '' ? null : parseFloat(estimatedHours)

      const customFieldsPayload = Object.entries(cfValues)
        .filter(([_, v]) => v !== undefined && v !== null && v !== '')
        .map(([customFieldId, value]) => ({ customFieldId, value }))

      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        typeId: workTypeId || undefined,
        statusId: statusId || undefined,
        priority,
        assigneeId: assigneeId || undefined,
        sprintId: sprintId === 'backlog' ? null : sprintId,
        storyPoints: isNaN(parsedStoryPoints as number) ? null : parsedStoryPoints,
        estimatedHours: isNaN(parsedHours as number) ? null : parsedHours,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        customFields: customFieldsPayload.length > 0 ? customFieldsPayload : undefined,
      }

      const created = await taskService.createProjectTask(projectIdOrKey, payload)

      // Reset form
      setTitle('')
      setDescription('')
      setStoryPoints('')
      setEstimatedHours('')
      setStartDate('')
      setDueDate('')
      setCfValues({})

      onClose()
      if (onTaskCreated) {
        onTaskCreated(created)
      }
    } catch (err: any) {
      console.error('Failed to create task:', err)
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Không thể tạo công việc. Vui lòng thử lại!',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-3xl overflow-hidden flex flex-col my-8 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Tạo công việc mới (Create Task)</h2>
              <p className="text-[11px] text-slate-500">Khởi tạo công việc chuẩn Agile theo cấu hình dự án</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMessage && (
          <div className="px-6 py-2.5 bg-rose-50 border-b border-rose-100 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="p-0.5 text-rose-600 hover:text-rose-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Form Body (2 cột gọn gàng) */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span>Đang tải cấu hình dự án...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Tiêu đề công việc (Bắt buộc) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tiêu đề công việc <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tóm tắt công việc cần thực hiện..."
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
              />
            </div>

            {/* Mô tả công việc (Textarea) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mô tả chi tiết
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả bối cảnh, tiêu chí nghiệm thu (Acceptance Criteria), hướng dẫn tái hiện..."
                className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs resize-y"
              />
            </div>

            {/* Lưới 2 cột cho các thuộc tính chuẩn Agile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
              {/* Loại công việc (WorkType) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Loại công việc
                </label>
                <select
                  value={workTypeId}
                  onChange={(e) => setWorkTypeId(e.target.value)}
                  className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                >
                  {workTypes.map((wt) => (
                    <option key={wt.id} value={wt.id}>
                      {wt.name} {wt.isSubtask ? '(Subtask)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cột trạng thái ban đầu (Status) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Trạng thái
                </label>
                <select
                  value={statusId}
                  onChange={(e) => setStatusId(e.target.value)}
                  className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                >
                  {statuses.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Độ ưu tiên (Priority kèm badge) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Độ ưu tiên
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                >
                  <option value="LOW">🔵 Thấp (LOW)</option>
                  <option value="MEDIUM">🟡 Trung bình (MEDIUM)</option>
                  <option value="HIGH">🟠 Cao (HIGH)</option>
                  <option value="URGENT">🔴 Khẩn cấp (URGENT)</option>
                </select>
              </div>

              {/* Người thực hiện (Assignee) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Người thực hiện
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                >
                  <option value="">-- Chưa giao (Unassigned) --</option>
                  {members.map((m) => {
                    const uId = m.userId || m.user?.id || m.id
                    return (
                      <option key={uId} value={uId}>
                        {m.user?.fullName || m.user?.email || uId}
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Sprint hoặc Backlog */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sprint</label>
                <select
                  value={sprintId || 'backlog'}
                  onChange={(e) =>
                    setSprintId(e.target.value === 'backlog' ? null : e.target.value)
                  }
                  className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                >
                  <option value="backlog">📦 Backlog (Chưa vào Sprint)</option>
                  {sprints
                    .filter((s) => s.status !== 'COMPLETED')
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.status === 'ACTIVE' ? '⚡ ' : '📋 '}
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Điểm Story Points */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Story Points
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={storyPoints}
                  onChange={(e) => setStoryPoints(e.target.value)}
                  placeholder="0"
                  className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>

              {/* Thời gian ước tính (Giờ) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Thời gian ước tính (Giờ)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  placeholder="Ví dụ: 4"
                  className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>

              {/* Ngày bắt đầu */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>

              {/* Hạn chót (Due Date) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Hạn hoàn thành (Due Date)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>
            </div>

            {/* Khu vực Trường dữ liệu tùy chỉnh (Custom Fields) */}
            {customFields.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-800">
                  Trường dữ liệu tùy chỉnh (Custom Fields)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {customFields.map((cf) => {
                    const val = cfValues[cf.id] ?? ''
                    return (
                      <div key={cf.id} className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 block">
                          {cf.name} {cf.isRequired && <span className="text-rose-500">*</span>}
                        </label>

                        {cf.fieldType === 'SELECT' ? (
                          <select
                            value={val}
                            onChange={(e) =>
                              setCfValues((p) => ({ ...p, [cf.id]: e.target.value }))
                            }
                            className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                          >
                            <option value="">-- Chọn giá trị --</option>
                            {(cf.options || []).map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : cf.fieldType === 'NUMBER' ? (
                          <input
                            type="number"
                            value={val}
                            onChange={(e) =>
                              setCfValues((p) => ({ ...p, [cf.id]: e.target.value }))
                            }
                            className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
                            placeholder="Nhập số..."
                          />
                        ) : cf.fieldType === 'DATE' ? (
                          <input
                            type="date"
                            value={val ? String(val).split('T')[0] : ''}
                            onChange={(e) =>
                              setCfValues((p) => ({ ...p, [cf.id]: e.target.value }))
                            }
                            className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
                          />
                        ) : (
                          <input
                            type="text"
                            value={val}
                            onChange={(e) =>
                              setCfValues((p) => ({ ...p, [cf.id]: e.target.value }))
                            }
                            className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
                            placeholder="Nhập giá trị..."
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Footer nút hành động */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={!title.trim() || isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-2xs hover:shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang khởi tạo...</span>
                  </>
                ) : (
                  <span>Tạo công việc</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default CreateTaskModal
