using ConstructionManagement.Application.Common;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Application.Services;

public class RoleService : IRoleService
{
    private readonly IAppDbContext _context;

    public static readonly List<PermissionModuleGroupDto> SystemPermissions = new()
    {
        new PermissionModuleGroupDto
        {
            ModuleKey = "dashboard",
            ModuleName = "Tổng Quan Hệ Thống (Dashboard)",
            Permissions = new List<PermissionItemDto>
            {
                new() { Code = "dashboard.view", Name = "Xem tổng quan cá nhân", Description = "Truy cập màn hình tổng quan và xem dữ liệu công việc cá nhân của mình" },
                new() { Code = "dashboard.view_project", Name = "Xem tổng quan dự án tham gia", Description = "Xem KPI, tiến độ và công việc của các dự án tham gia" },
                new() { Code = "dashboard.view_all", Name = "Xem toàn bộ tổng quan", Description = "Xem toàn bộ KPI, dự án, công việc và hoạt động của tất cả thành viên" }
            }
        },
        new PermissionModuleGroupDto
        {
            ModuleKey = "projects",
            ModuleName = "Quản Lý Dự Án & Công Trình",
            Permissions = new List<PermissionItemDto>
            {
                new() { Code = "projects.view", Name = "Xem dự án cá nhân", Description = "Xem danh sách và chi tiết các dự án/công trình mà bản thân trực tiếp tạo hoặc làm PM" },
                new() { Code = "projects.view_project", Name = "Xem dự án tham gia", Description = "Xem danh sách các dự án/công trình mà bản thân là thành viên, PM hoặc có công việc được phân công" },
                new() { Code = "projects.view_all", Name = "Xem toàn bộ dự án hệ thống", Description = "Xem tất cả dự án/công trình của toàn bộ công ty" },
                new() { Code = "projects.create", Name = "Tạo dự án", Description = "Khởi tạo công trình / dự án mới" },
                new() { Code = "projects.edit", Name = "Sửa dự án", Description = "Cập nhật thông tin, ngân sách, tiến độ dự án" },
                new() { Code = "projects.delete", Name = "Xóa dự án", Description = "Xóa công trình khỏi hệ thống" },
                new() { Code = "projects.manage_members", Name = "Quản lý thành viên", Description = "Thêm và xóa nhân sự ban quản lý dự án" }
            }
        },
        new PermissionModuleGroupDto
        {
            ModuleKey = "tasks",
            ModuleName = "Quản Lý Công Việc (WBS Tree)",
            Permissions = new List<PermissionItemDto>
            {
                new() { Code = "tasks.view", Name = "Xem công việc cá nhân", Description = "Xem danh sách công việc được phân công cho bản thân" },
                new() { Code = "tasks.view_project", Name = "Xem công việc dự án tham gia", Description = "Xem tất cả công việc trong các dự án/công trình mà bản thân là thành viên hoặc quản lý" },
                new() { Code = "tasks.view_all", Name = "Xem toàn bộ công việc hệ thống", Description = "Xem tất cả công việc của toàn bộ hệ thống" },
                new() { Code = "tasks.create", Name = "Tạo công việc", Description = "Thêm mới hạng mục công việc / công việc con" },
                new() { Code = "tasks.edit", Name = "Sửa công việc", Description = "Chỉnh sửa tên, mô tả, hạn ngày, người phụ trách" },
                new() { Code = "tasks.delete", Name = "Xóa công việc", Description = "Xóa hạng mục công việc và các mục con" },
                new() { Code = "tasks.update_status", Name = "Đổi trạng thái", Description = "Cập nhật trạng thái công việc (Đang làm, Hoàn thành...)" },
                new() { Code = "tasks.update_progress", Name = "Cập nhật tiến độ %", Description = "Điều chỉnh thanh trượt tiến độ % hoàn thành" },
                new() { Code = "tasks.comment", Name = "Bình luận & Phản hồi", Description = "Gửi nhận xét kỹ thuật, trao đổi công việc" }
            }
        },
        new PermissionModuleGroupDto
        {
            ModuleKey = "gantt",
            ModuleName = "Tiến Độ Biểu Đồ Gantt",
            Permissions = new List<PermissionItemDto>
            {
                new() { Code = "gantt.view", Name = "Xem biểu đồ Gantt cá nhân", Description = "Xem tiến độ Gantt các công việc được giao cho bản thân" },
                new() { Code = "gantt.view_project", Name = "Xem biểu đồ Gantt dự án tham gia", Description = "Xem tiến độ Gantt toàn bộ công việc trong các dự án tham gia" },
                new() { Code = "gantt.view_all", Name = "Xem toàn bộ biểu đồ Gantt", Description = "Xem toàn bộ tiến độ và công việc của tất cả thành viên trên Gantt" }
            }
        },
        new PermissionModuleGroupDto
        {
            ModuleKey = "employees",
            ModuleName = "Nhân Sự & Khối Lượng Workload",
            Permissions = new List<PermissionItemDto>
            {
                new() { Code = "employees.view", Name = "Xem nhân sự", Description = "Tra cứu danh sách nhân sự và biểu đồ khối lượng công việc" },
                new() { Code = "employees.create", Name = "Thêm nhân viên", Description = "Tạo tài khoản và phân bổ nhân sự mới" },
                new() { Code = "employees.edit", Name = "Sửa thông tin & vai trò", Description = "Chỉnh sửa phòng ban, số điện thoại, gán vai trò" },
                new() { Code = "employees.delete", Name = "Khóa / Xóa tài khoản", Description = "Vô hiệu hóa hoặc xóa nhân viên khỏi hệ thống" },
                new() { Code = "employees.reset_password", Name = "Đặt lại mật khẩu", Description = "Đặt lại mật khẩu cho tài khoản người dùng" }
            }
        },
        new PermissionModuleGroupDto
        {
            ModuleKey = "reports",
            ModuleName = "Báo Cáo & Thống Kê",
            Permissions = new List<PermissionItemDto>
            {
                new() { Code = "reports.view", Name = "Xem báo cáo cá nhân", Description = "Xem báo cáo tiến độ và công việc được phân công cho bản thân" },
                new() { Code = "reports.view_project", Name = "Xem báo cáo dự án tham gia", Description = "Xem báo cáo và thống kê toàn bộ công việc trong các dự án được tham gia hoặc quản lý" },
                new() { Code = "reports.view_all", Name = "Xem toàn bộ báo cáo hệ thống", Description = "Xem báo cáo tổng hợp tiến độ và hiệu suất của toàn công ty" },
                new() { Code = "reports.export", Name = "Xuất dữ liệu", Description = "Xuất dữ liệu báo cáo sang Excel / CSV" }
            }
        },
        new PermissionModuleGroupDto
        {
            ModuleKey = "roles",
            ModuleName = "Phân Quyền & Vai Trò",
            Permissions = new List<PermissionItemDto>
            {
                new() { Code = "roles.view", Name = "Xem vai trò", Description = "Xem danh sách các vai trò trong hệ thống" },
                new() { Code = "roles.manage", Name = "Quản lý vai trò & quyền", Description = "Tạo mới, chỉnh sửa ma trận quyền và phân quyền" }
            }
        },
        new PermissionModuleGroupDto
        {
            ModuleKey = "audit",
            ModuleName = "Lịch Sử Đăng Nhập & Đăng Xuất",
            Permissions = new List<PermissionItemDto>
            {
                new() { Code = "audit.view_sessions", Name = "Xem nhật ký đăng nhập", Description = "Tra cứu thời gian login/logout, IP và thời lượng online" }
            }
        }
    };

    public RoleService(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<RoleDto>>> GetAllRolesAsync()
    {
        var roles = await _context.Roles
            .Include(r => r.Permissions)
            .Include(r => r.UserRoles)
            .OrderBy(r => r.Name)
            .Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name,
                Code = r.Code,
                Description = r.Description,
                Color = r.Color,
                IsSystem = r.IsSystem,
                UserCount = r.UserRoles.Count,
                Permissions = r.Permissions.Select(p => p.PermissionCode).ToList(),
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<List<RoleDto>>.Ok(roles);
    }

    public async Task<ApiResponse<RoleDto>> GetRoleByIdAsync(Guid id)
    {
        var r = await _context.Roles
            .Include(r => r.Permissions)
            .Include(r => r.UserRoles)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (r == null) return ApiResponse<RoleDto>.Fail("Không tìm thấy vai trò.");

        var dto = new RoleDto
        {
            Id = r.Id,
            Name = r.Name,
            Code = r.Code,
            Description = r.Description,
            Color = r.Color,
            IsSystem = r.IsSystem,
            UserCount = r.UserRoles.Count,
            Permissions = r.Permissions.Select(p => p.PermissionCode).ToList(),
            CreatedAt = r.CreatedAt
        };

        return ApiResponse<RoleDto>.Ok(dto);
    }

    public async Task<ApiResponse<RoleDto>> CreateRoleAsync(CreateRoleRequest request)
    {
        var code = request.Code.Trim().ToUpperInvariant();
        var existing = await _context.Roles.AnyAsync(r => r.Code.ToUpper() == code);
        if (existing)
        {
            return ApiResponse<RoleDto>.Fail($"Mã vai trò '{code}' đã tồn tại trong hệ thống.");
        }

        var role = new AppRole
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Code = code,
            Description = request.Description,
            Color = !string.IsNullOrWhiteSpace(request.Color) ? request.Color.Trim() : "#0284c7",
            IsSystem = false,
            CreatedAt = DateTime.UtcNow
        };

        var requestedPerms = (request.Permissions ?? new List<string>()).Distinct().ToList();
        if (!requestedPerms.Contains("dashboard.view"))
        {
            requestedPerms.Add("dashboard.view");
        }

        foreach (var perm in requestedPerms)
        {
            role.Permissions.Add(new RolePermission
            {
                Id = Guid.NewGuid(),
                RoleId = role.Id,
                PermissionCode = perm,
                CreatedAt = DateTime.UtcNow
            });
        }

        _context.Roles.Add(role);
        await _context.SaveChangesAsync();

        return ApiResponse<RoleDto>.Ok(new RoleDto
        {
            Id = role.Id,
            Name = role.Name,
            Code = role.Code,
            Description = role.Description,
            Color = role.Color,
            IsSystem = role.IsSystem,
            UserCount = 0,
            Permissions = role.Permissions.Select(p => p.PermissionCode).ToList(),
            CreatedAt = role.CreatedAt
        }, "Tạo vai trò mới thành công.");
    }

    public async Task<ApiResponse<RoleDto>> UpdateRoleAsync(Guid id, UpdateRoleRequest request)
    {
        var role = await _context.Roles
            .Include(r => r.UserRoles)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (role == null) return ApiResponse<RoleDto>.Fail("Không tìm thấy vai trò.");

        var code = request.Code.Trim().ToUpperInvariant();
        var existingCode = await _context.Roles.AnyAsync(r => r.Code.ToUpper() == code && r.Id != id);
        if (existingCode)
        {
            return ApiResponse<RoleDto>.Fail($"Mã vai trò '{code}' đã được sử dụng.");
        }

        role.Name = request.Name.Trim();
        if (!role.IsSystem)
        {
            role.Code = code;
        }
        role.Description = request.Description;
        if (!string.IsNullOrWhiteSpace(request.Color))
        {
            role.Color = request.Color.Trim();
        }
        role.UpdatedAt = DateTime.UtcNow;

        // Update permissions safely without clearing tracked collection
        if (request.Permissions != null)
        {
            var requestedPerms = request.Permissions.Distinct().ToList();
            if (!requestedPerms.Contains("dashboard.view"))
            {
                requestedPerms.Add("dashboard.view");
            }

            var existingPerms = await _context.RolePermissions
                .Where(p => p.RoleId == id)
                .ToListAsync();

            var toRemove = existingPerms.Where(p => !requestedPerms.Contains(p.PermissionCode)).ToList();
            if (toRemove.Any())
            {
                _context.RolePermissions.RemoveRange(toRemove);
            }

            var existingCodes = existingPerms.Select(p => p.PermissionCode).ToHashSet();
            var toAdd = requestedPerms.Where(c => !existingCodes.Contains(c)).ToList();
            foreach (var permCode in toAdd)
            {
                _context.RolePermissions.Add(new RolePermission
                {
                    Id = Guid.NewGuid(),
                    RoleId = role.Id,
                    PermissionCode = permCode,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        await _context.SaveChangesAsync();

        var updatedPerms = await _context.RolePermissions
            .Where(p => p.RoleId == id)
            .Select(p => p.PermissionCode)
            .ToListAsync();

        return ApiResponse<RoleDto>.Ok(new RoleDto
        {
            Id = role.Id,
            Name = role.Name,
            Code = role.Code,
            Description = role.Description,
            IsSystem = role.IsSystem,
            UserCount = role.UserRoles.Count,
            Permissions = updatedPerms,
            CreatedAt = role.CreatedAt
        }, "Cập nhật vai trò thành công.");
    }

    public async Task<ApiResponse<bool>> DeleteRoleAsync(Guid id)
    {
        var role = await _context.Roles
            .Include(r => r.UserRoles)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (role == null) return ApiResponse<bool>.Fail("Không tìm thấy vai trò.");
        if (role.IsSystem) return ApiResponse<bool>.Fail("Không thể xóa vai trò hệ thống mặc định.");
        if (role.UserRoles.Count > 0)
        {
            return ApiResponse<bool>.Fail($"Không thể xóa vai trò đang có {role.UserRoles.Count} nhân sự sử dụng. Vui lòng chuyển vai trò của nhân sự trước.");
        }

        _context.Roles.Remove(role);
        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Đã xóa vai trò thành công.");
    }

    public Task<ApiResponse<List<PermissionModuleGroupDto>>> GetPermissionMatrixAsync()
    {
        return Task.FromResult(ApiResponse<List<PermissionModuleGroupDto>>.Ok(SystemPermissions));
    }

    public async Task<List<string>> GetUserPermissionsAsync(Guid userId)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r!.Permissions)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return new List<string>();

        // If user is SuperAdmin role enum, grant all permissions
        if (user.Role == Domain.Enums.UserRole.SuperAdmin)
        {
            return SystemPermissions.SelectMany(g => g.Permissions).Select(p => p.Code).Distinct().ToList();
        }

        // If user has dynamic roles assigned, return ONLY the permissions granted to those dynamic roles (even if empty)
        if (user.UserRoles != null && user.UserRoles.Any())
        {
            return user.UserRoles
                .Where(ur => ur.Role != null)
                .SelectMany(ur => ur.Role!.Permissions)
                .Select(p => p.PermissionCode)
                .Distinct()
                .ToList();
        }

        // Only fallback to legacy default permissions if user has NO dynamic role mappings at all
        var perms = new List<string>();
        switch (user.Role)
        {
            case Domain.Enums.UserRole.ProjectManager:
                perms = new List<string>
                {
                    "dashboard.view", "dashboard.view_project", "dashboard.view_all",
                    "projects.view", "projects.view_project", "projects.view_all", "projects.create", "projects.edit", "projects.manage_members",
                    "tasks.view", "tasks.view_project", "tasks.view_all", "tasks.create", "tasks.edit", "tasks.delete", "tasks.update_status", "tasks.update_progress", "tasks.comment",
                    "gantt.view", "gantt.view_project", "gantt.view_all",
                    "employees.view", "reports.view", "reports.view_project", "reports.view_all", "reports.export", "audit.view_sessions"
                };
                break;
            case Domain.Enums.UserRole.Supervisor:
                perms = new List<string>
                {
                    "dashboard.view", "dashboard.view_project",
                    "projects.view", "projects.view_project",
                    "tasks.view", "tasks.view_project", "tasks.create", "tasks.edit", "tasks.update_status", "tasks.update_progress", "tasks.comment",
                    "gantt.view", "gantt.view_project",
                    "employees.view", "reports.view", "reports.view_project"
                };
                break;
            default:
                perms = new List<string>
                {
                    "dashboard.view",
                    "projects.view",
                    "tasks.view", "tasks.update_progress", "tasks.update_status", "tasks.comment",
                    "gantt.view", "employees.view", "reports.view"
                };
                break;
        }

        return perms;
    }
}
