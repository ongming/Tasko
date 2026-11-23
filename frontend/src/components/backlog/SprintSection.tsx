import React from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Pencil,
  Play,
  Plus,
  Trash2,
} from 'lucide-react'
import { BacklogDroppableContainer } from './BacklogDroppableContainer'
import type { Sprint } from '@/types/sprint'
import type { TaskItem } from '@/types/task'

export interface SprintSectionProps {
  sprint: Sprint
  sprintTasks: TaskItem[]
  isExpanded: boolean
  onToggleExpand: (sprintId: string) => void
  onStartSprint: (sprint: Sprint) => void
  onCompleteSprint: (sprint: Sprint) => void
  onDeleteSprint: (sprintId: string) => void
  onEditSprint?: (sprint: Sprint) => void
  hasActiveSprint?: boolean
  isAddingTask: boolean
  quickTitle: string
  onChangeQuickTitle: (sprintId: string, val: string) => void
  onOpenQuickAdd: (sprintId: string) => void
  onCloseQuickAdd: () => void
  onConfirmQuickCreate: (sprintId: string) => void
  renderIssueRow: (issue: TaskItem) => React.ReactNode
}

export const SprintSection: React.FC<SprintSectionProps> = ({
  sprint,
  sprintTasks,
  isExpanded,
  onToggleExpand,
  onStartSprint,
  onCompleteSprint,
  onDeleteSprint,
  onEditSprint,
  hasActiveSprint = false,
  isAddingTask,
  quickTitle,
  onChangeQuickTitle,
  onOpenQuickAdd,
  onCloseQuickAdd,
  onConfirmQuickCreate,
  renderIssueRow,
}) => {
  const isActive = sprint.status === 'ACTIVE'
  const isCompleted = sprint.status === 'COMPLETED'

  const todoPoints = sprintTasks
    .filter((t) => t.status?.category === 'TODO')
    .reduce((sum, t) => sum + (t.storyPoints || 0), 0)
  const inProgressPoints = sprintTasks
    .filter((t) => t.status?.category === 'IN_PROGRESS')
    .reduce((sum, t) => sum + (t.storyPoints || 0), 0)
  const donePoints = sprintTasks
    .filter((t) => t.status?.category === 'DONE')
    .reduce((sum, t) => sum + (t.storyPoints || 0), 0)

  return (
    <BacklogDroppableContainer id={sprint.id} isActiveSprint={isActive}>
      {/* Header Sprint */}
      <div
        className={`px-4 py-3 border-b flex items-center justify-between flex-wrap gap-3 transition-colors ${
          isActive ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50/80 border-slate-200/80'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onToggleExpand(sprint.id)}
            className="p-1 rounded-md hover:bg-slate-200/60 text-slate-500 transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-bold text-sm text-slate-900 tracking-tight">{sprint.name}</span>

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : isCompleted
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isActive ? '⚡ ĐANG CHẠY' : isCompleted ? '🏆 ĐÃ HOÀN THÀNH' : 'LÊN KẾ HOẠCH'}
            </span>

            {sprint.startDate && sprint.endDate && (
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date(sprint.startDate).toLocaleDateString('vi-VN')} -{' '}
                  {new Date(sprint.endDate).toLocaleDateString('vi-VN')}
                </span>
              </span>
            )}

            {sprint.goal && (
              <span
                className="text-[11px] text-slate-500 italic max-w-xs truncate hidden sm:inline"
                title={sprint.goal}
              >
                • &quot;{sprint.goal}&quot;
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 text-[10px] font-bold">
            <span title="Điểm cần làm (To Do)" className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
              {todoPoints}
            </span>
            <span title="Điểm đang làm (In Progress)" className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
              {inProgressPoints}
            </span>
            <span title="Điểm hoàn thành (Done)" className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
              {donePoints}
            </span>
            <span className="text-slate-400 text-[11px] font-medium ml-1">
              ({sprintTasks.length} việc)
            </span>
          </div>

          {!isActive && !isCompleted && (
            <button
              type="button"
              disabled={hasActiveSprint || sprintTasks.length === 0}
              onClick={() => onStartSprint(sprint)}
              title={
                hasActiveSprint
                  ? 'Đang có Sprint khác hoạt động. Hãy hoàn thành Sprint đó trước.'
                  : sprintTasks.length === 0
                    ? 'Cần ít nhất 1 công việc trong Sprint để bắt đầu.'
                    : 'Bắt đầu Sprint này'
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Bắt đầu Sprint</span>
            </button>
          )}

          {isActive && (
            <button
              type="button"
              onClick={() => onCompleteSprint(sprint)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Hoàn thành Sprint</span>
            </button>
          )}

          {!isCompleted && onEditSprint && (
            <button
              type="button"
              onClick={() => onEditSprint(sprint)}
              className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
              title="Chỉnh sửa Sprint"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}

          {!isCompleted && (
            <button
              type="button"
              onClick={() => onDeleteSprint(sprint.id)}
              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Xóa Sprint này"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Danh sách Task trong Sprint */}
      {isExpanded && (
        <div className="flex flex-col">
          <SortableContext
            items={sprintTasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {sprintTasks.length > 0 ? (
              sprintTasks.map(renderIssueRow)
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 italic">
                Kéo thả công việc từ kho Backlog hoặc tạo mới để lập kế hoạch cho Sprint này.
              </div>
            )}
          </SortableContext>

          {!isCompleted && (
            <div className="p-2 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              {isAddingTask ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Nhập tiêu đề công việc và nhấn Enter..."
                    value={quickTitle}
                    onChange={(e) => onChangeQuickTitle(sprint.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onConfirmQuickCreate(sprint.id)
                      if (e.key === 'Escape') onCloseQuickAdd()
                    }}
                    className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => onConfirmQuickCreate(sprint.id)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
                  >
                    Thêm
                  </button>
                  <button
                    type="button"
                    onClick={onCloseQuickAdd}
                    className="px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-200/60 rounded-lg"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenQuickAdd(sprint.id)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo công việc trong {sprint.name}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </BacklogDroppableContainer>
  )
}

export default SprintSection
