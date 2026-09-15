using ConstructionManagement.Application.Common;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.API.Controllers;

[Authorize]
public class UsersController : BaseApiController
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUsers([FromQuery] PaginationParams pagination)
    {
        var result = await _userService.GetAllUsersAsync(pagination);
        return Ok(result);
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllUsersList()
    {
        var result = await _userService.GetAllUsersListAsync();
        return Ok(result);
    }

    [HttpGet("workload")]
    public async Task<IActionResult> GetWorkloadSummary()
    {
        var result = await _userService.GetWorkloadSummaryAsync();
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetUserById(Guid id)
    {
        var result = await _userService.GetUserByIdAsync(id);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    [HttpGet("{id:guid}/progress-summary")]
    public async Task<IActionResult> GetProgressSummary(Guid id)
    {
        var result = await _userService.GetUserProgressSummaryAsync(id);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        var result = await _userService.CreateUserAsync(request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        var result = await _userService.UpdateUserAsync(id, request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpPost("{id:guid}/avatar")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> UploadUserAvatar(Guid id, [FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { success = false, message = "Vui lòng chọn ảnh đại diện hợp lệ." });
        }

        var result = await _userService.UploadUserAvatarAsync(id, file);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var result = await _userService.DeleteUserAsync(id);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    [HttpPatch("{id:guid}/toggle-status")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> ToggleUserStatus(Guid id)
    {
        var result = await _userService.ToggleUserStatusAsync(id);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }
}
