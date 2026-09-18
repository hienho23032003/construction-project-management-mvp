using ConstructionManagement.Application.Common;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user);
}

public interface IAuthService
{
    Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request, string? ipAddress = null, string? userAgent = null);
    Task<ApiResponse<bool>> LogoutAsync(Guid? sessionId);
    Task<ApiResponse<UserDto>> GetCurrentUserAsync(Guid userId);
    Task<ApiResponse<UserDto>> RegisterAsync(CreateUserRequest request);
    Task<ApiResponse<UserDto>> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
    Task<ApiResponse<UserDto>> UploadAvatarAsync(Guid userId, Microsoft.AspNetCore.Http.IFormFile file);
    Task<ApiResponse<bool>> ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
}

public interface IRoleService
{
    Task<ApiResponse<List<RoleDto>>> GetAllRolesAsync();
    Task<ApiResponse<RoleDto>> GetRoleByIdAsync(Guid id);
    Task<ApiResponse<RoleDto>> CreateRoleAsync(CreateRoleRequest request);
    Task<ApiResponse<RoleDto>> UpdateRoleAsync(Guid id, UpdateRoleRequest request);
    Task<ApiResponse<bool>> DeleteRoleAsync(Guid id);
    Task<ApiResponse<List<PermissionModuleGroupDto>>> GetPermissionMatrixAsync();
    Task<List<string>> GetUserPermissionsAsync(Guid userId);
}

public interface IUserSessionService
{
    Task<Guid> CreateSessionAsync(Guid userId, string? ipAddress, string? userAgent);
    Task<bool> CloseSessionAsync(Guid sessionId);
    Task<ApiResponse<PingSessionResultDto>> PingSessionAsync(Guid sessionId, Guid userId, string? ipAddress = null, string? userAgent = null);
    Task<bool> LeaveSessionAsync(Guid sessionId);
    Task<ApiResponse<PagedResult<UserLoginSessionDto>>> GetLoginHistoryAsync(
        DateTime? fromDate,
        DateTime? toDate,
        Guid? userId,
        string? status,
        string? search,
        PaginationParams pagination);
    Task<ApiResponse<LoginSessionStatsDto>> GetSessionStatsAsync(DateTime? fromDate = null, DateTime? toDate = null);
}

public interface IUserService
{
    Task<ApiResponse<PagedResult<UserDto>>> GetAllUsersAsync(PaginationParams pagination);
    Task<ApiResponse<List<UserDto>>> GetAllUsersListAsync(); // For dropdowns
    Task<ApiResponse<UserDto>> GetUserByIdAsync(Guid id);
    Task<ApiResponse<UserDto>> CreateUserAsync(CreateUserRequest request);
    Task<ApiResponse<UserDto>> UpdateUserAsync(Guid id, UpdateUserRequest request);
    Task<ApiResponse<UserDto>> UploadUserAvatarAsync(Guid userId, Microsoft.AspNetCore.Http.IFormFile file);
    Task<ApiResponse<bool>> DeleteUserAsync(Guid id);
    Task<ApiResponse<bool>> ToggleUserStatusAsync(Guid id);
    Task<ApiResponse<bool>> ResetPasswordAsync(Guid userId, string newPassword, Guid currentUserId);
    Task<ApiResponse<List<EmployeeWorkloadSummaryDto>>> GetWorkloadSummaryAsync();
    Task<ApiResponse<EmployeeProgressDetailDto>> GetUserProgressSummaryAsync(Guid userId);
}

public interface IProjectService
{
    Task<ApiResponse<PagedResult<ProjectDto>>> GetAllProjectsAsync(PaginationParams pagination, ProjectStatus? status = null, Guid? currentUserId = null, bool canViewAll = true, bool canViewProject = false);
    Task<ApiResponse<List<ProjectDto>>> GetAllProjectsListAsync(Guid? currentUserId = null, bool canViewAll = true, bool canViewProject = false); // For dropdowns
    Task<ApiResponse<ProjectDetailDto>> GetProjectByIdAsync(Guid id);
    Task<ApiResponse<ProjectDto>> CreateProjectAsync(CreateProjectRequest request, Guid currentUserId);
    Task<ApiResponse<ProjectDto>> UpdateProjectAsync(Guid id, UpdateProjectRequest request, Guid currentUserId);
    Task<ApiResponse<bool>> DeleteProjectAsync(Guid id, Guid currentUserId);
    Task<ApiResponse<List<ProjectMemberDto>>> GetProjectMembersAsync(Guid projectId);
    Task<ApiResponse<ProjectMemberDto>> AddProjectMemberAsync(Guid projectId, AddProjectMemberRequest request);
    Task<ApiResponse<bool>> RemoveProjectMemberAsync(Guid projectId, Guid userId);
    Task RecalculateProjectProgressAsync(Guid projectId);
}

public interface ITaskService
{
    Task<ApiResponse<PagedResult<TaskDto>>> GetAllTasksAsync(PaginationParams pagination, Guid? projectId = null, Guid? assigneeId = null, TaskItemStatus? status = null, PriorityLevel? priority = null, Guid? currentUserId = null, bool canViewAll = true, bool canViewProject = false);
    Task<ApiResponse<List<TaskTreeDto>>> GetTaskTreeByProjectAsync(Guid projectId);
    Task<ApiResponse<TaskDto>> GetTaskByIdAsync(Guid id);
    Task<ApiResponse<TaskDto>> CreateTaskAsync(CreateTaskRequest request, Guid currentUserId);
    Task<ApiResponse<TaskDto>> UpdateTaskAsync(Guid id, UpdateTaskRequest request, Guid currentUserId);
    Task<ApiResponse<bool>> DeleteTaskAsync(Guid id, Guid currentUserId);
    
    // Status, Progress, Dates, and Priority updates (Gantt drag/drop & inline updates)
    Task<ApiResponse<TaskDto>> UpdateStatusAsync(Guid id, UpdateTaskStatusRequest request, Guid currentUserId);
    Task<ApiResponse<TaskDto>> UpdateProgressAsync(Guid id, UpdateTaskProgressRequest request, Guid currentUserId);
    Task<ApiResponse<TaskDto>> UpdateDatesAsync(Guid id, UpdateTaskDatesRequest request, Guid currentUserId);
    Task<ApiResponse<TaskDto>> UpdatePriorityAsync(Guid id, UpdateTaskPriorityRequest request, Guid currentUserId);
    
    // Comments
    Task<ApiResponse<List<TaskCommentDto>>> GetTaskCommentsAsync(Guid taskId);
    Task<ApiResponse<TaskCommentDto>> AddCommentAsync(Guid taskId, CreateCommentRequest request, Guid currentUserId);
    Task<ApiResponse<TaskCommentDto>> AddCommentWithAttachmentsAsync(Guid taskId, CreateCommentWithFilesRequest request, Guid currentUserId);
    Task<ApiResponse<bool>> DeleteCommentAsync(Guid commentId, Guid currentUserId);

    // Dependencies
    Task<ApiResponse<List<TaskDependencyDto>>> GetTaskDependenciesAsync(Guid taskId);
    Task<ApiResponse<TaskDependencyDto>> AddDependencyAsync(CreateDependencyRequest request, Guid currentUserId);
    Task<ApiResponse<bool>> DeleteDependencyAsync(Guid dependencyId, Guid currentUserId);

    // Gantt Data with server-side filtering
    Task<ApiResponse<GanttDataResponse>> GetGanttDataAsync(Guid? projectId = null, TaskItemStatus? status = null, bool? activeOnly = null, DateTime? fromDate = null, DateTime? toDate = null, Guid? currentUserId = null, bool canViewAll = true, bool canViewProject = false);

    // Checklist / Acceptance criteria
    Task<ApiResponse<List<TaskChecklistItemDto>>> GetTaskChecklistAsync(Guid taskId);
    Task<ApiResponse<TaskChecklistItemDto>> CreateChecklistItemAsync(Guid taskId, CreateChecklistItemRequest request, Guid currentUserId);
    Task<ApiResponse<TaskChecklistItemDto>> UpdateChecklistItemAsync(Guid taskId, Guid itemId, UpdateChecklistItemRequest request, Guid currentUserId);
    Task<ApiResponse<bool>> DeleteChecklistItemAsync(Guid taskId, Guid itemId, Guid currentUserId);
    Task<ApiResponse<List<TaskChecklistItemDto>>> BatchSaveChecklistAsync(Guid taskId, BatchChecklistRequest request, Guid currentUserId);

    // Hierarchy business calculation
    Task RecalculateParentTaskProgressAsync(Guid? parentTaskId);
}

public interface IDashboardService
{
    Task<ApiResponse<DashboardSummaryDto>> GetDashboardSummaryAsync(Guid userId, DateTime? fromDate = null, DateTime? toDate = null);
}

public interface IReportService
{
    Task<ApiResponse<List<ProjectProgressReportDto>>> GetProjectProgressReportAsync(ReportFilterRequest filter, Guid? currentUserId = null, bool canViewAll = true, bool canViewProject = false);
    Task<ApiResponse<List<TaskReportDto>>> GetTaskReportAsync(ReportFilterRequest filter, Guid? currentUserId = null, bool canViewAll = true, bool canViewProject = false);
    Task<ApiResponse<List<OverdueReportDto>>> GetOverdueReportAsync(ReportFilterRequest filter, Guid? currentUserId = null, bool canViewAll = true, bool canViewProject = false);
    Task<ApiResponse<List<EmployeeWorkloadReportDto>>> GetEmployeeWorkloadReportAsync(ReportFilterRequest filter, Guid? currentUserId = null, bool canViewAll = true, bool canViewProject = false);
    Task<byte[]> ExportReportCsvAsync(string reportType, ReportFilterRequest filter, Guid? currentUserId = null, bool canViewAll = true, bool canViewProject = false);
}

public interface INotificationService
{
    Task<ApiResponse<PagedResult<NotificationDto>>> GetUserNotificationsAsync(Guid userId, PaginationParams pagination);
    Task<ApiResponse<bool>> MarkAsReadAsync(Guid notificationId, Guid userId);
    Task<ApiResponse<bool>> MarkAllAsReadAsync(Guid userId);
    Task CreateNotificationAsync(Guid userId, string title, string message, NotificationType type, string? refType = null, Guid? refId = null);
}

public interface IActivityLogService
{
    Task<ApiResponse<PagedResult<ActivityLogDto>>> GetActivityLogsPagedAsync(
        PaginationParams pagination,
        Guid? projectId = null,
        Guid? taskId = null,
        Guid? userId = null,
        string? action = null);
    Task<ApiResponse<List<ActivityLogDto>>> GetRecentLogsAsync(Guid? projectId = null, Guid? taskId = null, int limit = 50);
    Task LogAsync(Guid userId, ActivityAction action, string details, Guid? projectId = null, Guid? taskId = null, string? oldValue = null, string? newValue = null);
}
