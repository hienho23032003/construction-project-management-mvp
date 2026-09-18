namespace ConstructionManagement.Domain.Enums;

public enum ProjectStatus
{
    NotStarted = 0,
    InProgress = 1,
    Completed = 2,
    OnHold = 3,
    Overdue = 4,
    Cancelled = 5
}

public enum TaskItemStatus
{
    NotStarted = 0,
    InProgress = 1,
    Completed = 2,
    OnHold = 3,
    Overdue = 4
}

public enum PriorityLevel
{
    Low = 0,
    Medium = 1,
    High = 2,
    Urgent = 3
}

public enum UserRole
{
    Employee = 0,
    Supervisor = 1,
    ProjectManager = 2,
    SuperAdmin = 3
}

public enum DependencyType
{
    FinishToStart = 0,
    StartToStart = 1,
    FinishToFinish = 2,
    StartToFinish = 3
}

public enum NotificationType
{
    TaskAssigned = 0,
    TaskDeadlineSoon = 1,
    TaskOverdue = 2,
    TaskStatusChanged = 3,
    TaskProgressChanged = 4,
    CommentAdded = 5,
    DeadlineChanged = 6,
    ProjectAssigned = 7
}

public enum ActivityAction
{
    ProjectCreated = 0,
    ProjectUpdated = 1,
    TaskCreated = 2,
    TaskUpdated = 3,
    TaskAssigned = 4,
    StatusChanged = 5,
    ProgressChanged = 6,
    DeadlineChanged = 7,
    CommentAdded = 8,
    MemberAdded = 9,
    MemberRemoved = 10,
    TaskDeleted = 11,
    ProjectDeleted = 12
}

public enum SessionStatus
{
    Active = 0,
    LoggedOut = 1,
    Expired = 2
}
