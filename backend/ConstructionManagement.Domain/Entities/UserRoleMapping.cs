namespace ConstructionManagement.Domain.Entities;

public class UserRoleMapping
{
    public Guid UserId { get; set; }
    public Guid RoleId { get; set; }
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User? User { get; set; }
    public AppRole? Role { get; set; }
}
