import React from 'react'
import { Check } from 'lucide-react'
import type { BusinessDomain } from './types'

interface DomainSelectorGridProps {
  domains: BusinessDomain[]
  selectedDomain: BusinessDomain
  onSelectDomain: (domain: BusinessDomain) => void
}

export const DomainSelectorGrid: React.FC<DomainSelectorGridProps> = ({
  domains,
  selectedDomain,
  onSelectDomain,
}) => {
  return (
    <div className="flex flex-col gap-3 text-left">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Chọn mô hình hoạt động (Lĩnh vực dự án)
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Tasko sẽ tự động cấu hình các nhãn dán, trường thông tin và mẫu thẻ phù hợp nhất với mô hình của bạn.
        </p>
      </div>

      <div
        role="region"
        aria-label="Danh sách mô hình hoạt động doanh nghiệp"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5"
      >
        {domains.map((domain) => {
          const isSelected = selectedDomain.id === domain.id
          const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onSelectDomain(domain)
            }
          }

          return (
            <div
              key={domain.id}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`Chọn mô hình ${domain.name}`}
              onClick={() => onSelectDomain(domain)}
              onKeyDown={handleKeyDown}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative select-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                isSelected
                  ? 'bg-indigo-50/40 border-indigo-500 ring-2 ring-indigo-100 shadow-xs'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center">
                    {domain.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${domain.badgeColor}`}>
                    {domain.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    {domain.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {domain.description}
                  </p>
                </div>
              </div>

              {/* Nhãn gợi ý (Tags) */}
              <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex flex-wrap gap-1">
                {domain.tags.map((t, idx) => (
                  <span key={idx} className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    #{t}
                  </span>
                ))}
              </div>

              {/* Biểu tượng Check khi được chọn */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
