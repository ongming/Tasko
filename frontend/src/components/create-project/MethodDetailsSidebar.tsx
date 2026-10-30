import React from 'react'
import { Check } from 'lucide-react'
import type { AgileCardConfig, MethodDetails } from './types'

interface MethodDetailsSidebarProps {
  method: AgileCardConfig
  details: MethodDetails
}

export const MethodDetailsSidebar: React.FC<MethodDetailsSidebarProps> = ({
  method,
  details,
}) => {
  return (
    <aside
      aria-label={`Chi tiết phương pháp ${method.title}`}
      className="w-full lg:w-80 shrink-0 flex flex-col gap-5 self-start text-left"
    >
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col gap-4">
        {/* Header thẻ phương pháp */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center shrink-0">
              {method.icon}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-snug">
                {method.title}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {method.featureText}
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${method.badgeClass}`}>
            {method.badge}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {method.description}
        </p>

        {/* Tính năng có sẵn */}
        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
          <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
            Tính năng cốt lõi
          </span>
          <div className="flex flex-col gap-2">
            {details.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quy trình công việc mẫu (Workflow) */}
        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
          <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
            Quy trình mẫu (Workflow)
          </span>
          <div className="flex flex-col gap-1.5">
            {details.workflow.map((st, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${st.color} flex-1 text-center shadow-2xs`}>
                  {st.label}
                </span>
                {idx < details.workflow.length - 1 && (
                  <span className="text-slate-300 text-xs shrink-0 select-none">↓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Loại công việc (Issue Types) */}
        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
          <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
            Loại công việc hỗ trợ
          </span>
          <div className="flex flex-wrap gap-1.5">
            {details.issueTypes.map((it, idx) => (
              <span key={idx} className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${it.color}`}>
                {it.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
