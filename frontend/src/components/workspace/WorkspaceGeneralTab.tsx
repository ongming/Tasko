import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { workspaceService } from '@/services/workspaceService'
import type { WorkspaceResponse } from '@/types/workspace'

export interface WorkspaceGeneralTabProps {
  workspace: WorkspaceResponse
  canManage: boolean
  isOwner?: boolean
  remainingWorkspaces?: WorkspaceResponse[]
}

export const WorkspaceGeneralTab: React.FC<WorkspaceGeneralTabProps> = ({
  workspace,
  canManage,
  isOwner = false,
  remainingWorkspaces = [],
}) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [wsName, setWsName] = useState('')
  const [wsDescription, setWsDescription] = useState('')
  const [wsSuccess, setWsSuccess] = useState<string | null>(null)
  const [wsError, setWsError] = useState<string | null>(null)
  const [isCopiedSlug, setIsCopiedSlug] = useState(false)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [confirmName, setConfirmName] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    setWsName(workspace.name || '')
    setWsDescription(workspace.description || '')
  }, [workspace.id, workspace.name, workspace.description])

  const updateWorkspaceMutation = useMutation({
    mutationFn: (payload: { name?: string; description?: string }) =>
      workspaceService.update(workspace.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-workspaces'] })
      queryClient.invalidateQueries({ queryKey: ['workspace', workspace.slug] })
      setWsSuccess('Cập nhật cấu hình không gian làm việc thành công!')
      setTimeout(() => setWsSuccess(null), 3500)
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || err?.message || 'Không thể cập nhật không gian làm việc'
      setWsError(msg)
    },
  })

  const deleteWorkspaceMutation = useMutation({
    mutationFn: () => workspaceService.remove(workspace.id),
    onSuccess: () => {
      setIsDeleteModalOpen(false)
      setDeleteError(null)
      queryClient.invalidateQueries({ queryKey: ['my-workspaces'] })
      queryClient.removeQueries({ queryKey: ['workspace', workspace.slug] })
      queryClient.removeQueries({ queryKey: ['workspace-members', workspace.id] })
      queryClient.removeQueries({ queryKey: ['projects', workspace.id] })
      queryClient.removeQueries({ queryKey: ['projects', workspace.slug] })

      const nextWorkspace = remainingWorkspaces[0]
      if (nextWorkspace) {
        navigate(`/${nextWorkspace.slug}/overview`, { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể xóa không gian làm việc. Vui lòng thử lại sau.'
      setDeleteError(msg)
    },
  })

  const isConfirmMatched = confirmName.trim() === workspace.name

  const handleUpdateWorkspace = (e: React.FormEvent) => {
    e.preventDefault()
    if (!wsName.trim()) {
      setWsError('Tên không gian làm việc không được để trống')
      return
    }
    setWsError(null)
    setWsSuccess(null)
    updateWorkspaceMutation.mutate({
      name: wsName.trim(),
      description: wsDescription.trim() || undefined,
    })
  }

  const handleCopySlug = () => {
    if (!workspace.slug) return
    navigator.clipboard.writeText(`${window.location.origin}/${workspace.slug}`)
    setIsCopiedSlug(true)
    setTimeout(() => setIsCopiedSlug(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      {wsSuccess && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{wsSuccess}</span>
        </div>
      )}
      {wsError && (
        <div className="flex items-center gap-2 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{wsError}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        <form onSubmit={handleUpdateWorkspace} className="p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Cấu hình Không gian làm việc</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Chỉnh sửa tên và thông tin nhận diện của Không gian làm việc này.
              </p>
            </div>

            {!canManage && (
              <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                Chỉ xem (Không có quyền sửa)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Tên Không gian làm việc <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
                disabled={!canManage || updateWorkspaceMutation.isPending}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-medium disabled:bg-slate-50 disabled:cursor-not-allowed transition-all shadow-2xs"
                placeholder="Nhập tên không gian làm việc..."
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Đường dẫn định danh (URL Slug)
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  value={workspace.slug}
                  readOnly
                  disabled
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 font-mono font-medium cursor-default"
                />
                <button
                  type="button"
                  onClick={handleCopySlug}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Sao chép liên kết Không gian làm việc"
                >
                  {isCopiedSlug ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Mô tả Không gian làm việc
            </label>
            <textarea
              rows={3}
              value={wsDescription}
              onChange={(e) => setWsDescription(e.target.value)}
              disabled={!canManage || updateWorkspaceMutation.isPending}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-medium disabled:bg-slate-50 disabled:cursor-not-allowed transition-all shadow-2xs resize-none"
              placeholder="Nhập mô tả ngắn gọn về không gian làm việc này..."
            />
          </div>

          {canManage && (
            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={updateWorkspaceMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {updateWorkspaceMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Lưu thay đổi</span>
              </button>
            </div>
          )}
        </form>

        {/* Thống kê & Gemini AI */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/50">
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Thành viên</span>
            <p className="text-lg font-bold text-slate-900">{workspace.memberCount || 1} người</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              Vai trò của bạn
            </span>
            <p className="text-lg font-bold text-indigo-600">
              {workspace.role === 'OWNER'
                ? 'Chủ sở hữu'
                : workspace.role === 'ADMIN'
                  ? 'Quản trị viên'
                  : 'Thành viên'}
            </p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              Tasko Gemini AI
            </span>
            <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Đang kích hoạt</span>
            </p>
          </div>
        </div>
      </div>

      {/* Vùng nguy hiểm (Danger Zone) */}
      <div className="bg-rose-50/50 rounded-2xl border border-rose-200 p-6 space-y-3">
        <h2 className="text-sm font-bold text-rose-900 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Vùng nguy hiểm</span>
        </h2>
        <p className="text-xs text-rose-700 leading-relaxed">
          Xóa không gian làm việc là hành động <strong>không thể hoàn tác</strong>. Toàn bộ dự án,
          công việc, Sprint, danh sách thành viên và cấu hình liên quan thuộc{' '}
          <strong>{workspace.name}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống.
        </p>

        {isOwner ? (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setConfirmName('')
                setDeleteError(null)
                setIsDeleteModalOpen(true)
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa không gian làm việc</span>
            </button>
          </div>
        ) : (
          <p className="text-xs font-medium text-rose-600/80 bg-white/70 border border-rose-200/70 rounded-xl px-3.5 py-2.5">
            Chỉ Chủ sở hữu Workspace mới có quyền xóa không gian làm việc này.
          </p>
        )}
      </div>

      {/* Modal Xác nhận xóa Workspace */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-workspace-modal-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3
                  id="delete-workspace-modal-title"
                  className="text-sm font-bold text-slate-900"
                >
                  Xác nhận xóa không gian làm việc
                </h3>
                <p className="text-xs text-slate-500">
                  Hành động này không thể hoàn tác sau khi thực hiện.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Để xác nhận xóa vĩnh viễn, vui lòng nhập chính xác tên không gian làm việc{' '}
              <strong className="text-rose-600 px-1.5 py-0.5 bg-rose-50 rounded font-semibold">
                {workspace.name}
              </strong>{' '}
              vào ô bên dưới:
            </p>

            <input
              type="text"
              placeholder={`Nhập "${workspace.name}" để xác nhận...`}
              value={confirmName}
              onChange={(e) => {
                setConfirmName(e.target.value)
                if (deleteError) setDeleteError(null)
              }}
              disabled={deleteWorkspaceMutation.isPending}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-rose-500 focus:ring-2 focus:ring-rose-100 disabled:bg-slate-50"
            />

            {deleteError && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteWorkspaceMutation.isPending}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => deleteWorkspaceMutation.mutate()}
                disabled={!isConfirmMatched || deleteWorkspaceMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleteWorkspaceMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <span>Xóa vĩnh viễn Workspace</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkspaceGeneralTab
