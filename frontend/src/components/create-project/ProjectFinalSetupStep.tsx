import React, { useState } from 'react'
import {
  FolderPlus,
  Check,
  ArrowRight,
  Loader2,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Info,
  RotateCcw,
  Users,
  Search,
  UserPlus,
  X,
} from 'lucide-react'
import { Select } from '@/components/ui/Select'
import { WorkTypeIconPicker } from '@/components/project/WorkTypeIconPicker'
import type {
  AgileCardConfig,
  BusinessDomain,
  WorkflowStage,
  CustomWorkType,
  PendingProjectMember,
} from '@/types/createProject'
import type { WorkspaceMemberItem, Role } from '@/types/member'
import type { UserSearchItem } from '@/services/userService'

interface ProjectFinalSetupStepProps {
  method: AgileCardConfig
  domain: BusinessDomain
  projectName: string
  projectKey: string
  projectColor: string
  error: string
  isSubmitting: boolean
  workflow: WorkflowStage[]
  workTypes: CustomWorkType[]
  isAdvancedOpen?: boolean
  onProjectNameChange: (val: string) => void
  onProjectKeyChange: (val: string) => void
  onProjectColorChange: (val: string) => void
  onUpdateWorkflowLabel: (id: string, label: string) => void
  onUpdateWorkflowCategory?: (id: string, category: 'TODO' | 'IN_PROGRESS' | 'DONE') => void
  onAddWorkflowStage: () => void
  onRemoveWorkflowStage: (id: string) => void
  onUpdateWorkTypeLabel: (id: string, label: string) => void
  onUpdateWorkTypeIcon: (id: string, iconKey: string) => void
  onUpdateWorkTypeColor?: (id: string, color: string) => void
  onAddWorkType?: () => void
  onRemoveWorkType?: (id: string) => void
  onResetConfiguration?: () => void
  onOpenAiModal?: () => void
  onToggleAdvanced?: () => void
  availableWorkspaceMembers?: WorkspaceMemberItem[]
  assignableRoles?: Role[]
  pendingMembers?: PendingProjectMember[]
  memberSearchQuery?: string
  searchedUsers?: UserSearchItem[]
  isSearchingMembers?: boolean
  onMemberSearchChange?: (val: string) => void
  onAddPendingMember?: (member: {
    userId: string
    fullName: string
    email: string
    avatarUrl?: string | null
    roleId?: string
  }) => void
  onRemovePendingMember?: (userId: string) => void
  onUpdatePendingMemberRole?: (userId: string, roleId: string) => void
  onAddAllWorkspaceMembers?: () => void
  onBack: () => void
  onSubmit: (e: React.FormEvent) => void
}

const AVAILABLE_COLORS = [
  { name: 'Indigo', class: 'bg-indigo-600', ring: 'ring-indigo-500' },
  { name: 'Tím', class: 'bg-purple-600', ring: 'ring-purple-500' },
  { name: 'Xanh dương', class: 'bg-blue-600', ring: 'ring-blue-500' },
  { name: 'Xanh lục', class: 'bg-emerald-600', ring: 'ring-emerald-500' },
  { name: 'Hổ phách', class: 'bg-amber-500', ring: 'ring-amber-500' },
  { name: 'Hồng', class: 'bg-pink-600', ring: 'ring-pink-500' },
]

/**
 * Bước 3: Trang thiết lập cuối cùng (ProjectFinalSetupStep)
 * Thiết kế tinh gọn, tập trung cao độ, chuẩn Impeccable (Operate Mode).
 * Hỗ trợ Tùy biến Nâng cao: Quy trình (Workflow) & Loại công việc (Module, Task, Bug)
 */
export const ProjectFinalSetupStep: React.FC<ProjectFinalSetupStepProps> = ({
  method,
  domain,
  projectName,
  projectKey,
  projectColor,
  error,
  isSubmitting,
  workflow,
  workTypes,
  onProjectNameChange,
  onProjectKeyChange,
  onProjectColorChange,
  onUpdateWorkflowLabel,
  onUpdateWorkflowCategory,
  onAddWorkflowStage,
  onRemoveWorkflowStage,
  onUpdateWorkTypeLabel,
  onUpdateWorkTypeIcon,
  onUpdateWorkTypeColor,
  onAddWorkType,
  onRemoveWorkType,
  onResetConfiguration,
  onOpenAiModal,
  availableWorkspaceMembers = [],
  assignableRoles = [],
  pendingMembers = [],
  memberSearchQuery = '',
  searchedUsers = [],
  isSearchingMembers = false,
  onMemberSearchChange,
  onAddPendingMember,
  onRemovePendingMember,
  onUpdatePendingMemberRole,
  onAddAllWorkspaceMembers,
  onBack,
  onSubmit,
}) => {
  // Trạng thái mở/đóng từng khối cấu hình chuẩn Jira Cloud
  const [isWorkTypesOpen, setIsWorkTypesOpen] = useState(true)
  const [isStatusesOpen, setIsStatusesOpen] = useState(false)

  const renderWorkTypeRow = (wt: CustomWorkType, canRemove: boolean) => (
    <div key={wt.id} className="flex items-center gap-2">
      <WorkTypeIconPicker
        iconKey={wt.iconKey}
        color={wt.color}
        ariaLabel={`Chọn biểu tượng cho ${wt.label || 'loại công việc'}`}
        onSelectIcon={(key) => onUpdateWorkTypeIcon(wt.id, key)}
        onSelectColor={
          onUpdateWorkTypeColor ? (col) => onUpdateWorkTypeColor(wt.id, col) : undefined
        }
      />

      <input
        type="text"
        value={wt.label}
        onChange={(e) => onUpdateWorkTypeLabel(wt.id, e.target.value)}
        placeholder="Tên loại công việc"
        className="flex-1 h-10 px-3 text-sm bg-white border border-slate-200 rounded-md text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
      />

      {canRemove && (
        <button
          type="button"
          onClick={() => onRemoveWorkType?.(wt.id)}
          title="Xóa loại công việc này"
          className="w-10 h-10 rounded-md border border-slate-200 hover:border-rose-200 hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0 shadow-2xs"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  )

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 text-left animate-in fade-in slide-in-from-right-3 duration-200">
      
      {/* 1. Header & Giới thiệu bước (Điều hướng đã được tích hợp 100% trên Breadcrumb) */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Thiết lập chi tiết dự án
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Đặt tên và mã định danh cho dự án của bạn. Bạn có thể thay đổi các cài đặt này bất kỳ lúc nào sau khi tạo.
        </p>
      </div>

      {/* 2. Form nhập thông tin chính */}
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        {error && (
          <div
            role="alert"
            className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium animate-in fade-in duration-150 flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tên Dự án */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="finalProjectNameInput" className="text-xs font-semibold text-slate-800">
            Tên dự án <span className="text-rose-500">*</span>
          </label>
          <input
            id="finalProjectNameInput"
            name="projectName"
            type="text"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            placeholder="VD: Core Website Redesign, Phát triển Ứng dụng..."
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
            required
            autoFocus
          />
        </div>

        {/* Mã dự án (Key) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="finalProjectKeyInput" className="text-xs font-semibold text-slate-800">
              Mã dự án (Key) <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">
              Tự động chuẩn hóa [A-Z]
            </span>
          </div>
          <input
            id="finalProjectKeyInput"
            name="projectKey"
            type="text"
            value={projectKey}
            onChange={(e) => onProjectKeyChange(e.target.value.toUpperCase())}
            placeholder="VD: TSK, CWR"
            maxLength={10}
            className="w-full px-3.5 py-2 text-sm bg-slate-50/60 border border-slate-200 rounded-lg font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all uppercase shadow-2xs"
            required
          />
          <p className="text-[11px] text-slate-500">
            Mã này dùng làm tiền tố trên tất cả các thẻ công việc (ví dụ: <strong className="font-semibold text-slate-700">{projectKey || 'PROJ'}-1</strong>, <strong className="font-semibold text-slate-700">{projectKey || 'PROJ'}-2</strong>).
          </p>
        </div>

        {/* Màu đại diện dự án (Chấm đơn sắc nét) */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-800">
            Màu sắc đại diện
          </label>
          <div className="flex items-center gap-2.5">
            {AVAILABLE_COLORS.map((c) => (
              <button
                key={c.class}
                type="button"
                onClick={() => onProjectColorChange(c.class)}
                aria-label={`Chọn màu ${c.name}`}
                className={`w-6 h-6 rounded-full ${c.class} flex items-center justify-center transition-transform cursor-pointer focus:outline-none ${
                  projectColor === c.class ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110 shadow-xs' : 'hover:scale-105'
                }`}
              >
                {projectColor === c.class && <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />}
              </button>
            ))}
          </div>
        </div>

        {/* KHỐI CẤU HÌNH (CONFIGURATION) CHUẨN JIRA CLOUD (XẾP DỌC) */}
        <div className="flex flex-col gap-3 pt-2">
          {/* Header Configuration* với Quick Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-slate-800">
                Configuration <span className="text-rose-500">*</span>
              </label>
            </div>

            <div className="flex items-center gap-1">
              {onResetConfiguration && (
                <button
                  type="button"
                  onClick={onResetConfiguration}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                  title="Khôi phục mặc định"
                  aria-label="Khôi phục mặc định"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* 1. Accordion: Loại công việc (Work types) */}
          <div className="border border-slate-200/90 rounded-lg bg-white overflow-visible shadow-2xs">
            <button
              type="button"
              onClick={() => setIsWorkTypesOpen((prev) => !prev)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer focus:outline-none"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-800">Work types</span>
                <span title="Các loại công việc cấu thành không gian làm việc của bạn">
                  <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                </span>
              </div>
              <div className="text-slate-400">
                {isWorkTypesOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </button>

            {isWorkTypesOpen && (
              <div className="px-4 pb-4 pt-1 flex flex-col gap-2.5 border-t border-slate-100">
                {/* Dòng 1: Epic / Module (Cấp cao nhất, không có nút xóa) */}
                {workTypes.slice(0, 1).map((wt) => renderWorkTypeRow(wt, false))}

                {/* Đường gạch ngang mờ ngăn cách Epic/Module và các công việc tiêu chuẩn */}
                {workTypes.length > 1 && <div className="border-b border-slate-100 my-0.5" />}

                {/* Các loại công việc tiêu chuẩn tiếp theo (Story, Task, Bug, ...) */}
                {workTypes.slice(1).map((wt) =>
                  renderWorkTypeRow(wt, Boolean(onRemoveWorkType && workTypes.length > 2)),
                )}

                {/* Nút thêm loại công việc */}
                {onAddWorkType && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={onAddWorkType}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 py-1.5 px-1 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add work type</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Accordion: Trạng thái (Statuses) */}
          <div className="border border-slate-200/90 rounded-lg bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setIsStatusesOpen((prev) => !prev)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer focus:outline-none"
            >
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800">Statuses</span>
                {!isStatusesOpen && (
                  <span className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {workflow.map((st) => st.label).join(', ')}
                  </span>
                )}
              </div>
              <div className="text-slate-400">
                {isStatusesOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </button>

            {isStatusesOpen && (
              <div className="px-4 pb-4 pt-2 flex flex-col gap-3 border-t border-slate-100">
                {/* Chú thích màu sắc và ý nghĩa trạng thái chuẩn Jira */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700">Quy ước màu:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span>Xám: Việc mới (To Do)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <span>Xanh dương: Đang làm (In Progress)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Xanh lá: Hoàn thành (Done)</span>
                  </div>
                </div>

                {workflow.map((st) => {
                  const currentCategory = st.category || 'IN_PROGRESS'
                  return (
                    <div key={st.id} className="flex items-center gap-2">
                      {/* Nút bấm chuyển nhanh giữa 3 màu trạng thái (Xám, Xanh dương, Xanh lá) */}
                      <button
                        type="button"
                        onClick={() => {
                          if (!onUpdateWorkflowCategory) return
                          const nextCat: 'TODO' | 'IN_PROGRESS' | 'DONE' =
                            currentCategory === 'TODO'
                              ? 'IN_PROGRESS'
                              : currentCategory === 'IN_PROGRESS'
                              ? 'DONE'
                              : 'TODO'
                          onUpdateWorkflowCategory(st.id, nextCat)
                        }}
                        title={`Nhóm hiện tại: ${
                          currentCategory === 'TODO'
                            ? 'Việc mới (Xám)'
                            : currentCategory === 'IN_PROGRESS'
                            ? 'Đang làm (Xanh dương)'
                            : 'Hoàn thành (Xanh lá)'
                        }. Bấm để đổi màu.`}
                        className={`w-10 h-10 rounded-md border flex items-center justify-center shrink-0 shadow-2xs transition-all cursor-pointer ${
                          currentCategory === 'TODO'
                            ? 'bg-slate-100 border-slate-300'
                            : currentCategory === 'DONE'
                            ? 'bg-emerald-50 border-emerald-300'
                            : 'bg-indigo-50 border-indigo-300'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full transition-transform hover:scale-125 ${
                            currentCategory === 'TODO'
                              ? 'bg-slate-400'
                              : currentCategory === 'DONE'
                              ? 'bg-emerald-500'
                              : 'bg-indigo-600'
                          }`}
                        />
                      </button>

                      {/* Ô nhập tên Status */}
                      <input
                        type="text"
                        value={st.label}
                        onChange={(e) => onUpdateWorkflowLabel(st.id, e.target.value)}
                        placeholder="Tên trạng thái"
                        className="flex-1 h-10 px-3 text-sm bg-white border border-slate-200 rounded-md text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
                      />

                      {/* Dropdown chọn nhóm nhanh */}
                      <Select
                        size="md"
                        value={currentCategory}
                        onChange={(val) =>
                          onUpdateWorkflowCategory &&
                          onUpdateWorkflowCategory(st.id, val as 'TODO' | 'IN_PROGRESS' | 'DONE')
                        }
                        className="min-w-[130px]"
                        options={[
                          { value: 'TODO', label: 'Việc mới', dotColor: 'bg-slate-400' },
                          { value: 'IN_PROGRESS', label: 'Đang làm', dotColor: 'bg-indigo-600' },
                          { value: 'DONE', label: 'Hoàn thành', dotColor: 'bg-emerald-500' },
                        ]}
                      />

                      {workflow.length > 2 && (
                        <button
                          type="button"
                          onClick={() => onRemoveWorkflowStage(st.id)}
                          title="Xóa trạng thái này"
                          className="w-10 h-10 rounded-md border border-slate-200 hover:border-rose-200 hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0 shadow-2xs"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )
                })}

                {/* Nút thêm trạng thái */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={onAddWorkflowStage}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 py-1.5 px-1 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add status</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Thành viên tham gia dự án */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <div>
                <h3 className="text-xs font-bold text-slate-900">Thành viên tham gia dự án</h3>
                <p className="text-[11px] text-slate-500">
                  Mặc định bạn là Chủ sở hữu. Có thể chọn nhanh từ Workspace hoặc tìm theo tên/email.
                </p>
              </div>
            </div>

            {availableWorkspaceMembers.length > 0 && onAddAllWorkspaceMembers && (
              <button
                type="button"
                onClick={onAddAllWorkspaceMembers}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold border border-indigo-200/70 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Thêm tất cả từ Workspace ({availableWorkspaceMembers.length})</span>
              </button>
            )}
          </div>

          {/* Ô tìm kiếm thành viên */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={memberSearchQuery}
              onChange={(e) => onMemberSearchChange?.(e.target.value)}
              placeholder="Tìm thành viên có sẵn trong Workspace hoặc theo tên / email..."
              className="w-full h-9 pl-8 pr-8 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            {isSearchingMembers && (
              <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
            )}
          </div>

          {/* Danh sách gợi ý từ Workspace + kết quả tìm kiếm */}
          {(() => {
            const q = memberSearchQuery.trim().toLowerCase()
            const filteredWs = availableWorkspaceMembers.filter((wm) => {
              if (!q) return true
              const name = (wm.user?.fullName || '').toLowerCase()
              const email = (wm.user?.email || '').toLowerCase()
              return name.includes(q) || email.includes(q)
            })
            const pendingIds = new Set(pendingMembers.map((m) => m.userId))
            const wsIds = new Set(availableWorkspaceMembers.map((wm) => wm.userId))
            const extraUsers = q
              ? searchedUsers.filter((u) => !pendingIds.has(u.id) && !wsIds.has(u.id))
              : []

            if (filteredWs.length === 0 && extraUsers.length === 0) {
              return q ? (
                <p className="text-[11px] text-slate-400 px-1">
                  Không tìm thấy thành viên phù hợp với &quot;{memberSearchQuery}&quot;.
                </p>
              ) : null
            }

            return (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {q ? 'Kết quả tìm kiếm' : 'Thành viên có sẵn trong Workspace'}
                </span>
                <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-200/70 bg-slate-50/50">
                  {filteredWs.map((wm) => {
                    const name = wm.user?.fullName || wm.user?.email || 'Thành viên'
                    const email = wm.user?.email || ''
                    return (
                      <div
                        key={wm.userId}
                        className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-white transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate">{name}</p>
                            {email && <p className="text-[10px] text-slate-400 truncate">{email}</p>}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            onAddPendingMember?.({
                              userId: wm.userId,
                              fullName: name,
                              email,
                              avatarUrl: wm.user?.avatarUrl,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white hover:bg-indigo-50 text-indigo-600 border border-slate-200 hover:border-indigo-200 text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Thêm</span>
                        </button>
                      </div>
                    )
                  })}

                  {extraUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-white transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {(u.fullName || u.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {u.fullName || u.email}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onAddPendingMember?.({
                            userId: u.id,
                            fullName: u.fullName || u.email,
                            email: u.email,
                            avatarUrl: u.avatarUrl,
                          })
                        }
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white hover:bg-indigo-50 text-indigo-600 border border-slate-200 hover:border-indigo-200 text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Danh sách thành viên sẽ được thêm vào dự án */}
          {pendingMembers.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                Sẽ thêm vào dự án ({pendingMembers.length})
              </span>
              <div className="space-y-1.5">
                {pendingMembers.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-slate-200/80 bg-slate-50/40"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {member.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{member.fullName}</p>
                        {member.email && (
                          <p className="text-[10px] text-slate-400 truncate">{member.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {assignableRoles.length > 0 && (
                        <Select
                          size="xs"
                          value={member.roleId}
                          onChange={(roleId) => onUpdatePendingMemberRole?.(member.userId, roleId)}
                          className="min-w-[110px]"
                          options={assignableRoles.map((r) => ({
                            value: r.id,
                            label: r.name,
                          }))}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => onRemovePendingMember?.(member.userId)}
                        title="Bỏ thành viên này"
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Nút hành động Submit */}
        <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            Quay lại
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || !projectName.trim()}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-lg shadow-xs shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FolderPlus className="w-4 h-4" />
            )}
            <span>
              {isSubmitting ? 'Đang khởi tạo...' : 'Tạo dự án'}
            </span>
            {!isSubmitting && <ArrowRight className="w-3.5 h-3.5 ml-0.5" />}
          </button>
        </div>
      </form>
    </div>
  )
}
