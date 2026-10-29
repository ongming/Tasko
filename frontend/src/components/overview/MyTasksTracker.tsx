import React from 'react'
import { Link } from 'react-router-dom'
import { Clock, ArrowRight, CheckCircle2 } from 'lucide-react'
import type { MyTaskItem, TaskCategory } from '../../types/overview'

interface MyTasksTrackerProps {
  tasks: MyTaskItem[]
  activeTab: TaskCategory
  tabCounts: {
    today: number
    in_progress: number
    overdue: number
    completed: number
  }
  onTabChange: (tab: TaskCategory) => void
  onToggleTask: (taskId: string) => void
}

export const MyTasksTracker: React.FC<MyTasksTrackerProps> = ({
  tasks,
  activeTab,
  tabCounts,
  onTabChange,
  onToggleTask,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
      {/* Widget Header & Filter Tabs */}
      <div className="p-4 sm:p-5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Công việc của tôi
          </h2>
          <p className="text-xs text-slate-500">
            Nhiệm vụ trực tiếp giao phó và ưu tiên cá nhân
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => onTabChange('today')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'today'
                ? 'bg-white text-indigo-600 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hôm nay ({tabCounts.today})
          </button>

          <button
            type="button"
            onClick={() => onTabChange('in_progress')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'in_progress'
                ? 'bg-white text-indigo-600 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đang làm ({tabCounts.in_progress})
          </button>

          <button
            type="button"
            onClick={() => onTabChange('overdue')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
              activeTab === 'overdue'
                ? 'bg-white text-red-600 font-semibold shadow-2xs'
                : 'text-red-600 hover:bg-red-50'
            }`}
          >
            <span>Quá hạn</span>
            {tabCounts.overdue > 0 && (
              <span className="bg-red-600 text-white text-[10px] px-1 rounded-full font-bold">
                {tabCounts.overdue}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('completed')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium hidden sm:inline-block transition-all ${
              activeTab === 'completed'
                ? 'bg-white text-emerald-600 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đã xong ({tabCounts.completed})
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="divide-y divide-slate-100 min-h-[220px]">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">Không có công việc nào trong mục này</p>
            <p className="text-xs text-slate-400 mt-0.5">Tất cả mục tiêu đã được giải quyết hoặc chưa được chỉ định.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="group px-4 sm:px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleTask(task.id)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer shrink-0"
                  aria-label={`Hoàn thành ${task.title}`}
                />
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium shrink-0">
                  {task.key}
                </span>
                <span
                  className={`text-sm truncate font-medium group-hover:text-indigo-600 transition-colors ${
                    task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                  }`}
                >
                  {task.title}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium border border-indigo-100/60">
                  {task.project}
                </span>

                {task.priority === 'high' && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-semibold border border-red-200/60">
                    Cao
                  </span>
                )}
                {task.priority === 'medium' && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200/60">
                    Vừa
                  </span>
                )}
                {task.priority === 'low' && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    Thấp
                  </span>
                )}

                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {task.dueTime}
                </span>

                <div
                  className={`w-6 h-6 rounded-full ${task.assignee.bg} text-white text-[10px] flex items-center justify-center font-semibold shrink-0`}
                  title={task.assignee.name}
                >
                  {task.assignee.initials}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Footer */}
      <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 pl-2">
          Hiển thị {tasks.length} công việc
        </span>
        <Link
          to="/workspace/board"
          className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition-colors pr-2"
        >
          <span>Xem tất cả công việc</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
