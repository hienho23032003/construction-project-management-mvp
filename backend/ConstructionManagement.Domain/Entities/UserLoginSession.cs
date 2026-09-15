using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

public class UserLoginSession
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public DateTime LoginTime { get; set; } = DateTime.UtcNow;
    public DateTime? LogoutTime { get; set; }
    public DateTime? LastActiveTime { get; set; }
    public double? DurationMinutes { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public SessionStatus Status { get; set; } = SessionStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public User? User { get; set; }
}
