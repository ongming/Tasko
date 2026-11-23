import React from 'react'
import { Link } from 'react-router-dom'
import { Users, ArrowUpRight } from 'lucide-react'
import type { TeamMemberStatus } from '../../types/overview'

interface TeamPresenceWidgetProps {
  members: TeamMemberStatus[]
  membersRoute?: string
}

export const TeamPresenceWidget: React.FC<TeamPresenceWidgetProps> = ({
  members,
  membersRoute = '/workspace/members',
}) => {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Thành viên Không gian
          </h2>
          <p className="text-xs text-slate-500">
            Danh sách thành viên đang tham gia cộng tác
          </p>
        </div>
        <Link
          to={membersRoute}
          className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 rounded-full text-slate-700 hover:text-indigo-600 font-medium inline-flex items-center gap-1 transition-colors"
        >
          <span>{members.length} thành viên</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {members.length === 0 ? (
        <div className="py-6 px-4 bg-slate-50/60 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-slate-700">Chưa có danh sách thành viên</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Mời đồng đội vào Không gian làm việc để cùng phân công công việc.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 mt-1">
          {members.slice(0, 6).map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-full ${member.bg} text-white text-xs flex items-center justify-center font-bold shrink-0`}
                >
                  {member.initials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-900 truncate leading-tight">
                    {member.name}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate">{member.role}</span>
                </div>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 border border-slate-200/70 shrink-0">
                {member.role}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
