import React from 'react'
import { UserPlus, UserCheck } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { WorkspaceMember } from '@/types/workspace'

export function MembersPage() {
  const { user } = useAuthStore()

  const userName = user?.full_name || 'Người dùng mới'
  const userEmail = user?.email || 'user@tasko.io'
  const userInitials = userName.slice(0, 2).toUpperCase()

  const members: WorkspaceMember[] = [
    {
      name: userName,
      email: userEmail,
      role: 'Chủ sở hữu (Owner)',
      initials: userInitials,
      color: 'bg-indigo-600',
    },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Thành viên nhóm
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý lời mời, vai trò và quyền hạn trong không gian làm việc Tasko.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Mời thành viên</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {members.map((m, idx) => (
          <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${m.color} text-white font-bold flex items-center justify-center text-xs shadow-xs`}>
                {m.initials}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>{m.name}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Bạn
                  </span>
                </h4>
                <p className="text-xs text-slate-500">{m.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {m.role}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Invitation banner */}
      <div className="p-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-100/70 text-indigo-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800">Chưa có thành viên nào khác</p>
            <p className="text-[11px] text-slate-500">Mời đồng đội vào Không gian làm việc qua email để cùng quản lý dự án.</p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
          <span>Gửi lời mời</span>
        </button>
      </div>
    </div>
  )
}

export default MembersPage
