using System.Security.Claims;
using ConstructionManagement.Application.Common;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace ConstructionManagement.API.Filters;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
public class RequirePermissionAttribute : TypeFilterAttribute
{
    public RequirePermissionAttribute(string permissionCode) : base(typeof(RequirePermissionFilter))
    {
        Arguments = new object[] { permissionCode };
    }
}

public class RequirePermissionFilter : IAsyncAuthorizationFilter
{
    private readonly string _permissionCode;
    private readonly IRoleService _roleService;

    public RequirePermissionFilter(string permissionCode, IRoleService roleService)
    {
        _permissionCode = permissionCode;
        _roleService = roleService;
    }

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;
        if (user == null || user.Identity == null || !user.Identity.IsAuthenticated)
        {
            context.Result = new UnauthorizedObjectResult(ApiResponse<string>.Fail("Vui lòng đăng nhập để tiếp tục."));
            return;
        }

        // SuperAdmin has full system access
        var roleClaim = user.FindFirst(ClaimTypes.Role)?.Value;
        if (string.Equals(roleClaim, "SuperAdmin", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            context.Result = new UnauthorizedObjectResult(ApiResponse<string>.Fail("Thông tin đăng nhập không hợp lệ."));
            return;
        }

        var permissions = await _roleService.GetUserPermissionsAsync(userId);
        if (permissions.Contains(_permissionCode, StringComparer.OrdinalIgnoreCase))
        {
            return;
        }

        context.Result = new ObjectResult(ApiResponse<string>.Fail($"Bạn không có quyền thực hiện thao tác này ({_permissionCode})."))
        {
            StatusCode = StatusCodes.Status403Forbidden
        };
    }
}
