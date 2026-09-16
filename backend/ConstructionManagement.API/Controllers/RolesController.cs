using ConstructionManagement.API.Filters;
using ConstructionManagement.Application.Common;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.API.Controllers;

[Authorize]
public class RolesController : BaseApiController
{
    private readonly IRoleService _roleService;

    public RolesController(IRoleService roleService)
    {
        _roleService = roleService;
    }

    [HttpGet]
    [RequirePermission("roles.view")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _roleService.GetAllRolesAsync();
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("roles.view")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _roleService.GetRoleByIdAsync(id);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    [RequirePermission("roles.manage")]
    public async Task<IActionResult> Create([FromBody] CreateRoleRequest request)
    {
        var result = await _roleService.CreateRoleAsync(request);
        if (!result.Success) return BadRequest(result);
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("roles.manage")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRoleRequest request)
    {
        var result = await _roleService.UpdateRoleAsync(id, request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("roles.manage")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _roleService.DeleteRoleAsync(id);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet("permissions-matrix")]
    public async Task<IActionResult> GetPermissionMatrix()
    {
        var result = await _roleService.GetPermissionMatrixAsync();
        return Ok(result);
    }

    [HttpGet("my-permissions")]
    public async Task<IActionResult> GetMyPermissions()
    {
        var permissions = await _roleService.GetUserPermissionsAsync(CurrentUserId);
        return Ok(ApiResponse<List<string>>.Ok(permissions));
    }
}

