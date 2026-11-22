import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Edit2, Plus, Trash2, X } from 'lucide-react'
import { projectService } from '@/services/projectService'
import type { ProjectStatus } from '@/types/projectConfig'

export interface StatusesSettingsTabProps {
  projectId: string
  statuses: ProjectStatus[]
  onFeedback: (fb: { type: 'success' | 'error'; message: string }) => void
}

export const StatusesSettingsTab: React.FC<StatusesSettingsTabProps> = ({
  projectId,
  statuses,
  onFeedback,
}) => {
  const queryClient = useQueryClient()

  const [editingStatus, setEditingStatus] = useState<ProjectStatus | null>(null)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [statusFormName, setStatusFormName] = useState('')
  const [statusFormCategory, setStatusFormCategory] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO')
  const [statusFormColor, setStatusFormColor] = useState('#94a3b8')
  const [statusFormWipLimit, setStatusFormWipLimit] = useState<string>('')

  const [deletingStatus, setDeletingStatus] = useState<ProjectStatus | null>(null)
  const [fallbackStatusId, setFallbackStatusId] = useState('')

  const handleOpenStatusModal = (status?: ProjectStatus) => {
    if (status) {
      setEditingStatus(status)
      setStatusFormName(status.name)
      setStatusFormCategory(status.category)
      setStatusFormColor(status.color)
      setStatusFormWipLimit(status.wipLimit ? String(status.wipLimit) : '')
    } else {
      setEditingStatus(null)
      setStatusFormName('')
      setStatusFormCategory('TODO')
      setStatusFormColor('#94a3b8')
      setStatusFormWipLimit('')
    }
    setIsStatusModalOpen(true)
  }

  const saveStatusMutation = useMutation({
    mutationFn: () => {
      const wip = statusFormWipLimit.trim() ? parseInt(statusFormWipLimit, 10) : null
      if (editingStatus) {
        return projectService.updateStatus(projectId, editingStatus.id, {
          name: statusFormName,
          category: statusFormCategory,
          color: statusFormColor,
          wipLimit: wip,
        })
      }
      return projectService.createStatus(projectId, {
        name: statusFormName,
        category: statusFormCategory,
        color: statusFormColor,
        wipLimit: wip,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-statuses'] })
      setIsStatusModalOpen(false)
      onFeedback({ type: 'success', message: 'Lưu trạng thái thành công!' })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể lưu trạng thái'
      onFeedback({ type: 'error', message: msg })
    },
  })

  const deleteStatusMutation = useMutation({
    mutationFn: () => {
      if (!deletingStatus) return Promise.resolve(null as any)
      return projectService.deleteStatus(projectId, deletingStatus.id, fallbackStatusId || undefined)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-statuses'] })
      setDeletingStatus(null)
      setFallbackStatusId('')
      onFeedback({ type: 'success', message: 'Đã xóa trạng thái!' })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể xóa trạng thái'
      onFeedback({ type: 'error', message: msg })
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Quản lý các cột trạng thái và áp đặt giới hạn công việc đang xử lý (WIP Limit) để tránh tắc nghẽn.
        </p>
        <button
          type="button"
          onClick={() => handleOpenStatusModal()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm cột trạng thái</span>
        </button>
      </div>

      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        {statuses.map((status) => (
          <div
            key={status.id}
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-3"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: status.color || '#94a3b8' }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">{status.name}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {status.category}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  WIP Limit: {status.wipLimit ? <strong>{status.wipLimit} thẻ</strong> : 'Không giới hạn'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenStatusModal(status)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                title="Chỉnh sửa cột"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeletingStatus(status)
                  const other = statuses.find((s) => s.id !== status.id)
                  setFallbackStatusId(other?.id || '')
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Xóa cột"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Thêm / Sửa Status */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingStatus ? 'Chỉnh sửa cột trạng thái' : 'Thêm cột trạng thái mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên cột trạng thái</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đang kiểm thử, Hoàn thành..."
                  value={statusFormName}
                  onChange={(e) => setStatusFormName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nhóm trạng thái</label>
                <select
                  value={statusFormCategory}
                  onChange={(e) => setStatusFormCategory(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="TODO">Cần làm (TODO)</option>
                  <option value="IN_PROGRESS">Đang làm (IN_PROGRESS)</option>
                  <option value="DONE">Hoàn thành (DONE)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Màu sắc nhận diện</label>
                <input
                  type="color"
                  value={statusFormColor}
                  onChange={(e) => setStatusFormColor(e.target.value)}
                  className="w-12 h-8 p-1 border border-slate-200 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Giới hạn số thẻ tối đa (WIP Limit)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Để trống nếu không giới hạn"
                  value={statusFormWipLimit}
                  onChange={(e) => setStatusFormWipLimit(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => saveStatusMutation.mutate()}
                disabled={!statusFormName.trim() || saveStatusMutation.isPending}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs disabled:opacity-50"
              >
                {saveStatusMutation.isPending ? 'Đang lưu...' : 'Lưu cột'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xóa Status (Fallback) */}
      {deletingStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Xóa cột &quot;{deletingStatus.name}&quot;?
                </h3>
                <p className="text-xs text-slate-500">Chuyển các công việc sang cột thay thế trước khi xóa.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chọn cột thay thế cho các thẻ hiện có:
              </label>
              <select
                value={fallbackStatusId}
                onChange={(e) => setFallbackStatusId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="">-- Chọn cột thay thế --</option>
                {statuses
                  .filter((s) => s.id !== deletingStatus.id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingStatus(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => deleteStatusMutation.mutate()}
                disabled={deleteStatusMutation.isPending}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-2xs"
              >
                {deleteStatusMutation.isPending ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StatusesSettingsTab
