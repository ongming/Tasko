import React from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, ChevronDown, ChevronRight, Loader2, Inbox } from 'lucide-react'
import type { TaskItem } from '@/types/task'
import { StartSprintModal } from '@/components/project/StartSprintModal'
import { CompleteSprintModal } from '@/components/project/CompleteSprintModal'
import { TaskDetailDrawer } from '@/components/project/TaskDetailDrawer'
import { CreateTaskModal } from '@/components/project/CreateTaskModal'
import { TaskFilterBar } from '@/components/project/TaskFilterBar'
import { WorkTypeIcon } from '@/components/project/WorkTypeIcon'
import { BacklogIssueRow } from '@/components/backlog/BacklogIssueRow'
import { BacklogDroppableContainer } from '@/components/backlog/BacklogDroppableContainer'
import { SprintSection } from '@/components/backlog/SprintSection'
import { CreateSprintModal } from '@/components/backlog/CreateSprintModal'
import { useBacklogBoard } from '@/hooks/useBacklogBoard'

export function BacklogView() {
  const { projectKey } = useParams<{ projectKey?: string }>()
  const [searchParams] = useSearchParams()
  const projectParam = projectKey || searchParams.get('project') || searchParams.get('projectId') || ''

  const {
    sprints,
    tasks,
    members,
    workTypes,
    isLoading,
    filters,
    setFilters,
    filteredTasks,
    plannedSprints,
    backlogTasks,
    expandedSprints,
    setExpandedSprints,
    isBacklogExpanded,
    setIsBacklogExpanded,
    isCreateTaskModalOpen,
    setIsCreateTaskModalOpen,
    createTaskInitialSprintId,
    setCreateTaskInitialSprintId,
    isCreateSprintModalOpen,
    setIsCreateSprintModalOpen,
    newSprintName,
    setNewSprintName,
    newSprintGoal,
    setNewSprintGoal,
    newSprintStartDate,
    setNewSprintStartDate,
    newSprintEndDate,
    setNewSprintEndDate,
    selectedSprintToStart,
    setSelectedSprintToStart,
    selectedSprintToComplete,
    setSelectedSprintToComplete,
    selectedTaskId,
    setSelectedTaskId,
    quickTitleBySection,
    setQuickTitleBySection,
    isAddingTaskFor,
    setIsAddingTaskFor,
    editingPointsTaskId,
    setEditingPointsTaskId,
    tempPoints,
    setTempPoints,
    loadData,
    handleOpenCreateSprintModal,
    handleConfirmCreateSprint,
    handleDeleteSprint,
    handleStartSprint,
    handleCompleteSprint,
    handleMoveTask,
    handleQuickCreateTask,
    handleSavePoints,
    dragDrop,
  } = useBacklogBoard(projectParam)

  const renderIssueIcon = (type?: { name: string; icon: string } | null) => (
    <WorkTypeIcon type={type} variant="badge" />
  )

  const renderIssueRow = (issue: TaskItem) => (
    <BacklogIssueRow
      key={issue.id}
      issue={issue}
      sprints={sprints}
      isEditingPoints={editingPointsTaskId === issue.id}
      tempPoints={tempPoints}
      setTempPoints={setTempPoints}
      onStartEditPoints={(item) => {
        setEditingPointsTaskId(item.id)
        setTempPoints(
          item.storyPoints !== null && item.storyPoints !== undefined
            ? String(item.storyPoints)
            : '',
        )
      }}
      onSavePoints={handleSavePoints}
      onCancelEditPoints={() => setEditingPointsTaskId(null)}
      onMoveSprintDropdown={handleMoveTask}
      onClickRow={(taskId) => {
        if (!dragDrop.shouldIgnoreClick()) setSelectedTaskId(taskId)
      }}
      renderIssueIcon={renderIssueIcon}
    />
  )

  return (
    <div className="flex flex-col gap-4 w-full flex-1 pb-16">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col gap-3 pb-1 border-b border-slate-100">
        <div className="flex items-center justify-between flex-wrap gap-2.5">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Backlog & Kế hoạch Sprint
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân bổ công việc vào các chu kỳ Sprint hoặc lưu trữ trong kho Backlog dự án
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenCreateSprintModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo Sprint</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCreateTaskInitialSprintId(null)
                setIsCreateTaskModalOpen(true)
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo công việc</span>
            </button>
          </div>
        </div>

        <TaskFilterBar
          filters={filters}
          onFilterChange={setFilters}
          members={members}
          workTypes={workTypes}
          totalCount={tasks.length}
          filteredCount={filteredTasks.length}
        />
      </div>

      {isLoading && (
        <div className="py-16 flex flex-col items-center justify-center gap-2.5 text-slate-500 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span className="font-medium">Đang tải danh sách Sprint và kho Backlog...</span>
        </div>
      )}

      {/* 2. Danh sách các Sprint & Kho Backlog */}
      {!isLoading && (
        <DndContext
          sensors={dragDrop.sensors}
          collisionDetection={closestCorners}
          onDragStart={dragDrop.handleDragStart}
          onDragOver={dragDrop.handleDragOver}
          onDragEnd={dragDrop.handleDragEnd}
          onDragCancel={dragDrop.handleDragCancel}
        >
          <div className="flex flex-col gap-4">
            {sprints.map((sprint) => (
              <SprintSection
                key={sprint.id}
                sprint={sprint}
                sprintTasks={filteredTasks.filter((t) => t.sprintId === sprint.id)}
                isExpanded={expandedSprints[sprint.id] ?? true}
                onToggleExpand={(id) =>
                  setExpandedSprints((prev) => ({
                    ...prev,
                    [id]: !(prev[id] ?? true),
                  }))
                }
                onStartSprint={setSelectedSprintToStart}
                onCompleteSprint={setSelectedSprintToComplete}
                onDeleteSprint={handleDeleteSprint}
                isAddingTask={isAddingTaskFor === sprint.id}
                quickTitle={quickTitleBySection[sprint.id] || ''}
                onChangeQuickTitle={(id, val) =>
                  setQuickTitleBySection((prev) => ({ ...prev, [id]: val }))
                }
                onOpenQuickAdd={(id) => {
                  setIsAddingTaskFor(id)
                  setQuickTitleBySection((prev) => ({ ...prev, [id]: '' }))
                }}
                onCloseQuickAdd={() => setIsAddingTaskFor(null)}
                onConfirmQuickCreate={(id) => handleQuickCreateTask(id)}
                renderIssueRow={renderIssueRow}
              />
            ))}

            {/* 3. Khu vực Kho Backlog */}
            <BacklogDroppableContainer id="backlog">
              <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsBacklogExpanded(!isBacklogExpanded)}
                    className="p-1 rounded-md hover:bg-slate-200/60 text-slate-500 transition-colors cursor-pointer"
                  >
                    {isBacklogExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  <div className="flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-slate-600" />
                    <span className="font-bold text-sm text-slate-900 tracking-tight">
                      Kho Backlog
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {backlogTasks.length} công việc
                    </span>
                    <span className="text-[11px] text-slate-400">
                      (Tổng{' '}
                      {backlogTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0)}{' '}
                      Story Points)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCreateTaskInitialSprintId(null)
                      setIsCreateTaskModalOpen(true)
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm vào Backlog</span>
                  </button>
                </div>
              </div>

              {isBacklogExpanded && (
                <div className="flex flex-col">
                  <SortableContext
                    items={backlogTasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {backlogTasks.length > 0 ? (
                      backlogTasks.map(renderIssueRow)
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                        <Inbox className="w-6 h-6 text-slate-300" />
                        <span>Kho Backlog hiện đang trống.</span>
                      </div>
                    )}
                  </SortableContext>

                  <div className="p-2 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    {isAddingTaskFor === 'backlog' ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          autoFocus
                          placeholder="Nhập tiêu đề công việc cho Backlog và nhấn Enter..."
                          value={quickTitleBySection['backlog'] || ''}
                          onChange={(e) =>
                            setQuickTitleBySection((prev) => ({
                              ...prev,
                              backlog: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleQuickCreateTask(null)
                            if (e.key === 'Escape') setIsAddingTaskFor(null)
                          }}
                          className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuickCreateTask(null)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
                        >
                          Thêm
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingTaskFor(null)}
                          className="px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-200/60 rounded-lg"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingTaskFor('backlog')
                          setQuickTitleBySection((prev) => ({
                            ...prev,
                            backlog: '',
                          }))
                        }}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Tạo công việc trong Backlog</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </BacklogDroppableContainer>
          </div>

          <DragOverlay>
            {dragDrop.activeItem ? (
              <BacklogIssueRow
                issue={dragDrop.activeItem}
                sprints={sprints}
                isEditingPoints={false}
                tempPoints=""
                setTempPoints={() => {}}
                onStartEditPoints={() => {}}
                onSavePoints={() => {}}
                onCancelEditPoints={() => {}}
                onMoveSprintDropdown={() => {}}
                onClickRow={() => {}}
                renderIssueIcon={renderIssueIcon}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Modals & Drawer */}
      <CreateSprintModal
        isOpen={isCreateSprintModalOpen}
        onClose={() => setIsCreateSprintModalOpen(false)}
        name={newSprintName}
        setName={setNewSprintName}
        goal={newSprintGoal}
        setGoal={setNewSprintGoal}
        startDate={newSprintStartDate}
        setStartDate={setNewSprintStartDate}
        endDate={newSprintEndDate}
        setEndDate={setNewSprintEndDate}
        onSubmit={handleConfirmCreateSprint}
      />

      <StartSprintModal
        isOpen={Boolean(selectedSprintToStart)}
        onClose={() => setSelectedSprintToStart(null)}
        sprint={selectedSprintToStart}
        onStart={handleStartSprint}
      />

      <CompleteSprintModal
        isOpen={Boolean(selectedSprintToComplete)}
        onClose={() => setSelectedSprintToComplete(null)}
        sprint={selectedSprintToComplete}
        plannedSprints={plannedSprints}
        onComplete={handleCompleteSprint}
      />

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        projectIdOrKey={projectParam}
        initialSprintId={createTaskInitialSprintId}
        onTaskCreated={() => {
          setIsCreateTaskModalOpen(false)
          loadData()
        }}
      />

      {selectedTaskId && (
        <TaskDetailDrawer
          isOpen={Boolean(selectedTaskId)}
          onClose={() => setSelectedTaskId(null)}
          projectIdOrKey={projectParam}
          taskId={selectedTaskId}
          onTaskUpdated={loadData}
          onTaskDeleted={loadData}
        />
      )}
    </div>
  )
}

export default BacklogView
