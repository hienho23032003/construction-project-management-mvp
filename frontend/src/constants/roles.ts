/**
 * User Role and System Permission Constants
 */

export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  PROJECT_MANAGER: 'ProjectManager',
  SUPERVISOR: 'Supervisor',
  ENGINEER: 'Engineer',
  WORKER: 'Worker',
  GUEST: 'Guest',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  [SYSTEM_ROLES.SUPER_ADMIN]: 'Quản Trị Viên Cấp Cao',
  [SYSTEM_ROLES.PROJECT_MANAGER]: 'Quản Lý Dự Án (PM)',
  [SYSTEM_ROLES.SUPERVISOR]: 'Giám Sát Công Trình',
  [SYSTEM_ROLES.ENGINEER]: 'Kỹ Sư Hiện Trường',
  [SYSTEM_ROLES.WORKER]: 'Nhân Viên / Kỹ Thuật',
  [SYSTEM_ROLES.GUEST]: 'Khách / Chỉ Xem',
};

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  [SYSTEM_ROLES.SUPER_ADMIN]: 'Toàn quyền cấu hình hệ thống, quản trị người dùng, phân quyền và giám sát toàn bộ dự án',
  [SYSTEM_ROLES.PROJECT_MANAGER]: 'Quản lý toàn diện các dự án được giao, phân công công việc, quản trị ngân sách và tiến độ',
  [SYSTEM_ROLES.SUPERVISOR]: 'Giám sát hiện trường thi công, cập nhật tiến độ thực tế, duyệt trạng thái và gửi phản hồi',
  [SYSTEM_ROLES.ENGINEER]: 'Thực hiện các hạng mục công việc, cập nhật tiến độ hoàn thành % và trao đổi kỹ thuật',
  [SYSTEM_ROLES.WORKER]: 'Thành viên thực hiện công việc hiện trường',
  [SYSTEM_ROLES.GUEST]: 'Chỉ có quyền xem thông tin cơ bản được chia sẻ',
};
