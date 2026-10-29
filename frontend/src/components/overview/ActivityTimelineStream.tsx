import React from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import type { ActivityItem } from '../../types/overview'

interface ActivityTimelineStreamProps {
  activities: ActivityItem[]
}

export const ActivityTimelineStream: React.FC<ActivityTimelineStreamProps> = ({ activities }) => {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
          Hoạt động gần đây
        </h2>
        <button
          type="button"
          className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Làm mới</span>
        </button>
      </div>

      <div className="relative pl-5 flex flex-col gap-4 mt-2 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
        {activities.map((item) => {
          if (item.isAi) {
            return (
              <div key={item.id} className="relative flex flex-col">
                <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-purple-600 ring-4 ring-white shrink-0" />
                <div className="bg-purple-50/70 border border-purple-200/60 p-2.5 rounded-lg">
                  <div className="flex items-center gap-1 text-purple-800 text-xs font-bold mb-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Tasko AI Copilot</span>
                  </div>
                  <p className="text-xs text-slate-700">
                    {item.aiDescription}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {item.time}
                  </span>
                </div>
              </div>
            )
          }

          return (
            <div key={item.id} className="relative flex flex-col">
              <div
                className={`absolute -left-[19px] top-1 w-3 h-3 rounded-full ${item.dotColor} ring-4 ring-white shrink-0`}
              />
              <p className="text-xs text-slate-700">
                <span className="font-semibold text-slate-900">{item.user}</span>{' '}
                {item.action}{' '}
                {item.taskKey && (
                  <span className="font-mono text-[11px] text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded font-medium border border-indigo-100/50">
                    {item.taskKey}
                  </span>
                )}{' '}
                {item.target && (
                  <span className="font-semibold text-slate-900">{item.target}</span>
                )}{' '}
                {item.status && (
                  <>
                    sang trạng thái{' '}
                    <strong className="text-emerald-700 font-semibold">{item.status}</strong>.
                  </>
                )}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {item.time}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
