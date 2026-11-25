import React from 'react'
import {
  AlertTriangle,
  Bookmark,
  Box,
  Bug,
  CheckCircle2,
  CheckSquare,
  Flame,
  FolderKanban,
  Layers,
  LayoutGrid,
  ListTodo,
  Package,
  Shield,
  ShieldAlert,
} from 'lucide-react'

export const WORK_TYPE_ICON_OPTIONS: Array<{ key: string; label: string }> = [
  { key: 'Package', label: 'Module / Gói việc' },
  { key: 'Layers', label: 'Nhóm tính năng' },
  { key: 'Box', label: 'Khối chức năng' },
  { key: 'FolderKanban', label: 'Bảng công việc' },
  { key: 'LayoutGrid', label: 'Phân hệ' },
  { key: 'CheckSquare', label: 'Task chuẩn' },
  { key: 'ListTodo', label: 'Danh sách việc' },
  { key: 'CheckCircle2', label: 'Hoàn tất' },
  { key: 'Bookmark', label: 'Story' },
  { key: 'Bug', label: 'Lỗi (Bug)' },
  { key: 'AlertTriangle', label: 'Cảnh báo / Rủi ro' },
  { key: 'Flame', label: 'Khẩn cấp' },
  { key: 'ShieldAlert', label: 'Bảo mật' },
]

export const WORK_TYPE_COLOR_OPTIONS: Array<{
  name: string
  dotClass: string
  colorValue: string
  textClass: string
  badgeClass: string
}> = [
  {
    name: 'Xanh dương',
    dotClass: 'bg-blue-600',
    colorValue: 'bg-blue-100 text-blue-700 border-blue-200',
    textClass: 'text-blue-600',
    badgeClass: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    name: 'Tím',
    dotClass: 'bg-purple-600',
    colorValue: 'bg-purple-100 text-purple-700 border-purple-200',
    textClass: 'text-purple-600',
    badgeClass: 'bg-purple-50 text-purple-600 border-purple-100',
  },
  {
    name: 'Đỏ hồng',
    dotClass: 'bg-rose-600',
    colorValue: 'bg-rose-100 text-rose-700 border-rose-200',
    textClass: 'text-rose-600',
    badgeClass: 'bg-rose-50 text-rose-600 border-rose-100',
  },
  {
    name: 'Xanh lục',
    dotClass: 'bg-emerald-600',
    colorValue: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    textClass: 'text-emerald-600',
    badgeClass: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  {
    name: 'Hổ phách',
    dotClass: 'bg-amber-500',
    colorValue: 'bg-amber-100 text-amber-700 border-amber-200',
    textClass: 'text-amber-600',
    badgeClass: 'bg-amber-50 text-amber-600 border-amber-100',
  },
  {
    name: 'Đen xám',
    dotClass: 'bg-slate-800',
    colorValue: 'bg-slate-100 text-slate-800 border-slate-200',
    textClass: 'text-slate-800',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
  },
]

function resolveColorOption(colorStr?: string | null) {
  if (!colorStr) return null
  return (
    WORK_TYPE_COLOR_OPTIONS.find(
      (c) =>
        colorStr === c.colorValue ||
        colorStr.includes(c.textClass) ||
        colorStr.includes(c.dotClass.replace('bg-', 'text-')) ||
        (c.name === 'Xanh dương' && colorStr.includes('blue')) ||
        (c.name === 'Tím' && colorStr.includes('purple')) ||
        (c.name === 'Đỏ hồng' && colorStr.includes('rose')) ||
        (c.name === 'Xanh lục' && colorStr.includes('emerald')) ||
        (c.name === 'Hổ phách' && colorStr.includes('amber')) ||
        (c.name === 'Đen xám' && colorStr.includes('slate')),
    ) || null
  )
}

export function resolveWorkTypeKey(
  icon?: string | null,
  name?: string | null,
): string {
  const rawIcon = (icon || '').trim()
  const lowerIcon = rawIcon.toLowerCase()
  const lowerName = (name || '').toLowerCase()

  const exactMatch = WORK_TYPE_ICON_OPTIONS.find(
    (opt) => opt.key.toLowerCase() === lowerIcon,
  )
  if (exactMatch) return exactMatch.key
  if (lowerIcon === 'shield') return 'Shield'

  if (lowerName.includes('module')) return 'Package'
  if (lowerName.includes('bug')) return 'Bug'
  if (lowerName.includes('story')) return 'Bookmark'
  return 'CheckSquare'
}

export function resolveWorkTypeTextClass(
  iconKey: string,
  colorStr?: string | null,
): string {
  const matched = resolveColorOption(colorStr)
  if (matched) return matched.textClass

  if (['Package', 'Layers', 'Box', 'FolderKanban', 'LayoutGrid'].includes(iconKey)) {
    return 'text-purple-600'
  }
  if (['Bug', 'AlertTriangle', 'Flame', 'ShieldAlert'].includes(iconKey)) {
    return 'text-rose-600'
  }
  if (iconKey === 'Bookmark') return 'text-emerald-600'
  if (iconKey === 'Shield') return 'text-amber-600'
  return 'text-blue-600'
}

export function renderLucideWorkTypeIcon(iconKey: string, className: string) {
  switch (iconKey) {
    case 'Package':
      return <Package className={className} />
    case 'Layers':
      return <Layers className={className} />
    case 'Box':
      return <Box className={className} />
    case 'FolderKanban':
      return <FolderKanban className={className} />
    case 'LayoutGrid':
      return <LayoutGrid className={className} />
    case 'ListTodo':
      return <ListTodo className={className} />
    case 'CheckCircle2':
      return <CheckCircle2 className={className} />
    case 'Bookmark':
      return <Bookmark className={className} />
    case 'Bug':
      return <Bug className={className} />
    case 'AlertTriangle':
      return <AlertTriangle className={className} />
    case 'Flame':
      return <Flame className={className} />
    case 'ShieldAlert':
      return <ShieldAlert className={className} />
    case 'Shield':
      return <Shield className={className} />
    case 'CheckSquare':
    default:
      return <CheckSquare className={className} />
  }
}

export interface WorkTypeIconProps {
  type?: { name?: string | null; icon?: string | null; color?: string | null } | null
  typeName?: string | null
  sizeClass?: string
  variant?: 'icon' | 'badge'
}

/**
 * Hiển thị icon loại công việc dùng chung cho Kanban, Backlog, List, Calendar, Timeline và Cài đặt.
 */
export const WorkTypeIcon: React.FC<WorkTypeIconProps> = ({
  type,
  typeName,
  sizeClass = 'w-3.5 h-3.5',
  variant = 'icon',
}) => {
  const resolvedKey = resolveWorkTypeKey(type?.icon, type?.name || typeName)
  const colorOption = resolveColorOption(type?.color)
  const textClass = resolveWorkTypeTextClass(resolvedKey, type?.color)

  if (variant === 'badge') {
    const defaultBadge =
      textClass === 'text-purple-600'
        ? 'bg-purple-50 text-purple-600 border-purple-100'
        : textClass === 'text-rose-600'
          ? 'bg-rose-50 text-rose-600 border-rose-100'
          : textClass === 'text-emerald-600'
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
            : textClass === 'text-amber-600'
              ? 'bg-amber-50 text-amber-600 border-amber-100'
              : textClass === 'text-slate-800'
                ? 'bg-slate-100 text-slate-800 border-slate-200'
                : 'bg-blue-50 text-blue-600 border-blue-100'

    return (
      <span
        title={type?.name || typeName || 'Loại công việc'}
        className={`p-1.5 rounded-lg shrink-0 border inline-flex items-center justify-center ${
          colorOption?.badgeClass || defaultBadge
        }`}
      >
        {renderLucideWorkTypeIcon(resolvedKey, sizeClass)}
      </span>
    )
  }

  return renderLucideWorkTypeIcon(resolvedKey, `${sizeClass} ${textClass} shrink-0`)
}
