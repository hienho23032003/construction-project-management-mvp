/**
 * System Permission Codes and Mappings
 */

export const PERMISSIONS = {
  // Projects
  PROJECTS_VIEW: 'projects.view',
  PROJECTS_CREATE: 'projects.create',
  PROJECTS_EDIT: 'projects.edit',
  PROJECTS_DELETE: 'projects.delete',
  PROJECTS_MANAGE_MEMBERS: 'projects.manage_members',

  // Tasks
  TASKS_VIEW: 'tasks.view',
  TASKS_CREATE: 'tasks.create',
  TASKS_EDIT: 'tasks.edit',
  TASKS_DELETE: 'tasks.delete',
  TASKS_UPDATE_STATUS: 'tasks.update_status',
  TASKS_UPDATE_PROGRESS: 'tasks.update_progress',
  TASKS_COMMENT: 'tasks.comment',

  // Gantt
  GANTT_VIEW: 'gantt.view',
  GANTT_VIEW_ALL: 'gantt.view_all',

  // Employees
  EMPLOYEES_VIEW: 'employees.view',
  EMPLOYEES_CREATE: 'employees.create',
  EMPLOYEES_EDIT: 'employees.edit',
  EMPLOYEES_DELETE: 'employees.delete',
  EMPLOYEES_RESET_PASSWORD: 'employees.reset_password',

  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',

  // Roles
  ROLES_VIEW: 'roles.view',
  ROLES_MANAGE: 'roles.manage',

  // Audit Logs
  AUDIT_VIEW_SESSIONS: 'audit.view_sessions',
} as const;

export const PERMISSION_LABELS: Record<string, string> = {
  // Projects
  [PERMISSIONS.PROJECTS_VIEW]: 'Xem dự án & công trình',
  [PERMISSIONS.PROJECTS_CREATE]: 'Tạo dự án mới',
  [PERMISSIONS.PROJECTS_EDIT]: 'Chỉnh sửa dự án',
  [PERMISSIONS.PROJECTS_DELETE]: 'Xóa dự án khỏi hệ thống',
  [PERMISSIONS.PROJECTS_MANAGE_MEMBERS]: 'Quản lý thành viên ban dự án',

  // Tasks (WBS)
  [PERMISSIONS.TASKS_VIEW]: 'Xem cây công việc (WBS)',
  [PERMISSIONS.TASKS_CREATE]: 'Tạo công việc / hạng mục',
  [PERMISSIONS.TASKS_EDIT]: 'Chỉnh sửa thông tin công việc',
  [PERMISSIONS.TASKS_DELETE]: 'Xóa hạng mục công việc',
  [PERMISSIONS.TASKS_UPDATE_STATUS]: 'Cập nhật trạng thái công việc',
  [PERMISSIONS.TASKS_UPDATE_PROGRESS]: 'Cập nhật tiến độ % hoàn thành',
  [PERMISSIONS.TASKS_COMMENT]: 'Bình luận & phản hồi kỹ thuật',

  // Gantt Chart
  [PERMISSIONS.GANTT_VIEW]: 'Xem tiến độ Gantt (Của tôi)',
  [PERMISSIONS.GANTT_VIEW_ALL]: 'Xem toàn bộ tiến độ Gantt (Tất cả nhân sự)',

  // Employees & Workload
  [PERMISSIONS.EMPLOYEES_VIEW]: 'Xem danh sách nhân sự',
  [PERMISSIONS.EMPLOYEES_CREATE]: 'Thêm nhân sự mới',
  [PERMISSIONS.EMPLOYEES_EDIT]: 'Sửa thông tin & vai trò nhân sự',
  [PERMISSIONS.EMPLOYEES_DELETE]: 'Khóa / Xóa tài khoản nhân sự',
  [PERMISSIONS.EMPLOYEES_RESET_PASSWORD]: 'Đặt lại mật khẩu nhân viên',

  // Reports & Analytics
  [PERMISSIONS.REPORTS_VIEW]: 'Xem báo cáo & thống kê',
  [PERMISSIONS.REPORTS_EXPORT]: 'Xuất báo cáo (Excel / CSV)',

  // Roles & Permissions Matrix
  [PERMISSIONS.ROLES_VIEW]: 'Xem danh sách vai trò',
  [PERMISSIONS.ROLES_MANAGE]: 'Quản lý vai trò & ma trận phân quyền',

  // Audit Logs
  [PERMISSIONS.AUDIT_VIEW_SESSIONS]: 'Xem nhật ký đăng nhập & hoạt động',
};
