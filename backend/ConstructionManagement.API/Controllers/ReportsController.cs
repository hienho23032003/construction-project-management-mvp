using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.API.Controllers;

[Authorize]
public class ReportsController : BaseApiController
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("project-progress")]
    public async Task<IActionResult> GetProjectProgress([FromQuery] ReportFilterRequest filter)
    {
        var result = await _reportService.GetProjectProgressReportAsync(filter);
        return Ok(result);
    }

    [HttpGet("tasks")]
    public async Task<IActionResult> GetTasks([FromQuery] ReportFilterRequest filter)
    {
        var result = await _reportService.GetTaskReportAsync(filter);
        return Ok(result);
    }

    [HttpGet("overdue")]
    public async Task<IActionResult> GetOverdue([FromQuery] ReportFilterRequest filter)
    {
        var result = await _reportService.GetOverdueReportAsync(filter);
        return Ok(result);
    }

    [HttpGet("workload")]
    public async Task<IActionResult> GetWorkload([FromQuery] ReportFilterRequest filter)
    {
        var result = await _reportService.GetEmployeeWorkloadReportAsync(filter);
        return Ok(result);
    }

    [HttpGet("export")]
    public async Task<IActionResult> ExportCsv([FromQuery] string type, [FromQuery] ReportFilterRequest filter)
    {
        var bytes = await _reportService.ExportReportCsvAsync(type ?? "tasks", filter);
        var fileName = $"BaoCao_{type}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
        return File(bytes, "text/csv; charset=utf-8", fileName);
    }
}
