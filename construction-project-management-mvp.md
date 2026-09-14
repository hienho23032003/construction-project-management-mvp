# Construction Project Management System — MVP Specification

## 1. Mục tiêu

Xây dựng hệ thống Web quản lý công trình/thi công thay thế cách theo dõi bằng Google Sheet hiện tại.

Mục tiêu chính:
- Quản lý nhiều công trình/dự án.
- Tự động nhóm công việc theo dự án.
- Quản lý công việc, công việc con, người thực hiện và tiến độ.
- Theo dõi kế hoạch và thực tế.
- Hiển thị Gantt Chart theo ngày để theo dõi tiến độ.
- Dashboard và báo cáo tổng quan.
- Quản lý nhân sự và phân quyền.
- Notification, comment và activity log.
- Kiến trúc đủ mở rộng cho các nghiệp vụ quản lý công trình về sau.

---

## 2. Công nghệ bắt buộc

### Frontend
- ReactJS
- TypeScript
- Material UI (MUI)
- React Router
- TanStack Query
- Axios
- React Hook Form
- Zod hoặc thư viện validation tương đương
- Thư viện Gantt chuyên dụng, ưu tiên thư viện hỗ trợ task hierarchy, dependency, progress và drag/drop.

### Backend
- .NET / ASP.NET Core Web API
- C#
- Entity Framework Core
- REST API
- JWT Authentication
- Role/Permission Authorization
- FluentValidation hoặc validation tương đương
- Swagger / OpenAPI

### Database
- MySQL
- Entity Framework Core MySQL provider
- Migration bằng EF Core

### Kiến trúc
Frontend và Backend tách biệt:

ReactJS + MUI
        |
        | REST API / JSON
        v
ASP.NET Core Web API
        |
        v
Entity Framework Core
        |
        v
MySQL

---

## 3. Phạm vi MVP

### MUST HAVE

1. Authentication
2. User/Employee management
3. Role & Permission
4. Project management
5. Task management
6. Sub-task / Task hierarchy
7. Task assignment
8. Project grouping
9. Status management
10. Progress tracking
11. Start Date / Planned End Date / Actual End Date
12. Gantt Chart
13. Gantt drag & drop
14. Today indicator
15. Overdue detection
16. Planned vs Actual
17. Dashboard
18. Basic reports
19. Notification
20. Comment
21. Activity/Audit Log

### SHOULD HAVE nếu không ảnh hưởng tiến độ MVP
- Task dependency
- Calendar view
- Excel Import
- Excel Export
- File attachment

### PHASE 2
- Daily construction report
- Material management
- Contractor management
- Issue management
- Approval workflow
- Email notification
- Mobile/PWA
- Advanced analytics
- Cost management

---

# 4. Mô hình nghiệp vụ

Cấu trúc dữ liệu chính:

PROJECT
  |
  +-- PHASE / TASK GROUP
  |      |
  |      +-- TASK
  |      |     |
  |      |     +-- SUB-TASK
  |      |     +-- ASSIGNEE
  |      |     +-- COMMENT
  |      |     +-- ATTACHMENT
  |      |     +-- DEPENDENCY
  |      |
  |      +-- TASK
  |
  +-- PROJECT MEMBERS
  +-- GANTT
  +-- ACTIVITY LOG
  +-- NOTIFICATIONS

Project phải hỗ trợ hierarchy công việc nhiều cấp thông qua parentId.

Ví dụ:

CV5 - Công trình ABC
├── Thiết kế
│   ├── Khảo sát hiện trạng
│   ├── Lập bản vẽ
│   └── Duyệt bản vẽ
├── Chuẩn bị vật tư
│   ├── Lập danh sách vật tư
│   ├── Đặt vật tư
│   └── Tập kết vật tư
├── Thi công
│   ├── Chuẩn bị mặt bằng
│   ├── Lắp đặt
│   ├── Kiểm tra
│   └── Hoàn thiện
└── Bàn giao

Không giới hạn số cấp hierarchy.

---

# 5. Project Management

Project fields:

- Id
- Code
- Name
- Description
- Location
- ManagerId
- StartDate
- PlannedEndDate
- ActualEndDate
- Status
- Progress
- Priority
- CreatedAt
- UpdatedAt
- CreatedBy
- UpdatedBy

Chức năng:
- Tạo project
- Sửa project
- Xóa project
- Xem project
- Search
- Filter
- Sort
- Project status
- Gán Project Manager
- Quản lý thành viên
- Xem tiến độ tổng thể

---

# 6. Task Management

Task fields:

- Id
- ProjectId
- ParentId nullable
- Name
- Description
- Status
- Priority
- StartDate
- PlannedEndDate
- ActualEndDate nullable
- Progress
- CreatedBy
- UpdatedBy
- CreatedAt
- UpdatedAt

Chức năng:
- CRUD Task
- Tạo Sub-task
- Expand/Collapse hierarchy
- Assign nhân sự
- Update status
- Update progress
- Update deadline
- Search/filter
- Comment
- Activity history

Task hierarchy phải tự động group theo Project và Parent Task.

---

# 7. Status

MVP nên có:

- NOT_STARTED — Chưa bắt đầu
- IN_PROGRESS — Đang thực hiện
- COMPLETED — Hoàn thành
- ON_HOLD — Tạm dừng
- OVERDUE — Trễ tiến độ

Không nên hard-code logic UI theo màu. Status và màu nên được cấu hình tập trung.

Màu minh họa:
- Completed: xanh
- In Progress: xanh dương
- Not Started: xám
- On Hold: vàng
- Overdue: đỏ

---

# 8. Business Rules

## 8.1 Completed

Nếu status = COMPLETED:
- Progress phải bằng 100%.
- ActualEndDate được ghi nhận nếu chưa có.

## 8.2 Not Started

Nếu Today < StartDate và task chưa hoàn thành:
- Status mặc định NOT_STARTED.

## 8.3 In Progress

Nếu:
- StartDate <= Today
- Today <= PlannedEndDate
- Status != COMPLETED

=> IN_PROGRESS.

## 8.4 Overdue

Nếu:
- Today > PlannedEndDate
- Status != COMPLETED

=> Task được đánh dấu OVERDUE.

Không tự động ghi đè trạng thái người dùng nếu nghiệp vụ yêu cầu giữ status gốc; có thể dùng computed field isOverdue để tránh mất trạng thái.

## 8.5 Progress của Parent Task

Progress của Parent Task có thể được tính từ các child task.

Ví dụ:
- Task A = 100%
- Task B = 50%
- Task C = 0%

Parent Progress = trung bình hoặc weighted average tùy rule nghiệp vụ.

MVP mặc định dùng average nếu chưa có trọng số.

## 8.6 Project Progress

Project Progress được tính từ task/phase bên dưới, không nhập thủ công nếu không có yêu cầu đặc biệt.

## 8.7 Planned vs Actual

Phải phân biệt:
- Planned Start
- Planned End
- Actual Start nếu cần
- Actual End

Hệ thống phải có khả năng xác định:
- Đúng tiến độ
- Có nguy cơ trễ
- Đang trễ
- Đã hoàn thành

---

# 9. Gantt Chart

Gantt là feature trung tâm.

Hiển thị:

- Project
- Phase/Task Group
- Task
- Sub-task
- Start Date
- Planned End Date
- Actual End Date
- Progress
- Status

Ví dụ:

                    THÁNG 11/2026
             01 02 03 04 05 06 07 08...

CV5
├─ Chuẩn bị vật tư
│  ███████████
├─ Thi công
│       █████████████████
│  ├─ Điện
│  │      █████████
│  ├─ Nước
│  │           █████████
│  └─ Hoàn thiện
│                  █████████
└─ Bàn giao
                         █████

Gantt requirements:
- Day view
- Week view
- Month view
- Today line
- Status-based display
- Progress bar
- Expand/Collapse
- Drag & drop task
- Resize task duration
- Update Start/End Date khi drag/drop
- Dependency giữa task nếu thư viện hỗ trợ
- Đồng bộ hai chiều với Task data
- Hiển thị Planned vs Actual nếu có thể

Không nên tự xây Gantt từ đầu nếu thư viện chuyên dụng đáp ứng được yêu cầu.

---

# 10. Task Dependency

Entity:

TaskDependency
- Id
- PredecessorTaskId
- SuccessorTaskId
- DependencyType
- CreatedAt

MVP/Should Have hỗ trợ quan hệ:

Task A -> Task B

Ví dụ:

Thiết kế
  ->
Duyệt bản vẽ
  ->
Đặt vật tư
  ->
Tập kết vật tư
  ->
Thi công
  ->
Kiểm tra
  ->
Bàn giao

Nếu task trước bị trễ, hệ thống có thể cảnh báo task phía sau có nguy cơ bị ảnh hưởng.

---

# 11. Dashboard

Dashboard dành cho Admin/Project Manager.

KPI cards:

- Tổng số công trình
- Công trình đang thực hiện
- Công trình hoàn thành
- Công trình trễ
- Tổng task
- Task hoàn thành
- Task đang thực hiện
- Task trễ

Các widget:
- Project progress
- Task status
- Overdue tasks
- Upcoming deadlines
- Employee workload
- Recent activities

Ví dụ:

CV3  █████████░ 90%
CV5  ██████░░░░ 60%
CV7  ███░░░░░░░ 30%

---

# 12. Reports

MVP cần các báo cáo cơ bản:

## Project Progress Report
- Project
- Manager
- Start Date
- Planned End Date
- Progress
- Status
- Overdue

## Task Report
- Task
- Project
- Assignee
- Status
- Progress
- Start Date
- Planned End Date
- Actual End Date

## Overdue Report
- Task
- Project
- Assignee
- Planned End
- Overdue Days

## Employee Workload
- Employee
- Total Tasks
- Active Tasks
- Completed Tasks
- Overdue Tasks

Có thể hỗ trợ filter theo:
- Project
- Employee
- Status
- Date range

---

# 13. Employee Management

Employee/User fields:

- Id
- FullName
- Email
- Phone nếu cần
- Department
- RoleId
- IsActive
- CreatedAt
- UpdatedAt

Chức năng:
- CRUD user
- Activate/Deactivate
- Assign role
- Assign project
- Assign task
- Xem workload

---

# 14. Role & Permission

MVP role:

## SUPER_ADMIN
- Toàn quyền hệ thống

## PROJECT_MANAGER
- Tạo/sửa project
- Quản lý task
- Assign employee
- Cập nhật deadline
- Xem dashboard/report
- Comment

## SUPERVISOR
- Xem project được phân quyền
- Cập nhật task
- Cập nhật progress
- Comment
- Theo dõi nhân sự

## EMPLOYEE
- Xem task được giao
- Cập nhật progress
- Cập nhật status
- Comment

Backend phải enforce permission. Không chỉ ẩn button ở frontend.

---

# 15. Notification

Notification types:

- TASK_ASSIGNED
- TASK_DEADLINE_SOON
- TASK_OVERDUE
- TASK_STATUS_CHANGED
- TASK_PROGRESS_CHANGED
- COMMENT_ADDED
- DEADLINE_CHANGED
- PROJECT_ASSIGNED

Ví dụ:

"Bạn được giao công việc Thi công tầng 2."

"Công việc Tập kết vật tư sẽ đến hạn sau 2 ngày."

"Công việc Thi công tầng 2 đã quá hạn."

MVP ưu tiên notification trong hệ thống. Email có thể để Phase 2.

---

# 16. Comment

Mỗi Task có comment thread:

Task
  |
  +-- Comment
  +-- Comment
  +-- Comment

Comment fields:
- Id
- TaskId
- UserId
- Content
- CreatedAt
- UpdatedAt

MVP:
- Add comment
- Edit own comment
- Delete own comment
- Hiển thị người viết và thời gian

Phase 2:
- @mention
- Reply
- Attachment

---

# 17. Activity / Audit Log

Ghi nhận các thay đổi quan trọng:

- Project created
- Project updated
- Task created
- Task updated
- Task assigned
- Status changed
- Progress changed
- Deadline changed
- Comment added
- Member added/removed

Ví dụ:

14/09 09:20
Giang cập nhật progress: 40% -> 60%

14/09 09:25
Manager thay đổi deadline: 10/09 -> 15/09

ActivityLog fields:
- Id
- UserId
- ProjectId nullable
- TaskId nullable
- Action
- OldValue nullable
- NewValue nullable
- CreatedAt

---

# 18. UI/UX

Layout:

SIDEBAR
- Dashboard
- Projects
- Tasks
- Calendar
- Reports
- Employees
- Notifications
- Settings

HEADER
- Search
- Notification
- Current user
- Logout

Main pages:

## Dashboard
Tổng quan tiến độ.

## Projects
Danh sách project dạng table/card.

## Project Detail
Tabs:
- Overview
- Tasks
- Gantt
- Members
- Activity

## Tasks
Global task list với:
- Search
- Filter
- Sort
- Project
- Assignee
- Status
- Priority
- Date

## Gantt
Timeline quản lý tiến độ.

## Employees
Danh sách nhân sự và workload.

## Reports
Báo cáo và filter.

---

# 19. API Architecture

Backend ASP.NET Core Web API.

Các nhóm API dự kiến:

/api/auth
/api/users
/api/roles
/api/projects
/api/projects/{id}/members
/api/projects/{id}/tasks
/api/tasks
/api/tasks/{id}
/api/tasks/{id}/comments
/api/tasks/{id}/dependencies
/api/notifications
/api/reports
/api/activity-logs

Ví dụ:

GET    /api/projects
POST   /api/projects
GET    /api/projects/{id}
PUT    /api/projects/{id}
DELETE /api/projects/{id}

GET    /api/projects/{id}/tasks
POST   /api/projects/{id}/tasks

GET    /api/tasks/{id}
PUT    /api/tasks/{id}
DELETE /api/tasks/{id}

POST   /api/tasks/{id}/comments

POST   /api/tasks/{id}/assignees

GET    /api/dashboard/summary

GET    /api/reports/project-progress

GET    /api/reports/overdue

---

# 20. Database Tables

Core tables:

users
roles
permissions
role_permissions

projects
project_members

tasks
task_assignees
task_dependencies

comments
notifications
activity_logs

Optional:
attachments

Relationships:

User
  |
  +-- ProjectMember -- Project
  |
  +-- TaskAssignee -- Task
  |
  +-- Comment -- Task
  |
  +-- Notification
  |
  +-- ActivityLog

Project
  |
  +-- Tasks
  +-- Members
  +-- ActivityLogs

Task
  |
  +-- Child Tasks
  +-- Assignees
  +-- Comments
  +-- Dependencies

---

# 21. Frontend structure

Recommended:

src/
├── app/
├── components/
│   ├── common/
│   ├── dashboard/
│   ├── projects/
│   ├── tasks/
│   ├── gantt/
│   ├── employees/
│   ├── reports/
│   └── notifications/
├── pages/
├── layouts/
├── services/
│   ├── api/
│   ├── projectService.ts
│   ├── taskService.ts
│   └── userService.ts
├── hooks/
├── types/
├── schemas/
├── utils/
└── theme/

MUI:
- ThemeProvider
- DataGrid
- Dialog
- Drawer
- Tabs
- Card
- Chip
- Menu
- Snackbar
- DatePicker
- Form controls

Không dùng inline style tràn lan. Tạo theme và reusable components.

---

# 22. Backend structure

Recommended ASP.NET Core structure:

src/
├── API/
│   ├── Controllers/
│   ├── Middleware/
│   └── Extensions/
├── Application/
│   ├── DTOs/
│   ├── Services/
│   ├── Validators/
│   └── Interfaces/
├── Domain/
│   ├── Entities/
│   ├── Enums/
│   └── Interfaces/
├── Infrastructure/
│   ├── Persistence/
│   ├── Repositories/
│   └── Authentication/
└── Shared/

Ưu tiên separation of concerns.

Controller không chứa business logic phức tạp.

Business logic nằm ở Application/Service layer.

---

# 23. Security

MVP phải có:

- JWT authentication
- Password hashing
- Role-based authorization
- Permission-based authorization nếu cần
- CORS cấu hình rõ ràng
- Input validation
- SQL injection protection thông qua EF Core parameterization
- API authorization ở backend
- Không lưu JWT/password không an toàn
- Không tin dữ liệu permission từ frontend

---

# 24. UX rules

- Responsive desktop-first vì đây là hệ thống quản lý công trình.
- Giao diện rõ ràng, ưu tiên thông tin.
- Gantt phải dễ đọc.
- Status dùng Chip/Badge.
- Overdue phải dễ nhận biết.
- Confirm trước thao tác xóa.
- Toast/Snackbar sau thao tác thành công/thất bại.
- Loading state.
- Empty state.
- Error state.
- Pagination cho bảng lớn.
- Search/filter không reload toàn bộ page nếu không cần.

---

# 25. Performance

Hệ thống có thể có nhiều project/task.

Không load toàn bộ task của toàn bộ project ngay khi mở Dashboard.

Yêu cầu:
- Pagination
- Server-side filtering
- Server-side sorting
- Lazy loading project/task
- API query có filter
- Index database cho các field thường query:
  - ProjectId
  - ParentId
  - AssigneeId
  - Status
  - StartDate
  - PlannedEndDate
- Gantt chỉ load dữ liệu cần thiết theo project/date range.

---

# 26. MVP User Flow

LOGIN
  ↓
DASHBOARD
  ↓
PROJECT LIST
  ↓
PROJECT DETAIL
  ↓
TASK MANAGEMENT
  ↓
GANTT

Ví dụ:

Admin tạo Project
  ↓
Tạo Phase/Task
  ↓
Assign Employee
  ↓
Thiết lập Start/End
  ↓
Task xuất hiện trên Gantt
  ↓
Employee cập nhật progress
  ↓
Manager theo dõi Dashboard
  ↓
Task hoàn thành
  ↓
Project tự cập nhật progress

---

# 27. Quy tắc quan trọng khi coding

1. Không hard-code dữ liệu demo trong production components.
2. Không hard-code permission ở frontend.
3. Backend là nguồn xác thực business rules.
4. Frontend chỉ chịu trách nhiệm UI/UX và gọi API.
5. Không để Controller chứa business logic lớn.
6. Không thiết kế database giống Google Sheet.
7. Task phải hỗ trợ parentId để hierarchy.
8. Project progress phải có logic tính toán rõ ràng.
9. Gantt phải đồng bộ với Task.
10. Date/time phải thống nhất timezone.
11. Không xóa dữ liệu quan trọng nếu có thể dùng soft delete.
12. Tất cả API phải có validation.
13. Các thay đổi quan trọng phải ghi ActivityLog.
14. Code reusable, tránh duplicate logic.
15. Thiết kế để Phase 2 có thể mở rộng sang material, contractor, daily report, issue và approval.

---

# 28. MVP Acceptance Criteria

MVP được xem là hoàn thành khi:

- User có thể login.
- Admin có thể tạo user và phân quyền.
- Admin/Manager có thể tạo Project.
- Project có thể có nhiều Task.
- Task có thể có Sub-task nhiều cấp.
- Task có thể assign cho Employee.
- Có Start Date và Planned End Date.
- Task hiển thị đúng trên Gantt.
- Gantt hỗ trợ expand/collapse.
- Gantt hỗ trợ drag/drop cập nhật ngày.
- Progress được hiển thị.
- Hệ thống phát hiện task overdue.
- Project progress được tính.
- Dashboard hiển thị tổng quan.
- Có report cơ bản.
- User nhận notification.
- Task có comment.
- Các thay đổi quan trọng được ghi ActivityLog.
- Backend kiểm soát authentication/authorization.
- Frontend ReactJS + MUI.
- Backend ASP.NET Core Web API.
- Database MySQL.

---

# 29. Roadmap

## Phase 1 — Foundation
- Project setup
- Authentication
- User
- Role/Permission
- Database
- API architecture
- MUI theme

## Phase 2 — Core Project Management
- Project CRUD
- Task CRUD
- Sub-task
- Assignment
- Status
- Progress
- Date management

## Phase 3 — Gantt
- Timeline
- Day/Week/Month
- Expand/Collapse
- Progress
- Status
- Today line
- Drag/drop
- Dependency

## Phase 4 — Management
- Dashboard
- Reports
- Employee workload
- Overdue
- Planned vs Actual

## Phase 5 — Collaboration
- Notification
- Comment
- Activity Log

## Phase 6 — Extension
- Excel
- Attachment
- Daily Report
- Material
- Contractor
- Issue
- Approval
- Cost

---

# 30. Nguyên tắc phát triển

Không cố gắng xây toàn bộ hệ thống quản lý công trình ngay từ đầu.

MVP tập trung vào:

PROJECT
  +
TASK
  +
EMPLOYEE
  +
TIMELINE
  +
GANTT
  +
DASHBOARD
  +
NOTIFICATION
  +
COMMENT

Thiết kế database/API mở rộng được nhưng chỉ triển khai những nghiệp vụ cần thiết cho MVP.

Ưu tiên:
1. Đúng nghiệp vụ
2. Gantt ổn định
3. Data model tốt
4. Permission đúng ở backend
5. UI dễ sử dụng
6. Có thể mở rộng Phase 2

