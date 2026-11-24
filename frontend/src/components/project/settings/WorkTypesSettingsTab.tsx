import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Bookmark, Bug, CheckSquare, Edit2, Package, Plus, Shield, Trash2, X } from 'lucide-react'
import { projectService } from '@/services/projectService'
import { WorkTypeIcon } from '@/components/project/WorkTypeIcon'
import { Select } from '@/components/ui/Select'
import type { ProjectWorkType, Workflow } from '@/types/projectConfig'

export interface WorkTypesSettingsTabProps {
  projectId: string
  workTypes: ProjectWorkType[]
  workflows: Workflow[]
  onFeedback: (fb: { type: 'success' | 'error'; message: string }) => void
}

export const WorkTypesSettingsTab: React.FC<WorkTypesSettingsTabProps> = ({
  projectId,
  workTypes,
  workflows,
  onFeedback,
}) => {
  const queryClient = useQueryClient()

  const [editingWorkType, setEditingWorkType] = useState<ProjectWorkType | null>(null)
  const [isWorkTypeModalOpen, setIsWorkTypeModalOpen] = useState(false)
  const [wtFormName, setWtFormName] = useState('')
  const [wtFormIcon, setWtFormIcon] = useState('CheckSquare')
  const [wtFormColor, setWtFormColor] = useState('bg-blue-100 text-blue-700')
  const [wtFormIsSubtask, setWtFormIsSubtask] = useState(false)
  const [wtFormWorkflowId, setWtFormWorkflowId] = useState<string>('')

  const [deletingWorkType, setDeletingWorkType] = useState<ProjectWorkType | null>(null)
  const [fallbackWorkTypeId, setFallbackWorkTypeId] = useState('')

  const handleOpenWorkTypeModal = (wt?: ProjectWorkType) => {
    if (wt) {
      setEditingWorkType(wt)
      setWtFormName(wt.name)
      setWtFormIcon(wt.icon || 'CheckSquare')
      setWtFormColor(wt.color || 'bg-blue-100 text-blue-700')
      setWtFormIsSubtask(wt.isSubtask ?? false)
      setWtFormWorkflowId(wt.workflowId || '')
    } else {
      setEditingWorkType(null)
      setWtFormName('')
      setWtFormIcon('CheckSquare')
      setWtFormColor('bg-blue-100 text-blue-700')
      setWtFormIsSubtask(false)
      setWtFormWorkflowId(workflows[0]?.id || '')
    }
    setIsWorkTypeModalOpen(true)
  }

  const saveWorkTypeMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: wtFormName,
        icon: wtFormIcon,
        color: wtFormColor,
        isSubtask: wtFormIsSubtask,
        workflowId: wtFormWorkflowId || undefined,
      }
      if (editingWorkType) {
        return projectService.updateWorkType(projectId, editingWorkType.id, payload)
      }
      return projectService.createWorkType(projectId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-work-types'] })
      setIsWorkTypeModalOpen(false)
      onFeedback({ type: 'success', message: 'Lưu loại công việc thành công!' })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể lưu loại công việc'
      onFeedback({ type: 'error', message: msg })
    },
  })

  const deleteWorkTypeMutation = useMutation({
    mutationFn: () => {
      if (!deletingWorkType) return Promise.resolve(null as any)
      return projectService.deleteWorkType(
        projectId,
        deletingWorkType.id,
        fallbackWorkTypeId || undefined,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-work-types'] })
      setDeletingWorkType(null)
      setFallbackWorkTypeId('')
      onFeedback({ type: 'success', message: 'Đã xóa loại công việc!' })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể xóa loại công việc'
      onFeedback({ type: 'error', message: msg })
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Cấu hình các phân loại công việc (Task, Bug, Module...) sử dụng trong dự án.
        </p>
        <button
          type="button"
          onClick={() => handleOpenWorkTypeModal()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm loại công việc</span>
        </button>
      </div>

      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        {workTypes.map((wt) => {
          return (
            <div
              key={wt.id}
              className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                  <WorkTypeIcon type={wt} sizeClass="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">{wt.name}</span>
                  {wt.isSubtask && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      Subtask
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenWorkTypeModal(wt)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                  title="Chỉnh sửa loại công việc"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeletingWorkType(wt)
                    const other = workTypes.find((w) => w.id !== wt.id)
                    setFallbackWorkTypeId(other?.id || '')
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Xóa loại công việc"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal Thêm / Sửa Work Type */}
      {isWorkTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingWorkType ? 'Chỉnh sửa loại công việc' : 'Thêm loại công việc mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsWorkTypeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên loại công việc</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Task, Bug, Story, Spike..."
                  value={wtFormName}
                  onChange={(e) => setWtFormName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Biểu tượng (Icon)</label>
                <Select
                  value={wtFormIcon}
                  onChange={setWtFormIcon}
                  options={[
                    {
                      value: 'CheckSquare',
                      label: 'Task chuẩn',
                      icon: <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />,
                    },
                    {
                      value: 'Bug',
                      label: 'Lỗi phần mềm',
                      icon: <Bug className="w-4 h-4 text-rose-600 shrink-0" />,
                    },
                    {
                      value: 'Package',
                      label: 'Module / Gói việc',
                      icon: <Package className="w-4 h-4 text-purple-600 shrink-0" />,
                    },
                    {
                      value: 'Bookmark',
                      label: 'Story',
                      icon: <Bookmark className="w-4 h-4 text-emerald-600 shrink-0" />,
                    },
                    {
                      value: 'Shield',
                      label: 'Bảo mật / Cải tiến',
                      icon: <Shield className="w-4 h-4 text-amber-600 shrink-0" />,
                    },
                  ]}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="subtask-checkbox"
                  checked={wtFormIsSubtask}
                  onChange={(e) => setWtFormIsSubtask(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                />
                <label htmlFor="subtask-checkbox" className="text-xs text-slate-700 cursor-pointer">
                  Đây là loại công việc con (Subtask)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsWorkTypeModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => saveWorkTypeMutation.mutate()}
                disabled={!wtFormName.trim() || saveWorkTypeMutation.isPending}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs disabled:opacity-50"
              >
                {saveWorkTypeMutation.isPending ? 'Đang lưu...' : 'Lưu loại công việc'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xóa Work Type (Fallback) */}
      {deletingWorkType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Xóa loại công việc &quot;{deletingWorkType.name}&quot;?
                </h3>
                <p className="text-xs text-slate-500">Chuyển các task hiện tại sang loại công việc khác.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chọn loại công việc thay thế:
              </label>
              <Select
                value={fallbackWorkTypeId}
                onChange={setFallbackWorkTypeId}
                options={[
                  { value: '', label: 'Chọn loại thay thế' },
                  ...workTypes
                    .filter((w) => w.id !== deletingWorkType.id)
                    .map((w) => ({
                      value: w.id,
                      label: w.name,
                      icon: <WorkTypeIcon type={w} sizeClass="w-3.5 h-3.5" />,
                    })),
                ]}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingWorkType(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => deleteWorkTypeMutation.mutate()}
                disabled={deleteWorkTypeMutation.isPending}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-2xs"
              >
                {deleteWorkTypeMutation.isPending ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkTypesSettingsTab
