import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Info, 
  X, 
  Filter, 
  CheckCircle2, 
  Pencil, 
  PlusSquare, 
  CalendarClock, 
  Maximize2,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react'

interface MetricCard {
  value: number;
  label: string;
  subtext: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

interface ActivityItem {
  id: string;
  author: string;
  initials: string;
  avatarBg: string;
  action: string;
  taskKey: string;
  taskTitle: string;
  statusBadge?: { label: string; bg: string };
  timeAgo: string;
}

export function ControlBoardView() {
  const [showBanner, setShowBanner] = useState(true)

  // 4 thẻ chỉ số nhanh ở trên cùng (chuẩn Jira Summary)
  const metrics: MetricCard[] = [
    {
      value: 4,
      label: 'hoàn thành',
      subtext: 'trong 7 ngày qua',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      value: 6,
      label: 'đã cập nhật',
      subtext: 'trong 7 ngày qua',
      icon: Pencil,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
    },
    {
      value: 8,
      label: 'đã tạo mới',
      subtext: 'trong 7 ngày qua',
      icon: PlusSquare,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      value: 2,
      label: 'sắp đến hạn',
      subtext: 'trong 7 ngày tới',
      icon: CalendarClock,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
    },
  ]

  // Dữ liệu vòng tròn trạng thái (Status Overview Donut)
  const statusStats = [
    { label: 'Backlog (Chờ làm)', count: 8, color: '#94a3b8', percentage: 40 },
    { label: 'In Progress (Đang làm)', count: 6, color: '#4f46e5', percentage: 30 },
    { label: 'Review (Đang duyệt)', count: 2, color: '#f59e0b', percentage: 10 },
    { label: 'Done (Hoàn thành)', count: 4, color: '#10b981', percentage: 20 },
  ]
  const totalTasks = statusStats.reduce((acc, curr) => acc + curr.count, 0)

  // Dữ liệu dòng thời gian hoạt động gần đây (Recent Activity feed)
  const activities: ActivityItem[] = [
    {
      id: 'act-1',
      author: 'Nguyễn Đình Quang Minh',
      initials: 'QM',
      avatarBg: 'bg-indigo-600 text-white',
      action: 'đã cập nhật trạng thái trên',
      taskKey: 'WR-104',
      taskTitle: 'Phát triển API đăng nhập',
      statusBadge: { label: 'In Progress', bg: 'bg-indigo-100 text-indigo-700' },
      timeAgo: '2 giờ trước',
    },
    {
      id: 'act-2',
      author: 'Nguyễn An',
      initials: 'NA',
      avatarBg: 'bg-blue-600 text-white',
      action: 'đã tạo mới công việc',
      taskKey: 'WR-101',
      taskTitle: 'Nghiên cứu đối thủ cạnh tranh',
      statusBadge: { label: 'Backlog', bg: 'bg-slate-100 text-slate-700' },
      timeAgo: '4 giờ trước',
    },
    {
      id: 'act-3',
      author: 'Lê Cúc',
      initials: 'LC',
      avatarBg: 'bg-amber-500 text-white',
      action: 'đã hoàn thành công việc',
      taskKey: 'WR-109',
      taskTitle: 'Tạo wireframe ban đầu',
      statusBadge: { label: 'Done', bg: 'bg-emerald-100 text-emerald-700' },
      timeAgo: 'Hôm qua lúc 16:30',
    },
    {
      id: 'act-4',
      author: 'Trần Bình',
      initials: 'TB',
      avatarBg: 'bg-teal-600 text-white',
      action: 'đã thêm bình luận vào',
      taskKey: 'WR-107',
      taskTitle: 'Sửa lỗi responsive trên tablet',
      timeAgo: 'Hôm qua lúc 11:15',
    },
    {
      id: 'act-5',
      author: 'Phạm Dũng',
      initials: 'PD',
      avatarBg: 'bg-purple-600 text-white',
      action: 'đã đổi hạn chót trên',
      taskKey: 'WR-103',
      taskTitle: 'Viết nội dung marketing',
      timeAgo: '2 ngày trước',
    },
  ]

  return (
    <div className="flex flex-col gap-5 w-full flex-1">
      {/* 1. Top Banner Thông báo Tùy chỉnh (Giống Jira Summary) */}
      {showBanner && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-5 text-white shadow-xs border border-indigo-800/40">
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3.5 max-w-2xl">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-400/20">
                <Info className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold tracking-tight text-white">
                  Tùy chỉnh bảng điều khiển Control Board theo không gian làm việc của bạn
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dễ dàng theo dõi báo cáo phân tích, tốc độ hoàn thành công việc và biểu đồ tiến độ được cá nhân hóa theo từng Sprint của dự án.
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <Link to="/workspace/control" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1">
                    <span>Xem báo cáo chi tiết</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                  <button 
                    type="button" 
                    onClick={() => setShowBanner(false)}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Bỏ qua
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setShowBanner(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Toolbar bộ lọc nhanh */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="w-7 h-7 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-indigo-200 cursor-pointer shadow-2xs"
          title="Lọc việc của tôi (QM)"
        >
          QM
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Bộ lọc</span>
        </button>
      </div>

      {/* 4. Thống kê 4 thẻ tóm tắt (Jira 7-day metric cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((item, idx) => {
          const Icon = item.icon
          return (
            <div 
              key={idx}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-4"
            >
              <div className={`w-11 h-11 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{item.value}</span>
                  <span className="text-xs font-bold text-slate-700 truncate">{item.label}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium truncate">{item.subtext}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 5. Khối nội dung chính: Status Overview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Cột trái: Status Overview (Donut Chart) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col gap-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Tổng quan trạng thái
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Xem nhanh trạng thái các hạng mục công việc.{' '}
                <Link to="/workspace/board" className="font-semibold text-indigo-600 hover:underline">
                  Xem tất cả
                </Link>
              </p>
            </div>
            <Link 
              to="/workspace/board" 
              className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
              title="Đi tới bảng Kanban"
            >
              <Maximize2 className="w-4 h-4" />
            </Link>
          </div>

          {/* Donut Chart SVG Container */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
            {/* SVG Donut */}
            <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                {/* Backlog Segment: 40% (stroke-dasharray 40 60, offset 0) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#94a3b8"
                  strokeWidth="12"
                  strokeDasharray="40 60"
                  strokeDashoffset="0"
                />
                {/* In Progress Segment: 30% (stroke-dasharray 30 70, offset -40) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#4f46e5"
                  strokeWidth="12"
                  strokeDasharray="30 70"
                  strokeDashoffset="-40"
                />
                {/* Review Segment: 10% (stroke-dasharray 10 90, offset -70) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  strokeDasharray="10 90"
                  strokeDashoffset="-70"
                />
                {/* Done Segment: 20% (stroke-dasharray 20 80, offset -80) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray="20 80"
                  strokeDashoffset="-80"
                />
              </svg>
              {/* Inner Center Label */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900">{totalTasks}</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Công việc</span>
              </div>
            </div>

            {/* Legend breakdown list */}
            <div className="flex flex-col gap-2.5 w-full sm:w-auto">
              {statusStats.map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between sm:justify-start gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: stat.color }} 
                    />
                    <span className="font-medium text-slate-700">{stat.label}</span>
                  </div>
                  <span className="font-bold text-slate-900 font-mono">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cột phải: Recent Activity Feed (Hoạt động gần đây) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Hoạt động gần đây
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cập nhật liên tục những thay đổi mới nhất diễn ra trong toàn bộ dự án.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {activities.map((act) => (
              <div key={act.id} className="py-3.5 flex items-start gap-3 first:pt-1 last:pb-1">
                {/* Author Avatar initials */}
                <div className={`w-8 h-8 rounded-full ${act.avatarBg} flex items-center justify-center font-bold text-xs shrink-0 ring-2 ring-white shadow-2xs`}>
                  {act.initials}
                </div>

                <div className="flex-1 min-w-0 text-xs">
                  <div className="text-slate-800 leading-relaxed">
                    <span className="font-bold text-slate-900">{act.author}</span>{' '}
                    <span className="text-slate-500">{act.action}</span>{' '}
                    <Link to="/workspace/board" className="font-mono font-bold text-indigo-600 hover:underline">
                      {act.taskKey}
                    </Link>
                    : <span className="font-medium text-slate-700">{act.taskTitle}</span>
                    {act.statusBadge && (
                      <span className={`inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${act.statusBadge.bg}`}>
                        {act.statusBadge.label}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block font-medium">
                    {act.timeAgo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ControlBoardView