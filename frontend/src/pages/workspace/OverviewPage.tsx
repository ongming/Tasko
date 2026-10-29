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
} from '../../components/overview'

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
    setActiveTab,
    handleToggleTask,
    handleCreateTask,
    openCreateModal,
    closeCreateModal,
  } = useOverview()

  return (
    <div className="w-full flex flex-col gap-6 max-w-[1600px] mx-auto p-4 sm:p-6 pb-12">
      {/* 1. Header & Quick Actions */}
      <OverviewHeader onOpenCreateTask={openCreateModal} />

      {/* 2. 4 Executive Stats KPI Ribbon */}
      <ExecutiveStatsRibbon stats={stats} />

      {/* 3. Main Dashboard 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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

      {/* 4. Quick Task Modal */}
      <QuickCreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSubmit={handleCreateTask}
      />
    </div>
  )
}

export default OverviewPage
