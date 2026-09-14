namespace ConstructionManagement.Domain.Entities;

public class ProjectMember
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string? RoleInProject { get; set; } // e.g. "Kỹ sư trưởng", "Giám sát thi công", "Kỹ sư hiện trường"
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}
