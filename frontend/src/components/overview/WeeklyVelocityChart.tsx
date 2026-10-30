import React from 'react'
import { TrendingUp, BarChart3 } from 'lucide-react'
import type { DailyVelocity } from '../../types/overview'

interface WeeklyVelocityChartProps {
  velocity: DailyVelocity[]
}

export const WeeklyVelocityChart: React.FC<WeeklyVelocityChartProps> = ({ velocity }) => {
  const totalTasks = velocity.reduce((acc, curr) => acc + (curr.isProjected ? 0 : curr.tasks), 0)

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Năng suất tuần này
          </h2>
          <p className="text-xs text-slate-500">
            {totalTasks > 0
              ? `${totalTasks} công việc đã hoàn thành`
              : 'Chưa có công việc nào hoàn thành'}
          </p>
        </div>
        {totalTasks > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-100">
            <TrendingUp className="w-3.5 h-3.5" />
            Vận tốc tuần
          </span>
        )}
      </div>

      {velocity.length === 0 ? (
        <div className="w-full bg-slate-50/80 rounded-lg p-6 border border-slate-100 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
            <BarChart3 className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-700">Chưa có dữ liệu vận tốc</p>
          <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
            Biểu đồ sẽ tự động xuất hiện khi bạn bắt đầu hoàn thành các công việc trong Sprint.
          </p>
        </div>
      ) : (
        <div className="w-full bg-slate-50/80 rounded-lg p-3 border border-slate-100">
          <svg
            className="w-full h-28"
            fill="none"
            viewBox="0 0 280 100"
            xmlns="http://www.w3.org/2000/svg"
          >
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

            {velocity.map((v, i) => {
              const xPos = 25 + i * 50
              const height = Math.min(Math.max(v.tasks * 6, 8), 65)
              const yPos = 82 - height

              return (
                <g key={v.day}>
                  <rect
                    fill={v.isProjected ? '#e0e7ff' : v.isPeak ? '#4f46e5' : '#818cf8'}
                    height={height}
                    rx="3"
                    stroke={v.isProjected ? '#4f46e5' : 'none'}
                    strokeDasharray={v.isProjected ? '2 2' : 'none'}
                    strokeWidth={v.isProjected ? 1.5 : 0}
                    width="24"
                    x={xPos}
                    y={yPos}
                  />
                  <text
                    className="text-[10px] font-medium font-sans"
                    fill={v.isPeak ? '#4f46e5' : '#475569'}
                    textAnchor="middle"
                    x={xPos + 12}
                    y={yPos - 5}
                  >
                    {v.tasks}
                  </text>
                  <text
                    className="text-[10px] font-sans"
                    fill="#64748b"
                    textAnchor="middle"
                    x={xPos + 12}
                    y="94"
                  >
                    {v.day}{v.isToday ? '*' : ''}
                  </text>
                </g>
              )
            })}
          </svg>

          <div className="flex justify-between items-center mt-1 text-slate-500 text-xs">
            <span>* Đang diễn ra</span>
            <span className="font-semibold text-indigo-600">Theo dõi tiến độ</span>
          </div>
        </div>
      )}
    </div>
  )
}
