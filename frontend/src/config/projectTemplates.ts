import { Briefcase, Code2, Megaphone, TrendingUp } from 'lucide-react'
import type { ProjectTemplate } from '@/types/projectTemplate'

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'default',
    name: 'Mặc định / Đa dụng',
    badge: 'Phổ biến',
    description: 'Quản lý tác vụ thông thường, dự án hỗn hợp và phối hợp phòng ban.',
    tags: ['Tác vụ', 'Ưu tiên', 'Hạn chót', 'Ghi chú'],
    workTypes: ['Module', 'Task', 'Bug'],
    workflow: ['Cần làm', 'Đang làm', 'Kiểm tra', 'Hoàn thành'],
    icon: Briefcase,
    defaultPrefix: 'Dự án Đa dụng',
  },
  {
    id: 'software',
    name: 'Lập trình & Công nghệ',
    badge: 'Chuẩn IT',
    description: 'Đội ngũ kỹ thuật, chu kỳ phát hành, theo dõi lỗi và pull request.',
    tags: ['Tính năng', 'Lỗi (Bug)', 'Refactor', 'Release'],
    workTypes: ['Module', 'Task', 'Bug'],
    workflow: ['Backlog', 'Đang làm', 'Code review', 'Kiểm thử', 'Hoàn thành'],
    icon: Code2,
    defaultPrefix: 'Dự án Phần mềm',
  },
  {
    id: 'marketing',
    name: 'Marketing & Sáng tạo',
    badge: 'Truyền thông',
    description: 'Chiến dịch tiếp thị, sản xuất nội dung và duyệt ấn phẩm thiết kế.',
    tags: ['Chiến dịch', 'Content', 'Design', 'Quảng cáo'],
    workTypes: ['Chiến dịch', 'Nội dung', 'Thiết kế'],
    workflow: ['Ý tưởng', 'Đang soạn', 'Chờ duyệt', 'Đã duyệt', 'Đã đăng'],
    icon: Megaphone,
    defaultPrefix: 'Dự án Marketing',
  },
  {
    id: 'sales',
    name: 'Kinh doanh & Bán hàng',
    badge: 'Tăng trưởng',
    description: 'Phễu khách hàng (pipeline), hợp đồng mua bán, đối tác và mục tiêu doanh số.',
    tags: ['Khách hàng', 'Hợp đồng', 'Chốt đơn', 'KPI'],
    workTypes: ['Khách hàng tiềm năng', 'Cơ hội', 'Hợp đồng'],
    workflow: ['Tiềm năng', 'Đã liên hệ', 'Báo giá', 'Đàm phán', 'Chốt đơn'],
    icon: TrendingUp,
    defaultPrefix: 'Dự án Kinh doanh',
  },
]
