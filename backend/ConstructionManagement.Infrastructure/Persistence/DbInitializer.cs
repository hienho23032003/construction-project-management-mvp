using BCrypt.Net;
using ConstructionManagement.Application.Services;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task InitializeAsync(AppDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        // Tự động đồng bộ Schema: Tự tạo bảng mới hoặc thêm các cột/field mới vào SQLite DB mà không làm mất dữ liệu
        await AutoSyncSchemaAsync(context);

        if (await context.Users.AnyAsync())
        {
            // Auto update any legacy role names or departments if present
            var legacyRoles = await context.Roles.Where(r => r.Name.Contains("Chỉ Huy Trưởng")).ToListAsync();
            if (legacyRoles.Any())
            {
                foreach (var r in legacyRoles)
                {
                    r.Name = r.Name.Replace("Chỉ Huy Trưởng", "Người Quản Lý");
                }
                await context.SaveChangesAsync();
            }

            var legacyUsers = await context.Users.Where(u => u.Department != null && u.Department.Contains("Ban Chỉ Huy")).ToListAsync();
            if (legacyUsers.Any())
            {
                foreach (var u in legacyUsers)
                {
                    u.Department = u.Department.Replace("Ban Chỉ Huy", "Ban Quản Lý");
                }
                await context.SaveChangesAsync();
            }

            return; // DB already seeded
        }

        var defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123456");

        // 1. Create Users
        var admin = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Nguyễn Văn Admin",
            Email = "admin@construction.com",
            PasswordHash = defaultPasswordHash,
            Phone = "0901234567",
            Department = "Ban Giám Đốc",
            Role = UserRole.SuperAdmin,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var pmViet = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Trần Quốc Việt",
            Email = "pm.viet@construction.com",
            PasswordHash = defaultPasswordHash,
            Phone = "0902345678",
            Department = "Ban Quản Lý Dự Án",
            Role = UserRole.ProjectManager,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var supDung = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Lê Hoàng Dũng",
            Email = "sup.dung@construction.com",
            PasswordHash = defaultPasswordHash,
            Phone = "0903456789",
            Department = "Ban Quản Lý Công Trường",
            Role = UserRole.Supervisor,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var engHien = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Phạm Đình Hiển",
            Email = "dev.hien@construction.com",
            PasswordHash = defaultPasswordHash,
            Phone = "0904567890",
            Department = "Phòng Kỹ Thuật & Thi Công",
            Role = UserRole.Employee,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var engAn = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Vũ Thành An",
            Email = "eng.an@construction.com",
            PasswordHash = defaultPasswordHash,
            Phone = "0905678901",
            Department = "Phòng Cơ Điện (ME)",
            Role = UserRole.Employee,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var engHoa = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Đặng Mai Hoa",
            Email = "eng.hoa@construction.com",
            PasswordHash = defaultPasswordHash,
            Phone = "0906789012",
            Department = "Phòng Quản Lý Vật Tư",
            Role = UserRole.Employee,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.AddRange(admin, pmViet, supDung, engHien, engAn, engHoa);
        await context.SaveChangesAsync();

        // 1.1 Seed Standard Roles & Permissions
        var roleAdmin = new AppRole
        {
            Id = Guid.NewGuid(),
            Name = "Super Admin (Quản Trị Tối Cao)",
            Code = "SUPER_ADMIN",
            Description = "Toàn quyền quản trị toàn bộ hệ thống, phân quyền và giám sát dự án",
            IsSystem = true,
            CreatedAt = DateTime.UtcNow
        };

        var rolePm = new AppRole
        {
            Id = Guid.NewGuid(),
            Name = "Người Quản Lý (Project Manager)",
            Code = "PROJECT_MANAGER",
            Description = "Quản lý toàn diện tiến độ, nhân sự, phê duyệt và điều phối công trình",
            IsSystem = false,
            CreatedAt = DateTime.UtcNow
        };

        var roleSupervisor = new AppRole
        {
            Id = Guid.NewGuid(),
            Name = "Giám Sát Công Trường (Site Supervisor)",
            Code = "SITE_SUPERVISOR",
            Description = "Giám sát kỹ thuật hiện trường, nghiệm thu, giao việc và theo dõi tiến độ thi công",
            IsSystem = false,
            CreatedAt = DateTime.UtcNow
        };

        var roleEngineer = new AppRole
        {
            Id = Guid.NewGuid(),
            Name = "Kỹ Sư Thi Công / Hiện Trường",
            Code = "FIELD_ENGINEER",
            Description = "Thực hiện các hạng mục công việc, cập nhật tiến độ thi công và thảo luận kỹ thuật",
            IsSystem = false,
            CreatedAt = DateTime.UtcNow
        };

        var roleAccountant = new AppRole
        {
            Id = Guid.NewGuid(),
            Name = "Kế Toán & Quản Lý Vật Tư",
            Code = "ACCOUNTANT_SUPPLY",
            Description = "Theo dõi xuất nhập vật tư và tra cứu báo cáo tài chính dự án",
            IsSystem = false,
            CreatedAt = DateTime.UtcNow
        };

        context.Roles.AddRange(roleAdmin, rolePm, roleSupervisor, roleEngineer, roleAccountant);
        await context.SaveChangesAsync();

        // All system permissions for SuperAdmin
        var allPermCodes = RoleService.SystemPermissions.SelectMany(g => g.Permissions).Select(p => p.Code).Distinct().ToList();
        foreach (var p in allPermCodes)
        {
            context.RolePermissions.Add(new RolePermission { Id = Guid.NewGuid(), RoleId = roleAdmin.Id, PermissionCode = p, CreatedAt = DateTime.UtcNow });
        }

        // PM Permissions
        var pmPerms = new[]
        {
            "projects.view", "projects.create", "projects.edit", "projects.manage_members",
            "tasks.view", "tasks.create", "tasks.edit", "tasks.delete", "tasks.update_status", "tasks.update_progress", "tasks.comment",
            "gantt.view", "gantt.edit_timeline",
            "employees.view", "reports.view", "reports.export", "audit.view_sessions"
        };
        foreach (var p in pmPerms)
        {
            context.RolePermissions.Add(new RolePermission { Id = Guid.NewGuid(), RoleId = rolePm.Id, PermissionCode = p, CreatedAt = DateTime.UtcNow });
        }

        // Supervisor Permissions
        var supPerms = new[]
        {
            "projects.view",
            "tasks.view", "tasks.create", "tasks.edit", "tasks.update_status", "tasks.update_progress", "tasks.comment",
            "gantt.view", "gantt.edit_timeline",
            "employees.view", "reports.view"
        };
        foreach (var p in supPerms)
        {
            context.RolePermissions.Add(new RolePermission { Id = Guid.NewGuid(), RoleId = roleSupervisor.Id, PermissionCode = p, CreatedAt = DateTime.UtcNow });
        }

        // Engineer Permissions
        var engPerms = new[]
        {
            "projects.view",
            "tasks.view", "tasks.update_status", "tasks.update_progress", "tasks.comment",
            "gantt.view", "employees.view"
        };
        foreach (var p in engPerms)
        {
            context.RolePermissions.Add(new RolePermission { Id = Guid.NewGuid(), RoleId = roleEngineer.Id, PermissionCode = p, CreatedAt = DateTime.UtcNow });
        }

        // Accountant Permissions
        var accPerms = new[] { "projects.view", "reports.view", "reports.export" };
        foreach (var p in accPerms)
        {
            context.RolePermissions.Add(new RolePermission { Id = Guid.NewGuid(), RoleId = roleAccountant.Id, PermissionCode = p, CreatedAt = DateTime.UtcNow });
        }

        // 1.2 Seed User Role Mappings
        context.UserRoles.AddRange(
            new UserRoleMapping { UserId = admin.Id, RoleId = roleAdmin.Id, AssignedAt = DateTime.UtcNow },
            new UserRoleMapping { UserId = pmViet.Id, RoleId = rolePm.Id, AssignedAt = DateTime.UtcNow },
            new UserRoleMapping { UserId = supDung.Id, RoleId = roleSupervisor.Id, AssignedAt = DateTime.UtcNow },
            new UserRoleMapping { UserId = engHien.Id, RoleId = roleEngineer.Id, AssignedAt = DateTime.UtcNow },
            new UserRoleMapping { UserId = engAn.Id, RoleId = roleEngineer.Id, AssignedAt = DateTime.UtcNow },
            new UserRoleMapping { UserId = engHoa.Id, RoleId = roleAccountant.Id, AssignedAt = DateTime.UtcNow }
        );

        // 1.3 Seed Sample Login Sessions (User Login/Logout History)
        var sNow = DateTime.UtcNow;
        context.UserLoginSessions.AddRange(
            new UserLoginSession
            {
                Id = Guid.NewGuid(),
                UserId = admin.Id,
                LoginTime = sNow.AddHours(-3),
                LogoutTime = null,
                DurationMinutes = null,
                IpAddress = "192.168.1.100",
                UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
                Status = SessionStatus.Active,
                CreatedAt = sNow.AddHours(-3)
            },
            new UserLoginSession
            {
                Id = Guid.NewGuid(),
                UserId = pmViet.Id,
                LoginTime = sNow.AddHours(-5),
                LogoutTime = sNow.AddHours(-2).AddMinutes(15),
                DurationMinutes = 165.0,
                IpAddress = "192.168.1.105",
                UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/128.0",
                Status = SessionStatus.LoggedOut,
                CreatedAt = sNow.AddHours(-5)
            },
            new UserLoginSession
            {
                Id = Guid.NewGuid(),
                UserId = supDung.Id,
                LoginTime = sNow.AddHours(-4),
                LogoutTime = null,
                DurationMinutes = null,
                IpAddress = "113.161.45.22",
                UserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6) Safari/604.1",
                Status = SessionStatus.Active,
                CreatedAt = sNow.AddHours(-4)
            },
            new UserLoginSession
            {
                Id = Guid.NewGuid(),
                UserId = engHien.Id,
                LoginTime = sNow.AddDays(-1).AddHours(-6),
                LogoutTime = sNow.AddDays(-1).AddHours(-2),
                DurationMinutes = 240.0,
                IpAddress = "14.232.18.90",
                UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
                Status = SessionStatus.LoggedOut,
                CreatedAt = sNow.AddDays(-1).AddHours(-6)
            }
        );
        await context.SaveChangesAsync();

        var today = DateTime.UtcNow.Date;

        // 2. Create Project 1: CV5 - Công trình Tòa nhà Văn phòng SkyTower
        var prjCv5 = new Project
        {
            Id = Guid.NewGuid(),
            Code = "CV5",
            Name = "Công trình Tòa nhà Văn phòng SkyTower",
            Description = "Dự án xây dựng tòa nhà văn phòng 15 tầng tại Quận 7, TP.HCM.",
            Location = "Khu đô thị Phú Mỹ Hưng, Quận 7, TP. Hồ Chí Minh",
            ManagerId = pmViet.Id,
            StartDate = today.AddDays(-30),
            PlannedEndDate = today.AddDays(90),
            Status = ProjectStatus.InProgress,
            Progress = 62.5,
            Priority = PriorityLevel.High,
            CreatedById = admin.Id,
            CreatedAt = DateTime.UtcNow.AddDays(-30)
        };

        // 3. Create Project 2: CV3 - Cải tạo Biệt thự Vườn Riverside
        var prjCv3 = new Project
        {
            Id = Guid.NewGuid(),
            Code = "CV3",
            Name = "Cải tạo Biệt thự Vườn Riverside",
            Description = "Cải tạo cảnh quan, sân vườn và nội thất biệt thự nghỉ dưỡng.",
            Location = "Bình Dương",
            ManagerId = pmViet.Id,
            StartDate = today.AddDays(-60),
            PlannedEndDate = today.AddDays(-5),
            ActualEndDate = today.AddDays(-3),
            Status = ProjectStatus.Completed,
            Progress = 100.0,
            Priority = PriorityLevel.Medium,
            CreatedById = admin.Id,
            CreatedAt = DateTime.UtcNow.AddDays(-60)
        };

        // 4. Create Project 3: CV7 - Xây dựng Nhà xưởng KCN Tân Bình
        var prjCv7 = new Project
        {
            Id = Guid.NewGuid(),
            Code = "CV7",
            Name = "Xây dựng Nhà xưởng KCN Tân Bình",
            Description = "Thi công nhà xưởng sản xuất khung thép tiền chế 5000m2.",
            Location = "KCN Tân Bình, TP. Hồ Chí Minh",
            ManagerId = pmViet.Id,
            StartDate = today.AddDays(-10),
            PlannedEndDate = today.AddDays(120),
            Status = ProjectStatus.InProgress,
            Progress = 25.0,
            Priority = PriorityLevel.Urgent,
            CreatedById = admin.Id,
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        };

        context.Projects.AddRange(prjCv5, prjCv3, prjCv7);
        await context.SaveChangesAsync();

        // Project Members for CV5
        context.ProjectMembers.AddRange(
            new ProjectMember { ProjectId = prjCv5.Id, UserId = pmViet.Id, RoleInProject = "Người quản lý / PM", JoinedAt = today.AddDays(-30) },
            new ProjectMember { ProjectId = prjCv5.Id, UserId = supDung.Id, RoleInProject = "Giám sát trưởng hiện trường", JoinedAt = today.AddDays(-30) },
            new ProjectMember { ProjectId = prjCv5.Id, UserId = engHien.Id, RoleInProject = "Kỹ sư thi công kết cấu", JoinedAt = today.AddDays(-30) },
            new ProjectMember { ProjectId = prjCv5.Id, UserId = engAn.Id, RoleInProject = "Kỹ sư cơ điện (ME)", JoinedAt = today.AddDays(-30) },
            new ProjectMember { ProjectId = prjCv5.Id, UserId = engHoa.Id, RoleInProject = "Kỹ sư quản lý vật tư", JoinedAt = today.AddDays(-30) }
        );

        // Project Members for CV3 & CV7
        context.ProjectMembers.AddRange(
            new ProjectMember { ProjectId = prjCv3.Id, UserId = pmViet.Id, RoleInProject = "PM", JoinedAt = today.AddDays(-60) },
            new ProjectMember { ProjectId = prjCv3.Id, UserId = supDung.Id, RoleInProject = "Giám sát", JoinedAt = today.AddDays(-60) },
            new ProjectMember { ProjectId = prjCv7.Id, UserId = pmViet.Id, RoleInProject = "PM", JoinedAt = today.AddDays(-10) },
            new ProjectMember { ProjectId = prjCv7.Id, UserId = engHien.Id, RoleInProject = "Kỹ sư kết cấu thép", JoinedAt = today.AddDays(-10) }
        );
        await context.SaveChangesAsync();

        // ================= TASKS FOR PROJECT CV5 (Multi-level Hierarchy) =================
        // Level 0: Phase 1 - Thiết kế & Pháp lý
        var phase1 = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = prjCv5.Id,
            Name = "1. Thiết kế & Xin phép thi công",
            Description = "Khảo sát, lập bản vẽ và xin cấp phép thi công",
            Status = TaskItemStatus.Completed,
            Priority = PriorityLevel.High,
            StartDate = today.AddDays(-30),
            PlannedEndDate = today.AddDays(-15),
            ActualEndDate = today.AddDays(-16),
            Progress = 100.0,
            Weight = 1.0,
            SortOrder = 1,
            CreatedAt = today.AddDays(-30)
        };
        context.Tasks.Add(phase1);
        await context.SaveChangesAsync();

        var task1_1 = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = prjCv5.Id,
            ParentId = phase1.Id,
            Name = "Khảo sát địa chất hiện trạng",
            Description = "Khoan thăm dò và lấy mẫu đất hiện trường",
            Status = TaskItemStatus.Completed,
            Priority = PriorityLevel.Medium,
            StartDate = today.AddDays(-30),
            PlannedEndDate = today.AddDays(-25),
            ActualEndDate = today.AddDays(-26),
            Progress = 100.0,
            Weight = 1.0,
            SortOrder = 1,
            CreatedAt = today.AddDays(-30)
        };
        var task1_2 = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = prjCv5.Id,
            ParentId = phase1.Id,
            Name = "Lập bản vẽ kỹ thuật thi công",
            Description = "Triển khai hồ sơ thiết kế bản vẽ chi tiết",
            Status = TaskItemStatus.Completed,
            Priority = PriorityLevel.High,
            StartDate = today.AddDays(-24),
            PlannedEndDate = today.AddDays(-18),
            ActualEndDate = today.AddDays(-19),
            Progress = 100.0,
            Weight = 1.0,
            SortOrder = 2,
            CreatedAt = today.AddDays(-30)
        };
        var task1_3 = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = prjCv5.Id,
            ParentId = phase1.Id,
            Name = "Duyệt bản vẽ & Thẩm định",
            Description = "Chủ đầu tư duyệt bản vẽ kỹ thuật",
            Status = TaskItemStatus.Completed,
            Priority = PriorityLevel.High,
            StartDate = today.AddDays(-17),
            PlannedEndDate = today.AddDays(-15),
            ActualEndDate = today.AddDays(-16),
            Progress = 100.0,
            Weight = 1.0,
            SortOrder = 3,
            CreatedAt = today.AddDays(-30)
        };
        context.Tasks.AddRange(task1_1, task1_2, task1_3);

        // Level 0: Phase 2 - Chuẩn bị vật tư & Mặt bằng
        var phase2 = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = prjCv5.Id,
            Name = "2. Chuẩn bị vật tư & Mặt bằng",
            Description = "Tập kết trang thiết bị và vật liệu chính",
            Status = TaskItemStatus.Completed,
            Priority = PriorityLevel.Medium,
            StartDate = today.AddDays(-14),
            PlannedEndDate = today.AddDays(-5),
            ActualEndDate = today.AddDays(-5),
            Progress = 100.0,
            Weight = 1.0,
            SortOrder = 2,
            CreatedAt = today.AddDays(-30)
        };
        context.Tasks.Add(phase2);
        await context.SaveChangesAsync();

        var task2_1 = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = prjCv5.Id,
            ParentId = phase2.Id,
            Name = "Lập danh mục & Đặt hàng thép, xi măng",
            Description = "Đặt hàng nhà cung cấp Hòa Phát & Nghi Sơn",
            Status = TaskItemStatus.Completed,
            Priority = PriorityLevel.Medium,
            StartDate = today.AddDays(-14),
            PlannedEndDate = today.AddDays(-10),
            ActualEndDate = today.AddDays(-10),
            Progress = 100.0,
            Weight = 1.0,
            SortOrder = 1,
            CreatedAt = today.AddDays(-30)
        };
        var task2_2 = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = prjCv5.Id,
            ParentId = phase2.Id,
            Name = "Tập kết vật tư về công trường",
            Description = "Kiểm đếm chất lượng và nhập kho bãi",
            Status = TaskItemStatus.Completed,
            Priority = PriorityLevel.High,
            StartDate = today.AddDays(-9),
            PlannedEndDate = today.AddDays(-5),
            ActualEndDate = today.AddDays(-5),
            Progress = 100.0,
            Weight = 1.0,
            SortOrder = 2,
            CreatedAt = today.AddDays(-30)
        };
        context.Tasks.AddRange(task2_1, task2_2);

        // Level 0: Phase 3 - Thi công phần thô & Kết cấu (Currently In Progress)
        var phase3 = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = prjCv5.Id,
            Name = "3. Thi công phần thô & Kết cấu",
            Description = "Cọc móng, đài móng và đổ sàn các tầng",
            Status = TaskItemStatus.InProgress,
            Priority = PriorityLevel.Urgent,
            StartDate = today.AddDays(-4),
            PlannedEndDate = today.AddDays(40),
            Progress = 50.0,
            Weight = 2.0,
            SortOrder = 3,
            CreatedAt = today.AddDays(-30)
        };
        context.Tasks.Add(phase3);
        await context.SaveChangesAsync();

        var task3_1 = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = prjCv5.Id,
            ParentId = phase3.Id,
            Name = "Đào đất & Đổ bê tông lót móng",
            Description = "Thi công đào móng và đổ bê tông mác 100",
            Status = TaskItemStatus.Completed,
            Priority = PriorityLevel.High,
            StartDate = today.AddDays(-4),
            PlannedEndDate = today.AddDays(2),
            ActualEndDate = today.AddDays(1),
            Progress = 100.0,
            Weight = 1.0,
            SortOrder = 1,
            CreatedAt = today.AddDays(-30)
        };
        var task3_2 = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = prjCv5.Id,
            ParentId = phase3.Id,
            Name = "Gia công lắp dựng cốt thép đài móng",
            Description = "Buộc thép đài móng và giằng móng theo thiết kế",
            Status = TaskItemStatus.InProgress,
            Priority = PriorityLevel.Urgent,
            StartDate = today.AddDays(3),
            PlannedEndDate = today.AddDays(12),
            Progress = 65.0,
            Weight = 1.0,
            SortOrder = 2,
            CreatedAt = today.AddDays(-30)
        };
        var task3_3 = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = prjCv5.Id,
            ParentId = phase3.Id,
            Name = "Đổ bê tông sàn tầng hầm & cột tầng 1",
            Description = "Bơm bê tông thương phẩm R28 mác 350",
            Status = TaskItemStatus.NotStarted,
            Priority = PriorityLevel.High,
            StartDate = today.AddDays(13),
            PlannedEndDate = today.AddDays(25),
            Progress = 0.0,
            Weight = 1.5,
            SortOrder = 3,
            CreatedAt = today.AddDays(-30)
        };
        context.Tasks.AddRange(task3_1, task3_2, task3_3);

        // Level 0: Phase 4 - Cơ điện (ME) & Hoàn thiện
        var phase4 = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = prjCv5.Id,
            Name = "4. Hệ thống Cơ điện (ME) & Hoàn thiện",
            Description = "Lắp đặt điện nước, điều hòa trung tâm và ốp lát",
            Status = TaskItemStatus.NotStarted,
            Priority = PriorityLevel.Medium,
            StartDate = today.AddDays(26),
            PlannedEndDate = today.AddDays(70),
            Progress = 0.0,
            Weight = 1.5,
            SortOrder = 4,
            CreatedAt = today.AddDays(-30)
        };
        context.Tasks.Add(phase4);
        await context.SaveChangesAsync();

        var task4_1 = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = prjCv5.Id,
            ParentId = phase4.Id,
            Name = "Lắp đặt đường ống cấp thoát nước âm sàn",
            Status = TaskItemStatus.NotStarted,
            Priority = PriorityLevel.Medium,
            StartDate = today.AddDays(26),
            PlannedEndDate = today.AddDays(45),
            Progress = 0.0,
            Weight = 1.0,
            SortOrder = 1,
            CreatedAt = today.AddDays(-30)
        };
        var task4_2 = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = prjCv5.Id,
            ParentId = phase4.Id,
            Name = "Đi dây cáp điện chiếu sáng & tủ phân phối",
            Status = TaskItemStatus.NotStarted,
            Priority = PriorityLevel.Medium,
            StartDate = today.AddDays(46),
            PlannedEndDate = today.AddDays(60),
            Progress = 0.0,
            Weight = 1.0,
            SortOrder = 2,
            CreatedAt = today.AddDays(-30)
        };
        var task4_3 = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = prjCv5.Id,
            ParentId = phase4.Id,
            Name = "Sơn bả tường & ốp lát gạch hoàn thiện",
            Status = TaskItemStatus.NotStarted,
            Priority = PriorityLevel.Medium,
            StartDate = today.AddDays(61),
            PlannedEndDate = today.AddDays(70),
            Progress = 0.0,
            Weight = 1.0,
            SortOrder = 3,
            CreatedAt = today.AddDays(-30)
        };
        context.Tasks.AddRange(task4_1, task4_2, task4_3);

        // Level 0: Phase 5 - Nghiệm thu & Bàn giao
        var phase5 = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = prjCv5.Id,
            Name = "5. Nghiệm thu PCCC & Bàn giao công trình",
            Description = "Kiểm tra PCCC và bàn giao cho Chủ đầu tư",
            Status = TaskItemStatus.NotStarted,
            Priority = PriorityLevel.High,
            StartDate = today.AddDays(71),
            PlannedEndDate = today.AddDays(90),
            Progress = 0.0,
            Weight = 1.0,
            SortOrder = 5,
            CreatedAt = today.AddDays(-30)
        };
        context.Tasks.Add(phase5);
        await context.SaveChangesAsync();

        // Assignees for CV5 tasks
        context.TaskAssignees.AddRange(
            new TaskAssignee { TaskId = task1_1.Id, UserId = engHien.Id, AssignedAt = today.AddDays(-30) },
            new TaskAssignee { TaskId = task1_2.Id, UserId = engHien.Id, AssignedAt = today.AddDays(-30) },
            new TaskAssignee { TaskId = task1_3.Id, UserId = pmViet.Id, AssignedAt = today.AddDays(-30) },
            new TaskAssignee { TaskId = task2_1.Id, UserId = engHoa.Id, AssignedAt = today.AddDays(-20) },
            new TaskAssignee { TaskId = task2_2.Id, UserId = engHoa.Id, AssignedAt = today.AddDays(-15) },
            new TaskAssignee { TaskId = task3_1.Id, UserId = supDung.Id, AssignedAt = today.AddDays(-5) },
            new TaskAssignee { TaskId = task3_2.Id, UserId = engHien.Id, AssignedAt = today.AddDays(-2) },
            new TaskAssignee { TaskId = task3_2.Id, UserId = supDung.Id, AssignedAt = today.AddDays(-2) },
            new TaskAssignee { TaskId = task4_1.Id, UserId = engAn.Id, AssignedAt = today.AddDays(-1) },
            new TaskAssignee { TaskId = task4_2.Id, UserId = engAn.Id, AssignedAt = today.AddDays(-1) }
        );

        // Task Dependencies for CV5 Gantt
        context.TaskDependencies.AddRange(
            new TaskDependency { PredecessorTaskId = task1_1.Id, SuccessorTaskId = task1_2.Id, DependencyType = DependencyType.FinishToStart, CreatedAt = today.AddDays(-30) },
            new TaskDependency { PredecessorTaskId = task1_2.Id, SuccessorTaskId = task1_3.Id, DependencyType = DependencyType.FinishToStart, CreatedAt = today.AddDays(-30) },
            new TaskDependency { PredecessorTaskId = task1_3.Id, SuccessorTaskId = phase2.Id, DependencyType = DependencyType.FinishToStart, CreatedAt = today.AddDays(-25) },
            new TaskDependency { PredecessorTaskId = task2_1.Id, SuccessorTaskId = task2_2.Id, DependencyType = DependencyType.FinishToStart, CreatedAt = today.AddDays(-20) },
            new TaskDependency { PredecessorTaskId = phase2.Id, SuccessorTaskId = phase3.Id, DependencyType = DependencyType.FinishToStart, CreatedAt = today.AddDays(-10) },
            new TaskDependency { PredecessorTaskId = task3_1.Id, SuccessorTaskId = task3_2.Id, DependencyType = DependencyType.FinishToStart, CreatedAt = today.AddDays(-5) },
            new TaskDependency { PredecessorTaskId = task3_2.Id, SuccessorTaskId = task3_3.Id, DependencyType = DependencyType.FinishToStart, CreatedAt = today.AddDays(-2) },
            new TaskDependency { PredecessorTaskId = phase3.Id, SuccessorTaskId = phase4.Id, DependencyType = DependencyType.FinishToStart, CreatedAt = today.AddDays(-1) }
        );

        // Comments on active task
        context.TaskComments.AddRange(
            new TaskComment
            {
                TaskId = task3_2.Id,
                UserId = supDung.Id,
                Content = "Cốt thép đài móng trục A-C đã buộc xong 70%, đang chờ kiểm tra mối hàn nối.",
                CreatedAt = today.AddDays(-1).AddHours(9)
            },
            new TaskComment
            {
                TaskId = task3_2.Id,
                UserId = engHien.Id,
                Content = "Đã kiểm tra khoảng cách con kê bê tông và lớp bảo vệ, đạt yêu cầu kỹ thuật TCVN.",
                CreatedAt = today.AddHours(2)
            }
        );

        // Activity Logs
        context.ActivityLogs.AddRange(
            new ActivityLog
            {
                UserId = pmViet.Id,
                ProjectId = prjCv5.Id,
                TaskId = task3_2.Id,
                Action = ActivityAction.ProgressChanged,
                Details = "Cập nhật tiến độ gia công cốt thép đài móng",
                OldValue = "40%",
                NewValue = "65%",
                CreatedAt = today.AddHours(3)
            },
            new ActivityLog
            {
                UserId = admin.Id,
                ProjectId = prjCv5.Id,
                Action = ActivityAction.ProjectCreated,
                Details = "Khởi tạo công trình Tòa nhà Văn phòng SkyTower",
                CreatedAt = today.AddDays(-30)
            }
        );

        // Notifications
        context.Notifications.AddRange(
            new Notification
            {
                UserId = engHien.Id,
                Title = "Bạn được giao công việc",
                Message = "Bạn được phân công phụ trách công việc 'Gia công lắp dựng cốt thép đài móng' trong dự án CV5.",
                Type = NotificationType.TaskAssigned,
                ReferenceType = "Task",
                ReferenceId = task3_2.Id,
                IsRead = false,
                CreatedAt = today.AddDays(-2)
            },
            new Notification
            {
                UserId = pmViet.Id,
                Title = "Cập nhật tiến độ công việc",
                Message = "Kỹ sư Phạm Đình Hiển vừa cập nhật tiến độ công việc 'Gia công lắp dựng cốt thép đài móng' lên 65%.",
                Type = NotificationType.TaskProgressChanged,
                ReferenceType = "Task",
                ReferenceId = task3_2.Id,
                IsRead = true,
                CreatedAt = today.AddHours(3)
            }
        );

        await context.SaveChangesAsync();
    }

    /// <summary>
    /// Tự động đồng bộ Schema: Tự tạo bảng mới hoặc thêm các cột/field mới vào SQLite DB mà không làm mất dữ liệu cũ.
    /// </summary>
    private static async Task AutoSyncSchemaAsync(AppDbContext context)
    {
        try
        {
            var connection = context.Database.GetDbConnection();
            var wasOpen = connection.State == System.Data.ConnectionState.Open;
            if (!wasOpen)
            {
                await connection.OpenAsync();
            }

            // Lấy danh sách tất cả các bảng hiện có trong SQLite
            var existingTables = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            using (var cmd = connection.CreateCommand())
            {
                cmd.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';";
                using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    existingTables.Add(reader.GetString(0));
                }
            }

            // Duyệt qua tất cả các Entity trong Model EF Core
            var entityTypes = context.Model.GetEntityTypes();
            foreach (var entityType in entityTypes)
            {
                var tableName = entityType.GetTableName();
                if (string.IsNullOrEmpty(tableName)) continue;

                if (!existingTables.Contains(tableName))
                {
                    // Nếu bảng chưa có trong DB, tự động tạo bảng mới
                    var createTableSql = GenerateCreateTableSql(entityType);
                    if (!string.IsNullOrEmpty(createTableSql))
                    {
                        using var createCmd = connection.CreateCommand();
                        createCmd.CommandText = createTableSql;
                        await createCmd.ExecuteNonQueryAsync();
                    }
                }
                else
                {
                    // Nếu bảng đã tồn tại, kiểm tra xem có cột/field nào mới thêm không
                    var existingColumns = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                    using (var infoCmd = connection.CreateCommand())
                    {
                        infoCmd.CommandText = $"PRAGMA table_info(\"{tableName}\");";
                        using var reader = await infoCmd.ExecuteReaderAsync();
                        while (await reader.ReadAsync())
                        {
                            existingColumns.Add(reader.GetString(1)); // name column
                        }
                    }

                    foreach (var property in entityType.GetProperties())
                    {
                        var columnName = property.GetColumnName();
                        if (string.IsNullOrEmpty(columnName)) continue;

                        if (!existingColumns.Contains(columnName))
                        {
                            // Cột mới chưa có trong DB -> Tự động chạy ALTER TABLE ADD COLUMN
                            var sqliteType = GetSqliteType(property.ClrType);
                            var alterSql = $"ALTER TABLE \"{tableName}\" ADD COLUMN \"{columnName}\" {sqliteType} NULL;";
                            try
                            {
                                using var alterCmd = connection.CreateCommand();
                                alterCmd.CommandText = alterSql;
                                await alterCmd.ExecuteNonQueryAsync();
                            }
                            catch
                            {
                                // Safe ignore if already exists
                            }
                        }
                    }
                }
            }

            if (!wasOpen)
            {
                await connection.CloseAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AutoSyncSchema Warning] {ex.Message}");
        }
    }

    private static string GetSqliteType(Type type)
    {
        var underlying = Nullable.GetUnderlyingType(type) ?? type;
        if (underlying == typeof(int) || underlying == typeof(long) || underlying == typeof(short) ||
            underlying == typeof(byte) || underlying == typeof(bool) || underlying.IsEnum)
        {
            return "INTEGER";
        }
        if (underlying == typeof(double) || underlying == typeof(float) || underlying == typeof(decimal))
        {
            return "REAL";
        }
        if (underlying == typeof(byte[]))
        {
            return "BLOB";
        }
        return "TEXT";
    }

    private static string GenerateCreateTableSql(Microsoft.EntityFrameworkCore.Metadata.IEntityType entityType)
    {
        var tableName = entityType.GetTableName();
        var properties = entityType.GetProperties().ToList();
        var primaryKey = entityType.FindPrimaryKey();
        var pkProperties = primaryKey?.Properties.Select(p => p.GetColumnName()).ToHashSet(StringComparer.OrdinalIgnoreCase) ?? new HashSet<string>();

        var columnDefs = new List<string>();
        foreach (var p in properties)
        {
            var colName = p.GetColumnName();
            var colType = GetSqliteType(p.ClrType);
            var isPk = pkProperties.Contains(colName);

            var def = $"\"{colName}\" {colType}";
            if (isPk && pkProperties.Count == 1)
            {
                def += " PRIMARY KEY";
            }
            columnDefs.Add(def);
        }

        if (pkProperties.Count > 1)
        {
            columnDefs.Add($"PRIMARY KEY ({string.Join(", ", pkProperties.Select(k => $"\"{k}\""))})");
        }

        return $"CREATE TABLE IF NOT EXISTS \"{tableName}\" (\n  {string.Join(",\n  ", columnDefs)}\n);";
    }
}
