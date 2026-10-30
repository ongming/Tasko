import React, { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'

// Layouts (Tải trực tiếp để đảm bảo layout shell cố định không bị giật lag)
import MainLayout from '@/layouts/MainLayout'
import WorkspaceLayout from '@/layouts/WorkspaceLayout'
import ProjectLayout from '@/layouts/ProjectLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import GuestRoute from '@/components/auth/GuestRoute'

// Fallback skeleton loader tinh gọn chuẩn Linear / Impeccable
const PageLoadingFallback = () => (
  <div className="w-full h-full min-h-[360px] flex-1 flex items-center justify-center p-8 animate-in fade-in duration-150">
    <div className="flex flex-col items-center gap-2.5">
      <div className="w-7 h-7 rounded-full border-2 border-indigo-100 border-t-indigo-600 animate-spin" />
      <span className="text-xs font-medium text-slate-400">Đang tải trang...</span>
    </div>
  </div>
)

const withSuspense = (Component: React.LazyExoticComponent<React.ComponentType<any>>) => (
  <Suspense fallback={<PageLoadingFallback />}>
    <Component />
  </Suspense>
)

// Public Pages (Lazy Loaded Chunks)
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'))

// Workspace Project Pages (Lazy Loaded Chunks)
const KanbanBoardView = lazy(() => import('@/pages/workspace/KanbanBoardView'))
const BacklogView = lazy(() => import('@/pages/workspace/BacklogView'))
const TimelineView = lazy(() => import('@/pages/workspace/TimelineView'))
const CalendarView = lazy(() => import('@/pages/workspace/CalendarView'))
const GanttView = lazy(() => import('@/pages/workspace/GanttView'))
const ControlBoardView = lazy(() => import('@/pages/workspace/ControlBoardView'))

// Workspace Management Pages (Lazy Loaded Chunks)
const OverviewPage = lazy(() => import('@/pages/workspace/OverviewPage'))
const ProjectsPage = lazy(() => import('@/pages/workspace/ProjectsPage'))
const CreateProjectPage = lazy(() => import('@/pages/workspace/CreateProjectPage'))
const MembersPage = lazy(() => import('@/pages/workspace/MembersPage'))
const SettingsPage = lazy(() => import('@/pages/workspace/SettingsPage'))

/**
 * Cấu hình Router hiện đại (Data Router) theo chuẩn React Router v6.4+ / v7
 * Đã áp dụng Route-based Code Splitting (React.lazy + Suspense)
 */
export const router = createBrowserRouter([
  // 1. Phân hệ Public (Landing Page có Header & Footer ngoài)
  {
    path: '/',
    element: (
      <MainLayout>
        {withSuspense(LandingPage)}
      </MainLayout>
    ),
  },

  // 2. Authentication (Đăng nhập & Đăng ký - Ngăn người dùng đã login vào lại)
  {
    path: '/login',
    element: (
      <GuestRoute>
        {withSuspense(LoginPage)}
      </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        {withSuspense(RegisterPage)}
      </GuestRoute>
    ),
  },
  {
    path: '/verify-email',
    element: withSuspense(VerifyEmailPage),
  },
  {
    path: '/signup',
    element: <Navigate to="/register" replace />,
  },
  {
    path: '/signin',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/auth/login',
    element: <Navigate to="/login" replace />,
  },

  // 3. Phân hệ Workspace (Layout có Sidebar & Topbar cố định - Đòi hỏi Đăng nhập)
  {
    path: '/workspace',
    element: (
      <ProtectedRoute>
        <WorkspaceLayout />
      </ProtectedRoute>
    ),
    children: [
      // Khi gõ đúng /workspace thì tự chuyển tiếp vào trang Tổng quan /overview
      {
        index: true,
        element: <Navigate to="overview" replace />,
      },
      // Phân hệ chế độ xem dự án (Project Layout: Header cố định khi cuộn + Dynamic Tabs)
      {
        element: <ProjectLayout />,
        children: [
          {
            path: 'board',
            element: withSuspense(KanbanBoardView),
          },
          {
            path: 'kanban',
            element: withSuspense(KanbanBoardView),
          },
          {
            path: 'control',
            element: withSuspense(ControlBoardView),
          },
          {
            path: 'backlog',
            element: withSuspense(BacklogView),
          },
          {
            path: 'timeline',
            element: withSuspense(TimelineView),
          },
          {
            path: 'calendar',
            element: withSuspense(CalendarView),
          },
          {
            path: 'gantt',
            element: withSuspense(GanttView),
          },
        ],
      },

      // Các trang quản lý trên thanh Sidebar
      {
        path: 'overview',
        element: withSuspense(OverviewPage),
      },
      {
        path: 'projects',
        element: withSuspense(ProjectsPage),
      },
      {
        path: 'projects/new',
        element: withSuspense(CreateProjectPage),
      },
      {
        path: 'members',
        element: withSuspense(MembersPage),
      },
      {
        path: 'settings',
        element: withSuspense(SettingsPage),
      },

      // Redirect tương thích
      {
        path: 'sprint',
        element: <Navigate to="backlog" replace />,
      },
      {
        path: 'tasks',
        element: <Navigate to="board" replace />,
      },
    ],
  },

  // 4. Catch-all: Bất kỳ URL nào không khớp sẽ chuyển về trang chủ
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export function AppRoutes() {
  return <RouterProvider router={router} />
}

export default AppRoutes
