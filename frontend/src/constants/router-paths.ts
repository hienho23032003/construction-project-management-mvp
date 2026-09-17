export const ROUTERS_PATHS = {
  ALL: '/*',
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/',
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:id',
  TASKS: '/tasks',
  GANTT: '/gantt',
  EMPLOYEES: '/employees',
  EMPLOYEE_DETAIL: '/employees/:id',
  REPORTS: '/reports',
  ROLES: '/roles',
  LOGIN_HISTORY: '/login-history',
  FORBIDDEN: '/forbidden',
} as const;

export type RouterPaths = (typeof ROUTERS_PATHS)[keyof typeof ROUTERS_PATHS];
