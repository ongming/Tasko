import React from 'react'
import { Link } from 'react-router-dom'
import { CheckSquare, Bug, ChevronRight, PlusCircle } from 'lucide-react'
import type { ProjectSummary } from '../../types/overview'

interface ActiveProjectsGridProps {
  projects: ProjectSummary[]
}

export const ActiveProjectsGrid: React.FC<ActiveProjectsGridProps> = ({ projects }) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Dự án đang hoạt động
          </h2>
          <p className="text-xs text-slate-500">
            Theo dõi tình trạng sprints và tiến độ phân phối
          </p>
        </div>
        <Link
          to="/workspace/projects"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Dự án mới</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((proj) => {
          const badgeStyles =
            proj.statusColor === 'emerald'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
              : proj.statusColor === 'indigo'
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
              : 'bg-purple-50 text-purple-700 border-purple-200/60'

          const progressBg =
            proj.statusColor === 'emerald'
              ? 'bg-emerald-600'
              : proj.statusColor === 'indigo'
              ? 'bg-indigo-600'
              : 'bg-purple-600'

          return (
            <div
              key={proj.id}
              className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                    {proj.code} • {proj.sprint}
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${badgeStyles}`}>
                    {proj.statusTag}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                  {proj.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {proj.description}
                </p>

                {/* Progress bar */}
                <div className="mt-2 flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">Tiến độ</span>
                    <span className="font-semibold text-slate-800">{proj.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressBg}`}
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                {/* Task and Bug counts */}
                <div className="flex items-center justify-between text-slate-500 text-xs mt-2 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1 font-medium">
                    <CheckSquare className="w-3.5 h-3.5 text-slate-400" /> {proj.tasksCount} việc
                  </span>
                  {proj.bugsCount > 0 ? (
                    <span className="text-red-600 font-medium flex items-center gap-1">
                      <Bug className="w-3.5 h-3.5" /> {proj.bugsCount} bugs
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> 0 bug
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer: Lead & Open Board Link */}
              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full ${proj.lead.bg} text-white text-[10px] font-semibold flex items-center justify-center shrink-0`}
                  >
                    {proj.lead.initials}
                  </div>
                  <span className="text-xs text-slate-700 font-medium truncate max-w-[90px]">
                    {proj.lead.name}
                  </span>
                </div>

                <Link
                  to={proj.boardRoute}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 transition-colors"
                >
                  <span>Mở Board</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
