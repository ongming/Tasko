import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  dotColor?: string
  icon?: React.ReactNode
  badge?: string
  disabled?: boolean
}

export interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  buttonClassName?: string
  disabled?: boolean
  ariaLabel?: string
  title?: string
  size?: 'sm' | 'md'
  align?: 'left' | 'right'
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Chọn...',
  className = '',
  buttonClassName = '',
  disabled = false,
  ariaLabel,
  title,
  size = 'sm',
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const heightClass = size === 'md' ? 'h-9 px-3 text-sm' : 'h-8 px-2.5 text-xs'

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        title={title}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 bg-white border rounded-lg text-slate-800 shadow-2xs transition-all cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${heightClass} ${
          isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-100'
            : 'border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
        } ${buttonClassName}`}
      >
        <span className="flex items-center gap-2 min-w-0 flex-1 text-left">
          {selectedOption?.dotColor && (
            <span className={`w-2 h-2 rounded-full shrink-0 ${selectedOption.dotColor}`} />
          )}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className={`truncate ${selectedOption ? '' : 'text-slate-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-indigo-500' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={`absolute top-full mt-1.5 min-w-full w-max max-w-[280px] bg-white rounded-xl border border-slate-200/90 shadow-xl p-1 z-50 max-h-60 overflow-y-auto animate-in fade-in duration-100 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400 text-center">Không có lựa chọn</div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  onClick={() => {
                    if (opt.disabled) return
                    onChange(opt.value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    isSelected
                      ? 'bg-indigo-50/90 text-indigo-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100/80 font-medium'
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0 flex-1">
                    {opt.dotColor && (
                      <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dotColor}`} />
                    )}
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <span className="truncate">{opt.label}</span>
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    {opt.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </span>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default Select
