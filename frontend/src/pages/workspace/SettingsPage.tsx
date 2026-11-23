import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { User as UserIcon, Building2, Users } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { workspaceService } from '@/services/workspaceService'
import { ProfileSecurityTab } from '@/components/workspace/ProfileSecurityTab'
import { WorkspaceGeneralTab } from '@/components/workspace/WorkspaceGeneralTab'
import { WorkspaceMembersTab } from '@/components/workspace/WorkspaceMembersTab'
import { Select } from '@/components/ui/Select'
import type { WorkspaceResponse } from '@/types/workspace'

export function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  const { workspaceSlug } = useParams<{ workspaceSlug?: string }>()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'members'>('profile')

  const { data: myWorkspaces = [] } = useQuery<WorkspaceResponse[]>({
    queryKey: ['my-workspaces'],
    queryFn: async () => {
      const res = await workspaceService.getMyWorkspaces()
      return (res as any)?.data || res || []
    },
  })

  const activeWorkspace =
    myWorkspaces.find((w) => w.slug === workspaceSlug) || myWorkspaces[0] || null

  const canManageWorkspace = Boolean(
    activeWorkspace?.role === 'OWNER' ||
      activeWorkspace?.role === 'ADMIN' ||
      (user?.id && activeWorkspace?.ownerId === user.id),
  )

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Cài đặt tài khoản &amp; Hệ thống
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý thông tin hồ sơ cá nhân, tùy chọn bảo mật và cấu hình không gian làm việc.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-1 border-b border-slate-200/80">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Hồ sơ &amp; Bảo mật</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('workspace')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'workspace'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Không gian làm việc</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'members'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Thành viên</span>
        </button>
      </div>

      {/* TAB 1: HỒ SƠ & BẢO MẬT */}
      {activeTab === 'profile' && <ProfileSecurityTab />}

      {/* WORKSPACE SWITCHER BANNER (Tab Không gian làm việc & Thành viên) */}
      {(activeTab === 'workspace' || activeTab === 'members') && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
              {activeWorkspace?.name ? activeWorkspace.name.slice(0, 2).toUpperCase() : 'WS'}
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Không gian làm việc hiện tại
              </p>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>{activeWorkspace?.name || 'Chưa chọn Không gian'}</span>
                {activeWorkspace?.role && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {activeWorkspace.role === 'OWNER'
                      ? 'Chủ sở hữu'
                      : activeWorkspace.role === 'ADMIN'
                        ? 'Quản trị viên'
                        : 'Thành viên'}
                  </span>
                )}
              </h3>
            </div>
          </div>

          {myWorkspaces.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                Đổi Không gian:
              </span>
              <Select
                value={activeWorkspace?.id || ''}
                onChange={(targetId) => {
                  const target = myWorkspaces.find((w) => w.id === targetId)
                  if (target) {
                    navigate(`/${target.slug}/settings`)
                  }
                }}
                align="right"
                className="min-w-[180px]"
                buttonClassName="font-semibold"
                options={myWorkspaces.map((w) => ({
                  value: w.id,
                  label: `${w.name} (${w.slug})`,
                }))}
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KHÔNG GIAN LÀM VIỆC */}
      {activeTab === 'workspace' && (
        <div className="flex flex-col gap-6">
          {!activeWorkspace ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-xs text-slate-400">
              Bạn chưa tham gia không gian làm việc nào.
            </div>
          ) : (
            <WorkspaceGeneralTab workspace={activeWorkspace} canManage={canManageWorkspace} />
          )}
        </div>
      )}

      {/* TAB 3: THÀNH VIÊN */}
      {activeTab === 'members' && (
        <div className="flex flex-col gap-6">
          {!activeWorkspace ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-xs text-slate-400">
              Bạn chưa tham gia không gian làm việc nào.
            </div>
          ) : (
            <WorkspaceMembersTab workspace={activeWorkspace} canManage={canManageWorkspace} />
          )}
        </div>
      )}
    </div>
  )
}

export default SettingsPage
