import React from 'react'
import { Bug, CheckSquare, Package } from 'lucide-react'

export interface WorkTypeIconProps {
  type?: { name?: string | null; icon?: string | null } | null
  typeName?: string | null
  sizeClass?: string
  variant?: 'icon' | 'badge'
}

/**
 * Hiển thị icon loại công việc (Module, Bug, Task) dùng chung cho Kanban, Backlog, List, Calendar, Timeline.
 */
export const WorkTypeIcon: React.FC<WorkTypeIconProps> = ({
  type,
  typeName,
  sizeClass = 'w-3.5 h-3.5',
  variant = 'icon',
}) => {
  const iconHint = type?.icon?.toLowerCase() || ''
  const nameHint = (type?.name || typeName || '').toLowerCase()

  const isModule = iconHint.includes('package') || nameHint.includes('module')
  const isBug = iconHint.includes('bug') || nameHint.includes('bug')

  if (variant === 'badge') {
    if (isModule) {
      return (
        <span
          title="Module chức năng"
          className="p-1 rounded-md bg-purple-50 text-purple-600 shrink-0 border border-purple-100"
        >
          <Package className={sizeClass} />
        </span>
      )
    }
    if (isBug) {
      return (
        <span
          title="Lỗi (Bug)"
          className="p-1 rounded-md bg-rose-50 text-rose-600 shrink-0 border border-rose-100"
        >
          <Bug className={sizeClass} />
        </span>
      )
    }
    return (
      <span
        title="Công việc (Task)"
        className="p-1 rounded-md bg-blue-50 text-blue-600 shrink-0 border border-blue-100"
      >
        <CheckSquare className={sizeClass} />
      </span>
    )
  }

  if (isModule) return <Package className={`${sizeClass} text-purple-600 shrink-0`} />
  if (isBug) return <Bug className={`${sizeClass} text-rose-600 shrink-0`} />
  return <CheckSquare className={`${sizeClass} text-blue-600 shrink-0`} />
}

export default WorkTypeIcon
