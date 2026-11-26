import React from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import {
  Plus,
  ChevronDown,
  Eye,
  Loader2,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Info,
  X,
} from 'lucide-react'
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import { sprintService } from '@/services/sprintService'
import { CompleteSprintModal } from '@/components/project/CompleteSprintModal'
import { TaskDetailDrawer } from '@/components/project/TaskDetailDrawer'
import { TaskFilterBar } from '@/components/project/TaskFilterBar'
import { CreateTaskModal } from '@/components/project/CreateTaskModal'
import { WorkTypeIcon } from '@/components/project/WorkTypeIcon'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { KanbanCard } from '@/components/kanban/KanbanCard'
import { KanbanColumn } from '@/components/kanban/KanbanColumn'
import { useKanbanBoard, type BoardColumn } from '@/hooks/useKanbanBoard'
import { calculateNewPosition } from '@/utils/dragPosition'

export { calculateNewPosition }
export type { BoardColumn }

export function KanbanBoardView() {
  const { workspaceSlug, projectKey } = useParams<{ workspaceSlug?: string; projectKey?: string }>()
  const [searchParams] = useSearchParams()
  const projectParam = projectKey || searchParams.get('project') || searchParams.get('projectId') || ''

  const {
    columns,
    displayedColumns,
    allTasks,
    filteredTasks,
    members,
    workTypes,
    labels,
    modules,
    filters,
    setFilters,
    isScrum,
    isStrictScrum,
    isViewingCompletedSprint,
    canMutateBoard,
    startedSprints,
    currentSprint,
    plannedSprints,
    setSelectedSprintId,
    isLoading,
    errorMessage,
    setErrorMessage,
    warningMessage,
    setWarningMessage,
    quickAddColumnId,
    setQuickAddColumnId,
    quickTaskTitle,
    setQuickTaskTitle,
    isSubmittingQuickAdd,
    handleQuickAddTask,
    isCreateModalOpen,
    setIsCreateModalOpen,
    createTaskInitialStatusId,
    setCreateTaskInitialStatusId,
    isCompleteModalOpen,
    setIsCompleteModalOpen,
    selectedTaskId,
    setSelectedTaskId,
    loadInitialData,
    loadTasksForBoard,
    dragDrop,
  } = useKanbanBoard(projectParam)

  const renderWorkTypeIcon = (typeName?: string | null) => (
    <WorkTypeIcon typeName={typeName} />
  )

  const totalTasksCount = allTasks.length
  const backlogLink =
    workspaceSlug && projectKey
      ? `/${workspaceSlug}/${projectKey}/backlog`
      : `/workspace/backlog?project=${projectParam}`

  const sprintRemainingDays =
    currentSprint?.status === 'ACTIVE' && currentSprint.endDate
      ? Math.ceil(
          (new Date(currentSprint.endDate).setHours(23, 59, 59, 999) - Date.now()) /
            (1000 * 60 * 60 * 24),
        )
      : null

  return (
    <div className="flex flex-col gap-4 w-full flex-1">
      {/* Thông báo lỗi / Rollback Banner khi vi phạm ràng buộc */}
      {errorMessage && (
        <div className="flex items-center justify-between gap-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium shadow-2xs animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-100/60 transition-colors cursor-pointer"
            aria-label="Đóng cảnh báo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Cảnh báo khi kéo ngược trạng thái ngoài luồng quy trình */}
      {warningMessage && (
        <div className="flex items-center justify-between gap-3 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-medium shadow-2xs animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="truncate">{warningMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setWarningMessage(null)}
            className="p-1 rounded text-amber-500 hover:text-amber-700 hover:bg-amber-100/60 transition-colors cursor-pointer"
            aria-label="Đóng cảnh báo kéo ngược"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Header Toolbar Tinh gọn */}
      <div className="flex items-center justify-between flex-wrap gap-3 py-1">
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {filteredTasks.length === totalTasksCount
                ? `${totalTasksCount} công việc trên bảng`
                : `${filteredTasks.length} / ${totalTasksCount} công việc (đã lọc)`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {canMutateBoard && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setCreateTaskInitialStatusId(columns[0]?.id)
                setIsCreateModalOpen(true)
              }}
            >
              <span>Tạo công việc</span>
            </Button>
          )}

          {isScrum && (
            <div className="flex items-center gap-2.5 flex-wrap">
              {startedSprints.length > 0 ? (
                <>
                  <Select
                    value={currentSprint?.id || ''}
                    onChange={setSelectedSprintId}
                    className="min-w-[190px]"
                    buttonClassName="font-semibold"
                    options={startedSprints.map((s) => ({
                      value: s.id,
                      label: s.name,
                      dotColor: s.status === 'ACTIVE' ? 'bg-indigo-600' : 'bg-emerald-500',
                      badge: s.status === 'ACTIVE' ? 'Đang diễn ra' : 'Đã xong',
                    }))}
                  />

                  {sprintRemainingDays !== null && (
                    <span
                      className={`inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[11px] font-semibold border ${
                        sprintRemainingDays < 0
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : sprintRemainingDays <= 2
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200/80'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>
                        {sprintRemainingDays < 0
                          ? `Quá hạn ${Math.abs(sprintRemainingDays)} ngày`
                          : sprintRemainingDays === 0
                            ? 'Hết hạn hôm nay'
                            : `Còn ${sprintRemainingDays} ngày`}
                      </span>
                    </span>
                  )}

                  {currentSprint?.status === 'ACTIVE' && (
                    <Button
                      variant="success"
                      size="sm"
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      onClick={() => setIsCompleteModalOpen(true)}
                    >
                      <span>Hoàn thành Sprint</span>
                    </Button>
                  )}
                </>
              ) : (
                <Link
                  to={backlogLink}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/80 text-indigo-700 text-xs font-semibold shadow-2xs transition-all"
                >
                  <Play className="w-3 h-3 fill-indigo-700" />
                  <span>Bắt đầu Sprint tại Backlog</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Thanh lọc công việc */}
      <TaskFilterBar
        filters={filters}
        onFilterChange={setFilters}
        members={members}
        workTypes={workTypes}
        labels={labels}
        modules={modules}
        totalCount={totalTasksCount}
        filteredCount={filteredTasks.length}
      />

      {isLoading && (
        <div className="py-16 flex flex-col items-center justify-center gap-2.5 text-slate-500 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span className="font-medium">Đang tải bảng công việc...</span>
        </div>
      )}

      {isViewingCompletedSprint && (
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
          <Info className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            Bạn đang xem lại Sprint đã hoàn thành <strong>{currentSprint?.name}</strong> (chế độ chỉ đọc).
          </span>
        </div>
      )}

      {/* 3. Kanban Board Canvas hoặc Empty State cho Scrum chưa có Sprint */}
      {!isLoading && isStrictScrum && startedSprints.length === 0 ? (
        <div className="py-16 px-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center justify-center text-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Play className="w-5 h-5" />
          </div>
          <div className="max-w-md">
            <h3 className="text-sm font-bold text-slate-900">Chưa có Sprint nào đang chạy</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Trong Scrum, bảng thực thi chỉ hiển thị công việc của Sprint đang hoạt động. Hãy vào Backlog để tạo hoặc bắt đầu Sprint đầu tiên.
            </p>
          </div>
          <Link
            to={backlogLink}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Đi tới Backlog để bắt đầu Sprint</span>
          </Link>
        </div>
      ) : (
        !isLoading && (
          <DndContext
            sensors={canMutateBoard ? dragDrop.sensors : undefined}
            collisionDetection={closestCorners}
            onDragStart={canMutateBoard ? dragDrop.handleDragStart : undefined}
            onDragOver={canMutateBoard ? dragDrop.handleDragOver : undefined}
            onDragEnd={canMutateBoard ? dragDrop.handleDragEnd : undefined}
            onDragCancel={canMutateBoard ? dragDrop.handleDragCancel : undefined}
          >
            <div className="flex-1 flex gap-3.5 overflow-x-auto pb-4 items-start select-none">
              {displayedColumns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  isDraggingActive={dragDrop.isDragging}
                  quickAddColumnId={quickAddColumnId}
                  quickTaskTitle={quickTaskTitle}
                  setQuickTaskTitle={setQuickTaskTitle}
                  setQuickAddColumnId={setQuickAddColumnId}
                  handleQuickAddTask={handleQuickAddTask}
                  isSubmittingQuickAdd={isSubmittingQuickAdd}
                  onCardClick={(taskId) => {
                    if (!dragDrop.shouldIgnoreClick()) setSelectedTaskId(taskId)
                  }}
                  onOpenCreateModalWithStatus={(statusId) => {
                    setCreateTaskInitialStatusId(statusId)
                    setIsCreateModalOpen(true)
                  }}
                  renderWorkTypeIcon={renderWorkTypeIcon}
                  readOnly={!canMutateBoard}
                />
              ))}
            </div>

            <DragOverlay>
              {dragDrop.activeItem ? (
                <KanbanCard
                  task={dragDrop.activeItem}
                  isOverlay
                  renderWorkTypeIcon={renderWorkTypeIcon}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )
      )}

      {/* Modal Hoàn thành Sprint */}
      {isCompleteModalOpen && currentSprint && (
        <CompleteSprintModal
          isOpen={isCompleteModalOpen}
          onClose={() => setIsCompleteModalOpen(false)}
          sprint={currentSprint}
          plannedSprints={plannedSprints}
          onComplete={async (targetSprintId) => {
            await sprintService.completeSprint(projectParam, currentSprint.id, {
              targetSprintId: targetSprintId || undefined,
            })
            setIsCompleteModalOpen(false)
            await loadInitialData()
          }}
        />
      )}

      {/* Task Detail Drawer */}
      {selectedTaskId && (
        <TaskDetailDrawer
          isOpen={Boolean(selectedTaskId)}
          onClose={() => setSelectedTaskId(null)}
          projectIdOrKey={projectParam}
          taskId={selectedTaskId}
          onTaskUpdated={loadTasksForBoard}
          onTaskDeleted={loadTasksForBoard}
        />
      )}

      {/* Create Task Modal */}
      {projectParam && (
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          projectIdOrKey={projectParam}
          initialSprintId={isScrum && currentSprint ? currentSprint.id : null}
          initialStatusId={createTaskInitialStatusId}
          onTaskCreated={() => {
            setIsCreateModalOpen(false)
            loadTasksForBoard()
          }}
        />
      )}
    </div>
  )
}

export default KanbanBoardView
