namespace ConstructionManagement.Domain.Enums;

public enum ConversationType
{
    Direct = 0,
    Group = 1,
    ProjectBound = 2
}

public enum ChatMessageType
{
    Text = 0,
    Image = 1,
    File = 2,
    TaskCard = 3,
    ProjectCard = 4,
    System = 5
}

public enum ChatMentionType
{
    User = 0,
    Task = 1,
    Project = 2
}

public enum MemberRole
{
    Member = 0,
    Admin = 1
}
