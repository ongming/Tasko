import React from 'react'
import { useOverview } from '../../hooks/useOverview'
import {
  OverviewHeader,
  ExecutiveStatsRibbon,
  MyTasksTracker,
  ActiveProjectsGrid,
  WeeklyVelocityChart,
  TeamPresenceWidget,
  ActivityTimelineStream,
  QuickCreateTaskModal,
  NoWorkspaceEmptyState,
} from '../../components/overview'
import CreateWorkspaceModal from '@/components/workspace/CreateWorkspaceModal'

export function OverviewPage() {
  const {
    stats,
    projects,
    velocity,
    teamMembers,
    activities,
    activeTab,
    tabCounts,
    filteredTasks,
    isCreateModalOpen,
    isWorkspaceModalOpen,
    currentWorkspace,
    isLoadingWorkspaces,
    setActiveTab,
    handleToggleTask,
    handleCreateTask,
    handleCreateWorkspace,
    openCreateModal,
    closeCreateModal,
    openWorkspaceModal,
    closeWorkspaceModal,
  } = useOverview()

  if (isLoadingWorkspaces) {
    return (
      <div className="w-full min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] flex flex-col max-w-[1600px] mx-auto p-4 sm:p-6 pb-12">
      {/* Khi chưa có workspace nào: Hiển thị trang trống ở giữa hướng dẫn tạo Workspace */}
      {!currentWorkspace ? (
        <NoWorkspaceEmptyState onOpenCreateWorkspace={openWorkspaceModal} />
      ) : (
        <>
          {/* 1. Header & Quick Actions */}
          <OverviewHeader onOpenCreateTask={openCreateModal} />

          {/* 2. 4 Executive Stats KPI Ribbon */}
          <ExecutiveStatsRibbon stats={stats} />

          {/* 3. Main Dashboard 12-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6">
            {/* Left Column (7/12) */}
            <section aria-label="Nhiệm vụ và dự án" className="lg:col-span-7 flex flex-col gap-6">
              <MyTasksTracker
                tasks={filteredTasks}
                activeTab={activeTab}
                tabCounts={tabCounts}
                onTabChange={setActiveTab}
                onToggleTask={handleToggleTask}
              />
              <ActiveProjectsGrid projects={projects} />
            </section>

            {/* Right Column (5/12) */}
            <section aria-label="Năng suất và thành viên" className="lg:col-span-5 flex flex-col gap-6">
              <WeeklyVelocityChart velocity={velocity} />
              <TeamPresenceWidget members={teamMembers} />
              <ActivityTimelineStream activities={activities} />
            </section>
          </div>
        </>
      )}

      {/* Modal tạo công việc nhanh */}
      <QuickCreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSubmit={handleCreateTask}
      />

      {/* Modal tạo không gian làm việc mới */}
      <CreateWorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={closeWorkspaceModal}
        onSubmit={handleCreateWorkspace}
      />
    </div>
  )
}

export default OverviewPage
