using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces;

public interface IPresenceService
{
    Task UpdatePresenceAsync(Guid userId, string userName, string? avatarUrl, string? role, string? department, PresenceHeartbeatRequest request);
    Task ClearPresenceAsync(Guid userId);
    Task ClearEditingTaskAsync(Guid userId);
    ProjectPresenceDto GetProjectPresence(Guid projectId);
    List<UserPresenceDto> GetAllOnlineUsers();
    bool IsUserOnline(Guid userId);
}
