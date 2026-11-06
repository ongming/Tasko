import React from 'react'
import {
  Kanban,
  Repeat,
  Layers,
  ArrowRight,
  Package,
  CheckSquare,
  Bug,
} from 'lucide-react'
import type { AgileCardConfig, MethodDetails } from '@/types/createProject'

interface MethodDetailsSidebarProps {
  method: AgileCardConfig
  details: MethodDetails
  onUseTemplate?: () => void
}

// Icon tương ứng cho các loại công việc chuẩn hóa: Module, Task, Bug
function getIssueTypeIcon(label: string) {
  const lower = label.toLowerCase()
  if (lower.includes('module')) return <Package className="w-3 h-3 text-purple-600" />
  if (lower.includes('bug') || lower.includes('lỗi')) return <Bug className="w-3 h-3 text-rose-500" />
  return <CheckSquare className="w-3 h-3 text-blue-600" />
}

/**
 * Cột thông tin phương pháp (MethodDetailsSidebar)
 * Thiết kế phẳng (Borderless / Flat Canvas) tinh gọn 100% chuẩn Jira Cloud & Linear.
 * Tuân thủ Impeccable: Không bọc card-in-card, typography rõ ràng, nút Sử dụng mẫu này đặt ngay dưới.
 */
export const MethodDetailsSidebar: React.FC<MethodDetailsSidebarProps> = ({
  method,
  details,
  onUseTemplate,
}) => {
  return (
    <aside
      aria-label={`Chi tiết phương pháp ${method.title}`}
      className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-5 self-start text-left select-none pr-0 lg:pr-4"
    >
      {/* 1. Header & Title */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
          <div className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
            {method.id === 'kanban' && <Kanban className="w-3.5 h-3.5" />}
            {method.id === 'scrum' && <Repeat className="w-3.5 h-3.5" />}
            {method.id === 'scrumban' && <Layers className="w-3.5 h-3.5" />}
          </div>
          <span>Mẫu phương pháp</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {method.title}
        </h1>

        <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
          {method.description}
        </p>
      </div>

      {/* 2. Features (Tính năng chính) */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Tính năng
        </h3>
        <div className="flex flex-col gap-1.5">
          {details.features.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-snug">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Workflow (Quy trình dạng hàng ngang nối tiếp chuẩn Jira) */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Quy trình (Workflow)
        </h3>
        <div className="flex items-center flex-wrap gap-1.5">
          {details.workflow.map((st, idx) => (
            <React.Fragment key={idx}>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100/90 text-slate-700 border border-slate-200/80 shadow-2xs">
                {st.label}
              </span>
              {idx < details.workflow.length - 1 && (
                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0 stroke-[2.5]" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 4. Work types (Loại công việc trên 1 hàng phẳng với Icon) */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Loại công việc
        </h3>
        <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-700">
          {details.issueTypes.map((it, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/70 text-[11px] font-medium"
            >
              {getIssueTypeIcon(it.label)}
              <span>{it.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Nút Sử dụng mẫu này nằm độc lập ở cuối cột trái (Đúng vị trí khoanh đỏ) */}
      {onUseTemplate && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onUseTemplate}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-xl shadow-xs shadow-indigo-600/30 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span>Sử dụng mẫu này</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </aside>
  )
}
