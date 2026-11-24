import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  Calendar,
  CalendarRange,
  Kanban,
  List,
  ListTodo,
  Loader2,
  Save,
  Sliders,
} from 'lucide-react'
import { projectService } from '@/services/projectService'
import type { Project } from '@/types/workspace'

export interface GeneralSettingsTabProps {
  project: Project | undefined
  projectParam: string
  workspaceSlug?: string
  onFeedback: (fb: { type: 'success' | 'error'; message: string }) => void
}

export const GeneralSettingsTab: React.FC<GeneralSettingsTabProps> = ({
  project,
  projectParam,
  workspaceSlug,
  onFeedback,
}) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [generalName, setGeneralName] = useState('')
  const [generalDescription, setGeneralDescription] = useState('')
  const [generalStartDate, setGeneralStartDate] = useState('')
  const [generalEndDate, setGeneralEndDate] = useState('')
  const [generalViews, setGeneralViews] = useState<string[]>([])

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteConfirmationKey, setDeleteConfirmationKey] = useState('')

  const projectMethod: 'KANBAN' | 'SCRUM' | 'SCRUMBAN' =
    (project?.methodology as 'KANBAN' | 'SCRUM' | 'SCRUMBAN') ||
    (project?.settings?.method_id === 'scrum'
      ? 'SCRUM'
      : project?.settings?.method_id === 'scrumban'
        ? 'SCRUMBAN'
        : 'KANBAN')

  useEffect(() => {
    if (project) {
      setGeneralName(project.name || '')
      setGeneralDescription(project.description || '')
      setGeneralStartDate(project.startDate ? project.startDate.split('T')[0] : '')
      setGeneralEndDate(project.endDate ? project.endDate.split('T')[0] : '')

      const savedViews = Array.isArray(project.settings?.views) ? project.settings.views : []
      if (savedViews.length > 0) {
        setGeneralViews(savedViews)
      } else {
        const isScrum = projectMethod === 'SCRUM' || projectMethod === 'SCRUMBAN'
        setGeneralViews(isScrum ? ['control', 'board', 'backlog'] : ['control', 'board'])
      }
    }
  }, [project, projectMethod])

  const updateGeneralMutation = useMutation({
    mutationFn: () =>
      projectService.updateProjectSettings(project?.id || projectParam, {
        name: generalName,
        description: generalDescription,
        startDate: generalStartDate || null,
        endDate: generalEndDate || null,
        views: generalViews,
        settings: {
          ...project?.settings,
          views: generalViews,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectParam] })
      onFeedback({ type: 'success', message: 'Cập nhật thông tin dự án thành công!' })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể lưu cài đặt'
      onFeedback({ type: 'error', message: msg })
    },
  })

  const deleteProjectMutation = useMutation({
    mutationFn: () => projectService.deleteProject(project?.id || projectParam),
    onSuccess: () => {
      setIsDeleteModalOpen(false)
      const redirectUrl = workspaceSlug ? `/${workspaceSlug}/projects` : '/workspace/projects'
      navigate(redirectUrl, { replace: true })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể xóa dự án'
      onFeedback({ type: 'error', message: msg })
    },
  })

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Thông tin cơ bản
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tên dự án</label>
            <input
              type="text"
              value={generalName}
              onChange={(e) => setGeneralName(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mã dự án (Key)</label>
            <input
              type="text"
              disabled
              value={project?.key || ''}
              className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 text-slate-400 font-mono rounded-lg cursor-not-allowed"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả dự án</label>
            <textarea
              rows={3}
              value={generalDescription}
              onChange={(e) => setGeneralDescription(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              placeholder="Nhập mục tiêu và phạm vi của dự án..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày bắt đầu</label>
            <input
              type="date"
              value={generalStartDate}
              onChange={(e) => setGeneralStartDate(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày kết thúc dự kiến</label>
            <input
              type="date"
              value={generalEndDate}
              onChange={(e) => setGeneralEndDate(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Phương pháp quản lý cố định (Read-only) */}
        <div className="pt-2 flex items-center justify-between flex-wrap gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Phương pháp quản lý:</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70">
              {projectMethod === 'SCRUM' ? 'Scrum' : projectMethod === 'SCRUMBAN' ? 'Scrumban' : 'Kanban'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Được thiết lập cố định khi khởi tạo dự án
          </span>
        </div>

        {/* Cấu hình các Chế độ xem hiển thị (Project Views) */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Chế độ xem dự án (Views)
          </label>
          <p className="text-[11px] text-slate-500 mb-3">
            Cấu hình các chế độ xem hiển thị mặc định trên thanh điều hướng cho các thành viên trong dự án này.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              {
                id: 'control',
                label: 'Control Board',
                icon: Sliders,
                desc: 'Bảng điều khiển tổng quan dự án',
                isCore: true,
              },
              {
                id: 'board',
                label: 'Bảng (Board)',
                icon: Kanban,
                desc: 'Bảng Kanban theo các cột trạng thái',
                isCore: true,
              },
              {
                id: 'backlog',
                label: 'Backlog',
                icon: ListTodo,
                desc: 'Kế hoạch Sprint và ước lượng Story Points',
                isCore: true,
                onlyScrum: true,
              },
              {
                id: 'list',
                label: 'Danh sách',
                icon: List,
                desc: 'Xem danh sách dòng kẻ, lọc và quét nhanh',
              },
              {
                id: 'timeline',
                label: 'Lộ trình',
                icon: CalendarRange,
                desc: 'Dòng thời gian tiến độ tổng thể các mốc dự án',
              },
              {
                id: 'calendar',
                label: 'Lịch',
                icon: Calendar,
                desc: 'Theo dõi hạn chót và lịch bàn giao theo ngày/tháng',
              },
            ]
              .filter(
                (v) =>
                  !v.onlyScrum ||
                  projectMethod === 'SCRUM' ||
                  projectMethod === 'SCRUMBAN',
              )
              .map((view) => {
                const Icon = view.icon
                const isSelected = generalViews.includes(view.id)
                const isCore = view.isCore

                const toggleView = () => {
                  if (isCore) return
                  if (isSelected) {
                    setGeneralViews((prev) => prev.filter((id) => id !== view.id))
                  } else {
                    setGeneralViews((prev) => [...prev, view.id])
                  }
                }

                return (
                  <div
                    key={view.id}
                    onClick={toggleView}
                    className={`p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                      isCore ? 'cursor-default' : 'cursor-pointer hover:border-slate-300'
                    } ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-500/40 shadow-2xs'
                        : 'border-slate-200 bg-slate-50/50 opacity-60'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200/70 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-800 truncate">{view.label}</span>
                        {isCore ? (
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            Mặc định
                          </span>
                        ) : (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={toggleView}
                            className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 leading-snug">
                        {view.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="button"
            onClick={() => updateGeneralMutation.mutate()}
            disabled={updateGeneralMutation.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {updateGeneralMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </div>

      {/* Vùng nguy hiểm (Danger Zone) */}
      <div className="bg-rose-50/50 rounded-xl border border-rose-200 p-5 space-y-3">
        <h2 className="text-sm font-bold text-rose-900 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Vùng nguy hiểm</span>
        </h2>
        <p className="text-xs text-rose-700 leading-relaxed">
          Xóa dự án sẽ chuyển toàn bộ công việc và cấu hình của dự án vào trạng thái lưu trữ. Chỉ có
          Chủ sở hữu hoặc Quản trị viên Không gian làm việc mới có quyền thực hiện.
        </p>
        <div>
          <button
            type="button"
            onClick={() => {
              setDeleteConfirmationKey('')
              setIsDeleteModalOpen(true)
            }}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
          >
            Xóa dự án này
          </button>
        </div>
      </div>

      {/* Modal Xác nhận xóa dự án */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Xác nhận xóa dự án</h3>
                <p className="text-xs text-slate-500">Hành động này sẽ xóa dự án khỏi hệ thống.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Để xác nhận, vui lòng nhập chính xác mã dự án{' '}
              <strong className="text-rose-600 font-mono px-1 py-0.5 bg-rose-50 rounded">
                {project?.key}
              </strong>{' '}
              vào ô bên dưới:
            </p>

            <input
              type="text"
              placeholder={`Nhập mã "${project?.key}" để xác nhận...`}
              value={deleteConfirmationKey}
              onChange={(e) => setDeleteConfirmationKey(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => deleteProjectMutation.mutate()}
                disabled={
                  deleteConfirmationKey.trim().toUpperCase() !== project?.key?.toUpperCase() ||
                  deleteProjectMutation.isPending
                }
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-2xs cursor-pointer disabled:opacity-40"
              >
                {deleteProjectMutation.isPending ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GeneralSettingsTab
