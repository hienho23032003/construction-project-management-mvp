import React, { lazy } from 'react';
import { ROUTERS_PATHS } from '../constants/router-paths';
import { PERMISSIONS } from '../constants/permissions';

export interface RouteConfig {
  path?: string;
  index?: boolean;
  component: React.ComponentType<any>;
  permission?: string;
  title?: string;
}

// Page import factories
const pageLoaders = {
  LoginPage: () => import('../pages/LoginPage'),
  DashboardPage: () => import('../pages/DashboardPage'),
  ProjectsPage: () => import('../pages/ProjectsPage'),
  ProjectDetailPage: () => import('../pages/ProjectDetailPage'),
  TasksPage: () => import('../pages/TasksPage'),
  GanttPage: () => import('../pages/GanttPage'),
  EmployeesPage: () => import('../pages/EmployeesPage'),
  EmployeeDetailPage: () => import('../pages/EmployeeDetailPage'),
  ReportsPage: () => import('../pages/ReportsPage'),
  RolesPage: () => import('../pages/RolesPage'),
  LoginHistoryPage: () => import('../pages/LoginHistoryPage'),
  ChatPage: () => import('../pages/ChatPage'),
  ForbiddenPage: () => import('../pages/ForbiddenPage'),
};

// Lazy load page components for optimal bundle splitting and performance
export const LoginPage = lazy(() => pageLoaders.LoginPage().then((m) => ({ default: m.LoginPage })));
export const DashboardPage = lazy(() => pageLoaders.DashboardPage().then((m) => ({ default: m.DashboardPage })));
export const ProjectsPage = lazy(() => pageLoaders.ProjectsPage().then((m) => ({ default: m.ProjectsPage })));
export const ProjectDetailPage = lazy(() => pageLoaders.ProjectDetailPage().then((m) => ({ default: m.ProjectDetailPage })));
export const TasksPage = lazy(() => pageLoaders.TasksPage().then((m) => ({ default: m.TasksPage })));
export const GanttPage = lazy(() => pageLoaders.GanttPage().then((m) => ({ default: m.GanttPage })));
export const EmployeesPage = lazy(() => pageLoaders.EmployeesPage().then((m) => ({ default: m.EmployeesPage })));
export const EmployeeDetailPage = lazy(() => pageLoaders.EmployeeDetailPage().then((m) => ({ default: m.EmployeeDetailPage })));
export const ReportsPage = lazy(() => pageLoaders.ReportsPage().then((m) => ({ default: m.ReportsPage })));
export const RolesPage = lazy(() => pageLoaders.RolesPage().then((m) => ({ default: m.RolesPage })));
export const LoginHistoryPage = lazy(() => pageLoaders.LoginHistoryPage().then((m) => ({ default: m.LoginHistoryPage })));
export const ChatPage = lazy(() => pageLoaders.ChatPage().then((m) => ({ default: m.ChatPage })));
export const ForbiddenPage = lazy(() => pageLoaders.ForbiddenPage().then((m) => ({ default: m.ForbiddenPage })));

/**
 * Prefetches all main routes during browser idle time so clicking menu items loads instantly with 0 wait
 */
export const prefetchRoutes = () => {
  const prefetch = () => {
    pageLoaders.DashboardPage();
    pageLoaders.ProjectsPage();
    pageLoaders.TasksPage();
    pageLoaders.GanttPage();
    pageLoaders.EmployeesPage();
    pageLoaders.ReportsPage();
  };

  if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(prefetch);
    } else {
      setTimeout(prefetch, 1500);
    }
  }
};

export const protectedChildRoutes: RouteConfig[] = [
  {
    index: true,
    component: DashboardPage,
    title: 'Tổng Quan',
  },
  {
    path: 'projects',
    component: ProjectsPage,
    permission: PERMISSIONS.PROJECTS_VIEW,
    title: 'Công Trình & Dự Án',
  },
  {
    path: 'projects/:id',
    component: ProjectDetailPage,
    permission: PERMISSIONS.PROJECTS_VIEW,
    title: 'Chi Tiết Dự Án',
  },
  {
    path: 'tasks',
    component: TasksPage,
    permission: PERMISSIONS.TASKS_VIEW,
    title: 'Công Việc',
  },
  {
    path: 'gantt',
    component: GanttPage,
    permission: PERMISSIONS.GANTT_VIEW,
    title: 'Tiến Độ Gantt',
  },
  {
    path: 'employees',
    component: EmployeesPage,
    permission: PERMISSIONS.EMPLOYEES_VIEW,
    title: 'Nhân Sự & Workload',
  },
  {
    path: 'employees/:id',
    component: EmployeeDetailPage,
    permission: PERMISSIONS.EMPLOYEES_VIEW,
    title: 'Hồ Sơ Nhân Sự',
  },
  {
    path: 'reports',
    component: ReportsPage,
    permission: PERMISSIONS.REPORTS_VIEW,
    title: 'Báo Cáo & Xuất Dữ Liệu',
  },
  {
    path: 'roles',
    component: RolesPage,
    permission: PERMISSIONS.ROLES_VIEW,
    title: 'Phân Quyền & Vai Trò',
  },
  {
    path: 'login-history',
    component: LoginHistoryPage,
    permission: PERMISSIONS.AUDIT_VIEW_SESSIONS,
    title: 'Lịch Sử Đăng Nhập',
  },
  {
    path: 'chat',
    component: ChatPage,
    title: 'Trò Chuyện & Thảo Luận',
  },
  {
    path: 'forbidden',
    component: ForbiddenPage,
    title: 'Không Có Quyền Truy Cập',
  },
];
