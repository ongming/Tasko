import React from 'react'
import { Bookmark, Bug, CheckSquare, Package, Shield } from 'lucide-react'

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
  const isBookmark = iconHint.includes('bookmark') || nameHint.includes('story')
  const isShield = iconHint.includes('shield')

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
    if (isBookmark) {
      return (
        <span
          title="Story"
          className="p-1 rounded-md bg-emerald-50 text-emerald-600 shrink-0 border border-emerald-100"
        >
          <Bookmark className={sizeClass} />
        </span>
      )
    }
    if (isShield) {
      return (
        <span
          title="Bảo mật / Cải tiến"
          className="p-1 rounded-md bg-amber-50 text-amber-600 shrink-0 border border-amber-100"
        >
          <Shield className={sizeClass} />
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
  if (isBookmark) return <Bookmark className={`${sizeClass} text-emerald-600 shrink-0`} />
  if (isShield) return <Shield className={`${sizeClass} text-amber-600 shrink-0`} />
  return <CheckSquare className={`${sizeClass} text-blue-600 shrink-0`} />
}

export default WorkTypeIcon
