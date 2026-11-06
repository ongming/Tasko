import React from 'react'
import {
  FolderPlus,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Kanban,
  Repeat,
  Layers,
} from 'lucide-react'
import type { AgileCardConfig, BusinessDomain } from '@/types/createProject'

interface ProjectFinalSetupStepProps {
  method: AgileCardConfig
  domain: BusinessDomain
  projectName: string
  projectKey: string
  projectColor: string
  error: string
  isSubmitting: boolean
  onProjectNameChange: (val: string) => void
  onProjectKeyChange: (val: string) => void
  onProjectColorChange: (val: string) => void
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
 * Giúp người dùng hoàn thiện Tên dự án, Mã Key, Màu sắc trước khi tạo vào Workspace.
 */
export const ProjectFinalSetupStep: React.FC<ProjectFinalSetupStepProps> = ({
  method,
  domain,
  projectName,
  projectKey,
  projectColor,
  error,
  isSubmitting,
  onProjectNameChange,
  onProjectKeyChange,
  onProjectColorChange,
  onBack,
  onSubmit,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 text-left animate-in fade-in slide-in-from-right-3 duration-200">
      
      {/* 1. Header & Điều hướng quay lại */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onBack}
          className="self-start inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer group active:scale-[0.98] mb-1"
          aria-label="Quay lại chọn mẫu"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Quay lại chọn mô hình</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Thiết lập chi tiết dự án
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Đặt tên và mã định danh cho dự án của bạn. Bạn có thể thay đổi các cài đặt này bất kỳ lúc nào sau khi tạo.
        </p>
      </div>

      {/* 2. Banner tóm tắt cấu hình đã chọn (Summary Strip) */}
      <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shadow-2xs">
            {method.id === 'kanban' && <Kanban className="w-4 h-4" />}
            {method.id === 'scrum' && <Repeat className="w-4 h-4" />}
            {method.id === 'scrumban' && <Layers className="w-4 h-4" />}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900">
              Phương pháp: {method.title}
            </span>
            <span className="text-[11px] text-slate-500">
              Mô hình: {domain.name}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
        >
          Thay đổi
        </button>
      </div>

      {/* 3. Form nhập thông tin chính */}
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium animate-in fade-in duration-150 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tên Dự án */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="finalProjectNameInput" className="text-xs font-bold text-slate-800">
            Tên dự án <span className="text-rose-500">*</span>
          </label>
          <input
            id="finalProjectNameInput"
            name="projectName"
            type="text"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            placeholder="VD: Core Website Redesign, Phát triển Ứng dụng..."
            className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
            required
            autoFocus
          />
        </div>

        {/* Mã dự án (Key) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="finalProjectKeyInput" className="text-xs font-bold text-slate-800">
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
            className="w-full px-4 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-xl font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all uppercase shadow-2xs"
            required
          />
          <p className="text-[11px] text-slate-500">
            Mã này dùng làm tiền tố trên tất cả các thẻ công việc (ví dụ: <strong className="font-semibold text-slate-700">{projectKey || 'PROJ'}-1</strong>, <strong className="font-semibold text-slate-700">{projectKey || 'PROJ'}-2</strong>).
          </p>
        </div>

        {/* Màu đại diện dự án */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-800">
            Màu sắc đại diện
          </label>
          <div className="flex items-center gap-3">
            {AVAILABLE_COLORS.map((c) => (
              <button
                key={c.class}
                type="button"
                onClick={() => onProjectColorChange(c.class)}
                aria-label={`Chọn màu ${c.name}`}
                className={`w-7 h-7 rounded-full ${c.class} flex items-center justify-center transition-transform cursor-pointer focus:outline-none ${
                  projectColor === c.class ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110 shadow-xs' : 'hover:scale-105'
                }`}
              >
                {projectColor === c.class && <Check className="w-4 h-4 text-white stroke-[2.5]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Nút hành động Submit */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-2">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Quay lại
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || !projectName.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-xl shadow-xs shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
