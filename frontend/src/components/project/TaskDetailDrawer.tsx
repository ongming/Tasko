import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  Trash2,
  Calendar,
  Clock,
  User,
  CheckSquare,
  Bug,
  Package,
  CheckCircle2,
  Plus,
  Loader2,
  AlertTriangle,
  Copy,
  Check,
  Edit3,
  ChevronRight,
  Info,
  Layers,
} from 'lucide-react'
import { taskService } from '@/services/taskService'
import { projectService } from '@/services/projectService'
import { sprintService } from '@/services/sprintService'
import { Select } from '@/components/ui/Select'
import { TaskCommentsSection } from '@/components/project/TaskCommentsSection'
import { useAuthStore } from '@/stores/authStore'
import type { TaskItem, TaskPriority } from '@/types/task'
import type { ProjectStatus, ProjectWorkType, CustomField } from '@/types/projectConfig'
import type { ProjectMember } from '@/types/member'
import type { Sprint } from '@/types/sprint'

interface TaskDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  projectIdOrKey: string
  taskId: string | null
  onTaskUpdated?: () => Promise<void> | void
  onTaskDeleted?: () => Promise<void> | void
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  isOpen,
  onClose,
  projectIdOrKey,
  taskId,
  onTaskUpdated,
  onTaskDeleted,
}) => {
  const currentUser = useAuthStore((s) => s.user)
  const [task, setTask] = useState<TaskItem | null>(null)
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(taskId)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)

  // Cấu hình dự án (Statuses, WorkTypes, Members, Sprints, CustomFields)
  const [statuses, setStatuses] = useState<ProjectStatus[]>([])
  const [workTypes, setWorkTypes] = useState<ProjectWorkType[]>([])
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [customFields, setCustomFields] = useState<CustomField[]>([])

  // Form states cho Task
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [tempDescription, setTempDescription] = useState('')
  const [statusId, setStatusId] = useState('')
  const [typeId, setTypeId] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM')
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [sprintId, setSprintId] = useState<string>('')
  const [storyPoints, setStoryPoints] = useState<string>('')
  const [estimatedHours, setEstimatedHours] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')
  const [cfValues, setCfValues] = useState<Record<string, any>>({})

  // Subtask quick add input
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [isAddingSubtask, setIsAddingSubtask] = useState(false)

  // Xác định vai trò của user hiện tại trong dự án
  const currentMember = members.find((m) => m.userId === currentUser?.id)
  const currentRoleName = currentMember?.role?.name?.toUpperCase()
  const isViewer = currentRoleName === 'VIEWER'
  const canModerateComments =
    currentRoleName === 'OWNER' ||
    currentRoleName === 'ADMIN' ||
    (!currentMember && Boolean(currentUser))

  // 1. Tải cấu hình Project
  useEffect(() => {
    if (!isOpen || !projectIdOrKey) return

    const fetchConfig = async () => {
      try {
        const [loadedStatuses, loadedTypes, loadedMembers, loadedSprints, loadedCf] =
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
        setCustomFields(loadedCf)
      } catch (err) {
        console.error('Failed to load project config for task drawer:', err)
      }
    }

    fetchConfig()
  }, [isOpen, projectIdOrKey])

  // 2. Tải chi tiết Task
  const loadTaskDetail = async (id: string) => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      const data = await taskService.getTaskById(projectIdOrKey, id)
      setTask(data)

      setTitle(data.title || '')
      setDescription(data.description || '')
      setTempDescription(data.description || '')
      setIsEditingDescription(false)
      setStatusId(data.statusId || '')
      setTypeId(data.typeId || '')
      setPriority(data.priority || 'MEDIUM')
      setAssigneeId(data.assigneeId || '')
      setSprintId(data.sprintId || 'backlog')
      setStoryPoints(
        data.storyPoints !== null && data.storyPoints !== undefined
          ? String(data.storyPoints)
          : '',
      )
      setEstimatedHours(
        data.estimatedHours !== null && data.estimatedHours !== undefined
          ? String(data.estimatedHours)
          : '',
      )
      setStartDate(data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '')
      setDueDate(data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '')

      // Custom fields map
      const cfMap: Record<string, any> = {}
      if (data.customFields && Array.isArray(data.customFields)) {
        for (const item of data.customFields) {
          cfMap[item.customFieldId] = item.value
        }
      }
      setCfValues(cfMap)
    } catch (err: any) {
      console.error('Failed to load task details:', err)
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Không thể tải thông tin công việc',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && currentTaskId) {
      loadTaskDetail(currentTaskId)
    } else {
      setTask(null)
    }
  }, [isOpen, currentTaskId])

  // Cập nhật khi prop taskId thay đổi từ ngoài
  useEffect(() => {
    setCurrentTaskId(taskId)
  }, [taskId])

  if (!isOpen) return null

  // Lưu thuộc tính đơn lẻ của Task
  const handleUpdateField = async (patch: Record<string, any>) => {
    if (!task || !projectIdOrKey) return
    try {
      setIsSaving(true)
      setErrorMessage(null)
      const updated = await taskService.updateProjectTask(projectIdOrKey, task.id, patch)
      setTask(updated)
      if (onTaskUpdated) {
        await onTaskUpdated()
      }
    } catch (err: any) {
      console.error('Failed to update task field:', err)
      const msg = err?.response?.data?.message || err?.message || 'Không thể lưu thay đổi'
      setErrorMessage(msg)
      // Rollback form states to current task values
      if (patch.statusId !== undefined) setStatusId(task.statusId)
      if (patch.priority !== undefined) setPriority(task.priority)
      if (patch.assigneeId !== undefined) setAssigneeId(task.assigneeId || '')
      if (patch.sprintId !== undefined) setSprintId(task.sprintId || 'backlog')
    } finally {
      setIsSaving(false)
    }
  }

  // Lưu mô tả công việc
  const handleSaveDescription = async () => {
    await handleUpdateField({ description: tempDescription.trim() })
    setDescription(tempDescription.trim())
    setIsEditingDescription(false)
  }

  // Lưu Custom Field value
  const handleUpdateCustomField = async (customFieldId: string, value: any) => {
    if (!task || !projectIdOrKey) return
    try {
      setIsSaving(true)
      setErrorMessage(null)
      setCfValues((prev) => ({ ...prev, [customFieldId]: value }))
      await taskService.updateProjectTask(projectIdOrKey, task.id, {
        customFields: [{ customFieldId, value }],
      })
      if (onTaskUpdated) {
        await onTaskUpdated()
      }
    } catch (err: any) {
      console.error('Failed to update custom field:', err)
      setErrorMessage(err?.response?.data?.message || 'Không thể lưu trường tùy chỉnh')
    } finally {
      setIsSaving(false)
    }
  }

  // Thêm nhanh Subtask
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault()
    const subTitle = newSubtaskTitle.trim()
    if (!subTitle || !task || !projectIdOrKey) return

    try {
      setIsAddingSubtask(true)
      setErrorMessage(null)
      await taskService.createProjectTask(projectIdOrKey, {
        title: subTitle,
        parentTaskId: task.id,
        statusId: statuses[0]?.id,
      })
      setNewSubtaskTitle('')
      await loadTaskDetail(task.id)
      if (onTaskUpdated) {
        await onTaskUpdated()
      }
    } catch (err: any) {
      console.error('Failed to create subtask:', err)
      setErrorMessage(err?.response?.data?.message || 'Không thể thêm công việc con')
    } finally {
      setIsAddingSubtask(false)
    }
  }

  // Xóa Subtask
  const handleDeleteSubtask = async (subtaskId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!task || !projectIdOrKey) return
    try {
      await taskService.deleteProjectTask(projectIdOrKey, subtaskId)
      await loadTaskDetail(task.id)
      if (onTaskUpdated) {
        await onTaskUpdated()
      }
    } catch (err: any) {
      console.error('Failed to delete subtask:', err)
      setErrorMessage(err?.response?.data?.message || 'Không thể xóa công việc con')
    }
  }

  // Xóa Task chính
  const handleDeleteTask = async () => {
    if (!task || !projectIdOrKey) return
    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa công việc ${task.taskKey}? Toàn bộ subtasks liên quan cũng sẽ được lưu trữ.`,
      )
    ) {
      return
    }
    try {
      setIsSaving(true)
      await taskService.deleteProjectTask(projectIdOrKey, task.id)
      onClose()
      if (onTaskDeleted) {
        await onTaskDeleted()
      }
    } catch (err: any) {
      console.error('Failed to delete task:', err)
      setErrorMessage(err?.response?.data?.message || 'Không thể xóa công việc')
      setIsSaving(false)
    }
  }

  // Copy task key vào clipboard
  const handleCopyKey = () => {
    if (!task?.taskKey) return
    navigator.clipboard.writeText(task.taskKey)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  const completedSubtasksCount = (task?.subtasks || []).filter(
    (s) => s.status?.category === 'DONE',
  ).length
  const totalSubtasksCount = task?.subtasks?.length || 0
  const subtasksPercent =
    totalSubtasksCount > 0 ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100) : 0

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header Drawer */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            {/* WorkType Icon + taskKey Breadcrumb */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-slate-200 shadow-2xs">
              {task?.type?.name?.toLowerCase().includes('bug') ? (
                <Bug className="w-3.5 h-3.5 text-rose-600" />
              ) : task?.type?.name?.toLowerCase().includes('module') ? (
                <Package className="w-3.5 h-3.5 text-purple-600" />
              ) : (
                <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
              )}
              <span className="font-mono text-xs font-bold text-slate-800">{task?.taskKey || 'TASK'}</span>
            </div>

            {/* Nút Copy Task Key */}
            <button
              type="button"
              onClick={handleCopyKey}
              className="p-1 rounded hover:bg-slate-200/60 text-slate-500 transition-colors cursor-pointer"
              title="Sao chép mã công việc"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Parent Task link nếu đây là Subtask */}
            {task?.parentTask && (
              <button
                type="button"
                onClick={() => setCurrentTaskId(task.parentTask!.id)}
                className="text-[11px] text-slate-500 hover:text-indigo-600 flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 cursor-pointer"
              >
                <span>Thuộc:</span>
                <strong className="font-mono font-semibold">{task.parentTask.taskKey}</strong>
              </button>
            )}

            {isSaving && (
              <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-2">
                <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                <span>Đang lưu...</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Nút Xóa Task (Ẩn nếu user là VIEWER) */}
            {!isViewer && (
              <button
                type="button"
                onClick={handleDeleteTask}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Xóa công việc"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Đóng bảng chi tiết"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
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

        {/* 2. Drawer Body (Chia 2 cột: 65% Nội dung chính + 35% Thuộc tính) */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span>Đang tải thông tin chi tiết...</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* CỘT TRÁI (~65% Chiều rộng): Tiêu đề, Mô tả, Subtasks */}
            <div className="flex-1 md:w-[65%] overflow-y-auto p-6 space-y-6">
              {/* Tiêu đề công việc (Inline Edit) */}
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur()
                    }
                  }}
                  onBlur={() => {
                    if (title.trim() && title.trim() !== task?.title) {
                      handleUpdateField({ title: title.trim() })
                    }
                  }}
                  placeholder="Tiêu đề công việc..."
                  className="w-full text-lg sm:text-xl font-bold text-slate-900 placeholder:text-slate-400 border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 transition-all focus:outline-none"
                />
              </div>

              {/* Mô tả chi tiết (Click để soạn thảo + Lưu / Hủy) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Mô tả công việc</span>
                  {!isEditingDescription && (
                    <button
                      type="button"
                      onClick={() => {
                        setTempDescription(description)
                        setIsEditingDescription(true)
                      }}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Chỉnh sửa</span>
                    </button>
                  )}
                </label>

                {isEditingDescription ? (
                  <div className="space-y-2">
                    <textarea
                      rows={5}
                      autoFocus
                      value={tempDescription}
                      onChange={(e) => setTempDescription(e.target.value)}
                      placeholder="Thêm mô tả chi tiết, tiêu chí nghiệm thu (Acceptance Criteria)..."
                      className="w-full text-xs p-3 border border-indigo-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 leading-relaxed text-slate-800 bg-white shadow-2xs resize-y"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingDescription(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveDescription}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
                      >
                        Lưu mô tả
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      setTempDescription(description)
                      setIsEditingDescription(true)
                    }}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 text-xs text-slate-700 leading-relaxed min-h-[80px] cursor-pointer whitespace-pre-wrap transition-colors"
                  >
                    {description ? (
                      description
                    ) : (
                      <span className="text-slate-400 italic">
                        Chưa có mô tả chi tiết. Nhấp vào đây để thêm...
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Phân hệ Công việc con (Subtasks) */}
              {!task?.parentTaskId && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-900">
                        Công việc con (Subtasks)
                      </h3>
                      {totalSubtasksCount > 0 && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {completedSubtasksCount} / {totalSubtasksCount} ({subtasksPercent}%)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  {totalSubtasksCount > 0 && (
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full transition-all duration-300"
                        style={{ width: `${subtasksPercent}%` }}
                      />
                    </div>
                  )}

                  {/* Danh sách Subtasks */}
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                    {task?.subtasks && task.subtasks.length > 0 ? (
                      task.subtasks.map((sub) => (
                        <div
                          key={sub.id}
                          onClick={() => setCurrentTaskId(sub.id)}
                          className="px-3.5 py-2.5 flex items-center justify-between hover:bg-indigo-50/40 transition-colors gap-2 text-xs group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <CheckCircle2
                              className={`w-3.5 h-3.5 shrink-0 ${
                                sub.status?.category === 'DONE'
                                  ? 'text-emerald-600'
                                  : 'text-slate-300'
                              }`}
                            />
                            <span className="font-mono text-[11px] font-bold text-slate-500 group-hover:text-indigo-600 transition-colors shrink-0">
                              {sub.taskKey}
                            </span>
                            <span
                              className={`truncate font-medium ${
                                sub.status?.category === 'DONE'
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-800'
                              }`}
                            >
                              {sub.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                              {sub.status?.name || 'Cần làm'}
                            </span>
                            {sub.assignee && (
                              <div
                                className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center shadow-2xs"
                                title={sub.assignee.name || ''}
                              >
                                {sub.assignee.name?.slice(0, 1).toUpperCase()}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteSubtask(sub.id, e)}
                              className="p-1 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="Xóa subtask"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3.5 text-center text-xs text-slate-400 italic">
                        Chưa có công việc con nào.
                      </div>
                    )}
                  </div>

                  {/* Ô nhập thêm Subtask nhanh */}
                  <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="+ Nhập tiêu đề công việc con và nhấn Enter..."
                      className="flex-1 text-xs px-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 shadow-2xs transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={!newSubtaskTitle.trim() || isAddingSubtask}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs disabled:opacity-50 cursor-pointer"
                    >
                      {isAddingSubtask ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Thêm'}
                    </button>
                  </form>
                </div>
              )}

              {/* Phân hệ Bình luận (QLC-01) */}
              {task?.id && (
                <TaskCommentsSection
                  projectId={projectIdOrKey}
                  taskId={task.id}
                  isViewer={isViewer}
                  canModerateComments={canModerateComments}
                />
              )}
            </div>

            {/* CỘT PHẢI (~35% Chiều rộng): Bảng thuộc tính và Thông tin hệ thống */}
            <div className="md:w-[35%] overflow-y-auto p-5 bg-slate-50/50 space-y-5 text-xs">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Thuộc tính công việc
              </h3>

              <div className="space-y-3.5">
                {/* Trạng thái (Status) */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 block">
                    Trạng thái
                  </label>
                  <Select
                    value={statusId}
                    onChange={(val) => {
                      setStatusId(val)
                      handleUpdateField({ statusId: val })
                    }}
                    buttonClassName="font-semibold"
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

                {/* Người thực hiện (Assignee) */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 block">
                    Người thực hiện
                  </label>
                  <Select
                    value={assigneeId}
                    onChange={(next) => {
                      const val = next || null
                      setAssigneeId(val || '')
                      handleUpdateField({ assigneeId: val })
                    }}
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

                {/* Độ ưu tiên (Priority) */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 block">
                    Độ ưu tiên
                  </label>
                  <Select
                    value={priority}
                    onChange={(next) => {
                      const val = next as TaskPriority
                      setPriority(val)
                      handleUpdateField({ priority: val })
                    }}
                    buttonClassName="font-semibold"
                    options={[
                      { value: 'LOW', label: 'Thấp (LOW)', dotColor: 'bg-blue-500' },
                      { value: 'MEDIUM', label: 'Trung bình (MEDIUM)', dotColor: 'bg-amber-400' },
                      { value: 'HIGH', label: 'Cao (HIGH)', dotColor: 'bg-orange-500' },
                      { value: 'URGENT', label: 'Khẩn cấp (URGENT)', dotColor: 'bg-rose-500' },
                    ]}
                  />
                </div>

                {/* Loại công việc (WorkType) */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 block">
                    Loại công việc
                  </label>
                  <Select
                    value={typeId}
                    onChange={(next) => {
                      const val = next || undefined
                      setTypeId(val || '')
                      handleUpdateField({ typeId: val })
                    }}
                    options={[
                      { value: '', label: 'Mặc định' },
                      ...workTypes.map((wt) => ({
                        value: wt.id,
                        label: `${wt.name}${wt.isSubtask ? ' (Subtask)' : ''}`,
                      })),
                    ]}
                  />
                </div>

                {/* Sprint */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 block">Sprint</label>
                  <Select
                    value={sprintId || 'backlog'}
                    onChange={(next) => {
                      const val = next === 'backlog' ? null : next
                      setSprintId(val || 'backlog')
                      handleUpdateField({ sprintId: val })
                    }}
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

                {/* Story Points & Ước tính giờ */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 block">
                      Story Points
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={storyPoints}
                      onChange={(e) => setStoryPoints(e.target.value)}
                      onBlur={() => {
                        const pts = storyPoints.trim() === '' ? null : parseInt(storyPoints, 10)
                        handleUpdateField({ storyPoints: isNaN(pts as number) ? null : pts })
                      }}
                      placeholder="0"
                      className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 block">
                      Ước tính (h)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(e.target.value)}
                      onBlur={() => {
                        const hrs =
                          estimatedHours.trim() === '' ? null : parseFloat(estimatedHours)
                        handleUpdateField({ estimatedHours: isNaN(hrs as number) ? null : hrs })
                      }}
                      placeholder="0"
                      className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Ngày bắt đầu & Hạn chót */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 block">
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        const val = e.target.value
                        setStartDate(val)
                        handleUpdateField({ startDate: val ? new Date(val).toISOString() : null })
                      }}
                      className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 block">
                      Hạn hoàn thành (Due Date)
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => {
                        const val = e.target.value
                        setDueDate(val)
                        handleUpdateField({ dueDate: val ? new Date(val).toISOString() : null })
                      }}
                      className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Trường tùy chỉnh (Custom Fields) */}
                {customFields.length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      Trường tùy chỉnh
                    </span>
                    {customFields.map((cf) => {
                      const val = cfValues[cf.id] ?? ''
                      return (
                        <div key={cf.id} className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-500 block">
                            {cf.name} {cf.isRequired && <span className="text-rose-500">*</span>}
                          </label>

                          {cf.fieldType === 'SELECT' ? (
                            <Select
                              value={val}
                              onChange={(next) => handleUpdateCustomField(cf.id, next)}
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
                              onBlur={() => {
                                const num = val === '' ? null : Number(val)
                                handleUpdateCustomField(cf.id, num)
                              }}
                              className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
                              placeholder="Nhập số..."
                            />
                          ) : cf.fieldType === 'DATE' ? (
                            <input
                              type="date"
                              value={val ? String(val).split('T')[0] : ''}
                              onChange={(e) => handleUpdateCustomField(cf.id, e.target.value)}
                              className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
                            />
                          ) : (
                            <input
                              type="text"
                              value={val}
                              onChange={(e) =>
                                setCfValues((p) => ({ ...p, [cf.id]: e.target.value }))
                              }
                              onBlur={() => handleUpdateCustomField(cf.id, val)}
                              className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
                              placeholder="Nhập văn bản..."
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Thông tin hệ thống (Creator, Created, Updated) */}
                <div className="pt-3 border-t border-slate-200/80 space-y-2 text-[11px] text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Người tạo:</span>
                    <strong className="text-slate-600 font-medium">
                      {task?.reporter?.name || 'Hệ thống'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Ngày tạo:</span>
                    <span>
                      {task?.createdAt ? new Date(task.createdAt).toLocaleDateString('vi-VN') : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cập nhật lần cuối:</span>
                    <span>
                      {task?.updatedAt ? new Date(task.updatedAt).toLocaleDateString('vi-VN') : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskDetailDrawer
