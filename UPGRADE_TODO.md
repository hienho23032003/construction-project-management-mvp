# DANH SÁCH CÁC HẠNG MỤC CẦN NÂNG CẤP (MULTI-USER CONCURRENCY & PRODUCTION READINESS)
> Dự án: **Hệ Thống Quản Lý Dự Án Xây Dựng (Construction Project Management)**

---

## 📌 Bảng Tổng Hợp Trạng Thái Các Hạng Mục

| STT | Hạng Mục Nâng Cấp | Mức Độ Ưu Tiên | Trạng Thái | Mô Tả Tóm Tắt |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Tối ưu Cơ sở dữ liệu (Database Concurrency & WAL Mode)** | 🔴 Cao (P1) | 🟢 **Hoàn thành** | Bật SQLite WAL mode, `busy_timeout=5000`, `Cache=Shared` chống lock DB khi nhiều người ghi đồng thời. |
| **2** | **Đồng bộ Thời gian thực (Real-time Sync với SignalR)** | 🟠 Cao (P2) | ⏳ Kế hoạch tiếp theo | Broadcast sự kiện thay đổi công việc, bình luận, trạng thái tức thì đến toàn bộ người dùng đang mở trang. |
| **3** | **Kiểm soát Xung đột Ghi đè (Optimistic Concurrency Control)** | 🟡 Trung bình (P3) | ⏳ Kế hoạch tiếp theo | Thêm `RowVersion`/`UpdatedAt` để cảnh báo khi 2 người cùng chỉnh sửa 1 công việc tại cùng 1 thời điểm. |
| **4** | **Tự động làm mới dữ liệu nền (Auto-Polling & Background Sync)** | 🟢 Cao (P4) | 🟢 **Hoàn thành** | Cấu hình React Query `refetchInterval: 30s` & `refetchOnWindowFocus` cho Gantt Chart, Task List, Dashboard. |
| **5** | **Chỉ báo Người đang xem / Đang thao tác (User Presence Indicator)** | 🔵 Trung bình (P5) | 🟢 **Hoàn thành** | Hiển thị avatar/badge của đồng nghiệp đang cùng xem hoặc sửa trên từng dự án/công việc. |
| **6** | **Chuyển đổi Database Production (MySQL / PostgreSQL / SQL Server)** | 🟣 Dài hạn (P6) | ⏳ Khi triển khai Server | Chuyển `DatabaseProvider` trong `appsettings.json` sang RDBMS chuyên dụng khi lượng người dùng > 50 người. |

---

## 🛠️ Chi Tiết Từng Hạng Mục

### 1. 🔴 Mục 1: Tối ưu Cơ sở dữ liệu chống Lock khi Ghi đồng thời
- [x] Cập nhật chuỗi kết nối SQLite trong `appsettings.json` với `Cache=Shared;Mode=ReadWriteCreate;`.
- [x] Kích hoạt chế độ **WAL (Write-Ahead Logging)** vĩnh viễn trong `DbInitializer.cs` (`PRAGMA journal_mode=WAL;`).
- [x] Thiết lập `PRAGMA busy_timeout=5000;` để tự động chờ đến 5s giải phóng lock thay vì báo lỗi ngay lập tức.
- [x] Tối ưu hóa bộ nhớ tạm SQLite (`PRAGMA temp_store=MEMORY; PRAGMA synchronous=NORMAL;`).

---

### 2. 🟠 Mục 2: Tích hợp SignalR (Real-time WebSockets)
- [ ] Cài đặt gói `Microsoft.AspNetCore.SignalR` ở Backend.
- [ ] Tạo `GanttHub` và `NotificationHub` để quản lý các phòng chat dự án (`ProjectGroup`).
- [ ] Khi có sự kiện `CreateTask`, `UpdateTaskProgress`, `DeleteTask`, `AddComment` $\rightarrow$ Phát tín hiệu tới các client đang kết nối.
- [ ] Tích hợp `@microsoft/signalr` ở Frontend để tự động cập nhật biểu đồ Gantt và danh sách công việc mà không cần tải lại.

---

### 3. 🟡 Mục 3: Khóa Lạc Quan (Optimistic Concurrency Control)
- [ ] Bổ sung trường `byte[] RowVersion` hoặc `DateTime UpdatedAt` trong Entity `TaskItem` và `Project`.
- [ ] Khi cập nhật công việc, kiểm tra `RowVersion` gửi lên từ client có khớp với `RowVersion` hiện tại trong DB hay không.
- [ ] Nếu không khớp (do người khác đã lưu trước) $\rightarrow$ Trả về mã lỗi `409 Conflict`.
- [ ] Frontend hiển thị Modal cảnh báo xung đột kèm nút *"Xem thay đổi mới nhất"* hoặc *"Ghi đè có xác nhận"*.

---

### 4. 🟢 Mục 4: Tự động Làm mới Dữ liệu Nền (Auto-Polling & Cache Sync)
- [x] Bật `refetchOnWindowFocus: true` trong `QueryClient` (`App.tsx`) để tự động đồng bộ khi chuyển tab.
- [x] Thêm `refetchInterval: 5 phút` (300,000ms) cho các truy vấn Dự án (`useProjectsQuery`, `useProjectDetailQuery`).
- [x] Thêm `refetchInterval: 1 phút` (60,000ms) cho Biểu đồ Gantt, Danh sách công việc và Chi tiết công việc (`useGanttDataQuery`, `useTasksQuery`, `useTaskDetailQuery`).
- [x] Đảm bảo làm mới ngầm không gây giật lag giao diện nhờ `placeholderData: keepPreviousData` và bộ nhớ tạm React Query.

---

### 5. 🔵 Mục 5: Chỉ báo Người dùng Hiện diện (Presence / Co-editing)
- [x] Xây dựng Backend `PresenceService` & `PresenceController` lưu trữ trạng thái người dùng trực tuyến, xem dự án và sửa task (TTL 25s tự động dọn dẹp).
- [x] Tạo `usePresence` hook và `ProjectPresenceAvatars` hiển thị nhóm Avatar người dùng đang xem cùng dự án trên Header Gantt, Task List và Chi tiết Công trình.
- [x] Cảnh báo chỉnh sửa đồng thời (`CoEditingWarningBanner`) trong `TaskFormModal` và `TaskDetailDrawer` khi có đồng nghiệp đang cùng mở sửa 1 công việc.

---

### 6. 🟣 Mục 6: Chuyển đổi Cơ sở dữ liệu lên Server Production
- [ ] Chạy lệnh Migration tạo bảng cho MySQL / SQL Server / PostgreSQL.
- [ ] Cấu hình Connection Pooling (`MinPoolSize=5`, `MaxPoolSize=100`).
- [ ] Đổi `"DatabaseProvider": "MySql"` hoặc `"SqlServer"` trong file `appsettings.Production.json`.
