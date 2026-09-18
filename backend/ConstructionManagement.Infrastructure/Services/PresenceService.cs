using System.Collections.Concurrent;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;

namespace ConstructionManagement.Infrastructure.Services;

public class PresenceService : IPresenceService
{
    private readonly ConcurrentDictionary<Guid, UserPresenceDto> _presences = new();
    private static readonly TimeSpan HeartbeatTtl = TimeSpan.FromSeconds(25);

    public Task UpdatePresenceAsync(Guid userId, string userName, string? avatarUrl, string? role, string? department, PresenceHeartbeatRequest request)
    {
        var now = DateTime.UtcNow;

        _presences.AddOrUpdate(
            userId,
            _ => new UserPresenceDto
            {
                UserId = userId,
                UserName = userName,
                UserAvatarUrl = avatarUrl,
                UserRole = role,
                UserDepartment = department,
                ProjectId = request.ProjectId,
                EditingTaskId = request.IsEditing ? request.TaskId : null,
                EditingTaskName = request.IsEditing ? request.TaskName : null,
                IsEditing = request.IsEditing,
                LastHeartbeat = now
            },
            (_, existing) =>
            {
                existing.UserName = userName;
                existing.UserAvatarUrl = avatarUrl;
                existing.UserRole = role;
                existing.UserDepartment = department;
                existing.ProjectId = request.ProjectId;
                existing.EditingTaskId = request.IsEditing ? request.TaskId : null;
                existing.EditingTaskName = request.IsEditing ? request.TaskName : null;
                existing.IsEditing = request.IsEditing;
                existing.LastHeartbeat = now;
                return existing;
            }
        );

        CleanupExpired();
        return Task.CompletedTask;
    }

    public Task ClearPresenceAsync(Guid userId)
    {
        _presences.TryRemove(userId, out _);
        return Task.CompletedTask;
    }

    public Task ClearEditingTaskAsync(Guid userId)
    {
        if (_presences.TryGetValue(userId, out var presence))
        {
            presence.EditingTaskId = null;
            presence.EditingTaskName = null;
            presence.IsEditing = false;
        }
        return Task.CompletedTask;
    }

    public ProjectPresenceDto GetProjectPresence(Guid projectId)
    {
        CleanupExpired();
        var now = DateTime.UtcNow;
        var threshold = now - HeartbeatTtl;

        var projectUsers = _presences.Values
            .Where(p => p.ProjectId == projectId && p.LastHeartbeat >= threshold)
            .ToList();

        var activeEditors = projectUsers
            .Where(p => p.IsEditing && p.EditingTaskId.HasValue)
            .Select(p => new TaskActiveEditorDto
            {
                TaskId = p.EditingTaskId!.Value,
                TaskName = p.EditingTaskName,
                UserId = p.UserId,
                UserName = p.UserName,
                UserAvatarUrl = p.UserAvatarUrl,
                EditingSince = p.LastHeartbeat
            })
            .ToList();

        return new ProjectPresenceDto
        {
            ProjectId = projectId,
            ActiveUsers = projectUsers,
            ActiveEditors = activeEditors
        };
    }

    public List<UserPresenceDto> GetAllOnlineUsers()
    {
        CleanupExpired();
        var threshold = DateTime.UtcNow - HeartbeatTtl;
        return _presences.Values
            .Where(p => p.LastHeartbeat >= threshold)
            .ToList();
    }

    public bool IsUserOnline(Guid userId)
    {
        CleanupExpired();
        return _presences.TryGetValue(userId, out var p) && p.LastHeartbeat >= DateTime.UtcNow - HeartbeatTtl;
    }

    private void CleanupExpired()
    {
        var threshold = DateTime.UtcNow - HeartbeatTtl;
        foreach (var pair in _presences)
        {
            if (pair.Value.LastHeartbeat < threshold)
            {
                _presences.TryRemove(pair.Key, out _);
            }
        }
    }
}
