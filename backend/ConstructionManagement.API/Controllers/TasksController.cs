using ConstructionManagement.API.Filters;
using ConstructionManagement.Application.Common;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.API.Controllers;

[Authorize]
public class TasksController : BaseApiController
{
    private readonly ITaskService _taskService;
    private readonly IRoleService _roleService;

    public TasksController(ITaskService taskService, IRoleService roleService)
    {
        _taskService = taskService;
        _roleService = roleService;
    }

    [HttpGet]
    [RequirePermission("tasks.view")]
    public async Task<IActionResult> GetAll(
        [FromQuery] PaginationParams pagination,
        [FromQuery] Guid? projectId,
        [FromQuery] Guid? assigneeId,
        [FromQuery] TaskItemStatus? status,
        [FromQuery] PriorityLevel? priority)
    {
        var isSuperAdmin = User.IsInRole("SuperAdmin");
        var canViewAll = isSuperAdmin;
        var canViewProject = isSuperAdmin;

        if (!isSuperAdmin && CurrentUserId != Guid.Empty)
        {
            var permissions = await _roleService.GetUserPermissionsAsync(CurrentUserId);
            canViewAll = permissions.Contains("tasks.view_all");
            canViewProject = canViewAll || permissions.Contains("tasks.view_project");
        }

        var result = await _taskService.GetAllTasksAsync(pagination, projectId, assigneeId, status, priority, CurrentUserId, canViewAll, canViewProject);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [RequirePermission("tasks.view")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _taskService.GetTaskByIdAsync(id);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    [RequirePermission("tasks.create")]
    public async Task<IActionResult> Create([FromBody] CreateTaskRequest request)
    {
        var result = await _taskService.CreateTaskAsync(request, CurrentUserId);
        if (!result.Success) return BadRequest(result);
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id}")]
    [RequirePermission("tasks.edit")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTaskRequest request)
    {
        var result = await _taskService.UpdateTaskAsync(id, request, CurrentUserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [RequirePermission("tasks.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _taskService.DeleteTaskAsync(id, CurrentUserId);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    // Direct Status Update (Assigned employee or Manager/Admin)
    [HttpPatch("{id}/status")]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateTaskStatusRequest request)
    {
        var result = await _taskService.UpdateStatusAsync(id, request, CurrentUserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    // Direct Progress Update (Assigned employee or Manager/Admin)
    [HttpPatch("{id}/progress")]
    [HttpPut("{id}/progress")]
    public async Task<IActionResult> UpdateProgress(Guid id, [FromBody] UpdateTaskProgressRequest request)
    {
        var result = await _taskService.UpdateProgressAsync(id, request, CurrentUserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    // Gantt Drag & Drop Dates Update (Supervisor / Manager / Admin)
    [HttpPatch("{id}/dates")]
    [HttpPut("{id}/dates")]
    [RequirePermission("tasks.edit")]
    public async Task<IActionResult> UpdateDates(Guid id, [FromBody] UpdateTaskDatesRequest request)
    {
        var result = await _taskService.UpdateDatesAsync(id, request, CurrentUserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    // Gantt Data endpoint
    [HttpGet("gantt")]
    [RequirePermission("gantt.view")]
    public async Task<IActionResult> GetGanttData(
        [FromQuery] Guid? projectId,
        [FromQuery] TaskItemStatus? status,
        [FromQuery] bool? activeOnly,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate)
    {
        var isSuperAdmin = User.IsInRole("SuperAdmin");
        var canViewAll = isSuperAdmin;
        var canViewProject = isSuperAdmin;

        if (!isSuperAdmin && CurrentUserId != Guid.Empty)
        {
            var permissions = await _roleService.GetUserPermissionsAsync(CurrentUserId);
            canViewAll = permissions.Contains("gantt.view_all");
            canViewProject = canViewAll || permissions.Contains("gantt.view_project");
        }

        var result = await _taskService.GetGanttDataAsync(projectId, status, activeOnly, fromDate, toDate, CurrentUserId, canViewAll, canViewProject);
        return Ok(result);
    }

    // Comments
    [HttpGet("{id}/comments")]
    public async Task<IActionResult> GetComments(Guid id)
    {
        var result = await _taskService.GetTaskCommentsAsync(id);
        return Ok(result);
    }

    [HttpPost("{id}/comments")]
    public async Task<IActionResult> AddComment(Guid id, [FromBody] CreateCommentRequest request)
    {
        var result = await _taskService.AddCommentAsync(id, request, CurrentUserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpPost("{id}/comments-with-attachments")]
    public async Task<IActionResult> AddCommentWithAttachments(Guid id, [FromForm] CreateCommentWithFilesRequest request)
    {
        var result = await _taskService.AddCommentWithAttachmentsAsync(id, request, CurrentUserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("comments/{commentId}")]
    public async Task<IActionResult> DeleteComment(Guid commentId)
    {
        var result = await _taskService.DeleteCommentAsync(commentId, CurrentUserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    // Dependencies
    [HttpGet("{id}/dependencies")]
    [RequirePermission("tasks.view")]
    public async Task<IActionResult> GetDependencies(Guid id)
    {
        var result = await _taskService.GetTaskDependenciesAsync(id);
        return Ok(result);
    }

    [HttpPost("dependencies")]
    [RequirePermission("tasks.edit")]
    public async Task<IActionResult> AddDependency([FromBody] CreateDependencyRequest request)
    {
        var result = await _taskService.AddDependencyAsync(request, CurrentUserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("dependencies/{dependencyId}")]
    [RequirePermission("tasks.edit")]
    public async Task<IActionResult> DeleteDependency(Guid dependencyId)
    {
        var result = await _taskService.DeleteDependencyAsync(dependencyId, CurrentUserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }
}

