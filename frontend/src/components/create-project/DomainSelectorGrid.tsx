import React, { useRef } from 'react'
import type { ProjectTemplate } from '@/types/projectTemplate'
import { TemplateCard } from './TemplateCard'

interface DomainSelectorGridProps {
  templates: ProjectTemplate[]
  selectedTemplate: ProjectTemplate | null
  onSelectTemplate: (template: ProjectTemplate) => void
}

export const DomainSelectorGrid: React.FC<DomainSelectorGridProps> = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!templates.length) return

    const currentIndex = selectedTemplate
      ? templates.findIndex((t) => t.id === selectedTemplate.id)
      : 0

    let nextIndex = currentIndex

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      nextIndex = (currentIndex + 1) % templates.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      nextIndex = (currentIndex - 1 + templates.length) % templates.length
    }

    if (nextIndex !== currentIndex && templates[nextIndex]) {
      onSelectTemplate(templates[nextIndex]!)
      // Focus element mới
      const radios = containerRef.current?.querySelectorAll<HTMLElement>('[role="radio"]')
      radios?.[nextIndex]?.focus()
    }
  }

  return (
    <div className="flex flex-col gap-4 text-left">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Chọn mô hình phù hợp (Lĩnh vực dự án)
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Tasko sẽ tự động cấu hình quy trình làm việc (workflow), loại công việc và nhãn dán tối ưu nhất theo từng mẫu.
        </p>
      </div>

      <div
        ref={containerRef}
        role="radiogroup"
        aria-label="Danh sách mẫu mô hình dự án"
        onKeyDown={handleKeyDown}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr"
      >
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            selected={selectedTemplate?.id === template.id}
            onSelect={onSelectTemplate}
          />
        ))}
      </div>
    </div>
  )
}
