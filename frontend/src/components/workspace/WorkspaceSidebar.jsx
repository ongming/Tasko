import React, { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  CalendarDays, 
  Users, 
  Settings, 
  Plus, 
  ChevronsUpDown, 
  HelpCircle,
  Home,
  Briefcase
} from 'lucide-react'
import Logo from '@/components/Logo'

export function WorkspaceSidebar({ isMobileOpen, setIsMobileOpen }) {
  const location = useLocation()
  const [currentProject, setCurrentProject] = useState('website-redesign')

  const navItems = [
    { label: 'Tổng quan', path: '/workspace/overview', icon: LayoutDashboard },
    { label: 'Dự án', path: '/workspace/projects', icon: FolderKanban },
    { label: 'Cài đặt', path: '/workspace/settings', icon: Settings },
  ]

  const myProjects = [
    { id: 'website-redesign', name: 'Website Redesign', count: 18, color: 'bg-indigo-600' },
    { id: 'mobile-app', name: 'Mobile App', count: 9, color: 'bg-emerald-500' },
    { id: 'marketing-campaign', name: 'Marketing Campaign', count: 5, color: 'bg-amber-500' },
  ]

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileOpen?.(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-60 bg-white border-r border-slate-200/80 
        flex flex-col justify-between py-4 shadow-xs transition-transform duration-200 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col gap-5 overflow-y-auto px-3">
          {/* Workspace Switcher */}
          <div>
            <button 
              type="button"
              className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50/80 hover:bg-slate-100 border border-slate-200/60 transition-colors group text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  T
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                    Marketing Team
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    Tasko Agile
                  </span>
                </div>
              </div>
              <ChevronsUpDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
            </button>
          </div>

          {/* Primary Nav Menu */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path || (item.path === '/workspace/board' && (location.pathname === '/workspace' || location.pathname === '/workspace/'));
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen?.(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          {/* Divider */}
          <div className="h-px bg-slate-200/60 mx-1" />

          {/* Projects Section */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-3 py-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Dự án của tôi
              </span>
              <button 
                type="button" 
                className="text-slate-400 hover:text-indigo-600 transition-colors"
                title="Tạo dự án mới"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-0.5">
              {myProjects.map((p) => {
                const isSelected = currentProject === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setCurrentProject(p.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left ${
                      isSelected
                        ? 'bg-indigo-50/70 text-indigo-700 font-medium'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${p.color}`} />
                      <span className="truncate">{p.name}</span>
                    </div>
                    {p.count && (
                      <span className={`px-1.5 py-0.5 text-[11px] font-semibold rounded-full ${
                        isSelected 
                          ? 'bg-indigo-100 text-indigo-700' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <button 
              type="button"
              className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo dự án mới</span>
            </button>
          </div>
        </div>

        {/* Bottom Footer Actions */}
        <div className="px-3 pt-3 border-t border-slate-200/60 flex flex-col gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
            title="Về trang chủ Landing Page"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Về Trang chủ Tasko</span>
          </Link>

          <div className="flex items-center justify-between px-3 text-[11px] text-slate-400">
            <span>Tasko v2.4 Agile</span>
            <button 
              type="button" 
              className="text-slate-400 hover:text-slate-600 transition-colors"
              title="Trợ giúp"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default WorkspaceSidebar
