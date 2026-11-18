import React, { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  X,
  UserPlus,
  Users,
  Search,
  Trash2,
  Crown,
  Shield,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { projectService } from '@/services/projectService'
import { workspaceService } from '@/services/workspaceService'
import { useAuthStore } from '@/stores/authStore'
import type { ProjectMember, Role } from '@/types/member'

export interface ProjectMembersModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  workspaceId?: string
}

export const ProjectMembersModal: React.FC<ProjectMembersModalProps> = ({
  isOpen,
  onClose,
  projectId,
  workspaceId,
}) => {
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuthStore()

  // Form states
  const [selectedUserEmail, setSelectedUserEmail] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [searchMemberQuery, setSearchMemberQuery] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Dialog xác nhận chuyển quyền sở hữu & xóa
  const [transferTarget, setTransferTarget] = useState<ProjectMember | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProjectMember | null>(null)

  // 1. Lấy chi tiết dự án (để biết ownerId và workspaceId)
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getProjectById(projectId),
    enabled: isOpen && !!projectId,
  })

  const effectiveWorkspaceId = workspaceId || project?.workspaceId

  // 2. Lấy danh sách thành viên trong dự án
  const {
    data: projectMembers = [],
    isLoading: isLoadingMembers,
  } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => projectService.getProjectMembers(projectId),
    enabled: isOpen && !!projectId,
  })

  // 3. Lấy danh sách thành viên trong Workspace (để mời/chọn nhanh)
  const { data: workspaceMembers = [], isLoading: isLoadingWsMembers } = useQuery({
    queryKey: ['workspace-members', effectiveWorkspaceId],
    queryFn: () => workspaceService.getMembers(effectiveWorkspaceId!),
    enabled: isOpen && !!effectiveWorkspaceId,
  })

  // 4. Lấy danh sách các vai trò cấp Project (OWNER, MEMBER, VIEWER)
  const { data: projectRoles = [] } = useQuery({
    queryKey: ['roles', 'PROJECT'],
    queryFn: () => projectService.getRoles('PROJECT'),
    enabled: isOpen,
  })

  // Các vai trò có thể gán (chỉ MEMBER hoặc VIEWER, không cho gán OWNER trực tiếp khi thêm)
  const assignableRoles = useMemo(() => {
    return projectRoles.filter((r) => r.name !== 'OWNER')
  }, [projectRoles])

  // Thiết lập vai trò mặc định (MEMBER) khi roles load xong
  useEffect(() => {
    if (assignableRoles.length > 0 && !selectedRoleId) {
      const defaultRole = assignableRoles.find((r) => r.name === 'MEMBER') || assignableRoles[0]
      setSelectedRoleId(defaultRole.id)
    }
  }, [assignableRoles, selectedRoleId])

  // Kiểm tra quyền quản trị của người dùng hiện tại
  const canManage = useMemo(() => {
    if (!currentUser) return false
    // Là owner của dự án
    if (project?.ownerId && currentUser.id === project.ownerId) return true
    // Hoặc trong project_members có role là OWNER
    const currentProjMember = projectMembers.find((m) => m.userId === currentUser.id)
    if (currentProjMember?.role?.name === 'OWNER') return true
    // Hoặc là ADMIN / OWNER của Workspace
    const currentWsMember = workspaceMembers.find((wm) => wm.userId === currentUser.id)
    if (currentWsMember?.role?.name === 'ADMIN' || currentWsMember?.role?.name === 'OWNER') return true
    return false
  }, [currentUser, project, projectMembers, workspaceMembers])

  // Danh sách gợi ý thành viên Workspace chưa tham gia Project
  const availableWorkspaceMembers = useMemo(() => {
    const existingUserIds = new Set(projectMembers.map((m) => m.userId))
    return workspaceMembers.filter((wm) => !existingUserIds.has(wm.userId))
  }, [workspaceMembers, projectMembers])

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      setSelectedUserEmail('')
      setSelectedUserId(null)
      setSearchMemberQuery('')
      setFeedback(null)
      setTransferTarget(null)
      setDeleteTarget(null)
    }
  }, [isOpen])

  // Xử lý Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Mutation: Thêm thành viên
  const addMemberMutation = useMutation({
    mutationFn: (payload: { email?: string; userId?: string; roleId: string }) =>
      projectService.addProjectMember(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] })
      setSelectedUserEmail('')
      setSelectedUserId(null)
      setFeedback({ type: 'success', message: 'Thêm thành viên vào dự án thành công!' })
      setTimeout(() => setFeedback(null), 4000)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể thêm thành viên vào dự án'
      setFeedback({ type: 'error', message: msg })
    },
  })

  // Mutation: Đổi vai trò
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      projectService.updateProjectMemberRole(projectId, userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] })
      setFeedback({ type: 'success', message: 'Cập nhật vai trò thành công!' })
      setTimeout(() => setFeedback(null), 3000)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể cập nhật vai trò'
      setFeedback({ type: 'error', message: msg })
    },
  })

  // Mutation: Xóa thành viên
  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => projectService.removeProjectMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] })
      setDeleteTarget(null)
      setFeedback({ type: 'success', message: 'Đã xóa thành viên khỏi dự án!' })
      setTimeout(() => setFeedback(null), 3000)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể xóa thành viên'
      setFeedback({ type: 'error', message: msg })
    },
  })

  // Mutation: Chuyển quyền sở hữu
  const transferOwnershipMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      projectService.transferProjectOwnership(projectId, targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] })
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      setTransferTarget(null)
      setFeedback({ type: 'success', message: 'Đã chuyển giao quyền sở hữu dự án thành công!' })
      setTimeout(() => setFeedback(null), 4000)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể chuyển quyền sở hữu'
      setFeedback({ type: 'error', message: msg })
    },
  })

  // Submit thêm thành viên
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)

    if (!selectedRoleId) {
      setFeedback({ type: 'error', message: 'Vui lòng chọn vai trò cho thành viên!' })
      return
    }

    if (!selectedUserId && !selectedUserEmail.trim()) {
      setFeedback({ type: 'error', message: 'Vui lòng chọn hoặc nhập email thành viên!' })
      return
    }

    addMemberMutation.mutate({
      userId: selectedUserId || undefined,
      email: !selectedUserId ? selectedUserEmail.trim() : undefined,
      roleId: selectedRoleId,
    })
  }

  // Lọc danh sách thành viên hiển thị
  const filteredMembers = useMemo(() => {
    if (!searchMemberQuery.trim()) return projectMembers
    const q = searchMemberQuery.toLowerCase().trim()
    return projectMembers.filter(
      (m) =>
        m.user.fullName?.toLowerCase().includes(q) ||
        m.user.email?.toLowerCase().includes(q) ||
        m.role?.name?.toLowerCase().includes(q),
    )
  }, [projectMembers, searchMemberQuery])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-members-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="project-members-modal-title"
                className="text-base font-bold text-slate-900 tracking-tight leading-snug"
              >
                Thành viên Dự án
              </h2>
              <p className="text-xs text-slate-500">
                {project?.name || 'Dự án'} • {projectMembers.length} thành viên
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thông báo Feedback (Thành công / Lỗi) */}
        {feedback && (
          <div
            className={`px-6 py-2.5 flex items-center gap-2 text-xs font-medium border-b ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                : 'bg-rose-50 text-rose-800 border-rose-100'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Phần Thêm Thành Viên Mới (chỉ hiển thị nếu canManage) */}
          {canManage ? (
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                <span>Thêm thành viên mới</span>
              </div>

              <form onSubmit={handleAddMember} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  {/* Chọn thành viên Workspace HOẶC nhập Email */}
                  <div className="sm:col-span-8 space-y-1.5">
                    {availableWorkspaceMembers.length > 0 ? (
                      <div>
                        <select
                          className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                          value={selectedUserId || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            setSelectedUserId(val || null)
                            if (val) {
                              const found = availableWorkspaceMembers.find((m) => m.userId === val)
                              if (found) setSelectedUserEmail(found.user.email)
                            } else {
                              setSelectedUserEmail('')
                            }
                          }}
                        >
                          <option value="">-- Chọn thành viên từ Workspace --</option>
                          {availableWorkspaceMembers.map((wm) => (
                            <option key={wm.userId} value={wm.userId}>
                              {wm.user.fullName} ({wm.user.email})
                            </option>
                          ))}
                        </select>
                        <div className="mt-1 text-[11px] text-slate-400">
                          Hoặc nhập email bên dưới nếu chưa có trong danh sách trên:
                        </div>
                      </div>
                    ) : null}

                    {(!selectedUserId || availableWorkspaceMembers.length === 0) && (
                      <input
                        type="email"
                        placeholder="Nhập email thành viên thuộc Workspace..."
                        value={selectedUserEmail}
                        onChange={(e) => {
                          setSelectedUserEmail(e.target.value)
                          setSelectedUserId(null)
                        }}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    )}
                  </div>

                  {/* Dropdown Vai trò */}
                  <div className="sm:col-span-4">
                    <select
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                      value={selectedRoleId}
                      onChange={(e) => setSelectedRoleId(e.target.value)}
                    >
                      {assignableRoles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name === 'MEMBER'
                            ? 'Member (Chỉnh sửa)'
                            : role.name === 'VIEWER'
                            ? 'Viewer (Chỉ xem)'
                            : role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={addMemberMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {addMemberMutation.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang thêm...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Thêm vào dự án</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 flex items-center gap-2.5 text-xs text-slate-600">
              <Eye className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Bạn đang xem danh sách ở chế độ chỉ đọc. Chỉ Chủ sở hữu dự án hoặc Quản trị viên
                mới có quyền thêm và phân vai trò thành viên.
              </span>
            </div>
          )}

          {/* 2. Danh Sách Thành Viên Hiện Tại */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Danh sách thành viên ({projectMembers.length})
              </div>

              {/* Ô tìm kiếm thành viên */}
              <div className="relative w-48 sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm thành viên..."
                  value={searchMemberQuery}
                  onChange={(e) => setSearchMemberQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {isLoadingMembers ? (
              <div className="flex items-center justify-center py-10 text-slate-400 text-xs gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Đang tải danh sách thành viên...</span>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                Không tìm thấy thành viên nào phù hợp.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
                {filteredMembers.map((member) => {
                  const isOwner =
                    member.role?.name === 'OWNER' || project?.ownerId === member.userId
                  const initials = member.user.fullName
                    ? member.user.fullName.slice(0, 2).toUpperCase()
                    : 'U'
                  const isCurrentUser = currentUser?.id === member.userId

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/70 transition-colors gap-3"
                    >
                      {/* Avatar & Thông tin */}
                      <div className="flex items-center gap-3 min-w-0">
                        {member.user.avatarUrl ? (
                          <img
                            src={member.user.avatarUrl}
                            alt={member.user.fullName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center ring-1 ring-white shrink-0">
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-900 truncate">
                              {member.user.fullName}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                                Bạn
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 truncate block">
                            {member.user.email}
                          </span>
                        </div>
                      </div>

                      {/* Vai trò & Thao tác */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Huy hiệu Owner */}
                        {isOwner ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
                            <Crown className="w-3 h-3 text-amber-600" />
                            <span>Chủ sở hữu</span>
                          </span>
                        ) : canManage ? (
                          /* Dropdown đổi vai trò cho Member/Viewer */
                          <div className="flex items-center gap-1.5">
                            <select
                              value={member.roleId || ''}
                              onChange={(e) =>
                                updateRoleMutation.mutate({
                                  userId: member.userId,
                                  roleId: e.target.value,
                                })
                              }
                              disabled={updateRoleMutation.isPending}
                              className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-700 font-medium hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                            >
                              {assignableRoles.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name === 'MEMBER'
                                    ? 'Member'
                                    : r.name === 'VIEWER'
                                    ? 'Viewer'
                                    : r.name}
                                </option>
                              ))}
                            </select>

                            {/* Nút Chuyển quyền sở hữu */}
                            <button
                              type="button"
                              onClick={() => setTransferTarget(member)}
                              className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                              title="Chuyển quyền sở hữu dự án"
                              aria-label={`Chuyển quyền sở hữu cho ${member.user.fullName}`}
                            >
                              <Crown className="w-3.5 h-3.5" />
                            </button>

                            {/* Nút Xóa thành viên */}
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(member)}
                              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Xóa khỏi dự án"
                              aria-label={`Xóa ${member.user.fullName} khỏi dự án`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          /* Huy hiệu vai trò chỉ đọc khi không có quyền manage */
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                              member.role?.name === 'MEMBER'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            {member.role?.name === 'MEMBER' ? (
                              <>
                                <Shield className="w-3 h-3 text-blue-500" />
                                <span>Thành viên</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3 text-slate-400" />
                                <span>Người xem</span>
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* Dialog Xác nhận Chuyển quyền sở hữu (Transfer Ownership)   */}
      {/* ========================================================= */}
      {transferTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-100">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Chuyển quyền sở hữu dự án?
                </h3>
                <p className="text-xs text-slate-500">Hành động này không thể hoàn tác.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn chuyển giao vai trò <strong>Chủ sở hữu (Owner)</strong> của dự án
              cho <strong>{transferTarget.user.fullName}</strong> ({transferTarget.user.email})? Sau
              khi chuyển giao, bạn sẽ trở thành <strong>Thành viên (Member)</strong>.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTransferTarget(null)}
                disabled={transferOwnershipMutation.isPending}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => transferOwnershipMutation.mutate(transferTarget.userId)}
                disabled={transferOwnershipMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {transferOwnershipMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang chuyển...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-3.5 h-3.5" />
                    <span>Xác nhận chuyển</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Dialog Xác nhận Xóa thành viên khỏi dự án                  */}
      {/* ========================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-100">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Xóa thành viên khỏi dự án?</h3>
                <p className="text-xs text-slate-500">
                  Thành viên sẽ mất quyền truy cập dự án này.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa <strong>{deleteTarget.user.fullName}</strong> (
              {deleteTarget.user.email}) khỏi dự án này? Thành viên này vẫn giữ nguyên quyền trong
              Không gian làm việc.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={removeMemberMutation.isPending}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => removeMemberMutation.mutate(deleteTarget.userId)}
                disabled={removeMemberMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {removeMemberMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xác nhận xóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectMembersModal
