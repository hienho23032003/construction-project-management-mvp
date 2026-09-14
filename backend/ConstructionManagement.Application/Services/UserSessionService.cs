using ConstructionManagement.Application.Common;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Application.Services;

public class UserSessionService : IUserSessionService
{
    private readonly IAppDbContext _context;

    public UserSessionService(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> CreateSessionAsync(Guid userId, string? ipAddress, string? userAgent)
    {
        var session = new UserLoginSession
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            LoginTime = DateTime.UtcNow,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            Status = SessionStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        _context.UserLoginSessions.Add(session);
        await _context.SaveChangesAsync();

        return session.Id;
    }

    public async Task<bool> CloseSessionAsync(Guid sessionId)
    {
        var session = await _context.UserLoginSessions.FirstOrDefaultAsync(s => s.Id == sessionId);
        if (session == null) return false;

        var now = DateTime.UtcNow;
        session.LogoutTime = now;
        session.DurationMinutes = Math.Round((now - session.LoginTime).TotalMinutes, 1);
        session.Status = SessionStatus.LoggedOut;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<ApiResponse<PagedResult<UserLoginSessionDto>>> GetLoginHistoryAsync(
        DateTime? fromDate,
        DateTime? toDate,
        Guid? userId,
        string? search,
        PaginationParams pagination)
    {
        var query = _context.UserLoginSessions
            .Include(s => s.User)
            .AsNoTracking();

        if (userId.HasValue)
        {
            query = query.Where(s => s.UserId == userId.Value);
        }

        if (fromDate.HasValue)
        {
            var fromUtc = fromDate.Value.Date;
            query = query.Where(s => s.LoginTime >= fromUtc);
        }

        if (toDate.HasValue)
        {
            var toUtc = toDate.Value.Date.AddDays(1);
            query = query.Where(s => s.LoginTime < toUtc);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(x =>
                (x.User != null && (x.User.FullName.ToLower().Contains(s) || x.User.Email.ToLower().Contains(s))) ||
                (x.IpAddress != null && x.IpAddress.ToLower().Contains(s)) ||
                (x.UserAgent != null && x.UserAgent.ToLower().Contains(s)));
        }

        var totalCount = await query.CountAsync();
        var pageSize = pagination.PageSize > 0 ? pagination.PageSize : 15;
        var pageIndex = pagination.PageIndex > 0 ? pagination.PageIndex : 1;

        var items = await query
            .OrderByDescending(s => s.LoginTime)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new UserLoginSessionDto
            {
                Id = s.Id,
                UserId = s.UserId,
                UserName = s.User != null ? s.User.FullName : "Người dùng",
                UserEmail = s.User != null ? s.User.Email : string.Empty,
                UserDepartment = s.User != null ? s.User.Department : null,
                UserRole = s.User != null ? s.User.Role.ToString() : null,
                LoginTime = s.LoginTime,
                LogoutTime = s.LogoutTime,
                DurationMinutes = s.DurationMinutes,
                IpAddress = s.IpAddress,
                UserAgent = s.UserAgent,
                Status = s.Status,
                CreatedAt = s.CreatedAt
            })
            .ToListAsync();

        var result = new PagedResult<UserLoginSessionDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageIndex = pageIndex,
            PageSize = pageSize
        };

        return ApiResponse<PagedResult<UserLoginSessionDto>>.Ok(result);
    }

    public async Task<ApiResponse<LoginSessionStatsDto>> GetSessionStatsAsync()
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var totalSessions = await _context.UserLoginSessions.CountAsync();

        var activeOnlineUsers = await _context.UserLoginSessions
            .Where(s => s.Status == SessionStatus.Active && s.LoginTime >= DateTime.UtcNow.AddHours(-12))
            .Select(s => s.UserId)
            .Distinct()
            .CountAsync();

        var loggedOutToday = await _context.UserLoginSessions
            .Where(s => s.Status == SessionStatus.LoggedOut && s.LogoutTime >= today && s.LogoutTime < tomorrow)
            .CountAsync();

        var allClosedSessions = await _context.UserLoginSessions
            .Where(s => s.DurationMinutes.HasValue && s.DurationMinutes > 0)
            .Select(s => s.DurationMinutes!.Value)
            .ToListAsync();

        var avgDuration = allClosedSessions.DefaultIfEmpty(0).Average();

        return ApiResponse<LoginSessionStatsDto>.Ok(new LoginSessionStatsDto
        {
            TotalSessions = totalSessions,
            ActiveOnlineUsers = activeOnlineUsers,
            LoggedOutToday = loggedOutToday,
            AvgSessionMinutes = Math.Round(avgDuration, 1)
        });
    }
}
