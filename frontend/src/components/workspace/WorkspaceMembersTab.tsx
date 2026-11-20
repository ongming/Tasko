import React, { useState, useEffect, useRef } from 'react'
import {
  Users,
  UserPlus,
  Search,
  Loader2,
  X,
  ShieldCheck,
  User as UserIcon,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Crown,
  ChevronDown,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceService } from '@/services/workspaceService'
import { projectService } from '@/services/projectService'
import { userService, type UserSearchItem } from '@/services/userService'
import { useAuthStore } from '@/stores/authStore'
import type { WorkspaceResponse } from '@/types/workspace'
import type { WorkspaceMemberItem, Role } from '@/types/member'

export interface WorkspaceMembersTabProps {
  workspace: WorkspaceResponse;
  canManage: boolean;
}

export function WorkspaceMembersTab({ workspace, canManage }: WorkspaceMembersTabProps) {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((state) => state.user)

  // Search user form state with Debounce 300ms
  const [searchUserQuery, setSearchUserQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserSearchItem | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [filterListQuery, setFilterListQuery] = useState('')

  // Modal / Confirm state
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceMemberItem | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const searchContainerRef = useRef<HTMLDivElement>(null)

  // 1. Debounce 300ms cho ô tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchUserQuery.trim())
    }, 300)
    return () => clearTimeout(timer)
  }, [searchUserQuery])

  // 2. Click outside để đóng popup gợi ý
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchPopupOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 3. Tải danh sách thành viên hiện tại của Workspace
  const { data: members = [], isLoading: isLoadingMembers } = useQuery<WorkspaceMemberItem[]>({
    queryKey: ['workspace-members', workspace.id],
    queryFn: async () => {
      const res = await workspaceService.getMembers(workspace.id)
      return (res as any)?.data || res || []
    },
    enabled: !!workspace.id,
  })

  // 4. Tải danh sách vai trò cấp Workspace (ADMIN, MEMBER)
  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['workspace-roles'],
    queryFn: async () => {
      const res = await projectService.getRoles('WORKSPACE')
      return (res as any)?.data || res || []
    },
  })

  // Gán role mặc định là MEMBER
  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      const defaultRole = roles.find((r) => r.name === 'MEMBER') || roles[0]
      if (defaultRole) setSelectedRoleId(defaultRole.id)
    }
  }, [roles, selectedRoleId])

  // 5. Query tìm kiếm người dùng trong hệ thống qua từ khóa Debounce
  const { data: searchResults = [], isFetching: isSearchingUsers } = useQuery<UserSearchItem[]>({
    queryKey: ['users-search', debouncedSearchQuery],
    queryFn: () => userService.searchUsers(debouncedSearchQuery),
    enabled: debouncedSearchQuery.length >= 1 && isSearchPopupOpen,
    staleTime: 1000 * 30,
  })

  // 6. Mutation: Thêm thành viên vào Workspace
  const addMemberMutation = useMutation({
    mutationFn: (payload: { email: string; roleId: string }) =>
      workspaceService.addMember(workspace.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members', workspace.id] })
      setSelectedUser(null)
      setSearchUserQuery('')
      setDebouncedSearchQuery('')
      setIsSearchPopupOpen(false)
      setFeedback({ type: 'success', message: 'Thêm thành viên vào Không gian làm việc thành công!' })
      setTimeout(() => setFeedback(null), 4000)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể thêm thành viên vào Không gian làm việc'
      setFeedback({ type: 'error', message: msg })
    },
  })

  // 7. Mutation: Đổi vai trò thành viên
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      workspaceService.updateMemberRole(workspace.id, userId, { roleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members', workspace.id] })
      setFeedback({ type: 'success', message: 'Cập nhật vai trò thành viên thành công!' })
      setTimeout(() => setFeedback(null), 3000)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể thay đổi vai trò'
      setFeedback({ type: 'error', message: msg })
    },
  })

  // 8. Mutation: Xóa thành viên
  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => workspaceService.removeMember(workspace.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members', workspace.id] })
      setDeleteTarget(null)
      setFeedback({ type: 'success', message: 'Đã xóa thành viên khỏi Không gian làm việc!' })
      setTimeout(() => setFeedback(null), 3000)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể xóa thành viên'
      setFeedback({ type: 'error', message: msg })
    },
  })

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser?.email) {
      setFeedback({ type: 'error', message: 'Vui lòng tìm và chọn một người dùng từ danh sách gợi ý' })
      return
    }
    if (!selectedRoleId) {
      setFeedback({ type: 'error', message: 'Vui lòng chọn vai trò cho thành viên' })
      return
    }
    addMemberMutation.mutate({
      email: selectedUser.email,
      roleId: selectedRoleId,
    })
  }

  // Lọc danh sách thành viên hiển thị
  const filteredMembers = members.filter((m) => {
    if (!filterListQuery.trim()) return true
    const q = filterListQuery.toLowerCase()
    return (
      m.user.fullName?.toLowerCase().includes(q) ||
      m.user.email?.toLowerCase().includes(q) ||
      m.role.name?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Feedback Alert Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-3 p-3.5 rounded-xl text-xs font-semibold animate-in fade-in duration-200 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
              : 'bg-rose-50 text-rose-800 border-rose-200/80'
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

      {/* Form Thêm thành viên mới (chỉ hiện nếu canManage) */}
      {canManage && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              <span>Thêm thành viên vào Không gian làm việc</span>
            </h3>
            <span className="text-xs text-slate-400">
              Workspace: <strong className="text-slate-700">{workspace.name}</strong>
            </span>
          </div>

          <form onSubmit={handleAddMember} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              {/* Ô tìm kiếm người dùng với Debounce 300ms + Popup gợi ý */}
              <div className="sm:col-span-8 relative">
                {selectedUser ? (
                  <div className="flex items-center justify-between px-3 py-2 bg-indigo-50/70 border border-indigo-200/90 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {selectedUser.avatarUrl ? (
                        <img
                          src={selectedUser.avatarUrl}
                          alt={selectedUser.fullName}
                          className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-white"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {selectedUser.fullName ? selectedUser.fullName.slice(0, 2).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-indigo-950 truncate">
                          {selectedUser.fullName}
                        </span>
                        <span className="text-[10px] text-indigo-700/80 truncate">
                          {selectedUser.email}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(null)
                        setSearchUserQuery('')
                        setDebouncedSearchQuery('')
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-indigo-100/60 rounded-lg transition-colors cursor-pointer"
                      title="Đổi thành viên khác"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative" ref={searchContainerRef}>
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Nhập email hoặc họ tên thành viên để tìm kiếm..."
                      value={searchUserQuery}
                      onChange={(e) => {
                        setSearchUserQuery(e.target.value)
                        setIsSearchPopupOpen(true)
                      }}
                      onFocus={() => {
                        if (searchUserQuery.trim().length >= 1) {
                          setIsSearchPopupOpen(true)
                        }
                      }}
                      className="w-full text-xs sm:text-sm pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
                    />
                    {isSearchingUsers ? (
                      <Loader2 className="w-4 h-4 text-indigo-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                    ) : searchUserQuery ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchUserQuery('')
                          setDebouncedSearchQuery('')
                          setIsSearchPopupOpen(false)
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : null}

                    {/* Floating Popup Autosuggest */}
                    {isSearchPopupOpen && debouncedSearchQuery.length >= 1 && (
                      <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl border border-slate-200/90 shadow-xl p-1.5 z-50 animate-in fade-in duration-100 max-h-56 overflow-y-auto">
                        {isSearchingUsers ? (
                          <div className="flex items-center justify-center gap-2 py-4 text-xs text-slate-400">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                            <span>Đang tìm kiếm người dùng...</span>
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div className="py-4 text-center text-xs text-slate-400">
                            Không tìm thấy tài khoản nào khớp với &quot;{debouncedSearchQuery}&quot;
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            {searchResults.map((u) => {
                              const isAlreadyMember = members.some((m) => m.userId === u.id)
                              const isSelf = u.id === currentUser?.id
                              const initials = u.fullName ? u.fullName.slice(0, 2).toUpperCase() : 'U'

                              return (
                                <button
                                  key={u.id}
                                  type="button"
                                  onClick={() => {
                                    if (isAlreadyMember) return
                                    setSelectedUser(u)
                                    setIsSearchPopupOpen(false)
                                  }}
                                  disabled={isAlreadyMember}
                                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                                    isAlreadyMember
                                      ? 'opacity-60 bg-slate-50 cursor-not-allowed'
                                      : 'hover:bg-slate-100'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {u.avatarUrl ? (
                                      <img
                                        src={u.avatarUrl}
                                        alt={u.fullName}
                                        className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                                      />
                                    ) : (
                                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                                        {initials}
                                      </div>
                                    )}
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-xs font-semibold text-slate-800 truncate">
                                        {u.fullName}
                                      </span>
                                      <span className="text-[11px] text-slate-400 truncate">
                                        {u.email}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="shrink-0 ml-2">
                                    {isSelf ? (
                                      <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                        Bạn
                                      </span>
                                    ) : isAlreadyMember ? (
                                      <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                        Đã trong Không gian
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                                        Thành viên mới
                                      </span>
                                    )}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Lựa chọn vai trò (Admin / Member) */}
              <div className="sm:col-span-4 flex items-center gap-2">
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full text-xs sm:text-sm py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name === 'ADMIN' ? 'Quản trị viên (Admin)' : 'Thành viên (Member)'}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={!selectedUser || addMemberMutation.isPending}
                  className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  {addMemberMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5" />
                  )}
                  <span>Thêm</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách thành viên hiện tại */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Danh sách thành viên ({members.length})
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Lọc theo tên, email, vai trò..."
              value={filterListQuery}
              onChange={(e) => setFilterListQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {isLoadingMembers ? (
          <div className="flex items-center justify-center gap-2 py-12 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Đang tải danh sách thành viên...</span>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            {filterListQuery ? 'Không tìm thấy thành viên phù hợp.' : 'Chưa có thành viên nào.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredMembers.map((m) => {
              const isOwner = m.role.name === 'OWNER'
              const isSelf = m.userId === currentUser?.id
              const canEditThisMember = canManage && !isOwner && !isSelf
              const initials = m.user.fullName ? m.user.fullName.slice(0, 2).toUpperCase() : 'U'

              return (
                <div
                  key={m.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {m.user.avatarUrl ? (
                      <img
                        src={m.user.avatarUrl}
                        alt={m.user.fullName}
                        className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200 shadow-2xs"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs select-none">
                        {initials}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {m.user.fullName}
                        </span>
                        {isSelf && (
                          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded-full">
                            Bạn
                          </span>
                        )}
                        {isOwner && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-full flex items-center gap-1">
                            <Crown className="w-2.5 h-2.5" />
                            <span>Chủ sở hữu</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 truncate">{m.user.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Role selector or badge */}
                    {canEditThisMember ? (
                      <div className="relative">
                        <select
                          value={m.roleId || ''}
                          onChange={(e) =>
                            updateRoleMutation.mutate({
                              userId: m.userId,
                              roleId: e.target.value,
                            })
                          }
                          disabled={updateRoleMutation.isPending}
                          className="text-xs font-semibold py-1 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors cursor-pointer"
                        >
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          isOwner
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : m.role.name === 'ADMIN'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isOwner ? 'Chủ sở hữu' : m.role.name === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
                      </span>
                    )}

                    {/* Nút xóa thành viên */}
                    {canEditThisMember && (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(m)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa thành viên khỏi không gian làm việc"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal xác nhận xóa thành viên */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Xóa thành viên khỏi Không gian làm việc?
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Bạn có chắc chắn muốn xóa thành viên{' '}
                <strong className="text-slate-800">{deleteTarget.user.fullName}</strong> (
                {deleteTarget.user.email}) khỏi Không gian làm việc{' '}
                <strong className="text-slate-800">{workspace.name}</strong> không? Người dùng này sẽ mất toàn bộ quyền truy cập vào các dự án trong không gian này.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => removeMemberMutation.mutate(deleteTarget.userId)}
                disabled={removeMemberMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {removeMemberMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkspaceMembersTab
