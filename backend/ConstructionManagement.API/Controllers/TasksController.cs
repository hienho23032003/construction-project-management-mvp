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

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] PaginationParams pagination,
        [FromQuery] Guid? projectId,
        [FromQuery] Guid? assigneeId,
        [FromQuery] TaskItemStatus? status,
        [FromQuery] PriorityLevel? priority)
    {
        var result = await _taskService.GetAllTasksAsync(pagination, projectId, assigneeId, status, priority);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _taskService.GetTaskByIdAsync(id);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "SuperAdmin,ProjectManager,Supervisor")]
    public async Task<IActionResult> Create([FromBody] CreateTaskRequest request)
    {
        var result = await _taskService.CreateTaskAsync(request, CurrentUserId);
        if (!result.Success) return BadRequest(result);
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "SuperAdmin,ProjectManager,Supervisor")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTaskRequest request)
    {
        var result = await _taskService.UpdateTaskAsync(id, request, CurrentUserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "SuperAdmin,ProjectManager")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _taskService.DeleteTaskAsync(id, CurrentUserId);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    // Direct Status Update (Employee / Supervisor / Manager)
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateTaskStatusRequest request)
    {
        var result = await _taskService.UpdateStatusAsync(id, request, CurrentUserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    // Direct Progress Update (Employee / Supervisor / Manager)
    [HttpPatch("{id}/progress")]
    public async Task<IActionResult> UpdateProgress(Guid id, [FromBody] UpdateTaskProgressRequest request)
    {
        var result = await _taskService.UpdateProgressAsync(id, request, CurrentUserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    // Gantt Drag & Drop Dates Update (Supervisor / Manager / Admin)
    [HttpPatch("{id}/dates")]
    [Authorize(Roles = "SuperAdmin,ProjectManager,Supervisor")]
    public async Task<IActionResult> UpdateDates(Guid id, [FromBody] UpdateTaskDatesRequest request)
    {
        var result = await _taskService.UpdateDatesAsync(id, request, CurrentUserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    // Gantt Data endpoint
    [HttpGet("gantt")]
    public async Task<IActionResult> GetGanttData(
        [FromQuery] Guid? projectId,
        [FromQuery] TaskItemStatus? status,
        [FromQuery] bool? activeOnly,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate)
    {
        var result = await _taskService.GetGanttDataAsync(projectId, status, activeOnly, fromDate, toDate);
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
    public async Task<IActionResult> GetDependencies(Guid id)
    {
        var result = await _taskService.GetTaskDependenciesAsync(id);
        return Ok(result);
    }

    [HttpPost("dependencies")]
    [Authorize(Roles = "SuperAdmin,ProjectManager,Supervisor")]
    public async Task<IActionResult> AddDependency([FromBody] CreateDependencyRequest request)
    {
        var result = await _taskService.AddDependencyAsync(request, CurrentUserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("dependencies/{dependencyId}")]
    [Authorize(Roles = "SuperAdmin,ProjectManager,Supervisor")]
    public async Task<IActionResult> DeleteDependency(Guid dependencyId)
    {
        var result = await _taskService.DeleteDependencyAsync(dependencyId, CurrentUserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }
}
