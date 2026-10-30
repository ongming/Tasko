import React from 'react'
import { Users } from 'lucide-react'
import type { TeamMemberStatus } from '../../types/overview'

interface TeamPresenceWidgetProps {
  members: TeamMemberStatus[]
}

export const TeamPresenceWidget: React.FC<TeamPresenceWidgetProps> = ({ members }) => {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Thành viên trực tuyến
          </h2>
          <p className="text-xs text-slate-500">
            Trạng thái tức thì của các thành viên
          </p>
        </div>
        <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full text-slate-600 font-medium">
          {members.length} đang hoạt động
        </span>
      </div>

      {members.length === 0 ? (
        <div className="py-6 px-4 bg-slate-50/60 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-slate-700">Chưa có thành viên nào khác</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Mời đồng đội vào Không gian làm việc để xem trạng thái cộng tác.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 mt-1">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`relative w-8 h-8 rounded-full ${member.bg} text-white text-xs flex items-center justify-center font-bold shrink-0`}
                >
                  {member.initials}
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${member.statusDotColor} ring-2 ring-white`} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-900 truncate leading-tight">
                    {member.name}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate">
                    {member.role}
                  </span>
                </div>
              </div>

              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 flex items-center gap-1.5 border ${member.statusBadgeColor}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${member.statusDotColor}`} />
                {member.statusText}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
