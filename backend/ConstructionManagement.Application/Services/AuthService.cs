using BCrypt.Net;
using ConstructionManagement.Application.Common;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Application.Services;

public class AuthService : IAuthService
{
    private readonly IAppDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IUserSessionService _userSessionService;
    private readonly IRoleService _roleService;
    private readonly IFileStorageService _fileStorageService;

    public AuthService(
        IAppDbContext context,
        IJwtTokenService jwtTokenService,
        IUserSessionService userSessionService,
        IRoleService roleService,
        IFileStorageService fileStorageService)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
        _userSessionService = userSessionService;
        _roleService = roleService;
        _fileStorageService = fileStorageService;
    }

    public async Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request, string? ipAddress = null, string? userAgent = null)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower().Trim());

        if (user == null)
        {
            return ApiResponse<LoginResponse>.Fail("Email hoặc mật khẩu không chính xác.");
        }

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            return ApiResponse<LoginResponse>.Fail("Email hoặc mật khẩu không chính xác.");
        }

        if (!user.IsActive)
        {
            return ApiResponse<LoginResponse>.Fail("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên để được hỗ trợ.");
        }

        // Create login session record
        var sessionId = await _userSessionService.CreateSessionAsync(user.Id, ipAddress, userAgent);

        // Fetch permissions and dynamic roles
        var permissions = await _roleService.GetUserPermissionsAsync(user.Id);
        var roleNames = user.UserRoles.Where(ur => ur.Role != null).Select(ur => ur.Role!.Name).ToList();
        var roleIds = user.UserRoles.Select(ur => ur.RoleId).ToList();
        var roleColor = user.UserRoles.Where(ur => ur.Role != null && !string.IsNullOrEmpty(ur.Role.Color)).Select(ur => ur.Role!.Color).FirstOrDefault();

        var token = _jwtTokenService.GenerateToken(user);
        var userDto = new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            Department = user.Department,
            AvatarUrl = user.AvatarUrl,
            Role = user.Role,
            RoleColor = roleColor,
            Roles = roleNames.Count > 0 ? roleNames : new List<string> { user.Role.ToString() },
            RoleIds = roleIds,
            Permissions = permissions,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };

        return ApiResponse<LoginResponse>.Ok(new LoginResponse
        {
            Token = token,
            User = userDto,
            SessionId = sessionId,
            Permissions = permissions,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        }, "Đăng nhập thành công.");
    }

    public async Task<ApiResponse<bool>> LogoutAsync(Guid? sessionId)
    {
        if (sessionId.HasValue && sessionId.Value != Guid.Empty)
        {
            await _userSessionService.CloseSessionAsync(sessionId.Value);
        }
        return ApiResponse<bool>.Ok(true, "Đã đăng xuất thành công.");
    }

    public async Task<ApiResponse<UserDto>> GetCurrentUserAsync(Guid userId)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return ApiResponse<UserDto>.Fail("Không tìm thấy thông tin người dùng.");
        }

        var permissions = await _roleService.GetUserPermissionsAsync(user.Id);
        var roleNames = user.UserRoles.Where(ur => ur.Role != null).Select(ur => ur.Role!.Name).ToList();
        var roleIds = user.UserRoles.Select(ur => ur.RoleId).ToList();
        var roleColor = user.UserRoles.Where(ur => ur.Role != null && !string.IsNullOrEmpty(ur.Role.Color)).Select(ur => ur.Role!.Color).FirstOrDefault();

        return ApiResponse<UserDto>.Ok(new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            Department = user.Department,
            AvatarUrl = user.AvatarUrl,
            Role = user.Role,
            RoleColor = roleColor,
            Roles = roleNames.Count > 0 ? roleNames : new List<string> { user.Role.ToString() },
            RoleIds = roleIds,
            Permissions = permissions,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        });
    }

    public async Task<ApiResponse<UserDto>> RegisterAsync(CreateUserRequest request)
    {
        var existing = await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower().Trim());
        if (existing)
        {
            return ApiResponse<UserDto>.Fail("Email này đã được sử dụng trong hệ thống.");
        }

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = request.Email.ToLower().Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Phone = request.Phone,
            Department = request.Department,
            Role = request.Role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return ApiResponse<UserDto>.Ok(new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            Department = user.Department,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        }, "Tạo tài khoản thành công.");
    }

    public async Task<ApiResponse<UserDto>> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return ApiResponse<UserDto>.Fail("Không tìm thấy thông tin người dùng.");
        }

        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            return ApiResponse<UserDto>.Fail("Họ và tên không được để trống.");
        }

        user.FullName = request.FullName.Trim();
        user.Phone = request.Phone?.Trim();
        user.Department = request.Department?.Trim();
        if (!string.IsNullOrWhiteSpace(request.AvatarUrl))
        {
            user.AvatarUrl = request.AvatarUrl.Trim();
        }

        await _context.SaveChangesAsync();

        var permissions = await _roleService.GetUserPermissionsAsync(user.Id);
        var roleNames = user.UserRoles.Where(ur => ur.Role != null).Select(ur => ur.Role!.Name).ToList();
        var roleIds = user.UserRoles.Select(ur => ur.RoleId).ToList();

        return ApiResponse<UserDto>.Ok(new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            Department = user.Department,
            AvatarUrl = user.AvatarUrl,
            Role = user.Role,
            Roles = roleNames.Count > 0 ? roleNames : new List<string> { user.Role.ToString() },
            RoleIds = roleIds,
            Permissions = permissions,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        }, "Cập nhật thông tin cá nhân thành công.");
    }

    public async Task<ApiResponse<UserDto>> UploadAvatarAsync(Guid userId, Microsoft.AspNetCore.Http.IFormFile file)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return ApiResponse<UserDto>.Fail("Không tìm thấy thông tin người dùng.");
        }

        try
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif", ".jfif", ".pjpeg", ".pjp", ".bmp", ".svg", ".ico" };
            var result = await _fileStorageService.SaveFileAsync(file, "avatars", allowedExtensions, 5 * 1024 * 1024);

            // Xóa avatar cũ nếu có và là file local
            if (!string.IsNullOrWhiteSpace(user.AvatarUrl) && user.AvatarUrl.StartsWith("/uploads/avatars/"))
            {
                _fileStorageService.DeleteFile(user.AvatarUrl);
            }

            user.AvatarUrl = result.FilePath;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var permissions = await _roleService.GetUserPermissionsAsync(user.Id);
            var roleNames = user.UserRoles.Where(ur => ur.Role != null).Select(ur => ur.Role!.Name).ToList();
            var roleIds = user.UserRoles.Select(ur => ur.RoleId).ToList();

            return ApiResponse<UserDto>.Ok(new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Department = user.Department,
                AvatarUrl = user.AvatarUrl,
                Role = user.Role,
                Roles = roleNames.Count > 0 ? roleNames : new List<string> { user.Role.ToString() },
                RoleIds = roleIds,
                Permissions = permissions,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            }, "Cập nhật ảnh đại diện thành công.");
        }
        catch (Exception ex)
        {
            return ApiResponse<UserDto>.Fail($"Tải lên ảnh đại diện thất bại: {ex.Message}");
        }
    }

    public async Task<ApiResponse<bool>> ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return ApiResponse<bool>.Fail("Không tìm thấy thông tin người dùng.");
        }

        if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return ApiResponse<bool>.Fail("Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.");
        }

        if (request.NewPassword.Length < 6)
        {
            return ApiResponse<bool>.Fail("Mật khẩu mới phải có ít nhất 6 ký tự.");
        }

        bool isCurrentValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash);
        if (!isCurrentValid)
        {
            return ApiResponse<bool>.Fail("Mật khẩu hiện tại không chính xác.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Đổi mật khẩu thành công.");
    }
}
