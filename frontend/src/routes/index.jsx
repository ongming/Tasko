import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import MainLayout from '@/layouts/MainLayout'
import WorkspaceLayout from '@/layouts/WorkspaceLayout'

// Public Pages
import LandingPage from '@/pages/LandingPage'

// Modular Routes
import { workspaceRoutes } from './workspaceRoutes'

/**
 * Bộ định tuyến trung tâm của hệ thống Tasko
 * Tách biệt rõ ràng giữa Public Routes (Landing, Auth) và App Workspace Routes
 */
export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route
          path="/"
          element={
            <MainLayout>
              <LandingPage />
            </MainLayout>
          }
        />

        {/* ================= WORKSPACE ROUTES ================= */}
        <Route path="/workspace" element={<WorkspaceLayout />}>
          {workspaceRoutes.map((route, index) => {
            if (route.index) {
              return <Route key={`ws-idx-${index}`} index element={route.element} />
            }
            return <Route key={route.path} path={route.path} element={route.element} />
          })}
        </Route>

        {/* ================= CATCH-ALL ROUTE ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
