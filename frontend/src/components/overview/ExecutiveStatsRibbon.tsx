import React from 'react'
import { Folder, CheckSquare, Flame, Users, TrendingUp, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import type { OverviewStats } from '../../types/overview'

interface ExecutiveStatsRibbonProps {
  stats: OverviewStats
}

export const ExecutiveStatsRibbon: React.FC<ExecutiveStatsRibbonProps> = ({ stats }) => {
  const { user } = useAuthStore()

  const userInitials = user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : 'U'

  return (
    <section aria-label="Chỉ số điều hành" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Dự án đang kích hoạt */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-600 font-medium">
              Dự án đang kích hoạt
            </span>
            <span className="text-2xl font-bold text-slate-900 mt-1">
              {stats.activeProjects.count}{' '}
              <span className="text-sm text-slate-500 font-normal">dự án</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Folder className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-medium border border-slate-200/60">
            <TrendingUp className="w-3.5 h-3.5" />
            {stats.activeProjects.change}
          </span>
          <span className="text-xs font-mono text-slate-400 font-medium">
            {stats.activeProjects.quarter}
          </span>
        </div>
      </div>

      {/* Card 2: Công việc cần làm hôm nay */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-600 font-medium">
              Công việc cần làm hôm nay
            </span>
            <span className="text-2xl font-bold text-slate-900 mt-1">
              {stats.tasksToday.count}{' '}
              <span className="text-sm text-slate-500 font-normal">việc</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-medium border border-slate-200/60">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
            {stats.tasksToday.highPriorityCount > 0
              ? `${stats.tasksToday.highPriorityCount} việc ưu tiên cao`
              : '0 việc ưu tiên cao'}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {stats.tasksToday.deadline}
          </span>
        </div>
      </div>

      {/* Card 3: Tiến độ Sprint */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-600 font-medium">
              Tiến độ {stats.sprintProgress.sprintName}
            </span>
            <span className="text-2xl font-bold text-slate-900 mt-1">
              {stats.sprintProgress.percent}%{' '}
              <span className="text-sm text-slate-500 font-normal">xong</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.sprintProgress.percent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>{stats.sprintProgress.currentPoints} / {stats.sprintProgress.totalPoints} SP</span>
            <span>Còn {stats.sprintProgress.daysLeft} ngày</span>
          </div>
        </div>
      </div>

      {/* Card 4: Thành viên online */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-600 font-medium">
              Thành viên online
            </span>
            <span className="text-2xl font-bold text-slate-900 mt-1">
              {stats.onlineMembers.count}{' '}
              <span className="text-sm text-slate-500 font-normal">/ {stats.onlineMembers.total} người</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex -space-x-2 overflow-hidden items-center">
            {stats.onlineMembers.avatars.length > 0 ? (
              <>
                {stats.onlineMembers.avatars.map((av) => (
                  <div
                    key={av.id}
                    className={`relative inline-flex items-center justify-center w-6 h-6 rounded-full ${av.bg} text-white text-[10px] font-semibold ring-2 ring-white`}
                    title={av.name}
                  >
                    {av.initials}
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                  </div>
                ))}
                {stats.onlineMembers.total > stats.onlineMembers.avatars.length && (
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold flex items-center justify-center ring-2 ring-white">
                    +{stats.onlineMembers.total - stats.onlineMembers.avatars.length}
                  </div>
                )}
              </>
            ) : (
              <div
                className="relative inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-semibold ring-2 ring-white"
                title={user?.full_name || 'Bạn'}
              >
                {userInitials}
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
              </div>
            )}
          </div>
          <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Đang hoạt động
          </span>
        </div>
      </div>
    </section>
  )
}
