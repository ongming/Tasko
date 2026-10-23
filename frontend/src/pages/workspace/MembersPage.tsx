import React from 'react'
import { UserPlus } from 'lucide-react'
import { WorkspaceMember } from '@/types/workspace'

export function MembersPage() {
  const members: WorkspaceMember[] = [
    { name: 'Nguyễn Đình Quang Minh', email: 'minh.nguyen@tasko.io', role: 'Product Owner / Lead', initials: 'QM', color: 'bg-indigo-600' },
    { name: 'Nguyễn Đăng Khoa', email: 'khoa.nguyen@tasko.io', role: 'Scrum Master / Architect', initials: 'NK', color: 'bg-blue-600' },
    { name: 'Trần Bình', email: 'binh.tran@tasko.io', role: 'Frontend Engineer', initials: 'TB', color: 'bg-amber-600' },
    { name: 'Lê Cúc', email: 'cuc.le@tasko.io', role: 'UI/UX Designer', initials: 'LC', color: 'bg-emerald-600' },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
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
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs"
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
                <h4 className="text-sm font-bold text-slate-800">{m.name}</h4>
                <p className="text-xs text-slate-500">{m.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {m.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MembersPage
