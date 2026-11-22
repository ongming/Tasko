import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { KanbanCard } from './KanbanCard'
import type { BoardColumn } from '@/pages/project/KanbanBoardView'

export interface KanbanColumnProps {
  column: BoardColumn
  isDraggingActive: boolean
  quickAddColumnId: string | null
  quickTaskTitle: string
  setQuickTaskTitle: (val: string) => void
  setQuickAddColumnId: (colId: string | null) => void
  handleQuickAddTask: (columnId: string) => void
  isSubmittingQuickAdd: boolean
  onCardClick: (taskId: string) => void
  onOpenCreateModalWithStatus: (statusId: string) => void
  renderWorkTypeIcon?: (typeName?: string | null) => React.ReactNode
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  isDraggingActive,
  quickAddColumnId,
  quickTaskTitle,
  setQuickTaskTitle,
  setQuickAddColumnId,
  handleQuickAddTask,
  isSubmittingQuickAdd,
  onCardClick,
  onOpenCreateModalWithStatus,
  renderWorkTypeIcon,
}) => {
  // Đăng ký toàn bộ cột làm vùng nhận thả Droppable
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  })

  const columnPoints = column.tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0)
  const hasWipLimit = column.wipLimit !== null && column.wipLimit !== undefined && column.wipLimit > 0
  const isOverLimit = hasWipLimit && column.tasks.length >= column.wipLimit!

  return (
    <div
      ref={setNodeRef}
      className={`w-[280px] min-w-[280px] shrink-0 p-2.5 rounded-xl transition-all flex flex-col gap-2 h-fit self-start ${
        isOver
          ? 'bg-indigo-50/50 border-2 border-indigo-400 ring-2 ring-indigo-100 shadow-sm'
          : isOverLimit
          ? 'bg-slate-100/70 border border-rose-200/90 shadow-2xs'
          : `${column.wrapperClass}`
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-1.5 pt-0.5 pb-0.5 select-none">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`w-2 h-2 rounded-full ${column.colorBadge} shrink-0`} />
          <span className="text-[12px] font-bold text-slate-700 capitalize truncate">
            {column.title.toLowerCase()}
          </span>

          {/* Huy hiệu số lượng thẻ & WIP Limit */}
          <span
            title={hasWipLimit ? `Giới hạn WIP: ${column.wipLimit}` : undefined}
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold transition-all ${
              isOverLimit
                ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-200'
                : column.countBadgeClass
            }`}
          >
            {hasWipLimit ? `${column.tasks.length} / ${column.wipLimit}` : column.tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {columnPoints > 0 && (
            <span className="px-1.5 py-0.2 bg-slate-200/80 rounded text-[10px] font-semibold text-slate-600">
              {columnPoints} pts
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              setQuickAddColumnId(column.id)
              setQuickTaskTitle('')
            }}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Thêm nhanh công việc"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task Cards Sortable Container */}
      <SortableContext
        items={column.tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 min-h-[50px]">
          {column.tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              renderWorkTypeIcon={renderWorkTypeIcon}
              onClick={() => onCardClick(task.id)}
            />
          ))}

          {/* Khi cột đang trống và có thẻ đang lướt qua */}
          {column.tasks.length === 0 && (
            <div
              className={`h-14 rounded-lg border-2 border-dashed flex items-center justify-center text-[11px] font-medium transition-all select-none ${
                isOver
                  ? 'border-indigo-400 bg-indigo-50/60 text-indigo-700'
                  : 'border-slate-200/80 text-slate-400 bg-slate-50/50'
              }`}
            >
              {isOver ? 'Thả vào đây' : 'Chưa có công việc'}
            </div>
          )}
        </div>
      </SortableContext>

      {/* Dưới cùng cột: Nút [ + ] hoặc Form nhập thẻ nhanh */}
      {quickAddColumnId === column.id ? (
        <div className="p-2.5 bg-white rounded-lg border border-indigo-200 shadow-xs flex flex-col gap-2 mt-1 animate-in fade-in duration-100">
          <textarea
            autoFocus
            rows={2}
            placeholder="Nhập tiêu đề công việc..."
            value={quickTaskTitle}
            onChange={(e) => setQuickTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleQuickAddTask(column.id)
              }
              if (e.key === 'Escape') {
                e.preventDefault()
                setQuickAddColumnId(null)
              }
            }}
            className="text-xs w-full p-2 border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setQuickAddColumnId(null)
                onOpenCreateModalWithStatus(column.id)
              }}
              className="text-[11px] text-slate-500 hover:text-indigo-600 hover:underline transition-colors cursor-pointer"
            >
              Mở rộng chi tiết...
            </button>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={isSubmittingQuickAdd}
                onClick={() => setQuickAddColumnId(null)}
                className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSubmittingQuickAdd || !quickTaskTitle.trim()}
                onClick={() => handleQuickAddTask(column.id)}
                className="px-3 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-2xs transition-colors cursor-pointer"
              >
                {isSubmittingQuickAdd ? 'Đang tạo...' : 'Thêm thẻ'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setQuickAddColumnId(column.id)
            setQuickTaskTitle('')
          }}
          aria-label={`Thêm công việc vào cột ${column.title}`}
          className="w-full h-8 mt-1 flex items-center justify-center rounded-lg bg-slate-200/50 hover:bg-slate-200/80 text-slate-500 hover:text-slate-700 border border-slate-200/60 transition-colors cursor-pointer select-none"
          title="Thêm thẻ mới vào cột này"
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default KanbanColumn
