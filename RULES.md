# Construction Project Management System — Coding Standards & Development Rules (RULES.md)

Tài liệu này quy định bộ quy chuẩn chung cho toàn bộ dự án **Construction Project Management System**. Tất cả nhà phát triển (developer) và trợ lý AI khi tham gia phát triển, chỉnh sửa, mở rộng hệ thống bắt buộc phải tuân thủ nghiêm ngặt các nguyên tắc dưới đây nhằm đảm bảo tính thống nhất, dễ đọc, dễ kiểm thử, dễ mở rộng và tránh trùng lặp mã nguồn (duplicate code).

---

## TECH STACK CHÍNH

- **Frontend**: ReactJS (Vite) + TypeScript + Material UI (MUI) + TanStack React Query + Axios + Recharts
- **Backend**: ASP.NET Core Web API + C# (.NET 8/10) + FluentValidation + JWT Authentication
- **Database**: MySQL (hỗ trợ SQLite cho môi trường Local Dev)
- **ORM**: Entity Framework Core

---

## 1. Naming Convention (Quy ước đặt tên)

| Tầng / Thành phần | Quy ước | Ví dụ |
| :--- | :--- | :--- |
| **Database Table & Columns** | `snake_case` | `projects`, `task_items`, `planned_end_date`, `manager_id` |
| **C# (Entities, Classes, Methods, Properties)** | `PascalCase` | `TaskItem`, `PlannedEndDate`, `CalculateProgress()` |
| **C# Local Variables & Private Fields** | `camelCase` / `_camelCase` | `taskCount`, `_projectService` |
| **JSON API Request / Response** | `camelCase` | `{"projectId": "...", "plannedEndDate": "..."}` |
| **TypeScript Variables, Functions, Properties** | `camelCase` | `fetchProjects()`, `currentUserId`, `isOverdue` |
| **React Components, Layouts, Pages, Contexts** | `PascalCase` | `InteractiveGantt.tsx`, `ProjectDetailPage.tsx`, `AuthContext.tsx` |
| **Constants / Enums (FE & BE)** | `UPPER_SNAKE_CASE` hoặc `PascalCase` | `MAX_PAGE_SIZE`, `UserRole.SuperAdmin` |
| **CSS Class Names / Theme keys** | `kebab-case` / `camelCase` | `.gantt-timeline-bar`, `statusColors.inProgress` |

> [!IMPORTANT]
> **Thống nhất Mapping Dữ liệu:**
> - Frontend và Backend bắt buộc phải khớp schema camelCase trong giao tiếp JSON REST API.
> - Không tự ý đổi tên trường dữ liệu mà không cập nhật đồng bộ ở cả Backend DTOs và Frontend TypeScript Interfaces.

---

## 2. Frontend UI / CSS Standards

1. **Ưu tiên Material UI (MUI) & MUI Theme:**
   - Mọi màu sắc, khoảng cách (spacing), typography và bo góc (border radius) phải sử dụng cấu hình tập trung từ `theme/theme.ts`.
   - Tuyệt đối không hard-code mã màu hex (`#123456`), khoảng cách tùy tiện nếu trong Theme hoặc `statusColors` / `priorityColors` đã có định nghĩa.
2. **Sử dụng `sx` prop cho styling:**
   - Dùng thuộc tính `sx` cho styling tùy biến theo component.
   - Không lạm dụng file `.css` rời rạc hoặc inline `style={{ ... }}` không kiểm soát.
3. **Ưu tiên Common / Reusable Components:**
   - Trước khi tạo bất kỳ phần tử UI nào (Status chip, Priority badge, Progress bar, Modal xác nhận, Date picker...), kiểm tra thư mục `src/components/common/` xem đã có component tương ứng hay chưa.
   - Không viết lại hoặc duplicate các thành phần giao diện đã có.
4. **Thiết kế Responsive & Desktop-First:**
   - Hệ thống quản lý công trình ưu tiên hiển thị tối ưu trên màn hình Desktop/Laptop của kỹ sư và chỉ huy trưởng, đồng thời hỗ trợ tốt Drawer / responsive layout trên thiết bị di động.

---

## 3. Frontend Component & File Structure Rules

1. **Tuân thủ nguyên tắc Single Responsibility (Đơn trách nhiệm):**
   - Mỗi component chỉ nên giải quyết một mục tiêu giao diện hoặc nghiệp vụ cụ thể.
   - Không gộp toàn bộ logic lấy dữ liệu (API calls), xử lý dữ liệu phức tạp (data manipulation), quản lý form và giao diện khổng lồ vào trong một component duy nhất.
2. **Giới hạn số dòng mã nguồn (File Length Limits):**
   - **Ngưỡng cảnh báo:** Khi file tiến tới khoảng **300 – 400 dòng**, phải chủ động xem xét cấu trúc lại (refactor).
   - **Ngưỡng giới hạn:** Hạn chế tối đa file vượt quá **500 dòng**. Nếu file dài trên 500 dòng, phải ưu tiên bóc tách thành các component con, custom hooks hoặc util functions.
   - *Lưu ý:* 500 dòng là mốc cảnh báo/refactor, không tách máy móc thành quá nhiều file li ti gây khó đọc. Ưu tiên code mạch lạc, dễ hiểu và dễ bảo trì.
3. **Phân cấp bóc tách hợp lý:**
   - Tách UI phần tử nhỏ $\rightarrow$ `src/components/`
   - Tách State/Effect phức tạp $\rightarrow$ `src/hooks/`
   - Tách API endpoints $\rightarrow$ `src/services/api/`
   - Tách Hàm tính toán / chuyển đổi $\rightarrow$ `src/utils/`
   - Tách Kiểu dữ liệu $\rightarrow$ `src/types/`

---

## 4. Frontend Architecture Flow

Luồng truyền tải dữ liệu chuẩn ở Frontend:
$$\text{UI Component} \longrightarrow \text{Custom Hook (nếu có)} \longrightarrow \text{API Service (Axios)} \longrightarrow \text{Backend REST API}$$

- **Component**: Chỉ tập trung render UI, nhận props và kích hoạt events.
- **Custom Hook**: Chứa state, react query hooks, và logic tái sử dụng.
- **API Service (`services/api/`)**: Định nghĩa các hàm gọi HTTP Axios, xử lý URL params và response type.
- **Context (`contexts/`)**: Quản lý state toàn cục có vòng đời dài như Auth session, Thông báo (Notifications), Theme mode.
- **Tuyệt đối không gọi trực tiếp `axios.get(...)` rải rác bên trong các view components** mà phải thông qua `endpoints.ts`.

---

## 5. Backend Architecture Flow

Luồng xử lý chuẩn ở Backend ASP.NET Core:
$$\text{Controller} \longrightarrow \text{Application Service (Business Rules)} \longrightarrow \text{EF Core / DbContext} \longrightarrow \text{MySQL / Database}$$

- **Controller (`API/Controllers/`)**:
  - Chỉ làm nhiệm vụ tiếp nhận HTTP request, phân quyền (`[Authorize]`), kiểm tra ModelState và trả về `IActionResult` (`Ok`, `BadRequest`, `NotFound`).
  - **Tuyệt đối không chứa logic nghiệp vụ, tính toán ngày tháng, xử lý database phức tạp bên trong Controller.**
- **Service Layer (`Application/Services/`)**:
  - Chứa toàn bộ business rules: tính tiến độ cây công việc (Task hierarchy rollup), tự động xác định trạng thái quá hạn (Overdue), ghi nhận Activity Logs và đẩy Notifications.
- **DTOs (`Application/DTOs/`)**:
  - Luôn sử dụng DTOs cho request và response, không trả về raw EF Core Entities để tránh lộ schema hoặc dính lỗi circular reference JSON.
- **Validation**:
  - Sử dụng FluentValidation cho tất cả các request tạo mới / cập nhật.
- **Xử lý ngoại lệ tập trung**:
  - Toàn bộ lỗi được bắt qua `ExceptionHandlingMiddleware` và trả về định dạng chuẩn `ApiResponse<T>`.

---

## 6. Database & Migration Standards

1. **Đặt tên CSDL:** Toàn bộ bảng và cột CSDL sử dụng `snake_case`.
2. **Migrations:** Sử dụng EF Core Migrations để quản lý phiên bản database.
3. **Foreign Keys & Indexing:**
   - Khởi tạo Foreign Key với quan hệ Cascade / Restrict phù hợp.
   - Bắt buộc tạo Index cho các trường thường xuyên `WHERE`, `JOIN`, `ORDER BY`:
     - `project_id`, `parent_id`, `assignee_id`, `status`, `start_date`, `planned_end_date`.
4. **Toàn vẹn dữ liệu:**
   - Tránh duplicate dữ liệu, sử dụng quan hệ chuẩn hóa (Normal Form) kết hợp với các trường computed hợp lý.

---

## 7. Form, Validation & State Management

Frontend bắt buộc phải xử lý đầy đủ 6 trạng thái giao diện:
1. **Loading State:** Spinner / Skeleton khi đang fetch dữ liệu.
2. **Error State:** Alert / Toast thông báo khi request thất bại.
3. **Empty State:** Hình minh họa và thông báo hướng dẫn khi danh sách trống.
4. **Success State:** Cập nhật UI ngay lập tức hoặc Snackbar thông báo thành công.
5. **Validation State:** Báo lỗi trực quan trên từng input form.
6. **Permission State:** Vô hiệu hóa hoặc ẩn các nút thao tác theo quyền (`canEditProject`, `canEditTask`, `isAdmin`).

---

## 8. Authentication & Authorization (Phân Quyền)

Hệ thống hỗ trợ 4 vai trò (Roles) chính:
- **`SUPER_ADMIN`**: Toàn quyền cấu hình, quản trị tài khoản, xóa dự án/công việc.
- **`PROJECT_MANAGER`**: Chỉ huy trưởng dự án, tạo/sửa dự án, phân công kỹ sư, quản lý tiến độ.
- **`SUPERVISOR`**: Giám sát thi công hiện trường, cập nhật % tiến độ, điều chỉnh ngày Gantt, bình luận.
- **`EMPLOYEE`**: Kỹ sư/nhân viên, xem task được phân công, cập nhật trạng thái/tiến độ, trao đổi bình luận.

> [!WARNING]
> **Bảo Mật Phía Backend:**
> Backend luôn luôn phải enforce quyền hạn bằng Attribute `[Authorize(Roles = "...")]` hoặc kiểm tra quyền sở hữu trong Service. Không bao giờ tin tưởng hoàn toàn việc ẩn/hiện nút ở giao diện Frontend.

---

## 9. Code Quality & Clean Code Rules

- **DRY (Don't Repeat Yourself):** Không sao chép / dán code trùng lặp giữa các pages/services.
- **KISS (Keep It Simple, Stupid):** Ưu tiên giải pháp ngắn gọn, dễ hiểu, tránh trừu tượng hóa quá mức (over-engineering).
- **SOLID:** Giữ các class/interface gọn gàng, module hóa cao.
- **No Dead Code:** Xóa bỏ code không sử dụng, biến thừa, console.log debug trước khi hoàn thành task.

---

## 10. Security & Configuration Standards

- **Không bao giờ commit mật khẩu, JWT Secret thật, Connection String sản xuất lên Git.**
- Cấu hình thông qua `appsettings.json` hoặc Environment Variables.
- Không lưu token không an toàn hoặc gửi dữ liệu nhạy cảm qua URL params không mã hóa.

---

## 11. AI Coding Rules (Quy định bắt buộc đối với Trợ lý AI)

Mỗi khi AI thực hiện đọc, tạo hoặc sửa đổi mã nguồn trong dự án này, AI **PHẢI**:

1. **Đọc `RULES.md`** trước khi tiến hành viết code.
2. **Kiểm tra mã nguồn hiện có**: Tìm kiếm các Component, Hook, DTO, Service, Util đã tồn tại trước khi tạo mới để tránh trùng lặp.
3. **Tuân thủ Naming Convention** và hệ thống Theme/MUI đã thiết lập.
4. **Chủ động tái cấu trúc (Refactor)** khi phát hiện file giao diện Frontend vượt quá 400 - 500 dòng.
5. **Không tự ý thay đổi kiến trúc tổng thể** của dự án nếu người dùng không yêu cầu.
6. **Bảo toàn nghiệp vụ:** Khi refactor phải đảm bảo giữ nguyên 100% logic nghiệp vụ và hành vi giao diện.
7. **Kiểm tra sau khi hoàn thành:**
   - [x] Không còn lỗi biên dịch TypeScript (`tsc`) và C# (`dotnet build`).
   - [x] Imports đúng đường dẫn và không bị thừa.
   - [x] Props, State, Types và API payload khớp nhau giữa FE và BE.
   - [x] Giao diện hoạt động trơn tru, hỗ trợ đầy đủ Loading/Error/Empty states.

---

> **NGUYÊN TẮC CỐT LÕI:**
> *"Code phải chạy đúng, đúng kiến trúc, đúng quy chuẩn, có tính tái sử dụng cao, không trùng lặp, dễ đọc, dễ bảo trì và dễ mở rộng."*
