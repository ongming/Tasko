import React, { useState } from 'react'
import {
  FolderPlus,
  Check,
  ArrowRight,
  Loader2,
  Layers,
  Package,
  Box,
  FolderKanban,
  LayoutGrid,
  CheckSquare,
  ListTodo,
  CheckCircle2,
  Bookmark,
  Bug,
  AlertTriangle,
  Flame,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Info,
  RotateCcw,
} from 'lucide-react'
import type {
  AgileCardConfig,
  BusinessDomain,
  WorkflowStage,
  CustomWorkType,
} from '@/types/createProject'

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
  onAddWorkflowStage: () => void
  onRemoveWorkflowStage: (id: string) => void
  onUpdateWorkTypeLabel: (id: string, label: string) => void
  onUpdateWorkTypeIcon: (id: string, iconKey: string) => void
  onAddWorkType?: () => void
  onRemoveWorkType?: (id: string) => void
  onResetConfiguration?: () => void
  onOpenAiModal?: () => void
  onToggleAdvanced?: () => void
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

function renderWorkTypeIcon(iconKey: string) {
  switch (iconKey) {
    case 'Layers':
      return <Layers className="w-4 h-4 text-purple-600" />
    case 'Box':
      return <Box className="w-4 h-4 text-purple-600" />
    case 'FolderKanban':
      return <FolderKanban className="w-4 h-4 text-purple-600" />
    case 'LayoutGrid':
      return <LayoutGrid className="w-4 h-4 text-purple-600" />
    case 'ListTodo':
      return <ListTodo className="w-4 h-4 text-blue-600" />
    case 'CheckCircle2':
      return <CheckCircle2 className="w-4 h-4 text-blue-600" />
    case 'Bookmark':
      return <Bookmark className="w-4 h-4 text-blue-600" />
    case 'AlertTriangle':
      return <AlertTriangle className="w-4 h-4 text-rose-500" />
    case 'Flame':
      return <Flame className="w-4 h-4 text-rose-500" />
    case 'ShieldAlert':
      return <ShieldAlert className="w-4 h-4 text-rose-500" />
    case 'CheckSquare':
      return <CheckSquare className="w-4 h-4 text-blue-600" />
    case 'Bug':
      return <Bug className="w-4 h-4 text-rose-500" />
    case 'Package':
    default:
      return <Package className="w-4 h-4 text-purple-600" />
  }
}

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
  onAddWorkflowStage,
  onRemoveWorkflowStage,
  onUpdateWorkTypeLabel,
  onUpdateWorkTypeIcon,
  onAddWorkType,
  onRemoveWorkType,
  onResetConfiguration,
  onOpenAiModal,
  onBack,
  onSubmit,
}) => {
  // Trạng thái mở/đóng từng khối cấu hình chuẩn Jira Cloud
  const [isWorkTypesOpen, setIsWorkTypesOpen] = useState(true)
  const [isStatusesOpen, setIsStatusesOpen] = useState(false)

  const handleCycleWorkTypeIcon = (id: string, currentIconKey: string) => {
    const iconList =
      id === 'module'
        ? ['Package', 'Layers', 'Box', 'FolderKanban', 'LayoutGrid']
        : id === 'task'
        ? ['CheckSquare', 'ListTodo', 'CheckCircle2', 'Bookmark']
        : ['Bug', 'AlertTriangle', 'Flame', 'ShieldAlert']
    const currIdx = iconList.indexOf(currentIconKey)
    const nextIcon = iconList[(currIdx + 1) % iconList.length]!
    onUpdateWorkTypeIcon(id, nextIcon)
  }

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
          <div className="border border-slate-200/90 rounded-lg bg-white overflow-hidden shadow-2xs">
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
                {workTypes.slice(0, 1).map((wt) => (
                  <div key={wt.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCycleWorkTypeIcon(wt.id, wt.iconKey)}
                      title="Nhấp để đổi biểu tượng"
                      className="w-10 h-10 rounded-md border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-2xs"
                    >
                      {renderWorkTypeIcon(wt.iconKey)}
                    </button>
                    <input
                      type="text"
                      value={wt.label}
                      onChange={(e) => onUpdateWorkTypeLabel(wt.id, e.target.value)}
                      placeholder="Tên loại công việc"
                      className="flex-1 h-10 px-3 text-sm bg-white border border-slate-200 rounded-md text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
                    />
                  </div>
                ))}

                {/* Đường gạch ngang mờ ngăn cách Epic/Module và các công việc tiêu chuẩn */}
                {workTypes.length > 1 && <div className="border-b border-slate-100 my-0.5" />}

                {/* Các loại công việc tiêu chuẩn tiếp theo (Story, Task, Bug, ...) */}
                {workTypes.slice(1).map((wt) => (
                  <div key={wt.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCycleWorkTypeIcon(wt.id, wt.iconKey)}
                      title="Nhấp để đổi biểu tượng"
                      className="w-10 h-10 rounded-md border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-2xs"
                    >
                      {renderWorkTypeIcon(wt.iconKey)}
                    </button>
                    <input
                      type="text"
                      value={wt.label}
                      onChange={(e) => onUpdateWorkTypeLabel(wt.id, e.target.value)}
                      placeholder="Tên loại công việc"
                      className="flex-1 h-10 px-3 text-sm bg-white border border-slate-200 rounded-md text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
                    />
                    {onRemoveWorkType && workTypes.length > 2 && (
                      <button
                        type="button"
                        onClick={() => onRemoveWorkType(wt.id)}
                        title="Xóa loại công việc này"
                        className="w-10 h-10 rounded-md border border-slate-200 hover:border-rose-200 hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0 shadow-2xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

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
              <div className="px-4 pb-4 pt-1 flex flex-col gap-2.5 border-t border-slate-100">
                {workflow.map((st) => (
                  <div key={st.id} className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-md border border-slate-200 bg-white flex items-center justify-center shrink-0 shadow-2xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    </div>
                    <input
                      type="text"
                      value={st.label}
                      onChange={(e) => onUpdateWorkflowLabel(st.id, e.target.value)}
                      placeholder="Tên trạng thái"
                      className="flex-1 h-10 px-3 text-sm bg-white border border-slate-200 rounded-md text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
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
                ))}

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
