import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { Select } from '@/components/ui/Select'
import type { TaskItem } from '@/types/task'
import type { Sprint } from '@/types/sprint'

export interface BacklogIssueRowProps {
  issue: TaskItem
  sprints: Sprint[]
  isEditingPoints: boolean
  tempPoints: string
  setTempPoints: (val: string) => void
  onStartEditPoints: (issue: TaskItem) => void
  onSavePoints: (taskId: string) => void
  onCancelEditPoints: () => void
  onMoveSprintDropdown: (taskId: string, targetSprintId: string | null) => void
  onClickRow: (taskId: string) => void
  renderIssueIcon: (type?: { name: string; icon: string } | null) => React.ReactNode
  isOverlay?: boolean
}

export const BacklogIssueRow: React.FC<BacklogIssueRowProps> = ({
  issue,
  sprints,
  isEditingPoints,
  tempPoints,
  setTempPoints,
  onStartEditPoints,
  onSavePoints,
  onCancelEditPoints,
  onMoveSprintDropdown,
  onClickRow,
  renderIssueIcon,
  isOverlay = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: issue.id,
    data: {
      type: 'Task',
      issue,
    },
    disabled: isOverlay || isEditingPoints,
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  if (isOverlay) {
    return (
      <div className="px-3.5 py-2.5 flex items-center justify-between bg-white rounded-lg border-2 border-indigo-500 shadow-xl select-none cursor-grabbing">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-4">
          <GripVertical className="w-3.5 h-3.5 text-indigo-500 shrink-0 -ml-1" />
          {renderIssueIcon(issue.type)}
          <span className="font-mono text-xs font-bold text-indigo-600 shrink-0 w-20">
            {issue.taskKey}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
            {issue.title}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
            {issue.status?.name || 'Cần làm'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClickRow(issue.id)}
      className={`px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50/90 transition-colors group cursor-pointer border-b border-slate-100 last:border-b-0 select-none ${
        isDragging ? 'opacity-30 bg-indigo-50/30 border-dashed border-indigo-300' : ''
      }`}
    >
      {/* Vùng bên trái: Grip + Icon + Key + Tiêu đề */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-4">
        <GripVertical className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -ml-1 cursor-grab active:cursor-grabbing" />
        {renderIssueIcon(issue.type)}
        <span className="font-mono text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition-colors shrink-0 w-20">
          {issue.taskKey}
        </span>
        <span className="text-xs sm:text-sm font-medium text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
          {issue.title}
        </span>
        {issue.subtasks && issue.subtasks.length > 0 && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0">
            {issue.subtasks.length} subtasks
          </span>
        )}
      </div>

      {/* Vùng bên phải: Quick Move + Trạng thái + Points + Avatar */}
      <div
        className="flex items-center gap-2 sm:gap-3 shrink-0"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Quick move dropdown pill */}
        <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <Select
            size="xs"
            align="right"
            value={issue.sprintId || 'backlog'}
            onChange={(val) => onMoveSprintDropdown(issue.id, val === 'backlog' ? null : val)}
            title="Chuyển công việc sang Sprint khác hoặc Backlog"
            ariaLabel="Chuyển công việc sang Sprint khác hoặc Backlog"
            className="min-w-[125px]"
            options={[
              { value: 'backlog', label: 'Về Backlog', dotColor: 'bg-slate-400' },
              ...sprints
                .filter((s) => s.status !== 'COMPLETED')
                .map((s) => ({
                  value: s.id,
                  label: s.name,
                  dotColor: s.status === 'ACTIVE' ? 'bg-indigo-600' : 'bg-amber-400',
                })),
            ]}
          />
        </div>

        {/* Status badge */}
        <div className="w-24 text-center">
          <span
            className={`inline-block w-full px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight truncate border ${
              issue.status?.category === 'DONE'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                : issue.status?.category === 'IN_PROGRESS'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                  : 'bg-slate-100 text-slate-600 border-slate-200/80'
            }`}
          >
            {issue.status?.name || 'Cần làm'}
          </span>
        </div>

        {/* Story Points inline edit */}
        {isEditingPoints ? (
          <input
            type="number"
            min={0}
            max={99}
            autoFocus
            value={tempPoints}
            onChange={(e) => setTempPoints(e.target.value)}
            onBlur={() => onSavePoints(issue.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSavePoints(issue.id)
              if (e.key === 'Escape') onCancelEditPoints()
            }}
            className="w-7 h-6 text-center text-xs font-bold font-mono border-2 border-indigo-500 rounded-md bg-white text-indigo-700 focus:outline-none shadow-2xs"
          />
        ) : (
          <button
            type="button"
            onClick={() => onStartEditPoints(issue)}
            title="Nhấn để sửa điểm Story Points"
            className="w-7 h-6 rounded-md bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200/60 text-xs font-bold flex items-center justify-center font-mono transition-colors cursor-pointer shadow-2xs"
          >
            {issue.storyPoints !== null && issue.storyPoints !== undefined ? issue.storyPoints : '-'}
          </button>
        )}

        {/* Avatar Assignee */}
        <div
          className="w-6 h-6 rounded-full bg-slate-700 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-2xs shrink-0"
          title={issue.assignee?.name || 'Chưa gán người làm'}
        >
          {issue.assignee?.name ? issue.assignee.name.charAt(0).toUpperCase() : '?'}
        </div>
      </div>
    </div>
  )
}

export default BacklogIssueRow
