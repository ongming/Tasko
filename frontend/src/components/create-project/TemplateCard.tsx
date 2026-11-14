import React from 'react'
import { Check } from 'lucide-react'
import type { ProjectTemplate } from '@/types/projectTemplate'

export interface TemplateCardProps {
  template: ProjectTemplate
  selected: boolean
  onSelect: (template: ProjectTemplate) => void
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  selected,
  onSelect,
}) => {
  const Icon = template.icon
  const visibleTags = template.tags.slice(0, 3)
  const remainingCount = template.tags.length - visibleTags.length

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      onSelect(template)
    }
  }

  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={selected ? 0 : -1}
      aria-label={`Mẫu dự án ${template.name}`}
      onClick={() => onSelect(template)}
      onKeyDown={handleKeyDown}
      className={`relative flex flex-col justify-between p-5 rounded-xl border text-left cursor-pointer transition-all duration-150 select-none h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${
        selected
          ? 'bg-indigo-50/40 border-indigo-600 shadow-xs ring-1 ring-indigo-600'
          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-2xs'
      }`}
    >
      {/* Góc trên: Icon + Badge + Check icon */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              selected
                ? 'bg-indigo-100/70 border-indigo-200 text-indigo-700'
                : 'bg-slate-50 border-slate-200/80 text-slate-700'
            }`}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-700 border-slate-200/80">
              {template.badge}
            </span>

            {/* Checkmark icon hiển thị rõ ràng khi được chọn để không phụ thuộc vào màu sắc */}
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                selected
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'border border-slate-300 bg-white text-transparent'
              }`}
              aria-hidden="true"
            >
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Tiêu đề & Mô tả */}
        <h3 className="text-base font-semibold text-slate-900 tracking-tight">
          {template.name}
        </h3>
        <p className="text-sm text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
          {template.description}
        </p>
      </div>

      {/* Danh sách Tags nhãn dán: tối đa 3 chips + chip +N nếu còn */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
        {visibleTags.map((tag, idx) => (
          <span
            key={idx}
            className="text-xs font-medium bg-slate-100/80 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/60"
          >
            #{tag}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md border border-slate-200/60">
            +{remainingCount}
          </span>
        )}
      </div>
    </div>
  )
}
