import React from 'react'
import { TrendingUp } from 'lucide-react'
import type { DailyVelocity } from '../../types/overview'

interface WeeklyVelocityChartProps {
  velocity: DailyVelocity[]
}

export const WeeklyVelocityChart: React.FC<WeeklyVelocityChartProps> = ({ velocity }) => {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Năng suất tuần này
          </h2>
          <p className="text-xs text-slate-500">
            32 công việc đã hoàn thành xuất sắc
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-100">
          <TrendingUp className="w-3.5 h-3.5" />
          +15% vận tốc
        </span>
      </div>

      {/* Mini Inline SVG Bar Chart */}
      <div className="w-full bg-slate-50/80 rounded-lg p-3 border border-slate-100">
        <svg
          className="w-full h-28"
          fill="none"
          viewBox="0 0 280 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Grid lines horizontal */}
          <line
            stroke="#e2e8f0"
            strokeDasharray="2 2"
            strokeWidth="1"
            x1="10"
            x2="270"
            y1="82"
            y2="82"
          />
          <line
            stroke="#e2e8f0"
            strokeDasharray="2 2"
            strokeWidth="1"
            x1="10"
            x2="270"
            y1="45"
            y2="45"
          />

          {/* Bar T2 (5 tasks) */}
          <rect fill="#c7d2fe" height="28" rx="3" width="24" x="25" y="54" />
          <text
            className="text-[10px] font-medium font-sans"
            fill="#475569"
            textAnchor="middle"
            x="37"
            y="49"
          >
            5
          </text>
          <text
            className="text-[10px] font-sans"
            fill="#64748b"
            textAnchor="middle"
            x="37"
            y="94"
          >
            T2
          </text>

          {/* Bar T3 (8 tasks) */}
          <rect fill="#818cf8" height="45" rx="3" width="24" x="75" y="37" />
          <text
            className="text-[10px] font-semibold font-sans"
            fill="#312e81"
            textAnchor="middle"
            x="87"
            y="32"
          >
            8
          </text>
          <text
            className="text-[10px] font-sans"
            fill="#64748b"
            textAnchor="middle"
            x="87"
            y="94"
          >
            T3
          </text>

          {/* Bar T4 (11 tasks - Highlight Peak) */}
          <rect fill="#4f46e5" height="62" rx="3" width="24" x="125" y="20" />
          <text
            className="text-[10px] font-bold font-sans"
            fill="#4f46e5"
            textAnchor="middle"
            x="137"
            y="15"
          >
            11
          </text>
          <text
            className="text-[10px] font-bold font-sans"
            fill="#4f46e5"
            textAnchor="middle"
            x="137"
            y="94"
          >
            T4
          </text>

          {/* Bar T5 (6 tasks - Today) */}
          <rect fill="#6366f1" height="34" rx="3" width="24" x="175" y="48" />
          <text
            className="text-[10px] font-semibold font-sans"
            fill="#4338ca"
            textAnchor="middle"
            x="187"
            y="43"
          >
            6
          </text>
          <text
            className="text-[10px] font-bold font-sans"
            fill="#4338ca"
            textAnchor="middle"
            x="187"
            y="94"
          >
            T5*
          </text>

          {/* Bar T6 (Dự kiến 9 tasks - Striped/Ghost) */}
          <rect
            fill="#e0e7ff"
            height="48"
            rx="3"
            stroke="#4f46e5"
            strokeDasharray="2 2"
            strokeWidth="1.5"
            width="24"
            x="225"
            y="34"
          />
          <text
            className="text-[9px] font-sans"
            fill="#6366f1"
            textAnchor="middle"
            x="237"
            y="29"
          >
            dự kiến
          </text>
          <text
            className="text-[10px] font-sans"
            fill="#64748b"
            textAnchor="middle"
            x="237"
            y="94"
          >
            T6
          </text>
        </svg>

        <div className="flex justify-between items-center mt-1 text-slate-500 text-xs">
          <span>* Hôm nay đang tiếp diễn</span>
          <span className="font-semibold text-indigo-600">Mục tiêu sprint: 38 tasks</span>
        </div>
      </div>
    </div>
  )
}
