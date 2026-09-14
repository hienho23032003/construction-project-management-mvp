# Hướng Dẫn Deploy Hệ Thống Quản Lý Thi Công Lên Nhân Hòa (Subdomain fcbvn.vn)

Tài liệu này hướng dẫn chi tiết cách deploy dự án **Quản Lý Tiến Độ Thi Công & Timesheet** lên hosting/server Nhân Hòa dưới dạng Subdomain (Ví dụ: `tiendo.fcbvn.vn` hoặc `timesheet.fcbvn.vn`), tương tự như dự án Báo Giá `fcbvn.vn`.

---

## 1. Tự Động Đóng Gói (Build & Publish)

Chỉ cần chạy 1 câu lệnh duy nhất từ thư mục gốc của dự án:

### Cách 1: Chạy file Batch (Double-click)
- Double-click vào file: `tools\publish-prod.bat`

### Cách 2: Chạy qua PowerShell
```powershell
.\tools\publish-prod.ps1
```

**Quá trình script tự động thực hiện:**
1. Build Frontend React/Vite (`npm run build` tạo thư mục `dist`).
2. Copy toàn bộ assets tĩnh của Frontend vào `backend\ConstructionManagement.API\wwwroot`.
3. Build & Publish Backend ASP.NET Core .NET 8 ở chế độ `Release`.
4. Cấu hình sẵn `web.config` và `appsettings.Production.json`.
5. Đóng gói toàn bộ thành file nén duy nhất: **`publish.zip`** tại thư mục gốc dự án.

---

## 2. Cấu Hình Trên Hosting Nhân Hòa (Plesk / cPanel / IIS)

### Bước 1: Tạo Subdomain
1. Đăng nhập vào trang quản trị Hosting Nhân Hòa (Plesk hoặc cPanel).
2. Vào mục **Subdomains** -> Chọn **Add Subdomain**.
3. Nhập tên Subdomain, ví dụ:
   - **Subdomain Name**: `tiendo` (hoặc `timesheet`, `congtrinh`)
   - **Parent Domain**: `fcbvn.vn`
   - **Document Root**: `/tiendo.fcbvn.vn` (hoặc `httpdocs/tiendo`)
4. Bấm **OK** để tạo.

### Bước 2: Cấu Hình .NET Core Trên Hosting
1. Tại phần quản lý của Subdomain vừa tạo, kiểm tra **Hosting Settings** / **Application Pool**:
   - **.NET CLR Version**: `No Managed Code` (hoặc chọn .NET Core / .NET 8).
   - **Pipeline mode**: `Integrated`.

### Bước 3: Upload File & Giải Nén
1. Mở **File Manager** của Subdomain vừa tạo.
2. Xóa các file mặc định của hosting (nếu có).
3. Upload file **`publish.zip`** vừa được tạo ở bước 1.
4. Chọn file `publish.zip` -> Bấm **Extract Files** (Giải nén) ngay tại thư mục gốc của Subdomain.

---

## 3. Cấu Hình Cơ Sở Dữ Liệu (Database)

Dự án hỗ trợ 2 chế độ cơ sở dữ liệu linh hoạt:

### Lựa Chọn A: Sử Dụng SQLite (Mặc Định - Cực Kỳ Đơn Giản & Ổn Định)
- Không cần tạo Database MySQL trên hosting.
- Hệ thống sẽ tự động tạo file `construction_pm.db` và khởi tạo sẵn dữ liệu mẫu (Users, Roles, Projects, Tasks, Gantt, Permissions).
- Tài khoản đăng nhập ban đầu:
  - **Email**: `admin@fcbvn.vn`
  - **Mật khẩu**: `Admin@123`

### Lựa Chọn B: Sử Dụng MySQL Trên Hosting Nhân Hòa
Nếu muốn dùng MySQL trên Nhân Hòa (chung hoặc riêng với database của `fcbvn.vn`):
1. Mở file `appsettings.Production.json` trên File Manager của hosting.
2. Cập nhật:
   ```json
   {
     "DatabaseProvider": "MySql",
     "ConnectionStrings": {
       "MySqlConnection": "Server=localhost;Port=3306;Database=nhfcbzjk_tiendo;User=nhfcbzjk_fcbvn;Password=fcbvn123@;"
     }
   }
   ```
3. Khởi động lại ứng dụng / App Pool.

---

## 4. Cấu Hình DNS Cho Subdomain (Nếu Chưa Trỏ Tự Động)

Truy cập trang quản trị DNS tên miền `fcbvn.vn` (tại Nhân Hòa hoặc Cloudflare) và thêm bản ghi:
- **Type (Loại)**: `A`
- **Host / Name**: `tiendo` (hoặc `timesheet`)
- **Points to (Giá trị)**: Địa chỉ IP Server của Nhân Hòa (ví dụ IP của `fcbvn.vn`).
- **TTL**: 300 hoặc Auto.

---

## 5. Kiểm Tra Hoạt Động (Verification)

1. Mở trình duyệt và truy cập: `https://tiendo.fcbvn.vn` (hoặc subdomain bạn đã đặt).
2. Đăng nhập với tài khoản:
   - **Tài khoản**: `admin@fcbvn.vn`
   - **Mật khẩu**: `Admin@123`
3. Kiểm tra các chức năng:
   - ✅ Biểu đồ Gantt toàn màn hình & tương tác kéo thả.
   - ✅ Quản lý Công trình, Cây công việc, Bảng biểu responsive trên mobile.
   - ✅ Xuất báo cáo Excel / CSV.
   - ✅ Phân quyền chức năng & Lịch sử đăng nhập.
