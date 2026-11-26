import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { TaskItem } from '@/types/task'

export interface KanbanCardProps {
  task: TaskItem
  onClick?: () => void
  isOverlay?: boolean
  renderWorkTypeIcon?: (typeName?: string | null) => React.ReactNode
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  task,
  onClick,
  isOverlay = false,
  renderWorkTypeIcon,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
    disabled: isOverlay,
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  // Giao diện Thẻ bóng bay theo chuột khi đang kéo (DragOverlay)
  if (isOverlay) {
    return (
      <div className="bg-white p-3 rounded-lg border-2 border-indigo-500 shadow-2xl rotate-2 select-none w-[260px] cursor-grabbing flex flex-col gap-2">
        <div className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug">
          {task.title}
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 min-w-0">
            {renderWorkTypeIcon?.(task.type?.name)}
            <span className="font-mono text-[10px] text-slate-500 font-semibold truncate">
              {task.taskKey}
            </span>
          </div>
          {task.storyPoints !== null && task.storyPoints !== undefined && (
            <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 font-bold text-[9px] flex items-center justify-center">
              {task.storyPoints}
            </span>
          )}
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
      onClick={onClick}
      className={`group bg-white p-3 rounded-lg border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing flex flex-col gap-2 select-none ${
        isDragging
          ? 'opacity-30 border-dashed border-indigo-400 bg-indigo-50/20'
          : ''
      }`}
    >
      {/* Title */}
      <div className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
        {task.title}
      </div>

      {/* Module badge */}
      {task.module && (
        <div className="mt-1.5">
          <span
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/80 max-w-full truncate"
            title={`Module: ${task.module.taskKey} · ${task.module.title}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
            <span className="truncate">{task.module.title}</span>
          </span>
        </div>
      )}

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 mt-2">
          {task.labels.slice(0, 3).map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium border border-slate-200/80 max-w-[110px] truncate"
              style={{
                backgroundColor: `${label.color}15`,
                color: label.color,
              }}
              title={label.name}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: label.color }}
              />
              <span className="truncate">{label.name}</span>
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="text-[10px] font-medium text-slate-500 px-1 py-0.5 rounded bg-slate-100">
              +{task.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer: Key, WorkType icon, Story Points, Assignee */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 min-w-0">
          {renderWorkTypeIcon?.(task.type?.name)}
          <span className="font-mono text-[10px] text-slate-500 font-semibold truncate">
            {task.taskKey}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {task.storyPoints !== null && task.storyPoints !== undefined && (
            <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 font-bold text-[9px] flex items-center justify-center">
              {task.storyPoints}
            </span>
          )}

          {task.assignee ? (
            task.assignee.avatarUrl ? (
              <img
                src={task.assignee.avatarUrl}
                alt={task.assignee.name || ''}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                {task.assignee.name ? task.assignee.name.slice(0, 1).toUpperCase() : 'U'}
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default KanbanCard
