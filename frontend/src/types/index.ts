export type UserRole = 'Employee' | 'Supervisor' | 'ProjectManager' | 'SuperAdmin';

export type ProjectStatus = 'NotStarted' | 'InProgress' | 'Completed' | 'OnHold' | 'Overdue' | 'Cancelled';

export type TaskStatus = 'NotStarted' | 'InProgress' | 'Completed' | 'OnHold' | 'Overdue';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export type DependencyType = 'FinishToStart' | 'StartToStart' | 'FinishToFinish' | 'StartToFinish';

export type NotificationType =
  | 'TaskAssigned'
  | 'TaskDeadlineSoon'
  | 'TaskOverdue'
  | 'TaskStatusChanged'
  | 'TaskProgressChanged'
  | 'CommentAdded'
  | 'DeadlineChanged'
  | 'ProjectAssigned';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  department?: string;
  avatarUrl?: string;
  role: UserRole;
  roleName?: string;
  roles?: string[];
  roleIds?: string[];
  permissions?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface RolePermission {
  roleId: string;
  permissionCode: string;
}

export interface RoleItem {
  id: string;
  name: string;
  code: string;
  description?: string;
  isSystem: boolean;
  userCount: number;
  permissions: string[];
  createdAt: string;
}

export interface PermissionItem {
  code: string;
  name: string;
  description: string;
  module: string;
}

export interface PermissionModuleGroup {
  module: string;
  moduleName: string;
  description: string;
  permissions: PermissionItem[];
}

export type SessionStatus = 'Active' | 'LoggedOut' | 'Expired';

export interface UserLoginSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  department?: string;
  roleName?: string;
  userAvatarUrl?: string;
  loginTime: string;
  logoutTime?: string;
  lastActiveTime?: string;
  durationMinutes?: number;
  ipAddress?: string;
  userAgent?: string;
  status: SessionStatus;
}

export interface LoginSessionStats {
  totalSessions: number;
  activeOnlineUsers: number;
  loggedOutToday: number;
  avgSessionMinutes: number;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  description?: string;
  location?: string;
  managerId?: string;
  managerName?: string;
  startDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  status: ProjectStatus;
  statusName?: string;
  progress: number;
  priority: PriorityLevel;
  priorityName?: string;
  taskCount: number;
  completedTaskCount: number;
  overdueTaskCount: number;
  memberCount: number;
  isOverdue?: boolean;
  createdAt: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  fullName: string;
  email: string;
  department?: string;
  roleInProject?: string;
  avatarUrl?: string;
  joinedAt: string;
}

export interface TaskAssignee {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  department?: string;
  avatarUrl?: string;
  assignedAt: string;
}

export interface TaskCommentAttachment {
  id: string;
  commentId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  contentType?: string;
  uploadedAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userDepartment?: string;
  userAvatarUrl?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  attachments?: TaskCommentAttachment[];
}

export interface TaskDependency {
  id: string;
  predecessorTaskId: string;
  predecessorTaskName: string;
  successorTaskId: string;
  successorTaskName: string;
  dependencyType: DependencyType;
}

export interface TaskItem {
  id: string;
  projectId: string;
  projectName?: string;
  projectCode?: string;
  parentId?: string | null;
  parentName?: string | null;
  name: string;
  description?: string;
  status: TaskStatus;
  statusName?: string;
  priority: PriorityLevel;
  priorityName?: string;
  startDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  progress: number;
  weight: number;
  sortOrder: number;
  level?: number;
  isOverdue?: boolean;
  overdueDays?: number;
  isCompletedLate?: boolean;
  completedLateDays?: number;
  assignees: TaskAssignee[];
  dependencies?: TaskDependency[];
  subTaskCount: number;
  commentCount: number;
  createdAt: string;
}

export interface TaskTreeItem extends TaskItem {
  children: TaskTreeItem[];
}

export interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  type: 'project' | 'phase' | 'task' | 'subtask';
  parentId?: string | null;
  status: TaskStatus;
  statusName?: string;
  priority: PriorityLevel;
  priorityName?: string;
  dependencies: string[];
  assigneeNames: string[];
  isOverdue: boolean;
  hideChildren?: boolean;
  projectCode?: string;
  projectName?: string;
  realTaskId: string;
  projectId: string;
}

export interface GanttLink {
  id: string;
  source: string;
  target: string;
  type: string;
}

export interface GanttData {
  tasks: GanttTask[];
  links: GanttLink[];
}

export interface DashboardSummary {
  totalProjects: number;
  inProgressProjects: number;
  completedProjects: number;
  overdueProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  projectProgressList: {
    projectId: string;
    projectCode: string;
    projectName: string;
    progress: number;
    status: ProjectStatus;
    plannedEndDate: string;
    totalTasks: number;
    completedTasks: number;
  }[];
  taskStatusDistribution: {
    status: string;
    count: number;
    color: string;
  }[];
  criticalOverdueTasks: {
    taskId: string;
    taskName: string;
    projectId: string;
    projectCode: string;
    projectName: string;
    plannedEndDate: string;
    overdueDays: number;
    progress: number;
    assigneeNames: string[];
  }[];
  upcomingDeadlines: {
    taskId: string;
    taskName: string;
    projectCode: string;
    plannedEndDate: string;
    daysRemaining: number;
    progress: number;
    assigneeNames: string[];
  }[];
  employeeWorkloadList: {
    userId: string;
    fullName: string;
    department?: string;
    activeTasks: number;
    completedTasks: number;
    overdueTasks: number;
    totalTasks: number;
  }[];
  recentActivities: ActivityLog[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  typeName: string;
  referenceType?: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  projectId?: string;
  projectCode?: string;
  projectName?: string;
  taskId?: string;
  taskName?: string;
  action: string;
  actionName?: string;
  details: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: string[];
}

export interface PaginationParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  isDescending?: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface EmployeeKpiStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  overdueTasks: number;
  averageTaskProgress: number;
  onTimeCompletionRate: number;
}

export interface EmployeeProjectParticipation {
  projectId: string;
  projectCode: string;
  projectName: string;
  projectLocation?: string;
  projectStatus: ProjectStatus;
  projectProgress: number;
  roleInProject?: string;
  joinedAt?: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  averageProgress: number;
}

export interface EmployeeTaskItem {
  taskId: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  name: string;
  status: TaskStatus;
  priority: PriorityLevel;
  progress: number;
  startDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  isOverdue: boolean;
  daysRemaining: number;
  assignedAt: string;
}

export interface EmployeeActivityLog {
  id: string;
  action: string;
  details?: string;
  projectName?: string;
  taskName?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface EmployeeProgressDetail {
  user: User;
  stats: EmployeeKpiStats;
  projects: EmployeeProjectParticipation[];
  tasks: EmployeeTaskItem[];
  recentActivities: EmployeeActivityLog[];
}

export interface UserPresence {
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  userRole?: string;
  userDepartment?: string;
  projectId?: string;
  editingTaskId?: string;
  editingTaskName?: string;
  isEditing: boolean;
  lastHeartbeat: string;
}

export interface TaskActiveEditor {
  taskId: string;
  taskName?: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  editingSince: string;
}

export interface ProjectPresence {
  projectId: string;
  activeUsers: UserPresence[];
  activeEditors: TaskActiveEditor[];
}

export interface PresenceHeartbeatRequest {
  projectId?: string;
  taskId?: string;
  taskName?: string;
  isEditing?: boolean;
  avatarUrl?: string;
}


