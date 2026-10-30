import React from 'react'
import { Repeat, ArrowRight } from 'lucide-react'
import type { AgileCardConfig } from './types'

interface MethodCardProps {
  method: AgileCardConfig
  onSelect: () => void
}

export const MethodCard: React.FC<MethodCardProps> = ({ method, onSelect }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      aria-label={`Chọn phương pháp quản lý ${method.title}: ${method.featureText}`}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-400 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer group select-none text-left"
    >
      {/* Artwork Banner trực quan chuẩn Jira */}
      <div className="w-full h-44 bg-slate-50/70 border-b border-slate-100 p-4 flex items-center justify-center relative overflow-hidden select-none">
        
        {/* Kanban Artwork */}
        {method.id === 'kanban' && (
          <div className="w-full max-w-[210px] flex gap-2">
            <div className="flex-1 bg-white rounded-lg p-2 border border-slate-200/80 shadow-2xs flex flex-col gap-1.5">
              <div className="w-8 h-2 bg-slate-200 rounded" />
              <div className="w-full h-6 bg-slate-100 rounded" />
              <div className="w-full h-6 bg-slate-100 rounded" />
            </div>
            <div className="flex-1 bg-white rounded-lg p-2 border border-slate-200/80 shadow-2xs flex flex-col gap-1.5">
              <div className="w-10 h-2 bg-slate-200 rounded" />
              <div className="w-full h-8 bg-blue-500 rounded p-1 shadow-2xs flex items-center">
                <div className="w-8 h-1.5 bg-white/80 rounded" />
              </div>
            </div>
            <div className="flex-1 bg-white rounded-lg p-2 border border-slate-200/80 shadow-2xs flex flex-col gap-1.5">
              <div className="w-7 h-2 bg-slate-200 rounded" />
              <div className="w-full h-6 bg-emerald-50 border border-emerald-100 rounded" />
            </div>
          </div>
        )}

        {/* Scrum Artwork - Mô phỏng chân thực Jira Sprint & Backlog */}
        {method.id === 'scrum' && (
          <div className="w-full max-w-[228px] flex flex-col gap-2">
            {/* Active Sprint Container */}
            <div className="bg-white rounded-xl border border-purple-200/90 shadow-2xs overflow-hidden">
              {/* Sprint Header Bar */}
              <div className="bg-purple-50/90 px-2.5 py-1.5 border-b border-purple-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-2xs">
                    <Repeat className="w-2.5 h-2.5 stroke-[2.5]" />
                  </div>
                  <span className="text-[11px] font-bold text-purple-950 tracking-tight">Sprint 1</span>
                  <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Còn 5 ngày
                  </span>
                </div>
                {/* Jira Story Point Estimation Triad [To Do | In Progress | Done] */}
                <div className="flex items-center gap-0.5 text-[8px] font-bold">
                  <span className="w-4 h-3.5 bg-slate-200 text-slate-700 rounded-xs flex items-center justify-center">3</span>
                  <span className="w-4 h-3.5 bg-blue-500 text-white rounded-xs flex items-center justify-center">5</span>
                  <span className="w-4 h-3.5 bg-emerald-500 text-white rounded-xs flex items-center justify-center">8</span>
                </div>
              </div>

              {/* Sprint Issue Rows */}
              <div className="p-2 flex flex-col gap-1.5 bg-slate-50/40">
                {/* User Story Row */}
                <div className="bg-white rounded-lg px-2 py-1.5 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-3.5 h-3.5 rounded bg-emerald-500 text-white flex items-center justify-center text-[7px] font-black shrink-0 shadow-2xs">
                      S
                    </span>
                    <span className="text-[9px] font-bold text-slate-800 shrink-0">TSK-101</span>
                    <div className="w-14 h-1.5 bg-slate-200 rounded-full" />
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="w-3.5 h-3.5 rounded-full bg-purple-100 text-purple-700 font-bold text-[8px] flex items-center justify-center">
                      5
                    </span>
                    <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 text-white font-bold text-[7px] flex items-center justify-center">
                      A
                    </div>
                  </div>
                </div>

                {/* Task Row */}
                <div className="bg-white rounded-lg px-2 py-1.5 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-3.5 h-3.5 rounded bg-blue-500 text-white flex items-center justify-center text-[7px] font-black shrink-0 shadow-2xs">
                      ✓
                    </span>
                    <span className="text-[9px] font-bold text-slate-800 shrink-0">TSK-102</span>
                    <div className="w-10 h-1.5 bg-slate-200 rounded-full" />
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="w-3.5 h-3.5 rounded-full bg-purple-100 text-purple-700 font-bold text-[8px] flex items-center justify-center">
                      8
                    </span>
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-500 text-white font-bold text-[7px] flex items-center justify-center">
                      T
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Backlog Section Indicator */}
            <div className="flex items-center justify-between px-2.5 py-1 bg-white/90 rounded-lg border border-dashed border-slate-300 text-[9px] text-slate-500 font-medium shadow-2xs">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>Backlog dự án (4 việc)</span>
              </div>
              <span className="text-purple-600 font-bold text-[8.5px] hover:text-purple-700 transition-colors">
                + Kéo vào Sprint
              </span>
            </div>
          </div>
        )}

        {/* Scrumban Artwork */}
        {method.id === 'scrumban' && (
          <div className="w-full max-w-[210px] flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] px-1 font-semibold text-slate-400">
              <span>WIP: 3</span>
              <span className="text-emerald-600 font-bold">● Sprint Buffer</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-white rounded-lg p-2 border border-slate-200/80 shadow-2xs flex flex-col gap-1">
                <div className="w-full h-6 bg-emerald-50 border border-emerald-100 rounded" />
                <div className="w-full h-6 bg-slate-100 rounded" />
              </div>
              <div className="flex-1 bg-white rounded-lg p-2 border border-slate-200/80 shadow-2xs flex flex-col gap-1">
                <div className="w-full h-6 bg-slate-100 rounded" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Thông tin mô tả phương pháp */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {method.title}
            </h3>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${method.badgeClass}`}
            >
              {method.badge}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            {method.description}
          </p>
        </div>

        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            {method.icon}
            <span>{method.featureText}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
            <span>Chọn mẫu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  )
}
