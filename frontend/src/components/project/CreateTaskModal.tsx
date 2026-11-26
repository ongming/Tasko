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
import { isScrumProject } from '@/utils/projectMethod'
import { Select } from '@/components/ui/Select'
import { CreateModuleModal } from '@/components/project/CreateModuleModal'
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
  const [moduleId, setModuleId] = useState('')
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
  const [moduleItems, setModuleItems] = useState<TaskItem[]>([])
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [isScrum, setIsScrum] = useState<boolean>(Boolean(initialSprintId))

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCreateModuleModalOpen, setIsCreateModuleModalOpen] = useState(false)

  useEffect(() => {
    if (!isOpen || !projectIdOrKey) return

    const fetchConfig = async () => {
      try {
        setIsLoading(true)
        const [projData, loadedStatuses, loadedTypes, loadedMembers, loadedSprints, loadedCfs, loadedTasks] =
          await Promise.all([
            projectService.getProjectById(projectIdOrKey).catch(() => null),
            projectService.getProjectStatuses(projectIdOrKey).catch(() => []),
            projectService.getProjectWorkTypes(projectIdOrKey).catch(() => []),
            projectService.getProjectMembers(projectIdOrKey).catch(() => []),
            sprintService.getSprints(projectIdOrKey).catch(() => []),
            projectService.getCustomFields(projectIdOrKey).catch(() => []),
            taskService.getProjectTasks(projectIdOrKey).catch(() => []),
          ])

        setIsScrum(Boolean(initialSprintId) || isScrumProject(projData))
        setStatuses(loadedStatuses)
        setWorkTypes(loadedTypes)
        setModuleItems(loadedTasks.filter((t) => Boolean(t.type?.isModule)))
        setMembers(loadedMembers)
        setSprints(loadedSprints)
        setCustomFields(loadedCfs)

        // Set default values
        if (loadedStatuses.length > 0) {
          setStatusId(initialStatusId || loadedStatuses[0].id)
        }
        if (loadedTypes.length > 0) {
          const defaultNonModule = loadedTypes.find((wt) => !wt.isModule)
          setWorkTypeId(defaultNonModule?.id || loadedTypes[0].id)
        }
        setModuleId('')
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

      const selectedType = workTypes.find((wt) => wt.id === workTypeId)
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        typeId: workTypeId || undefined,
        moduleId: !selectedType?.isModule && moduleId ? moduleId : undefined,
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
                <Select
                  value={workTypeId}
                  onChange={(val) => {
                    setWorkTypeId(val)
                  }}
                  options={workTypes
                    .filter((wt) => !wt.isModule)
                    .map((wt) => ({
                      value: wt.id,
                      label: `${wt.name}${wt.isSubtask ? ' (Subtask)' : ''}`,
                    }))}
                />
              </div>

              {/* Thuộc Module */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-slate-600">
                    Thuộc Module
                  </label>
                  {workTypes.some((wt) => wt.isModule) && (
                    <button
                      type="button"
                      onClick={() => setIsCreateModuleModalOpen(true)}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                    >
                      + Tạo Module
                    </button>
                  )}
                </div>
                <Select
                  value={moduleId}
                  onChange={setModuleId}
                  options={[
                    { value: '', label: 'Không thuộc Module nào' },
                    ...moduleItems.map((m) => ({
                      value: m.id,
                      label: `${m.taskKey} · ${m.title}`,
                    })),
                  ]}
                />
              </div>

              {/* Cột trạng thái ban đầu (Status) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Trạng thái
                </label>
                <Select
                  value={statusId}
                  onChange={setStatusId}
                  options={statuses.map((st) => ({
                    value: st.id,
                    label: `${st.name} (${st.category})`,
                    dotColor:
                      st.category === 'DONE'
                        ? 'bg-emerald-500'
                        : st.category === 'IN_PROGRESS'
                          ? 'bg-indigo-600'
                          : 'bg-slate-400',
                  }))}
                />
              </div>

              {/* Độ ưu tiên (Priority) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Độ ưu tiên
                </label>
                <Select
                  value={priority}
                  onChange={(val) => setPriority(val as TaskPriority)}
                  buttonClassName="font-semibold"
                  options={[
                    { value: 'LOW', label: 'Thấp (LOW)', dotColor: 'bg-blue-500' },
                    { value: 'MEDIUM', label: 'Trung bình (MEDIUM)', dotColor: 'bg-amber-400' },
                    { value: 'HIGH', label: 'Cao (HIGH)', dotColor: 'bg-orange-500' },
                    { value: 'URGENT', label: 'Khẩn cấp (URGENT)', dotColor: 'bg-rose-500' },
                  ]}
                />
              </div>

              {/* Người thực hiện (Assignee) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Người thực hiện
                </label>
                <Select
                  value={assigneeId}
                  onChange={setAssigneeId}
                  options={[
                    { value: '', label: 'Chưa giao (Unassigned)' },
                    ...members.map((m) => {
                      const uId = m.userId || m.user?.id || m.id
                      return {
                        value: uId,
                        label: m.user?.fullName || m.user?.email || uId,
                      }
                    }),
                  ]}
                />
              </div>

              {/* Sprint & Story Points (chỉ hiện cho Scrum / Scrumban) */}
              {isScrum && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sprint</label>
                    <Select
                      value={sprintId || 'backlog'}
                      onChange={(val) => setSprintId(val === 'backlog' ? null : val)}
                      options={[
                        { value: 'backlog', label: 'Backlog (Chưa vào Sprint)', dotColor: 'bg-slate-400' },
                        ...sprints
                          .filter((s) => s.status !== 'COMPLETED')
                          .map((s) => ({
                            value: s.id,
                            label: s.name,
                            dotColor: s.status === 'ACTIVE' ? 'bg-indigo-600' : 'bg-amber-400',
                            badge: s.status === 'ACTIVE' ? 'Đang chạy' : 'Kế hoạch',
                          })),
                      ]}
                    />
                  </div>

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
                </>
              )}

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
                          <Select
                            value={val}
                            onChange={(next) =>
                              setCfValues((p) => ({ ...p, [cf.id]: next }))
                            }
                            options={[
                              { value: '', label: 'Chọn giá trị' },
                              ...(cf.options || []).map((opt) => ({ value: opt, label: opt })),
                            ]}
                          />
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

      <CreateModuleModal
        isOpen={isCreateModuleModalOpen}
        onClose={() => setIsCreateModuleModalOpen(false)}
        projectIdOrKey={projectIdOrKey}
        moduleWorkTypeId={workTypes.find((wt) => wt.isModule)?.id}
        onModuleCreated={(created) => {
          setModuleItems((prev) => [...prev, created])
          setModuleId(created.id)
        }}
      />
    </div>
  )
}

export default CreateTaskModal
