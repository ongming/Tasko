import React, { useEffect, useRef, useState } from 'react'
import {
  WORK_TYPE_COLOR_OPTIONS,
  WORK_TYPE_ICON_OPTIONS,
  renderLucideWorkTypeIcon,
  resolveWorkTypeTextClass,
} from './WorkTypeIcon'

export interface WorkTypeIconPickerProps {
  iconKey: string
  color?: string | null
  onSelectIcon: (iconKey: string) => void
  onSelectColor?: (colorValue: string) => void
  ariaLabel?: string
}

/**
 * Nút chọn biểu tượng + chấm màu dùng chung cho Tạo dự án và Cài đặt Loại công việc.
 */
export const WorkTypeIconPicker: React.FC<WorkTypeIconPickerProps> = ({
  iconKey,
  color,
  onSelectIcon,
  onSelectColor,
  ariaLabel = 'Chọn biểu tượng',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const activeTextClass = resolveWorkTypeTextClass(iconKey, color)

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Chọn biểu tượng và màu sắc"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        className={`w-10 h-10 rounded-md border bg-white hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer shadow-2xs ${
          isOpen ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200'
        }`}
      >
        {renderLucideWorkTypeIcon(iconKey, `w-4 h-4 ${activeTextClass}`)}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-56 rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-xl animate-in fade-in duration-100">
          <div
            role="listbox"
            aria-label="Danh sách biểu tượng"
            className="grid grid-cols-5 gap-1.5"
          >
            {WORK_TYPE_ICON_OPTIONS.map((opt) => {
              const isSelected = iconKey === opt.key
              return (
                <button
                  key={opt.key}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  title={opt.label}
                  aria-label={opt.label}
                  onClick={() => {
                    onSelectIcon(opt.key)
                    setIsOpen(false)
                  }}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    isSelected ? 'bg-slate-100 ring-2 ring-slate-800' : 'hover:bg-slate-100'
                  }`}
                >
                  {renderLucideWorkTypeIcon(opt.key, 'w-4 h-4 text-slate-800')}
                </button>
              )
            })}
          </div>

          {onSelectColor && (
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 px-1">
              {WORK_TYPE_COLOR_OPTIONS.map((colorOpt) => {
                const isColorSelected = activeTextClass === colorOpt.textClass
                return (
                  <button
                    key={colorOpt.name}
                    type="button"
                    title={`Màu ${colorOpt.name}`}
                    aria-label={`Chọn màu biểu tượng ${colorOpt.name}`}
                    onClick={() => onSelectColor(colorOpt.colorValue)}
                    className={`w-5 h-5 rounded-full ${colorOpt.dotClass} transition-transform hover:scale-110 cursor-pointer ${
                      isColorSelected ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : ''
                    }`}
                  />
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default WorkTypeIconPicker
