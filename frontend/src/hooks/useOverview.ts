import { useState, useMemo, useCallback } from 'react'
import type {
  OverviewStats,
  MyTaskItem,
  ProjectSummary,
  DailyVelocity,
  TeamMemberStatus,
  ActivityItem,
  TaskCategory,
  NewTaskPayload,
} from '../types/overview'

const INITIAL_STATS: OverviewStats = {
  activeProjects: {
    count: 3,
    change: '+1 so với tháng trước',
    quarter: 'Q4/2024',
  },
  tasksToday: {
    count: 6,
    highPriorityCount: 2,
    deadline: 'Hạn chót 18:00',
  },
  sprintProgress: {
    sprintName: 'Sprint 14',
    percent: 78,
    currentPoints: 32,
    totalPoints: 41,
    daysLeft: 3,
  },
  onlineMembers: {
    count: 9,
    total: 12,
    avatars: [
      { id: '1', name: 'Nguyễn An', initials: 'NA', bg: 'bg-indigo-600' },
      { id: '2', name: 'Trần Bình', initials: 'TB', bg: 'bg-blue-600' },
      { id: '3', name: 'Lê Mai', initials: 'LM', bg: 'bg-sky-600' },
      { id: '4', name: 'Tuấn Vũ', initials: 'TV', bg: 'bg-slate-700' },
    ],
  },
}

const INITIAL_TASKS: MyTaskItem[] = [
  {
    id: 'task-1',
    key: 'WR-104',
    title: 'Phát triển API đăng nhập & xác thực JWT',
    project: 'Website Redesign',
    priority: 'high',
    dueTime: '17:00',
    assignee: { name: 'Quang Minh', initials: 'QM', bg: 'bg-indigo-600' },
    completed: false,
    category: 'today',
  },
  {
    id: 'task-2',
    key: 'WR-105',
    title: 'Tích hợp cổng thanh toán VNPAY / MoMo',
    project: 'Website Redesign',
    priority: 'high',
    dueTime: 'Hôm nay',
    assignee: { name: 'Trần Bình', initials: 'TB', bg: 'bg-blue-600' },
    completed: false,
    category: 'today',
  },
  {
    id: 'task-3',
    key: 'MA-22',
    title: 'Tối ưu hóa thời gian tải ứng dụng Flutter',
    project: 'Mobile App',
    priority: 'medium',
    dueTime: 'Ngày mai',
    assignee: { name: 'Nguyễn An', initials: 'NA', bg: 'bg-indigo-600' },
    completed: false,
    category: 'in_progress',
  },
  {
    id: 'task-4',
    key: 'BE-88',
    title: 'Viết WebSocket Channel cho realtime Board updates',
    project: 'Backend API',
    priority: 'high',
    dueTime: '30/10',
    assignee: { name: 'Quang Minh', initials: 'QM', bg: 'bg-indigo-600' },
    completed: false,
    category: 'in_progress',
  },
  {
    id: 'task-5',
    key: 'WR-106',
    title: 'Tối ưu thẻ OpenGraph & SEO kĩ thuật',
    project: 'Website Redesign',
    priority: 'low',
    dueTime: '01/11',
    assignee: { name: 'Lê Mai', initials: 'LM', bg: 'bg-slate-700' },
    completed: false,
    category: 'today',
  },
  {
    id: 'task-6',
    key: 'WR-101',
    title: 'Nghiên cứu đối thủ cạnh tranh & khảo sát người dùng',
    project: 'Website Redesign',
    priority: 'high',
    dueTime: 'Hôm qua',
    assignee: { name: 'Quang Minh', initials: 'QM', bg: 'bg-indigo-600' },
    completed: false,
    category: 'overdue',
  },
  {
    id: 'task-7',
    key: 'WR-100',
    title: 'Tạo wireframe kiến trúc luồng dữ liệu ban đầu',
    project: 'Website Redesign',
    priority: 'medium',
    dueTime: '26/10',
    assignee: { name: 'Lê Mai', initials: 'LM', bg: 'bg-slate-700' },
    completed: true,
    category: 'completed',
  },
]

const INITIAL_PROJECTS: ProjectSummary[] = [
  {
    id: 'proj-1',
    code: 'WR',
    sprint: 'Sprint 14',
    statusTag: 'Đúng tiến độ',
    statusColor: 'emerald',
    title: 'Website Redesign',
    description: 'Thiết kế lại luồng người dùng & Checkout Portal',
    progress: 82,
    tasksCount: 18,
    bugsCount: 2,
    lead: { name: 'Nguyễn An', initials: 'NA', bg: 'bg-indigo-600' },
    boardRoute: '/workspace/board',
  },
  {
    id: 'proj-2',
    code: 'MA',
    sprint: 'Kanban',
    statusTag: 'WIP: 4/6',
    statusColor: 'indigo',
    title: 'Mobile App Flutter',
    description: 'Phát hành bản v2.4 trên App Store và Google Play',
    progress: 45,
    tasksCount: 9,
    bugsCount: 0,
    lead: { name: 'Trần Bình', initials: 'TB', bg: 'bg-blue-600' },
    boardRoute: '/workspace/kanban',
  },
  {
    id: 'proj-3',
    code: 'BE',
    sprint: 'Scrumban',
    statusTag: 'WIP: 5/8',
    statusColor: 'purple',
    title: 'Backend API NestJS',
    description: 'Refactor kiến trúc microservices và Kafka bus',
    progress: 60,
    tasksCount: 12,
    bugsCount: 1,
    lead: { name: 'Quang Minh', initials: 'QM', bg: 'bg-slate-700' },
    boardRoute: '/workspace/control',
  },
]

const VELOCITY_DATA: DailyVelocity[] = [
  { day: 'T2', tasks: 5 },
  { day: 'T3', tasks: 8 },
  { day: 'T4', tasks: 11, isPeak: true },
  { day: 'T5', tasks: 6, isToday: true },
  { day: 'T6', tasks: 9, isProjected: true },
]

const TEAM_MEMBERS: TeamMemberStatus[] = [
  {
    id: 'mem-1',
    name: 'Nguyễn An',
    role: 'Lead Frontend',
    initials: 'NA',
    bg: 'bg-indigo-600',
    statusText: 'Đang xem WR-104',
    statusDotColor: 'bg-emerald-500',
    statusBadgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
  },
  {
    id: 'mem-2',
    name: 'Trần Bình',
    role: 'Mobile Flutter',
    initials: 'TB',
    bg: 'bg-blue-600',
    statusText: 'Sẵn sàng nhận việc',
    statusDotColor: 'bg-blue-500',
    statusBadgeColor: 'bg-blue-50 text-blue-700 border-blue-200/50',
  },
  {
    id: 'mem-3',
    name: 'Lê Thị Mai',
    role: 'UI/UX Designer',
    initials: 'LM',
    bg: 'bg-violet-600',
    statusText: 'Thiết kế Figma',
    statusDotColor: 'bg-violet-500',
    statusBadgeColor: 'bg-violet-50 text-violet-700 border-violet-200/50',
  },
  {
    id: 'mem-4',
    name: 'Tuấn Vũ',
    role: 'DevOps Engineer',
    initials: 'TV',
    bg: 'bg-slate-700',
    statusText: 'Review PR #41',
    statusDotColor: 'bg-amber-500',
    statusBadgeColor: 'bg-amber-50 text-amber-800 border-amber-200/50',
  },
]

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    user: 'Trần Bình',
    action: 'vừa chuyển thẻ',
    taskKey: 'WR-109',
    status: 'Hoàn thành',
    time: '10 phút trước',
    dotColor: 'bg-emerald-500',
  },
  {
    id: 'act-2',
    user: 'Nguyễn An',
    action: 'đã khởi tạo',
    target: 'Sprint 15: Tích hợp AI Core',
    time: '45 phút trước',
    dotColor: 'bg-indigo-600',
  },
  {
    id: 'act-3',
    action: 'Tasko AI Copilot',
    isAi: true,
    aiDescription:
      'Đã tự động trích xuất thành công 12 User Stories và gán Story Points từ tài liệu PRD.',
    time: '2 giờ trước',
    dotColor: 'bg-purple-600',
  },
  {
    id: 'act-4',
    user: 'Lê Thị Mai',
    action: 'đã để lại phản hồi trên thẻ',
    taskKey: 'WR-102',
    time: '3 giờ trước',
    dotColor: 'bg-slate-500',
  },
]

export function useOverview() {
  const [activeTab, setActiveTab] = useState<TaskCategory>('today')
  const [tasks, setTasks] = useState<MyTaskItem[]>(INITIAL_TASKS)
  const [stats] = useState<OverviewStats>(INITIAL_STATS)
  const [projects] = useState<ProjectSummary[]>(INITIAL_PROJECTS)
  const [velocity] = useState<DailyVelocity[]>(VELOCITY_DATA)
  const [teamMembers] = useState<TeamMemberStatus[]>(TEAM_MEMBERS)
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Toggle task completion
  const handleToggleTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed
          return {
            ...t,
            completed: nextCompleted,
            category: nextCompleted ? 'completed' : 'today',
          }
        }
        return t
      })
    )
  }, [])

  // Create task
  const handleCreateTask = useCallback((payload: NewTaskPayload) => {
    const nextKeyNum = 110 + Math.floor(Math.random() * 50)
    const newTask: MyTaskItem = {
      id: `task-${Date.now()}`,
      key: `WR-${nextKeyNum}`,
      title: payload.title,
      project: payload.project,
      priority: payload.priority,
      dueTime: 'Hôm nay',
      assignee: { name: 'Quang Minh', initials: 'QM', bg: 'bg-indigo-600' },
      completed: false,
      category: 'today',
    }

    setTasks((prev) => [newTask, ...prev])
    setIsCreateModalOpen(false)

    // Add activity record
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        user: 'Quang Minh',
        action: 'vừa tạo nhiệm vụ mới',
        taskKey: newTask.key,
        time: 'Vừa xong',
        dotColor: 'bg-indigo-600',
      },
      ...prev,
    ])
  }, [])

  // Counts for tabs
  const tabCounts = useMemo(() => {
    return {
      today: tasks.filter((t) => t.category === 'today' && !t.completed).length,
      in_progress: tasks.filter((t) => t.category === 'in_progress' && !t.completed).length,
      overdue: tasks.filter((t) => t.category === 'overdue' && !t.completed).length,
      completed: tasks.filter((t) => t.completed || t.category === 'completed').length,
    }
  }, [tasks])

  // Filtered tasks based on activeTab
  const filteredTasks = useMemo(() => {
    if (activeTab === 'completed') {
      return tasks.filter((t) => t.completed || t.category === 'completed')
    }
    return tasks.filter((t) => t.category === activeTab && !t.completed)
  }, [tasks, activeTab])

  return {
    stats,
    projects,
    velocity,
    teamMembers,
    activities,
    activeTab,
    tabCounts,
    filteredTasks,
    isCreateModalOpen,
    setActiveTab,
    handleToggleTask,
    handleCreateTask,
    openCreateModal: () => setIsCreateModalOpen(true),
    closeCreateModal: () => setIsCreateModalOpen(false),
  }
}
