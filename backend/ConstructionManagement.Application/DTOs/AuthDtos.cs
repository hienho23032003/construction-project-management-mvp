using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.DTOs;

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
    public Guid? SessionId { get; set; }
    public List<string> Permissions { get; set; } = new();
    public DateTime ExpiresAt { get; set; }
}

public class UserDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Department { get; set; }
    public string? AvatarUrl { get; set; }
    public UserRole Role { get; set; }
    public string RoleName => Roles.Count > 0 ? Roles[0] : Role.ToString();
    public string? RoleColor { get; set; }
    public List<string> Roles { get; set; } = new();
    public List<Guid> RoleIds { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateUserRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Department { get; set; }
    public UserRole Role { get; set; } = UserRole.Employee;
    public List<Guid>? RoleIds { get; set; }
}

public class UpdateUserRequest
{
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Department { get; set; }
    public UserRole Role { get; set; }
    public List<Guid>? RoleIds { get; set; }
    public bool IsActive { get; set; }
    public string? NewPassword { get; set; }
}

public class UpdateProfileRequest
{
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Department { get; set; }
    public string? AvatarUrl { get; set; }
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class AdminResetPasswordRequest
{
    public string NewPassword { get; set; } = string.Empty;
}
