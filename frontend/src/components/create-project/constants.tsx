import React from 'react'
import {
  Kanban,
  Repeat,
  Layers,
  Briefcase,
  Code2,
  TrendingUp,
  Megaphone,
  Truck,
  Headphones,
} from 'lucide-react'
import type { AgileCardConfig, BusinessDomain, MethodDetails, AgileMethod } from './types'

export const AGILE_METHODS: AgileCardConfig[] = [
  {
    id: 'kanban',
    title: 'Kanban',
    badge: 'Đã tạo gần đây',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200/80',
    description: 'Làm việc hiệu quả và trực quan hóa luồng công việc liên tục trên bảng với Cần làm, Đang làm và Hoàn thành.',
    featureText: 'Luồng việc liên tục',
    icon: <Kanban className="w-3.5 h-3.5 text-indigo-600" />,
  },
  {
    id: 'scrum',
    title: 'Scrum',
    badge: 'Khuyên dùng',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/80',
    description: 'Quản lý công việc theo các chu kỳ Sprint có cấu trúc (1-4 tuần), ước tính Story Points và tổ chức Backlog.',
    featureText: 'Chu kỳ Sprint & Backlog',
    icon: <Repeat className="w-3.5 h-3.5 text-purple-600" />,
  },
  {
    id: 'scrumban',
    title: 'Scrumban',
    badge: 'Thử ngay',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    description: 'Mô hình kết hợp tính linh hoạt tức thời của Kanban với nhịp điệu lập kế hoạch và đánh giá định kỳ của Scrum.',
    featureText: 'Kết hợp Kanban + Sprint',
    icon: <Layers className="w-3.5 h-3.5 text-emerald-600" />,
  },
]

export const BUSINESS_DOMAINS: BusinessDomain[] = [
  {
    id: 'general',
    name: 'Mặc định / Đa dụng',
    badge: 'Phổ biến',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200/80',
    icon: <Briefcase className="w-4 h-4 text-indigo-600" />,
    description: 'Quản lý tác vụ thông thường, dự án hỗn hợp và phối hợp phòng ban linh hoạt.',
    tags: ['Tác vụ', 'Ưu tiên', 'Hạn chót', 'Ghi chú'],
    defaultPrefix: 'Dự án Đa dụng',
  },
  {
    id: 'software',
    name: 'Lập trình & Công nghệ',
    badge: 'Chuẩn IT',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/80',
    icon: <Code2 className="w-4 h-4 text-blue-600" />,
    description: 'Đội ngũ kỹ thuật, chu kỳ phát hành (release), bug tracking, pull requests.',
    tags: ['Tính năng', 'Lỗi (Bug)', 'Refactor', 'Release'],
    defaultPrefix: 'Dự án Phần mềm',
  },
  {
    id: 'business',
    name: 'Kinh doanh & Bán hàng',
    badge: 'Tăng trưởng',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
    description: 'Phễu khách hàng (pipeline), hợp đồng mua bán, đối tác và mục tiêu KPI doanh số.',
    tags: ['Khách hàng', 'Hợp đồng', 'Chốt đơn', 'KPI'],
    defaultPrefix: 'Dự án Kinh doanh',
  },
  {
    id: 'marketing',
    name: 'Marketing & Sáng tạo',
    badge: 'Truyền thông',
    badgeColor: 'bg-pink-50 text-pink-700 border-pink-200/80',
    icon: <Megaphone className="w-4 h-4 text-pink-600" />,
    description: 'Chiến dịch tiếp thị, sản xuất nội dung số, duyệt ấn phẩm thiết kế đồ họa.',
    tags: ['Chiến dịch', 'Content', 'Design', 'Quảng cáo'],
    defaultPrefix: 'Dự án Marketing',
  },
  {
    id: 'logistics',
    name: 'Vận tải & Chuỗi cung ứng',
    badge: 'Vận hành',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/80',
    icon: <Truck className="w-4 h-4 text-amber-600" />,
    description: 'Điều phối vận chuyển hàng hóa, theo dõi lộ trình đơn vận, kho bãi giao nhận.',
    tags: ['Đơn vận', 'Kho bãi', 'Lộ trình', 'Giao hàng'],
    defaultPrefix: 'Dự án Vận tải',
  },
  {
    id: 'support',
    name: 'Dịch vụ & Chăm sóc KH',
    badge: 'Hỗ trợ',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200/80',
    icon: <Headphones className="w-4 h-4 text-teal-600" />,
    description: 'Tiếp nhận ticket khiếu nại, phân luồng sự cố theo cam kết thời gian SLA.',
    tags: ['Ticket', 'SLA Khẩn', 'Hỗ trợ', 'Đánh giá'],
    defaultPrefix: 'Dự án Hỗ trợ KH',
  },
]

export const METHOD_DETAILS: Record<AgileMethod, MethodDetails> = {
  kanban: {
    features: [
      'Bảng luồng việc liên tục (Continuous Flow)',
      'Giới hạn công việc đang xử lý (WIP Limits)',
      'Đo lường thời gian chu kỳ (Cycle & Lead Time)',
      'Phân luồng thẻ công việc theo mức độ ưu tiên',
    ],
    workflow: [
      { label: 'Cần làm', color: 'bg-slate-100 text-slate-700 border-slate-200' },
      { label: 'Đang làm', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      { label: 'Kiểm tra', color: 'bg-amber-50 text-amber-700 border-amber-200' },
      { label: 'Hoàn thành', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    ],
    issueTypes: [
      { label: 'Tác vụ', color: 'bg-blue-100 text-blue-700' },
      { label: 'Cải tiến', color: 'bg-emerald-100 text-emerald-700' },
      { label: 'Lỗi (Bug)', color: 'bg-rose-100 text-rose-700' },
    ],
  },
  scrum: {
    features: [
      'Chu kỳ Sprint cố định (1 - 4 tuần)',
      'Ước tính Story Points & Quản lý Backlog',
      'Biểu đồ Burn-down Chart & Vận tốc Sprint',
      'Định hình mục tiêu Sprint Goal rõ ràng',
    ],
    workflow: [
      { label: 'Sprint Backlog', color: 'bg-purple-50 text-purple-700 border-purple-200' },
      { label: 'Đang xử lý', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      { label: 'Nghiệm thu (QA)', color: 'bg-amber-50 text-amber-700 border-amber-200' },
      { label: 'Hoàn thành', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    ],
    issueTypes: [
      { label: 'Epic', color: 'bg-purple-100 text-purple-700' },
      { label: 'Story', color: 'bg-emerald-100 text-emerald-700' },
      { label: 'Task', color: 'bg-blue-100 text-blue-700' },
      { label: 'Bug', color: 'bg-rose-100 text-rose-700' },
    ],
  },
  scrumban: {
    features: [
      'Kết hợp kéo việc Kanban với nhịp điệu Sprint',
      'Vùng đệm Sprint Buffer ngăn nghẽn cổ chai',
      'Hệ thống tự động kích hoạt bổ sung việc (Pull)',
      'Tối ưu thông lượng và giảm thời gian chờ',
    ],
    workflow: [
      { label: 'Sẵn sàng', color: 'bg-slate-100 text-slate-700 border-slate-200' },
      { label: 'Đang xử lý', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      { label: 'Vùng đệm Buffer', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      { label: 'Đã giao', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    ],
    issueTypes: [
      { label: 'Yêu cầu', color: 'bg-indigo-100 text-indigo-700' },
      { label: 'Tác vụ', color: 'bg-blue-100 text-blue-700' },
      { label: 'Khẩn cấp', color: 'bg-rose-100 text-rose-700' },
    ],
  },
}

/**
 * Tự động chuyển đổi tên dự án thành mã Key chuẩn quốc tế:
 * - Khử bỏ dấu tiếng Việt (ví dụ: "Dự án" -> "Du an")
 * - Lọc bỏ ký tự đặc biệt, chỉ giữ lại [A-Z0-9]
 * - Lấy chữ cái đầu của tối đa 5 từ
 */
export function generateProjectKey(name: string): string {
  if (!name.trim()) return 'PROJ'

  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')

  const words = normalized.trim().split(/\s+/)
  const letters = words
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, '')[0]?.toUpperCase() || '')
    .filter(Boolean)
    .join('')
    .slice(0, 5)

  return letters || 'PROJ'
}
