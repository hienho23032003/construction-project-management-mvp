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
        var now = DateTime.UtcNow;

        // Auto-close any previous active sessions for this user to avoid stale duplicate "Active" sessions
        var previousActiveSessions = await _context.UserLoginSessions
            .Where(s => s.UserId == userId && s.Status == SessionStatus.Active)
            .ToListAsync();

        foreach (var prev in previousActiveSessions)
        {
            var lastAct = prev.LastActiveTime ?? prev.LoginTime;
            prev.LogoutTime = lastAct;
            prev.Status = SessionStatus.LoggedOut;
            prev.DurationMinutes = Math.Max(0.1, Math.Round((lastAct - prev.LoginTime).TotalMinutes, 1));
        }

        var session = new UserLoginSession
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            LoginTime = now,
            LastActiveTime = now,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            Status = SessionStatus.Active,
            CreatedAt = now
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
        session.LastActiveTime = now;
        session.DurationMinutes = Math.Max(0.1, Math.Round((now - session.LoginTime).TotalMinutes, 1));
        session.Status = SessionStatus.LoggedOut;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> LeaveSessionAsync(Guid sessionId)
    {
        var session = await _context.UserLoginSessions.FirstOrDefaultAsync(s => s.Id == sessionId);
        if (session == null) return false;

        var now = DateTime.UtcNow;
        session.LogoutTime = now;
        session.LastActiveTime = now;
        session.DurationMinutes = Math.Max(0.1, Math.Round((now - session.LoginTime).TotalMinutes, 1));
        session.Status = SessionStatus.LoggedOut;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<ApiResponse<PingSessionResultDto>> PingSessionAsync(Guid sessionId, Guid userId, string? ipAddress = null, string? userAgent = null)
    {
        var now = DateTime.UtcNow;
        var session = sessionId != Guid.Empty
            ? await _context.UserLoginSessions.FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId)
            : null;

        var lastActivity = session?.LastActiveTime ?? session?.LoginTime ?? now;
        var idleGapMinutes = (now - lastActivity).TotalMinutes;

        // If session not found, or not Active, or inactive for > 2 minutes (tab was hidden/inactive):
        // Finalize old session if needed, then create a new active session for this authenticated user.
        if (session == null || session.Status != SessionStatus.Active || idleGapMinutes > 2.0)
        {
            if (session != null && session.Status == SessionStatus.Active)
            {
                session.LogoutTime = lastActivity;
                session.Status = idleGapMinutes >= 30.0 ? SessionStatus.Expired : SessionStatus.LoggedOut;
                session.DurationMinutes = Math.Max(0.1, Math.Round((lastActivity - session.LoginTime).TotalMinutes, 1));
            }

            var newSession = new UserLoginSession
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                LoginTime = now,
                LastActiveTime = now,
                IpAddress = ipAddress ?? session?.IpAddress,
                UserAgent = userAgent ?? session?.UserAgent,
                Status = SessionStatus.Active,
                CreatedAt = now
            };

            _context.UserLoginSessions.Add(newSession);
            await _context.SaveChangesAsync();

            return ApiResponse<PingSessionResultDto>.Ok(new PingSessionResultDto
            {
                SessionId = newSession.Id,
                IsNewSession = true
            });
        }

        // Active session within 2 minutes -> simply update LastActiveTime and Duration
        session.LastActiveTime = now;
        session.DurationMinutes = Math.Max(0.1, Math.Round((now - session.LoginTime).TotalMinutes, 1));
        await _context.SaveChangesAsync();

        return ApiResponse<PingSessionResultDto>.Ok(new PingSessionResultDto
        {
            SessionId = session.Id,
            IsNewSession = false
        });
    }

    public async Task<ApiResponse<PagedResult<UserLoginSessionDto>>> GetLoginHistoryAsync(
        DateTime? fromDate,
        DateTime? toDate,
        Guid? userId,
        string? status,
        string? search,
        PaginationParams pagination)
    {
        var now = DateTime.UtcNow;
        var onlineThreshold = now.AddMinutes(-2);

        var query = _context.UserLoginSessions
            .Include(s => s.User)
            .AsNoTracking();

        if (userId.HasValue && userId.Value != Guid.Empty)
        {
            query = query.Where(s => s.UserId == userId.Value);
        }

        if (fromDate.HasValue)
        {
            // Vietnam UTC+7 -> fromDate 00:00:00 VN corresponds to (fromDate - 7h) in UTC
            var fromUtc = fromDate.Value.Date.AddHours(-7);
            query = query.Where(s => s.LoginTime >= fromUtc);
        }

        if (toDate.HasValue)
        {
            // Vietnam UTC+7 -> toDate 23:59:59 VN corresponds to (toDate + 1 day - 7h) in UTC
            var toUtc = toDate.Value.Date.AddDays(1).AddHours(-7);
            query = query.Where(s => s.LoginTime < toUtc);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            var st = status.Trim();
            var expiredCutoff = now.AddMinutes(-30);

            if (st.Equals("Active", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(s => s.Status == SessionStatus.Active &&
                    ((s.LastActiveTime.HasValue && s.LastActiveTime.Value >= onlineThreshold) ||
                     (!s.LastActiveTime.HasValue && s.LoginTime >= onlineThreshold)));
            }
            else if (st.Equals("LoggedOut", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(s => s.Status == SessionStatus.LoggedOut ||
                    (s.Status == SessionStatus.Active &&
                     ((s.LastActiveTime.HasValue && s.LastActiveTime.Value < onlineThreshold && s.LastActiveTime.Value > expiredCutoff) ||
                      (!s.LastActiveTime.HasValue && s.LoginTime < onlineThreshold && s.LoginTime > expiredCutoff))));
            }
            else if (st.Equals("Expired", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(s => s.Status == SessionStatus.Expired ||
                    (s.Status == SessionStatus.Active &&
                     ((s.LastActiveTime.HasValue && s.LastActiveTime.Value <= expiredCutoff) ||
                      (!s.LastActiveTime.HasValue && s.LoginTime <= expiredCutoff))));
            }
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

        var rawItems = await query
            .OrderByDescending(s => s.LoginTime)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var items = rawItems.Select(s =>
        {
            var lastActivity = s.LastActiveTime ?? s.LoginTime;
            var isActuallyOnline = s.Status == SessionStatus.Active && lastActivity >= onlineThreshold;
            var idleMinutes = (now - lastActivity).TotalMinutes;

            SessionStatus resolvedStatus;
            DateTime? resolvedLogoutTime;
            double? resolvedDuration;

            if (isActuallyOnline)
            {
                resolvedStatus = SessionStatus.Active;
                resolvedLogoutTime = null;
                resolvedDuration = Math.Round((now - s.LoginTime).TotalMinutes, 1);
            }
            else if (s.Status == SessionStatus.Expired || (s.Status == SessionStatus.Active && idleMinutes >= 30.0))
            {
                resolvedStatus = SessionStatus.Expired;
                resolvedLogoutTime = s.LogoutTime ?? lastActivity;
                resolvedDuration = s.DurationMinutes ?? Math.Round(((s.LogoutTime ?? lastActivity) - s.LoginTime).TotalMinutes, 1);
            }
            else
            {
                resolvedStatus = SessionStatus.LoggedOut;
                resolvedLogoutTime = s.LogoutTime ?? lastActivity;
                resolvedDuration = s.DurationMinutes ?? Math.Round(((s.LogoutTime ?? lastActivity) - s.LoginTime).TotalMinutes, 1);
            }

            return new UserLoginSessionDto
            {
                Id = s.Id,
                UserId = s.UserId,
                UserName = s.User != null ? s.User.FullName : "Người dùng",
                UserEmail = s.User != null ? s.User.Email : string.Empty,
                UserDepartment = s.User != null ? s.User.Department : null,
                UserRole = s.User != null ? s.User.Role.ToString() : null,
                UserAvatarUrl = s.User != null ? s.User.AvatarUrl : null,
                LoginTime = DateTime.SpecifyKind(s.LoginTime, DateTimeKind.Utc),
                LogoutTime = resolvedLogoutTime.HasValue ? DateTime.SpecifyKind(resolvedLogoutTime.Value, DateTimeKind.Utc) : null,
                LastActiveTime = s.LastActiveTime.HasValue ? DateTime.SpecifyKind(s.LastActiveTime.Value, DateTimeKind.Utc) : null,
                DurationMinutes = Math.Max(0.1, resolvedDuration ?? 0),
                IpAddress = s.IpAddress,
                UserAgent = s.UserAgent,
                Status = resolvedStatus,
                CreatedAt = DateTime.SpecifyKind(s.CreatedAt, DateTimeKind.Utc)
            };
        }).ToList();

        var result = new PagedResult<UserLoginSessionDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageIndex = pageIndex,
            PageSize = pageSize
        };

        return ApiResponse<PagedResult<UserLoginSessionDto>>.Ok(result);
    }

    public async Task<ApiResponse<LoginSessionStatsDto>> GetSessionStatsAsync(DateTime? fromDate = null, DateTime? toDate = null)
    {
        var now = DateTime.UtcNow;
        var today = now.Date.AddHours(-7); // Vietnam start of today in UTC
        var tomorrow = today.AddDays(1);
        var onlineThreshold = now.AddMinutes(-2);

        var query = _context.UserLoginSessions.AsNoTracking();

        if (fromDate.HasValue)
        {
            var fromUtc = fromDate.Value.Date.AddHours(-7);
            query = query.Where(s => s.LoginTime >= fromUtc);
        }

        if (toDate.HasValue)
        {
            var toUtc = toDate.Value.Date.AddDays(1).AddHours(-7);
            query = query.Where(s => s.LoginTime < toUtc);
        }

        var totalSessions = await query.CountAsync();

        var activeOnlineUsers = await _context.UserLoginSessions
            .Where(s => s.Status == SessionStatus.Active &&
                        ((s.LastActiveTime.HasValue && s.LastActiveTime.Value >= onlineThreshold) ||
                         (!s.LastActiveTime.HasValue && s.LoginTime >= onlineThreshold)))
            .Select(s => s.UserId)
            .Distinct()
            .CountAsync();

        var loggedOutToday = await _context.UserLoginSessions
            .Where(s => (s.Status == SessionStatus.LoggedOut && ((s.LogoutTime ?? s.LastActiveTime ?? s.LoginTime) >= today && (s.LogoutTime ?? s.LastActiveTime ?? s.LoginTime) < tomorrow)) ||
                        (s.Status == SessionStatus.Active && (s.LastActiveTime ?? s.LoginTime) < onlineThreshold && (s.LastActiveTime ?? s.LoginTime) >= today))
            .CountAsync();

        var rawSessions = await query
            .Select(s => new
            {
                s.DurationMinutes,
                s.LoginTime,
                s.LogoutTime,
                s.LastActiveTime
            })
            .ToListAsync();

        var durations = rawSessions.Select(s =>
        {
            if (s.DurationMinutes.HasValue && s.DurationMinutes.Value > 0)
            {
                return s.DurationMinutes.Value;
            }
            var lastAct = s.LogoutTime ?? s.LastActiveTime ?? s.LoginTime;
            return Math.Max(0.1, Math.Round((lastAct - s.LoginTime).TotalMinutes, 1));
        }).ToList();

        var avgDuration = durations.DefaultIfEmpty(0).Average();

        return ApiResponse<LoginSessionStatsDto>.Ok(new LoginSessionStatsDto
        {
            TotalSessions = totalSessions,
            ActiveOnlineUsers = activeOnlineUsers,
            LoggedOutToday = loggedOutToday,
            AvgSessionMinutes = Math.Round(avgDuration, 1)
        });
    }
}
