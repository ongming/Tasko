import React from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'

// Layouts
import MainLayout from '@/layouts/MainLayout'
import WorkspaceLayout from '@/layouts/WorkspaceLayout'

// Public Pages
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

// Workspace Pages
import BoardView from '@/pages/workspace/BoardView'
import BacklogView from '@/pages/workspace/BacklogView'
import TimelineView from '@/pages/workspace/TimelineView'
import CalendarView from '@/pages/workspace/CalendarView'
import GanttView from '@/pages/workspace/GanttView'
import ControlBoardView from '@/pages/workspace/ControlBoardView'
import OverviewPage from '@/pages/workspace/OverviewPage'
import ProjectsPage from '@/pages/workspace/ProjectsPage'
import MembersPage from '@/pages/workspace/MembersPage'
import SettingsPage from '@/pages/workspace/SettingsPage'

/**
 * Cấu hình Router hiện đại (Data Router) theo chuẩn React Router v6.4+ / v7
 * Sử dụng createBrowserRouter nhận vào cây mảng Object (Route Objects)
 */
export const router = createBrowserRouter([
  // 1. Phân hệ Public (Landing Page có Header & Footer ngoài)
  {
    path: '/',
    element: (
      <MainLayout>
        <LandingPage />
      </MainLayout>
    ),
  },

  // 2. Authentication (Đăng nhập & Đăng ký)
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
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

  // 3. Phân hệ Workspace (Layout có Sidebar & Topbar cố định)
  {
    path: '/workspace',
    element: <WorkspaceLayout />,
    children: [
      // Khi gõ đúng /workspace thì tự chuyển tiếp vào /workspace/board
      {
        index: true,
        element: <Navigate to="board" replace />,
      },
      // Các chế độ xem công việc của dự án
      {
        path: 'board',
        element: <BoardView />,
      },
      {
        path: 'backlog',
        element: <BacklogView />,
      },
      {
        path: 'timeline',
        element: <TimelineView />,
      },
      {
        path: 'calendar',
        element: <CalendarView />,
      },
      {
        path: 'gantt',
        element: <GanttView />,
      },
      {
        path: 'control',
        element: <ControlBoardView />,
      },

      // Các trang quản lý trên thanh Sidebar
      {
        path: 'overview',
        element: <OverviewPage />,
      },
      {
        path: 'projects',
        element: <ProjectsPage />,
      },
      {
        path: 'members',
        element: <MembersPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
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

  // 3. Catch-all: Bất kỳ URL nào không khớp sẽ chuyển về trang chủ
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

/**
 * Component AppRoutes cung cấp Router cho toàn bộ ứng dụng
 */
export function AppRoutes() {
  return <RouterProvider router={router} />
}

export default AppRoutes
