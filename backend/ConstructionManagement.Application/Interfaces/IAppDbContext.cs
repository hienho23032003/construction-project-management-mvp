using ConstructionManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Application.Interfaces;

public interface IAppDbContext
{
    DbSet<User> Users { get; }
    DbSet<Project> Projects { get; }
    DbSet<ProjectMember> ProjectMembers { get; }
    DbSet<TaskItem> Tasks { get; }
    DbSet<TaskAssignee> TaskAssignees { get; }
    DbSet<TaskDependency> TaskDependencies { get; }
    DbSet<TaskComment> TaskComments { get; }
    DbSet<TaskCommentAttachment> TaskCommentAttachments { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<ActivityLog> ActivityLogs { get; }
    DbSet<AppRole> Roles { get; }
    DbSet<RolePermission> RolePermissions { get; }
    DbSet<UserRoleMapping> UserRoles { get; }
    DbSet<UserLoginSession> UserLoginSessions { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
