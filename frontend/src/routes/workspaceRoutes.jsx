import React from 'react'
import { Navigate } from 'react-router-dom'

// Workspace sub-pages
import BoardView from '@/pages/workspace/BoardView'
import BacklogView from '@/pages/workspace/BacklogView'
import TimelineView from '@/pages/workspace/TimelineView'
import GanttView from '@/pages/workspace/GanttView'
import CalendarView from '@/pages/workspace/CalendarView'
import ControlBoardView from '@/pages/workspace/ControlBoardView'
import OverviewPage from '@/pages/workspace/OverviewPage'
import ProjectsPage from '@/pages/workspace/ProjectsPage'
import MembersPage from '@/pages/workspace/MembersPage'
import SettingsPage from '@/pages/workspace/SettingsPage'

/**
 * Cấu hình toàn bộ Route cho phân hệ Workspace
 * Bao gồm các tab dự án (Control Board, Backlog, Timeline...) và menu điều hướng bên trái
 */
export const workspaceRoutes = [
  // Mặc định chuyển hướng vào Control Board khi vào /workspace
  { index: true, element: <Navigate to="/workspace/board" replace /> },
  
  // Các dạng xem dự án chính
  { path: 'board', element: <BoardView /> },
  { path: 'backlog', element: <BacklogView /> },
  { path: 'timeline', element: <TimelineView /> },
  { path: 'sprint', element: <Navigate to="/workspace/backlog" replace /> },
  { path: 'gantt', element: <GanttView /> },
  { path: 'calendar', element: <CalendarView /> },
  { path: 'control', element: <ControlBoardView /> },

  // Các mục quản lý trên thanh Sidebar
  { path: 'overview', element: <OverviewPage /> },
  { path: 'projects', element: <ProjectsPage /> },
  { path: 'tasks', element: <Navigate to="/workspace/board" replace /> },
  { path: 'members', element: <MembersPage /> },
  { path: 'settings', element: <SettingsPage /> },
]

export default workspaceRoutes
