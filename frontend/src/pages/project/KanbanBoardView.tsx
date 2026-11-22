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
  X,
} from 'lucide-react'
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import { sprintService } from '@/services/sprintService'
import { CompleteSprintModal } from '@/components/project/CompleteSprintModal'
import { TaskDetailDrawer } from '@/components/project/TaskDetailDrawer'
import { TaskFilterBar } from '@/components/project/TaskFilterBar'
import { CreateTaskModal } from '@/components/project/CreateTaskModal'
import { WorkTypeIcon } from '@/components/project/WorkTypeIcon'
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
    filters,
    setFilters,
    isScrum,
    startedSprints,
    currentSprint,
    plannedSprints,
    setSelectedSprintId,
    isLoading,
    errorMessage,
    setErrorMessage,
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

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setCreateTaskInitialStatusId(columns[0]?.id)
              setIsCreateModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo công việc</span>
          </button>

          {isScrum && (
            <div className="flex items-center gap-2.5">
              {startedSprints.length > 0 ? (
                <>
                  <div className="relative">
                    <select
                      value={currentSprint?.id || ''}
                      onChange={(e) => setSelectedSprintId(e.target.value)}
                      className="h-8 pl-2.5 pr-7 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 font-semibold text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer appearance-none shadow-2xs transition-all"
                    >
                      {startedSprints.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.status === 'ACTIVE'
                            ? `⚡ ${s.name} (Đang diễn ra)`
                            : `🏆 ${s.name} (Đã hoàn thành)`}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {currentSprint?.status === 'ACTIVE' && (
                    <button
                      type="button"
                      onClick={() => setIsCompleteModalOpen(true)}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Hoàn thành Sprint</span>
                    </button>
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
        totalCount={totalTasksCount}
        filteredCount={filteredTasks.length}
      />

      {isLoading && (
        <div className="py-16 flex flex-col items-center justify-center gap-2.5 text-slate-500 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span className="font-medium">Đang tải bảng công việc...</span>
        </div>
      )}

      {/* 3. Kanban Board Canvas */}
      {!isLoading && (
        <DndContext
          sensors={dragDrop.sensors}
          collisionDetection={closestCorners}
          onDragStart={dragDrop.handleDragStart}
          onDragOver={dragDrop.handleDragOver}
          onDragEnd={dragDrop.handleDragEnd}
          onDragCancel={dragDrop.handleDragCancel}
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
