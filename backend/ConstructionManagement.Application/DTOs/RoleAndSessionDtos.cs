using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.DTOs;

public class RoleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Color { get; set; }
    public bool IsSystem { get; set; }
    public int UserCount { get; set; }
    public List<string> Permissions { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class CreateRoleRequest
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Color { get; set; }
    public List<string> Permissions { get; set; } = new();
}

public class UpdateRoleRequest
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Color { get; set; }
    public List<string> Permissions { get; set; } = new();
}

public class PermissionItemDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class PermissionModuleGroupDto
{
    public string ModuleKey { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public List<PermissionItemDto> Permissions { get; set; } = new();
}

public class UserLoginSessionDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string? UserDepartment { get; set; }
    public string? UserRole { get; set; }
    public string? UserAvatarUrl { get; set; }
    public DateTime LoginTime { get; set; }
    public DateTime? LogoutTime { get; set; }
    public DateTime? LastActiveTime { get; set; }
    public double? DurationMinutes { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public SessionStatus Status { get; set; }
    public string StatusName => Status switch
    {
        SessionStatus.Active => "Đang hoạt động",
        SessionStatus.LoggedOut => "Đã đăng xuất",
        SessionStatus.Expired => "Hết phiên",
        _ => "Không xác định"
    };
    public DateTime CreatedAt { get; set; }
}

public class LoginSessionStatsDto
{
    public int TotalSessions { get; set; }
    public int ActiveOnlineUsers { get; set; }
    public int LoggedOutToday { get; set; }
    public double AvgSessionMinutes { get; set; }
}

public class LogoutRequest
{
    public Guid? SessionId { get; set; }
}

public class PingSessionRequest
{
    public Guid? SessionId { get; set; }
}

public class LeaveSessionRequest
{
    public Guid? SessionId { get; set; }
}
