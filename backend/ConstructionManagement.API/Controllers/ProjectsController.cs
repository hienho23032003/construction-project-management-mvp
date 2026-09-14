using ConstructionManagement.Application.Common;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.API.Controllers;

[Authorize]
public class ProjectsController : BaseApiController
{
    private readonly IProjectService _projectService;
    private readonly ITaskService _taskService;

    public ProjectsController(IProjectService projectService, ITaskService taskService)
    {
        _projectService = projectService;
        _taskService = taskService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PaginationParams pagination, [FromQuery] ProjectStatus? status)
    {
        var result = await _projectService.GetAllProjectsAsync(pagination, status);
        return Ok(result);
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllList()
    {
        var result = await _projectService.GetAllProjectsListAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _projectService.GetProjectByIdAsync(id);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "SuperAdmin,ProjectManager")]
    public async Task<IActionResult> Create([FromBody] CreateProjectRequest request)
    {
        var result = await _projectService.CreateProjectAsync(request, CurrentUserId);
        if (!result.Success) return BadRequest(result);
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "SuperAdmin,ProjectManager")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectRequest request)
    {
        var result = await _projectService.UpdateProjectAsync(id, request, CurrentUserId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _projectService.DeleteProjectAsync(id, CurrentUserId);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    [HttpGet("{id}/tasks")]
    public async Task<IActionResult> GetProjectTasks(Guid id)
    {
        var result = await _taskService.GetTaskTreeByProjectAsync(id);
        return Ok(result);
    }

    [HttpGet("{id}/members")]
    public async Task<IActionResult> GetMembers(Guid id)
    {
        var result = await _projectService.GetProjectMembersAsync(id);
        return Ok(result);
    }

    [HttpPost("{id}/members")]
    [Authorize(Roles = "SuperAdmin,ProjectManager")]
    public async Task<IActionResult> AddMember(Guid id, [FromBody] AddProjectMemberRequest request)
    {
        var result = await _projectService.AddProjectMemberAsync(id, request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{id}/members/{userId}")]
    [Authorize(Roles = "SuperAdmin,ProjectManager")]
    public async Task<IActionResult> RemoveMember(Guid id, Guid userId)
    {
        var result = await _projectService.RemoveProjectMemberAsync(id, userId);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }
}
