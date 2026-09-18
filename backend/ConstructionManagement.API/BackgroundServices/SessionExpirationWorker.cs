using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.API.BackgroundServices;

public class SessionExpirationWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SessionExpirationWorker> _logger;

    public SessionExpirationWorker(IServiceProvider serviceProvider, ILogger<SessionExpirationWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("SessionExpirationWorker started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<IAppDbContext>();

                var now = DateTime.UtcNow;
                var expiredCutoff = now.AddMinutes(-30);

                var expiredSessions = await context.UserLoginSessions
                    .Where(s => s.Status == SessionStatus.Active &&
                                ((s.LastActiveTime.HasValue && s.LastActiveTime.Value <= expiredCutoff) ||
                                 (!s.LastActiveTime.HasValue && s.LoginTime <= expiredCutoff)))
                    .ToListAsync(stoppingToken);

                if (expiredSessions.Count > 0)
                {
                    foreach (var s in expiredSessions)
                    {
                        var lastAct = s.LastActiveTime ?? s.LoginTime;
                        s.Status = SessionStatus.Expired;
                        s.LogoutTime = lastAct;
                        s.DurationMinutes = Math.Max(0.1, Math.Round((lastAct - s.LoginTime).TotalMinutes, 1));
                    }

                    await context.SaveChangesAsync(stoppingToken);
                    _logger.LogInformation("SessionExpirationWorker marked {Count} inactive sessions as Expired.", expiredSessions.Count);
                }
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred in SessionExpirationWorker.");
            }
        }

        _logger.LogInformation("SessionExpirationWorker stopped.");
    }
}
