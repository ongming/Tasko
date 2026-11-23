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
  size?: 'xs' | 'sm' | 'md'
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
  const [openUpward, setOpenUpward] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  const toggleOpen = () => {
    if (disabled) return
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setOpenUpward(spaceBelow < 240 && rect.top > spaceBelow)
      const currentIdx = options.findIndex((o) => o.value === value)
      setHighlightedIndex(currentIdx >= 0 ? currentIdx : 0)
    }
    setIsOpen((prev) => !prev)
  }

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
        return
      }
      if (options.length === 0) return
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setHighlightedIndex((prev) => (prev + 1) % options.length)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length)
      } else if (event.key === 'Enter' && highlightedIndex >= 0) {
        const target = options[highlightedIndex]
        if (target && !target.disabled) {
          event.preventDefault()
          onChange(target.value)
          setIsOpen(false)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, options, highlightedIndex, onChange])

  const heightClass =
    size === 'xs'
      ? 'h-7 px-2 text-[11px]'
      : size === 'md'
        ? 'h-9 px-3 text-sm'
        : 'h-8 px-2.5 text-xs'

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        title={title}
        disabled={disabled}
        onClick={toggleOpen}
        className={`w-full flex items-center justify-between gap-2 bg-white border rounded-lg text-slate-800 shadow-2xs transition-all duration-150 cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${heightClass} ${
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
          className={`absolute min-w-full w-max max-w-[300px] bg-white rounded-xl border border-slate-200/90 shadow-xl p-1 z-50 max-h-60 overflow-y-auto animate-in fade-in duration-100 ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400 text-center">Không có lựa chọn</div>
          ) : (
            options.map((opt, idx) => {
              const isSelected = opt.value === value
              const isHighlighted = idx === highlightedIndex
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => {
                    if (opt.disabled) return
                    onChange(opt.value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    isSelected
                      ? 'bg-indigo-50/90 text-indigo-700 font-semibold'
                      : isHighlighted
                        ? 'bg-slate-100/90 text-slate-900 font-medium'
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
