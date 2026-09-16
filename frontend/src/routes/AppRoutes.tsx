import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermission } from '../hooks/usePermission';
import { PERMISSIONS } from '../constants/permissions';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { ProjectDetailPage } from '../pages/ProjectDetailPage';
import { TasksPage } from '../pages/TasksPage';
import { GanttPage } from '../pages/GanttPage';
import { EmployeesPage } from '../pages/EmployeesPage';
import { EmployeeDetailPage } from '../pages/EmployeeDetailPage';
import { ReportsPage } from '../pages/ReportsPage';
import { RolesPage } from '../pages/RolesPage';
import { LoginHistoryPage } from '../pages/LoginHistoryPage';
import { ForbiddenPage } from '../pages/ForbiddenPage';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#0f172a' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ permission, children }) => {
  const { can, isSuperAdmin } = usePermission();

  if (isSuperAdmin || can(permission)) {
    return <>{children}</>;
  }

  return <ForbiddenPage />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        
        <Route
          path="projects"
          element={
            <PermissionGuard permission={PERMISSIONS.PROJECTS_VIEW}>
              <ProjectsPage />
            </PermissionGuard>
          }
        />
        <Route
          path="projects/:id"
          element={
            <PermissionGuard permission={PERMISSIONS.PROJECTS_VIEW}>
              <ProjectDetailPage />
            </PermissionGuard>
          }
        />
        
        <Route
          path="tasks"
          element={
            <PermissionGuard permission={PERMISSIONS.TASKS_VIEW}>
              <TasksPage />
            </PermissionGuard>
          }
        />
        
        <Route
          path="gantt"
          element={
            <PermissionGuard permission={PERMISSIONS.GANTT_VIEW}>
              <GanttPage />
            </PermissionGuard>
          }
        />
        
        <Route
          path="employees"
          element={
            <PermissionGuard permission={PERMISSIONS.EMPLOYEES_VIEW}>
              <EmployeesPage />
            </PermissionGuard>
          }
        />
        <Route
          path="employees/:id"
          element={
            <PermissionGuard permission={PERMISSIONS.EMPLOYEES_VIEW}>
              <EmployeeDetailPage />
            </PermissionGuard>
          }
        />
        
        <Route
          path="reports"
          element={
            <PermissionGuard permission={PERMISSIONS.REPORTS_VIEW}>
              <ReportsPage />
            </PermissionGuard>
          }
        />
        
        <Route
          path="roles"
          element={
            <PermissionGuard permission={PERMISSIONS.ROLES_VIEW}>
              <RolesPage />
            </PermissionGuard>
          }
        />
        
        <Route
          path="login-history"
          element={
            <PermissionGuard permission={PERMISSIONS.AUDIT_VIEW_SESSIONS}>
              <LoginHistoryPage />
            </PermissionGuard>
          }
        />

        <Route path="forbidden" element={<ForbiddenPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
