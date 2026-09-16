/**
 * System Permission Codes and Mappings
 */

export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',
  DASHBOARD_VIEW_PROJECT: 'dashboard.view_project',
  DASHBOARD_VIEW_ALL: 'dashboard.view_all',

  // Projects
  PROJECTS_VIEW: 'projects.view',
  PROJECTS_VIEW_PROJECT: 'projects.view_project',
  PROJECTS_VIEW_ALL: 'projects.view_all',
  PROJECTS_CREATE: 'projects.create',
  PROJECTS_EDIT: 'projects.edit',
  PROJECTS_DELETE: 'projects.delete',
  PROJECTS_MANAGE_MEMBERS: 'projects.manage_members',

  // Tasks
  TASKS_VIEW: 'tasks.view',
  TASKS_VIEW_PROJECT: 'tasks.view_project',
  TASKS_VIEW_ALL: 'tasks.view_all',
  TASKS_CREATE: 'tasks.create',
  TASKS_EDIT: 'tasks.edit',
  TASKS_DELETE: 'tasks.delete',
  TASKS_UPDATE_STATUS: 'tasks.update_status',
  TASKS_UPDATE_PROGRESS: 'tasks.update_progress',
  TASKS_COMMENT: 'tasks.comment',

  // Gantt
  GANTT_VIEW: 'gantt.view',
  GANTT_VIEW_PROJECT: 'gantt.view_project',
  GANTT_VIEW_ALL: 'gantt.view_all',

  // Employees
  EMPLOYEES_VIEW: 'employees.view',
  EMPLOYEES_CREATE: 'employees.create',
  EMPLOYEES_EDIT: 'employees.edit',
  EMPLOYEES_DELETE: 'employees.delete',
  EMPLOYEES_RESET_PASSWORD: 'employees.reset_password',

  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_VIEW_PROJECT: 'reports.view_project',
  REPORTS_VIEW_ALL: 'reports.view_all',
  REPORTS_EXPORT: 'reports.export',

  // Roles
  ROLES_VIEW: 'roles.view',
  ROLES_MANAGE: 'roles.manage',

  // Audit Logs
  AUDIT_VIEW_SESSIONS: 'audit.view_sessions',
} as const;

export const PERMISSION_LABELS: Record<string, string> = {
  // Dashboard
  [PERMISSIONS.DASHBOARD_VIEW]: 'Xem tổng quan cá nhân',
  [PERMISSIONS.DASHBOARD_VIEW_PROJECT]: 'Xem tổng quan dự án tham gia',
  [PERMISSIONS.DASHBOARD_VIEW_ALL]: 'Xem toàn bộ tổng quan hệ thống',

  // Projects
  [PERMISSIONS.PROJECTS_VIEW]: 'Xem dự án cá nhân',
  [PERMISSIONS.PROJECTS_VIEW_PROJECT]: 'Xem dự án tham gia',
  [PERMISSIONS.PROJECTS_VIEW_ALL]: 'Xem toàn bộ dự án hệ thống',
  [PERMISSIONS.PROJECTS_CREATE]: 'Tạo dự án mới',
  [PERMISSIONS.PROJECTS_EDIT]: 'Chỉnh sửa dự án',
  [PERMISSIONS.PROJECTS_DELETE]: 'Xóa dự án khỏi hệ thống',
  [PERMISSIONS.PROJECTS_MANAGE_MEMBERS]: 'Quản lý thành viên ban dự án',

  // Tasks (WBS)
  [PERMISSIONS.TASKS_VIEW]: 'Xem công việc cá nhân',
  [PERMISSIONS.TASKS_VIEW_PROJECT]: 'Xem công việc dự án tham gia',
  [PERMISSIONS.TASKS_VIEW_ALL]: 'Xem toàn bộ công việc hệ thống',
  [PERMISSIONS.TASKS_CREATE]: 'Tạo công việc / hạng mục',
  [PERMISSIONS.TASKS_EDIT]: 'Chỉnh sửa thông tin công việc',
  [PERMISSIONS.TASKS_DELETE]: 'Xóa hạng mục công việc',
  [PERMISSIONS.TASKS_UPDATE_STATUS]: 'Cập nhật trạng thái công việc',
  [PERMISSIONS.TASKS_UPDATE_PROGRESS]: 'Cập nhật tiến độ % hoàn thành',
  [PERMISSIONS.TASKS_COMMENT]: 'Bình luận & phản hồi kỹ thuật',

  // Gantt Chart
  [PERMISSIONS.GANTT_VIEW]: 'Xem tiến độ Gantt cá nhân',
  [PERMISSIONS.GANTT_VIEW_PROJECT]: 'Xem tiến độ Gantt dự án tham gia',
  [PERMISSIONS.GANTT_VIEW_ALL]: 'Xem toàn bộ tiến độ Gantt hệ thống',

  // Employees & Workload
  [PERMISSIONS.EMPLOYEES_VIEW]: 'Xem danh sách nhân sự',
  [PERMISSIONS.EMPLOYEES_CREATE]: 'Thêm nhân sự mới',
  [PERMISSIONS.EMPLOYEES_EDIT]: 'Sửa thông tin & vai trò nhân sự',
  [PERMISSIONS.EMPLOYEES_DELETE]: 'Khóa / Xóa tài khoản nhân sự',
  [PERMISSIONS.EMPLOYEES_RESET_PASSWORD]: 'Đặt lại mật khẩu nhân viên',

  // Reports & Analytics
  [PERMISSIONS.REPORTS_VIEW]: 'Xem báo cáo cá nhân',
  [PERMISSIONS.REPORTS_VIEW_PROJECT]: 'Xem báo cáo dự án tham gia',
  [PERMISSIONS.REPORTS_VIEW_ALL]: 'Xem toàn bộ báo cáo hệ thống',
  [PERMISSIONS.REPORTS_EXPORT]: 'Xuất báo cáo (Excel / CSV)',

  // Roles & Permissions Matrix
  [PERMISSIONS.ROLES_VIEW]: 'Xem danh sách vai trò',
  [PERMISSIONS.ROLES_MANAGE]: 'Quản lý vai trò & ma trận phân quyền',

  // Audit Logs
  [PERMISSIONS.AUDIT_VIEW_SESSIONS]: 'Xem nhật ký đăng nhập & hoạt động',
};
