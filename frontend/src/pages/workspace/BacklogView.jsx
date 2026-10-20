import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Star, 
  Share2, 
  Plus, 
  Play, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  MoreHorizontal, 
  Search, 
  Filter, 
  Bookmark, 
  CheckSquare, 
  Bug, 
  Layers, 
  GripVertical,
  Calendar,
  Sparkles
} from 'lucide-react'
import ProjectTabBar from '@/components/workspace/ProjectTabBar'

export function BacklogView() {
  const [isFavorite, setIsFavorite] = useState(true)
  const [isSprint1Expanded, setIsSprint1Expanded] = useState(true)
  const [isSprint2Expanded, setIsSprint2Expanded] = useState(true)
  const [isBacklogExpanded, setIsBacklogExpanded] = useState(true)

  // Sprint 1 issues (Active Sprint)
  const sprint1Issues = [
    { id: 'WR-101', title: 'Nghiên cứu đối thủ cạnh tranh & khảo sát người dùng', type: 'story', points: 5, status: 'In Progress', statusColor: 'bg-indigo-50 text-indigo-700', assignee: 'NA', assigneeBg: 'bg-indigo-600' },
    { id: 'WR-102', title: 'Thiết kế giao diện trang chủ và hệ thống Design System', type: 'story', points: 8, status: 'Backlog', statusColor: 'bg-slate-100 text-slate-700', assignee: 'LC', assigneeBg: 'bg-amber-500' },
    { id: 'WR-104', title: 'Phát triển API xác thực đăng nhập JWT & RBAC', type: 'task', points: 5, status: 'In Progress', statusColor: 'bg-indigo-50 text-indigo-700', assignee: 'NA', assigneeBg: 'bg-indigo-600' },
    { id: 'WR-107', title: 'Sửa lỗi vỡ layout responsive trên màn hình mobile', type: 'bug', points: 3, status: 'Review', statusColor: 'bg-amber-50 text-amber-700', assignee: 'TB', assigneeBg: 'bg-blue-500' },
    { id: 'WR-109', title: 'Tạo wireframe kiến trúc luồng dữ liệu ban đầu', type: 'task', points: 5, status: 'Done', statusColor: 'bg-emerald-50 text-emerald-700', assignee: 'LC', assigneeBg: 'bg-amber-500' },
  ]

  // Sprint 2 issues (Planned Sprint)
  const sprint2Issues = [
    { id: 'WR-105', title: 'Tích hợp cổng thanh toán trực tuyến MoMo và Stripe', type: 'story', points: 8, status: 'To Do', statusColor: 'bg-slate-100 text-slate-700', assignee: 'HQ', assigneeBg: 'bg-cyan-600' },
    { id: 'WR-106', title: 'Tối ưu hoá SEO On-Page và cấu hình Sitemap tự động', type: 'task', points: 5, status: 'To Do', statusColor: 'bg-slate-100 text-slate-700', assignee: 'MN', assigneeBg: 'bg-purple-600' },
    { id: 'WR-108', title: 'Đánh giá hiệu năng và tải cơ sở dữ liệu với 10,000 users', type: 'task', points: 5, status: 'To Do', statusColor: 'bg-slate-100 text-slate-700', assignee: 'NA', assigneeBg: 'bg-indigo-600' },
  ]

  // Backlog issues (Unassigned product backlog)
  const backlogIssues = [
    { id: 'WR-103', title: 'Viết nội dung truyền thông tiếp thị & cẩm nang onboarding', type: 'story', points: 3, status: 'To Do', statusColor: 'bg-slate-100 text-slate-700', assignee: 'PD', assigneeBg: 'bg-teal-500' },
    { id: 'WR-111', title: 'Xây dựng thông báo đẩy thời gian thực qua WebSocket', type: 'story', points: 8, status: 'To Do', statusColor: 'bg-slate-100 text-slate-700', assignee: 'TB', assigneeBg: 'bg-blue-500' },
    { id: 'WR-112', title: 'Hỗ trợ xuất báo cáo tiến độ dự án ra file PDF/Excel', type: 'task', points: 5, status: 'To Do', statusColor: 'bg-slate-100 text-slate-700', assignee: 'VT', assigneeBg: 'bg-slate-700' },
    { id: 'WR-113', title: 'Tích hợp đăng nhập nhanh qua Google OAuth2', type: 'story', points: 5, status: 'To Do', statusColor: 'bg-slate-100 text-slate-700', assignee: 'NA', assigneeBg: 'bg-indigo-600' },
  ]

  const renderIssueIcon = (type) => {
    switch (type) {
      case 'story':
        return <Bookmark className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" title="User Story" />
      case 'bug':
        return <Bug className="w-3.5 h-3.5 text-rose-500" title="Lỗi (Bug)" />
      default:
        return <CheckSquare className="w-3.5 h-3.5 text-blue-500" title="Công việc (Task)" />
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* 1. Project Ribbon Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Website Redesign
            </h1>
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              title="Đánh dấu dự án yêu thích"
            >
              <Star className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
            </button>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-mono text-xs font-semibold">
              WR-2024
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center -space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-white">NA</div>
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-white">TB</div>
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-white">LC</div>
              <div className="w-8 h-8 rounded-full bg-teal-500 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-white">PD</div>
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center ring-2 ring-white">+5</div>
            </div>
            <button type="button" className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs">
              <Share2 className="w-4 h-4" />
              <span>Chia sẻ</span>
            </button>
          </div>
        </div>

        {/* Project Navigation Tab Bar with dynamic views */}
        <ProjectTabBar />
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm trong Backlog..."
              className="w-full h-8.5 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 shadow-2xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs">
            Chỉ việc của tôi
          </button>
          <button type="button" className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs">
            Sprint hiện tại
          </button>
          <button type="button" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo Sprint mới</span>
          </button>
        </div>
      </div>

      {/* Backlog Plan Sections */}
      <div className="flex flex-col gap-5">
        {/* ================= SECTION 1: Active Sprint (Sprint 1) ================= */}
        <div className="bg-white rounded-2xl border border-indigo-200/80 shadow-2xs overflow-hidden">
          {/* Sprint Header */}
          <div className="p-4 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={() => setIsSprint1Expanded(!isSprint1Expanded)}
                className="p-1 rounded hover:bg-indigo-100/60 text-slate-600"
              >
                {isSprint1Expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">Sprint 1</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider">
                    Đang diễn ra
                  </span>
                </div>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  01 thg 5 - 15 thg 5 • {sprint1Issues.length} công việc
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700" title="To Do points">5</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700" title="In Progress points">10</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800" title="Done points">11</span>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Hoàn thành Sprint
              </button>
            </div>
          </div>

          {/* Sprint 1 Issues Table */}
          {isSprint1Expanded && (
            <div className="divide-y divide-slate-100">
              {sprint1Issues.map((issue) => (
                <div 
                  key={issue.id}
                  className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/70 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                    <GripVertical className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab shrink-0" />
                    <div className="shrink-0">{renderIssueIcon(issue.type)}</div>
                    <span className="font-mono text-xs font-semibold text-slate-400 shrink-0 w-16">{issue.id}</span>
                    <span className="text-xs font-medium text-slate-800 truncate group-hover:text-indigo-600">{issue.title}</span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${issue.statusColor}`}>
                      {issue.status}
                    </span>
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                      {issue.points}
                    </span>
                    <div className={`w-6 h-6 rounded-full ${issue.assigneeBg} text-white text-[10px] font-bold flex items-center justify-center ring-1 ring-white`}>
                      {issue.assignee}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= SECTION 2: Planned Sprint (Sprint 2) ================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={() => setIsSprint2Expanded(!isSprint2Expanded)}
                className="p-1 rounded hover:bg-slate-200/60 text-slate-600"
              >
                {isSprint2Expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Sprint 2 (Dự kiến)</h2>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  16 thg 5 - 30 thg 5 • {sprint2Issues.length} công việc
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">18 SP</span>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-slate-700" />
                <span>Bắt đầu Sprint</span>
              </button>
            </div>
          </div>

          {isSprint2Expanded && (
            <div className="divide-y divide-slate-100">
              {sprint2Issues.map((issue) => (
                <div 
                  key={issue.id}
                  className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/70 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                    <GripVertical className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab shrink-0" />
                    <div className="shrink-0">{renderIssueIcon(issue.type)}</div>
                    <span className="font-mono text-xs font-semibold text-slate-400 shrink-0 w-16">{issue.id}</span>
                    <span className="text-xs font-medium text-slate-800 truncate group-hover:text-indigo-600">{issue.title}</span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${issue.statusColor}`}>
                      {issue.status}
                    </span>
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                      {issue.points}
                    </span>
                    <div className={`w-6 h-6 rounded-full ${issue.assigneeBg} text-white text-[10px] font-bold flex items-center justify-center ring-1 ring-white`}>
                      {issue.assignee}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= SECTION 3: Product Backlog ================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={() => setIsBacklogExpanded(!isBacklogExpanded)}
                className="p-1 rounded hover:bg-slate-200/60 text-slate-600"
              >
                {isBacklogExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Backlog (Tồn đọng sản phẩm)</h2>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  {backlogIssues.length} công việc chưa phân vào Sprint
                </span>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Tạo Sprint mới</span>
            </button>
          </div>

          {isBacklogExpanded && (
            <div className="divide-y divide-slate-100">
              {backlogIssues.map((issue) => (
                <div 
                  key={issue.id}
                  className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/70 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                    <GripVertical className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab shrink-0" />
                    <div className="shrink-0">{renderIssueIcon(issue.type)}</div>
                    <span className="font-mono text-xs font-semibold text-slate-400 shrink-0 w-16">{issue.id}</span>
                    <span className="text-xs font-medium text-slate-800 truncate group-hover:text-indigo-600">{issue.title}</span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${issue.statusColor}`}>
                      {issue.status}
                    </span>
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                      {issue.points}
                    </span>
                    <div className={`w-6 h-6 rounded-full ${issue.assigneeBg} text-white text-[10px] font-bold flex items-center justify-center ring-1 ring-white`}>
                      {issue.assignee}
                    </div>
                  </div>
                </div>
              ))}

              {/* Quick Inline Add Task */}
              <div className="px-4 py-3 bg-slate-50/40">
                <button
                  type="button"
                  className="flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tạo công việc trong Backlog...</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BacklogView
