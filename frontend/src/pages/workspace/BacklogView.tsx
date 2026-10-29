import React, { useState } from 'react'
import { 
  Plus, 
  Play, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Bookmark, 
  CheckSquare, 
  Bug, 
  GripVertical,
  MoreHorizontal,
  CheckCircle2
} from 'lucide-react'
import { Task } from '@/types/task'

export function BacklogView() {
  const [isSprint1Expanded, setIsSprint1Expanded] = useState<boolean>(true)
  const [isSprint2Expanded, setIsSprint2Expanded] = useState<boolean>(true)
  const [isBacklogExpanded, setIsBacklogExpanded] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'my' | 'active'>('all')

  // Sprint 1 issues (Active Sprint)
  const sprint1Issues: Task[] = [
    { id: 'WR-101', title: 'Nghiên cứu đối thủ cạnh tranh & khảo sát người dùng', type: 'story', points: 5, status: 'In Progress', statusColor: 'bg-indigo-50 text-indigo-700 border border-indigo-200/50', assignees: [{ name: 'NA', bg: 'bg-indigo-600' }], tag: 'Research', dueDate: '12 thg 5' },
    { id: 'WR-102', title: 'Thiết kế giao diện trang chủ và hệ thống Design System', type: 'story', points: 8, status: 'Backlog', statusColor: 'bg-slate-100 text-slate-700 border border-slate-200', assignees: [{ name: 'LC', bg: 'bg-amber-500' }], tag: 'Design', dueDate: '15 thg 5' },
    { id: 'WR-104', title: 'Phát triển API xác thực đăng nhập JWT & RBAC', type: 'task', points: 5, status: 'In Progress', statusColor: 'bg-indigo-50 text-indigo-700 border border-indigo-200/50', assignees: [{ name: 'NA', bg: 'bg-indigo-600' }], tag: 'Backend', dueDate: '10 thg 5' },
    { id: 'WR-107', title: 'Sửa lỗi vỡ layout responsive trên màn hình mobile', type: 'bug', points: 3, status: 'Review', statusColor: 'bg-amber-50 text-amber-700 border border-amber-200/50', assignees: [{ name: 'TB', bg: 'bg-blue-500' }], tag: 'Frontend', dueDate: '11 thg 5' },
    { id: 'WR-109', title: 'Tạo wireframe kiến trúc luồng dữ liệu ban đầu', type: 'task', points: 5, status: 'Done', statusColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', assignees: [{ name: 'LC', bg: 'bg-amber-500' }], tag: 'Design', dueDate: '08 thg 5' },
  ]

  // Sprint 2 issues (Planned Sprint)
  const sprint2Issues: Task[] = [
    { id: 'WR-105', title: 'Tích hợp cổng thanh toán trực tuyến MoMo và Stripe', type: 'story', points: 8, status: 'To Do', statusColor: 'bg-slate-100 text-slate-700 border border-slate-200', assignees: [{ name: 'HQ', bg: 'bg-cyan-600' }], tag: 'Backend', dueDate: '14 thg 5' },
    { id: 'WR-106', title: 'Tối ưu hoá SEO On-Page và cấu hình Sitemap tự động', type: 'task', points: 5, status: 'To Do', statusColor: 'bg-slate-100 text-slate-700 border border-slate-200', assignees: [{ name: 'MN', bg: 'bg-purple-600' }], tag: 'SEO', dueDate: '17 thg 5' },
    { id: 'WR-108', title: 'Đánh giá hiệu năng và tải cơ sở dữ liệu với 10,000 users', type: 'task', points: 5, status: 'To Do', statusColor: 'bg-slate-100 text-slate-700 border border-slate-200', assignees: [{ name: 'NA', bg: 'bg-indigo-600' }], tag: 'DevOps', dueDate: '13 thg 5' },
  ]

  // Backlog issues (Unassigned product backlog)
  const backlogIssues: Task[] = [
    { id: 'WR-103', title: 'Viết nội dung truyền thông tiếp thị & cẩm nang onboarding', type: 'story', points: 3, status: 'To Do', statusColor: 'bg-slate-100 text-slate-700 border border-slate-200', assignees: [{ name: 'PD', bg: 'bg-teal-500' }], tag: 'Content', dueDate: '18 thg 5' },
    { id: 'WR-111', title: 'Xây dựng thông báo đẩy thời gian thực qua WebSocket', type: 'story', points: 8, status: 'To Do', statusColor: 'bg-slate-100 text-slate-700 border border-slate-200', assignees: [{ name: 'TB', bg: 'bg-blue-500' }], tag: 'Backend', dueDate: '20 thg 5' },
    { id: 'WR-112', title: 'Hỗ trợ xuất báo cáo tiến độ dự án ra file PDF/Excel', type: 'task', points: 5, status: 'To Do', statusColor: 'bg-slate-100 text-slate-700 border border-slate-200', assignees: [{ name: 'VT', bg: 'bg-slate-700' }], tag: 'Reporting', dueDate: '22 thg 5' },
    { id: 'WR-113', title: 'Tích hợp đăng nhập nhanh qua Google OAuth2', type: 'story', points: 5, status: 'To Do', statusColor: 'bg-slate-100 text-slate-700 border border-slate-200', assignees: [{ name: 'NA', bg: 'bg-indigo-600' }], tag: 'Security', dueDate: '25 thg 5' },
  ]

  const renderIssueIcon = (type?: string) => {
    switch (type) {
      case 'story':
        return (
          <span title="User Story" className="p-0.5 rounded bg-emerald-50 text-emerald-600 shrink-0">
            <Bookmark className="w-3.5 h-3.5 fill-emerald-500" />
          </span>
        )
      case 'bug':
        return (
          <span title="Lỗi (Bug)" className="p-0.5 rounded bg-rose-50 text-rose-600 shrink-0">
            <Bug className="w-3.5 h-3.5" />
          </span>
        )
      default:
        return (
          <span title="Công việc (Task)" className="p-0.5 rounded bg-indigo-50 text-indigo-600 shrink-0">
            <CheckSquare className="w-3.5 h-3.5" />
          </span>
        )
    }
  }

  // Component render từng dòng issue chuẩn Jira (thẳng hàng tuyệt đối)
  const renderIssueRow = (issue: Task) => (
    <div 
      key={issue.id}
      className="px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer border-b border-slate-100 last:border-b-0"
    >
      {/* Vùng bên trái: Icon + Key + Tên */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-4">
        <GripVertical className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab shrink-0 -ml-1" />
        {renderIssueIcon(issue.type)}
        <span className="font-mono text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors shrink-0 w-16">
          {issue.id}
        </span>
        <span className="text-xs sm:text-sm font-medium text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
          {issue.title}
        </span>
      </div>

      {/* Vùng bên phải: Tag + Trạng thái + Points + Avatar (Cột cố định thẳng tắp) */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {issue.tag && (
          <span className="hidden md:inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
            {issue.tag}
          </span>
        )}
        <div className="w-24 text-center">
          <span className={`inline-block w-full px-2 py-0.5 rounded-full text-[11px] font-semibold truncate ${issue.statusColor}`}>
            {issue.status}
          </span>
        </div>
        <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center font-mono">
          {issue.points || '-'}
        </span>
        <div 
          className={`w-6 h-6 rounded-full ${issue.assignees[0]?.bg || 'bg-slate-600'} text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-2xs shrink-0`}
          title={issue.assignees[0]?.name}
        >
          {issue.assignees[0]?.name}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-4 w-full flex-1">
      {/* 1. Thanh tìm kiếm và bộ lọc nhanh (Jira Backlog Toolbar) */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-1">
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm công việc trong Backlog..."
              aria-label="Tìm kiếm trong Backlog"
              className="w-full h-9 pl-9 pr-4 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={() => setActiveFilter(activeFilter === 'my' ? 'all' : 'my')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
              activeFilter === 'my'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Chỉ việc của tôi
          </button>
          <button 
            type="button" 
            onClick={() => setActiveFilter(activeFilter === 'active' ? 'all' : 'active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
              activeFilter === 'active'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Sprint hiện tại
          </button>
          <button 
            type="button" 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo Sprint mới</span>
          </button>
        </div>
      </div>

      {/* 2. Danh sách các phần Sprint & Product Backlog */}
      <div className="flex flex-col gap-4">
        {/* ================= SPRINT 1 (Active Sprint) ================= */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Header Sprint */}
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={() => setIsSprint1Expanded(!isSprint1Expanded)}
                className="p-1 rounded-md hover:bg-slate-200/60 text-slate-500 transition-colors cursor-pointer"
                title={isSprint1Expanded ? 'Thu gọn Sprint' : 'Mở rộng Sprint'}
              >
                {isSprint1Expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-sm font-bold text-slate-900 tracking-tight">Sprint 1</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                  Đang diễn ra
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  01 thg 5 - 15 thg 5 • {sprint1Issues.length} công việc
                </span>
              </div>
            </div>

            {/* Thống kê Story Points (To do / In progress / Done) & Nút hoàn thành */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs font-bold font-mono">
                <span className="px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700" title="Điểm chờ làm (To Do)">5</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700" title="Điểm đang làm (In Progress)">10</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800" title="Điểm hoàn thành (Done)">11</span>
              </div>
              
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Hoàn thành Sprint
              </button>

              <button
                type="button"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                title="Tùy chọn Sprint"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Danh sách công việc Sprint 1 */}
          {isSprint1Expanded && (
            <div>
              {sprint1Issues.map(renderIssueRow)}
              
              {/* Tạo việc nhanh ở đáy Sprint */}
              <button
                type="button"
                className="w-full px-4 py-2.5 flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:bg-slate-50/80 transition-colors border-t border-slate-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                <span>+ Tạo công việc trong Sprint 1</span>
              </button>
            </div>
          )}
        </div>

        {/* ================= SPRINT 2 (Planned Sprint) ================= */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={() => setIsSprint2Expanded(!isSprint2Expanded)}
                className="p-1 rounded-md hover:bg-slate-200/60 text-slate-500 transition-colors cursor-pointer"
                title={isSprint2Expanded ? 'Thu gọn Sprint' : 'Mở rộng Sprint'}
              >
                {isSprint2Expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-sm font-bold text-slate-900 tracking-tight">Sprint 2</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                  Kế hoạch
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  16 thg 5 - 30 thg 5 • {sprint2Issues.length} công việc
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold font-mono">18 SP</span>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-slate-700 text-slate-700" />
                <span>Bắt đầu Sprint</span>
              </button>
              <button
                type="button"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                title="Tùy chọn Sprint"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isSprint2Expanded && (
            <div>
              {sprint2Issues.map(renderIssueRow)}
              
              <button
                type="button"
                className="w-full px-4 py-2.5 flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:bg-slate-50/80 transition-colors border-t border-slate-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                <span>+ Tạo công việc trong Sprint 2</span>
              </button>
            </div>
          )}
        </div>

        {/* ================= SECTION 3: Product Backlog ================= */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={() => setIsBacklogExpanded(!isBacklogExpanded)}
                className="p-1 rounded-md hover:bg-slate-200/60 text-slate-500 transition-colors cursor-pointer"
                title={isBacklogExpanded ? 'Thu gọn Backlog' : 'Mở rộng Backlog'}
              >
                {isBacklogExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 tracking-tight">Backlog</span>
                <span className="text-xs text-slate-400 font-medium">
                  • {backlogIssues.length} công việc chưa phân vào Sprint
                </span>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Tạo Sprint từ Backlog</span>
            </button>
          </div>

          {isBacklogExpanded && (
            <div>
              {backlogIssues.map(renderIssueRow)}

              {/* Quick Inline Add Task */}
              <button
                type="button"
                className="w-full px-4 py-2.5 flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:bg-slate-50/80 transition-colors border-t border-slate-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                <span>+ Tạo công việc trong Backlog...</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BacklogView