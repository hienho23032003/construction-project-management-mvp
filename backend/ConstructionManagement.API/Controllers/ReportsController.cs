using ConstructionManagement.API.Filters;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.API.Controllers;

[Authorize]
public class ReportsController : BaseApiController
{
    private readonly IReportService _reportService;
    private readonly IRoleService _roleService;

    public ReportsController(IReportService reportService, IRoleService roleService)
    {
        _reportService = reportService;
        _roleService = roleService;
    }

    private async Task<(bool canViewAll, bool canViewProject)> CheckReportPermissionsAsync()
    {
        if (User.IsInRole("SuperAdmin")) return (true, true);
        if (CurrentUserId == Guid.Empty) return (true, true);
        var permissions = await _roleService.GetUserPermissionsAsync(CurrentUserId);
        var canViewAll = permissions.Contains("reports.view_all");
        var canViewProject = canViewAll || permissions.Contains("reports.view_project");
        return (canViewAll, canViewProject);
    }

    [HttpGet("project-progress")]
    [RequirePermission("reports.view")]
    public async Task<IActionResult> GetProjectProgress([FromQuery] ReportFilterRequest filter)
    {
        var (canViewAll, canViewProject) = await CheckReportPermissionsAsync();
        var result = await _reportService.GetProjectProgressReportAsync(filter, CurrentUserId, canViewAll, canViewProject);
        return Ok(result);
    }

    [HttpGet("tasks")]
    [RequirePermission("reports.view")]
    public async Task<IActionResult> GetTasks([FromQuery] ReportFilterRequest filter)
    {
        var (canViewAll, canViewProject) = await CheckReportPermissionsAsync();
        var result = await _reportService.GetTaskReportAsync(filter, CurrentUserId, canViewAll, canViewProject);
        return Ok(result);
    }

    [HttpGet("overdue")]
    [RequirePermission("reports.view")]
    public async Task<IActionResult> GetOverdue([FromQuery] ReportFilterRequest filter)
    {
        var (canViewAll, canViewProject) = await CheckReportPermissionsAsync();
        var result = await _reportService.GetOverdueReportAsync(filter, CurrentUserId, canViewAll, canViewProject);
        return Ok(result);
    }

    [HttpGet("workload")]
    [RequirePermission("reports.view")]
    public async Task<IActionResult> GetWorkload([FromQuery] ReportFilterRequest filter)
    {
        var (canViewAll, canViewProject) = await CheckReportPermissionsAsync();
        var result = await _reportService.GetEmployeeWorkloadReportAsync(filter, CurrentUserId, canViewAll, canViewProject);
        return Ok(result);
    }

    [HttpGet("export")]
    [RequirePermission("reports.export")]
    public async Task<IActionResult> ExportCsv([FromQuery] string type, [FromQuery] ReportFilterRequest filter)
    {
        var (canViewAll, canViewProject) = await CheckReportPermissionsAsync();
        var bytes = await _reportService.ExportReportCsvAsync(type ?? "tasks", filter, CurrentUserId, canViewAll, canViewProject);
        var fileName = $"BaoCao_{type}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
        return File(bytes, "text/csv; charset=utf-8", fileName);
    }
}

