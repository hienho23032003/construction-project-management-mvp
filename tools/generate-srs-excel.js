const ExcelJS = require('exceljs');
const path = require('path');

async function createSRSExcel() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Hệ Thống Quản Lý Dự Án & Tiến Độ Thi Công';
  workbook.lastModifiedBy = 'Antigravity AI';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Styles
  const primaryHeaderFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0284C7' } // Sky Blue 600
  };
  const secondaryHeaderFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F172A' } // Slate 900
  };
  const sectionHeaderFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2E8F0' } // Slate 200
  };
  const highlightFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF0F9FF' } // Sky 50
  };

  const headerFont = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  const titleFont = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FF0F172A' } };
  const subTitleFont = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF64748B' } };
  const boldText = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF1E293B' } };
  const regularText = { name: 'Segoe UI', size: 10, color: { argb: 'FF334155' } };

  const thinBorder = {
    top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
  };

  function applyTableStyles(sheet, startRow, endRow, startCol, endCol, isHeader = true) {
    for (let r = startRow; r <= endRow; r++) {
      const row = sheet.getRow(r);
      for (let c = startCol; c <= endCol; c++) {
        const cell = row.getCell(c);
        cell.border = thinBorder;
        cell.alignment = { vertical: 'middle', wrapText: true, ...cell.alignment };
        if (r === startRow && isHeader) {
          cell.fill = primaryHeaderFill;
          cell.font = headerFont;
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        } else if (!cell.font) {
          cell.font = regularText;
        }
      }
    }
  }

  // ==========================================
  // SHEET 1: TỔNG QUAN HỆ THỐNG
  // ==========================================
  const ws1 = workbook.addWorksheet('1. Tổng Quan Hệ Thống');
  ws1.views = [{ showGridLines: true }];
  ws1.columns = [
    { width: 6 },
    { width: 25 },
    { width: 45 },
    { width: 40 }
  ];

  ws1.mergeCells('B2:D2');
  ws1.getCell('B2').value = 'HỆ THỐNG QUẢN LÝ DỰ ÁN & TIẾN ĐỘ THI CÔNG XÂY DỰNG';
  ws1.getCell('B2').font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FF0284C7' } };
  ws1.getCell('B2').alignment = { vertical: 'middle' };
  ws1.getRow(2).height = 30;

  ws1.mergeCells('B3:D3');
  ws1.getCell('B3').value = 'Tài liệu Đặc tả Yêu cầu Phần mềm (SRS) & Hướng Dẫn Vận Hành Chi Tiết';
  ws1.getCell('B3').font = subTitleFont;

  const infoRows = [
    ['1. Mục Tiêu Dự Án', 'Cung cấp nền tảng quản lý dự án xây dựng toàn diện, theo dõi tiến độ thi công WBS/Gantt real-time, phân quyền nhân sự chặt chẽ, tối ưu báo cáo và cảnh báo trễ tiến độ.'],
    ['2. Kiến Trúc Backend', 'ASP.NET Core 8 Web API, Entity Framework Core 8, SQLite/SQL Server, Clean Architecture (Domain, Application, Infrastructure, API), JWT Bearer Auth, BCrypt.'],
    ['3. Kiến Trúc Frontend', 'React 18, TypeScript, Vite, Material UI (MUI v5), React Query (@tanstack/react-query), date-fns, Lucide React Icons.'],
    ['4. Đối Tượng Người Dùng', 'Ban Giám Đốc, Người Quản Lí (Project Manager), Kỹ Sư Giám Sát, Kỹ Sư Công Trường, Tổ Đội / Thợ Thi Công.'],
    ['5. Triển Khai & Vận Hành', 'Self-contained ASP.NET Core Release, tích hợp Single-Page App (SPA) tại wwwroot, script tự động đóng gói publish.zip chuẩn Production.'],
    ['6. Tài Khoản Quản Trị Mặc Định', 'Email: admin@gmail.com | Mật khẩu: 123456 | Quyền: SuperAdmin (Toàn quyền hệ thống)']
  ];

  let rIdx = 5;
  ws1.getCell(`B${rIdx}`).value = 'THÔNG TIN TỔNG QUAN';
  ws1.getCell(`B${rIdx}`).font = titleFont;
  rIdx++;

  ws1.getRow(rIdx).values = ['', 'Hạng Mục', 'Chi Tiết Đặc Tả', 'Ghi Chú / Khuyến Nghị'];
  const t1Header = rIdx;
  rIdx++;

  infoRows.forEach((row, i) => {
    ws1.getRow(rIdx).values = ['', row[0], row[1], 'Áp dụng trên toàn bộ môi trường'];
    rIdx++;
  });
  applyTableStyles(ws1, t1Header, rIdx - 1, 2, 4);

  // ==========================================
  // SHEET 2: MA TRẬN VAI TRÒ & PHÂN QUYỀN
  // ==========================================
  const ws2 = workbook.addWorksheet('2. Vai Trò & Phân Quyền');
  ws2.views = [{ showGridLines: true }];
  ws2.columns = [
    { width: 6 },
    { width: 22 },
    { width: 14 },
    { width: 14 },
    { width: 16 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 30 }
  ];

  ws2.mergeCells('B2:I2');
  ws2.getCell('B2').value = 'MA TRẬN PHÂN QUYỀN HỆ THỐNG (RBAC PERMISSION MATRIX)';
  ws2.getCell('B2').font = titleFont;
  ws2.getRow(2).height = 25;

  const permHeaders = ['', 'Chức Năng / Module', 'SuperAdmin', 'Giám Đốc', 'Người Quản Lí', 'Giám Sát', 'Kỹ Sư', 'Thợ / Công Nhân', 'Mô Tả Quyền Hạn'];
  ws2.getRow(4).values = permHeaders;

  const permissions = [
    ['Xem Dashboard tổng quan', 'Full (100%)', 'Full (100%)', 'Theo DA phụ trách', 'Theo DA phụ trách', 'Theo DA phụ trách', 'Cá nhân', 'Xem KPI, tiến độ, cảnh báo trễ'],
    ['Quản lý Dự Án (Tạo / Sửa / Xóa)', 'Toàn quyền', 'Toàn quyền', 'Sửa DA được giao', 'Chỉ xem', 'Chỉ xem', 'Không có', 'Quản lý thông tin công trình'],
    ['Phân bổ Thành viên dự án', 'Toàn quyền', 'Toàn quyền', 'Thành viên DA mình', 'Không có', 'Không có', 'Không có', 'Gán nhân sự vào dự án'],
    ['Quản lý Công Việc (WBS)', 'Toàn quyền', 'Toàn quyền', 'Toàn quyền trong DA', 'Tạo/Sửa việc được giao', 'Xem/Báo cáo tiến độ', 'Xem việc mình làm', 'Cấu trúc phân rã công việc'],
    ['Cập nhật Tiến độ & Trạng thái', 'Toàn quyền', 'Toàn quyền', 'Toàn quyền', 'Toàn quyền', 'Cập nhật việc mình', 'Cập nhật việc mình', 'Cập nhật % hoàn thành'],
    ['Thiết lập Phụ thuộc (Dependency)', 'Toàn quyền', 'Toàn quyền', 'Toàn quyền trong DA', 'Chỉ xem', 'Không có', 'Không có', 'Liên kết FS, SS, FF, SF'],
    ['Biểu Đồ Tiến Độ Gantt Chart', 'Xem/Sửa toàn bộ', 'Xem/Sửa toàn bộ', 'Xem/Sửa DA mình', 'Xem/Sửa việc mình', 'Chỉ xem', 'Chỉ xem', 'Dòng thời gian thi công thực tế'],
    ['Xuất Báo Cáo Excel / PDF', 'Toàn quyền', 'Toàn quyền', 'Báo cáo DA mình', 'Báo cáo việc mình', 'Không có', 'Không có', 'Xuất dữ liệu thống kê'],
    ['Quản lý Nhân Sự (Thêm/Sửa/Khóa)', 'Toàn quyền', 'Toàn quyền', 'Không có', 'Không có', 'Không có', 'Không có', 'Bảo mật tài khoản công ty'],
    ['Cấu hình Ma Trận Phân Quyền', 'Toàn quyền', 'Chỉ xem', 'Không có', 'Không có', 'Không có', 'Không có', 'Tùy biến quyền cho các vai trò'],
    ['Xem Nhật Ký Đăng Nhập (Audit)', 'Toàn quyền', 'Toàn quyền', 'Không có', 'Không có', 'Không có', 'Không có', 'Theo dõi IP, UserAgent, phiên đăng nhập']
  ];

  let pRow = 5;
  permissions.forEach(p => {
    ws2.getRow(pRow).values = ['', p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7]];
    pRow++;
  });
  applyTableStyles(ws2, 4, pRow - 1, 2, 9);

  // ==========================================
  // SHEET 3: ĐẶC TẢ CHỨC NĂNG CHI TIẾT (SRS)
  // ==========================================
  const ws3 = workbook.addWorksheet('3. Đặc Tả Chức Năng (SRS)');
  ws3.views = [{ showGridLines: true }];
  ws3.columns = [
    { width: 6 },
    { width: 12 },
    { width: 22 },
    { width: 28 },
    { width: 35 },
    { width: 30 },
    { width: 28 }
  ];

  ws3.mergeCells('B2:G2');
  ws3.getCell('B2').value = 'DANH MỤC ĐẶC TẢ YÊU CẦU CHỨC NĂNG PHẦN MỀM (SRS)';
  ws3.getCell('B2').font = titleFont;
  ws3.getRow(2).height = 25;

  ws3.getRow(4).values = ['', 'Mã Chức Năng', 'Phân Hệ (Module)', 'Tên Chức Năng', 'Mô Tả Chi Tiết & Nghiệp Vụ', 'Dữ Liệu Đầu Vào (Input)', 'Kết Quả Đầu Ra (Output)'];

  const srsList = [
    ['AUTH-01', 'Xác thực & Phiên', 'Đăng nhập hệ thống', 'Kiểm tra email, mật khẩu BCrypt, kiểm tra trạng thái tài khoản không bị khóa (IsActive=true). Lưu IP, UserAgent.', 'Email, Password', 'JWT Access Token, Thông tin user, Menu tương ứng'],
    ['AUTH-02', 'Xác thực & Phiên', 'Khóa/Bảo mật tài khoản', 'Chặn đăng nhập ngay lập tức khi tài khoản bị khóa, trả thông báo chính xác từ API.', 'UserId', 'Thông báo lỗi tài khoản bị khóa'],
    ['AUTH-03', 'Xác thực & Phiên', 'Nhật ký đăng nhập', 'Ghi vết lịch sử truy cập: IP, trình duyệt, thời gian đăng nhập/đăng xuất, tỷ lệ hoạt động.', 'Bộ lọc thời gian, user', 'Danh sách session, thống kê tổng quan'],
    ['PROJ-01', 'Quản lý Dự Án', 'Tạo mới dự án', 'Nhập mã dự án, tên công trình, địa điểm, Người Quản Lí, ngày bắt đầu, ngày kết thúc dự kiến, mức ưu tiên.', 'Thông tin dự án', 'Dự án mới, hiển thị trên Dashboard & Gantt'],
    ['PROJ-02', 'Quản lý Dự Án', 'Quản lý thành viên DA', 'Thêm thành viên với vai trò cụ thể vào dự án, xóa thành viên khi hoàn thành.', 'UserId, ProjectId, Role', 'Danh sách nhân sự tham gia dự án'],
    ['PROJ-03', 'Quản lý Dự Án', 'Tự động tính tiến độ DA', 'Tính toán % tiến độ tổng thể dự án dựa trên tổng trọng số và % tiến độ của các công việc con.', 'Tiến độ các task con', 'Progress % của dự án tự cập nhật real-time'],
    ['TASK-01', 'Quản lý Công Việc', 'Cây phân cấp WBS', 'Tạo cấu trúc phân rã công việc đa cấp: Hạng mục cha (Phase) -> Công việc con (Task/Subtask).', 'Tên task, ParentId, Dates', 'Cây WBS có thể thu gọn/mở rộng'],
    ['TASK-02', 'Quản lý Công Việc', 'Bảng công việc nhóm DA', 'Hiển thị công việc theo nhóm Mã Dự Án, cho phép Thu gọn / Mở rộng nhóm và giữ nguyên khi tìm kiếm.', 'Bộ lọc, Từ khóa search', 'Bảng dữ liệu công việc phân nhóm thông minh'],
    ['TASK-03', 'Quản lý Công Việc', 'Cập nhật tiến độ tức thì', 'Cập nhật slider tiến độ hoặc dropdown trạng thái trực tiếp ngay trên bảng mà không cần mở modal.', 'Progress (0-100), Status', 'Tiến độ cập nhật, task cha & DA tự tính lại'],
    ['TASK-04', 'Quản lý Công Việc', 'Liên kết phụ thuộc', 'Thiết lập mối quan hệ phụ thuộc Finish-to-Start (FS), Start-to-Start (SS), Finish-to-Finish (FF), Start-to-Finish (SF).', 'Task nguồn, Task đích, Loại', 'Đường liên kết phụ thuộc trên Gantt'],
    ['TASK-05', 'Quản lý Công Việc', 'Trao đổi & Bình luận', 'Thêm bình luận, ghi chú hiện trường, trao đổi công việc theo từng đầu việc cụ thể.', 'Nội dung comment', 'Lịch sử trao đổi theo thời gian'],
    ['GANTT-01', 'Biểu Đồ Gantt', 'Dòng thời gian tương tác', 'Biểu diễn tiến độ trực quan theo thời gian thực với thanh công cụ điều khiển gộp thông minh.', 'Tasks data, Dependencies', 'Biểu đồ Gantt trực quan cao cấp'],
    ['GANTT-02', 'Biểu Đồ Gantt', 'Lọc dữ liệu Server-Side', 'Lọc dự án, trạng thái, khoảng thời gian (Tháng này, Quý này...) trực tiếp từ Backend để triệt tiêu độ lag.', 'ProjectId, Status, Dates', 'Dữ liệu Gantt tối ưu, tốc độ phản hồi tức thì'],
    ['GANTT-03', 'Biểu Đồ Gantt', 'Thu gọn / Mở rộng cây', 'Nhấp chuột vào bất kỳ vị trí hàng công việc để đóng/mở nhánh cây nhanh chóng.', 'Click event trên hàng', 'Nhánh cây WBS đóng/mở mượt mà'],
    ['GANTT-04', 'Biểu Đồ Gantt', 'MUI DatePicker', 'Chọn khoảng ngày chính xác với lịch chọn ngày tiếng Việt hiện đại.', 'Từ ngày, Đến ngày', 'Gantt timeline cập nhật theo ngày đã chọn'],
    ['REP-01', 'Báo Cáo & Thống Kê', 'Báo cáo tổng hợp dự án', 'Báo cáo tổng tiến độ, số lượng việc, ngân sách, nhân sự tham gia từng công trình.', 'Bộ lọc dự án, thời gian', 'Bảng số liệu & biểu đồ tiến độ'],
    ['REP-02', 'Báo Cáo & Thống Kê', 'Cảnh báo công việc trễ hạn', 'Tự động phát hiện và tổng hợp các công việc quá hạn dự kiến mà chưa hoàn thành (màu đỏ cảnh báo).', 'Hạn kết thúc, Status', 'Danh sách việc chậm tiến độ cần xử lý gấp'],
    ['REP-03', 'Báo Cáo & Thống Kê', 'Phân bổ khối lượng nhân sự', 'Thống kê số lượng công việc đang giao cho từng nhân viên, tránh quá tải cục bộ.', 'UserId, Thời gian', 'Biểu đồ & bảng Workload từng nhân sự'],
    ['USER-01', 'Quản trị Nhân Sự', 'Quản lý người dùng', 'Thêm, sửa thông tin nhân viên, đổi vai trò, phòng ban, khóa/mở khóa tài khoản nhân viên.', 'Thông tin nhân sự', 'Danh sách nhân sự công ty chuẩn hóa']
  ];

  let sRow = 5;
  srsList.forEach(s => {
    ws3.getRow(sRow).values = ['', s[0], s[1], s[2], s[3], s[4], s[5]];
    sRow++;
  });
  applyTableStyles(ws3, 4, sRow - 1, 2, 7);

  // ==========================================
  // SHEET 4: HƯỚNG DẪN SỬ DỤNG CHI TIẾT
  // ==========================================
  const ws4 = workbook.addWorksheet('4. Hướng Dẫn Sử Dụng');
  ws4.views = [{ showGridLines: true }];
  ws4.columns = [
    { width: 6 },
    { width: 8 },
    { width: 24 },
    { width: 35 },
    { width: 45 },
    { width: 30 }
  ];

  ws4.mergeCells('B2:F2');
  ws4.getCell('B2').value = 'HƯỚNG DẪN SỬ DỤNG TỪNG BƯỚC CHO NGƯỜI DÙNG (USER MANUAL)';
  ws4.getCell('B2').font = titleFont;
  ws4.getRow(2).height = 25;

  ws4.getRow(4).values = ['', 'Bước', 'Màn Hình', 'Thao Tác Thực Hiện', 'Chi Tiết Hướng Dẫn', 'Lưu Ý Quan Trọng'];

  const guideList = [
    ['1', 'Đăng Nhập', 'Truy cập trang đăng nhập', 'Nhập Email và Mật khẩu được cấp. Bấm "Đăng Nhập".', 'Hệ thống tự động điều hướng vào trang Dashboard tổng quan nếu tài khoản hợp lệ.'],
    ['2', 'Dashboard', 'Xem chỉ số tổng quan', 'Xem 4 thẻ KPI: Dự án đang chạy, Tiến độ TB, Việc hoàn thành, Việc trễ hạn.', 'Bấm vào việc trễ hạn để xem chi tiết và đôn đốc nhân sự.'],
    ['3', 'Quản Lý Dự Án', 'Tạo dự án mới', 'Vào menu "Dự Án" -> Bấm "+ Thêm Dự Án" -> Điền Mã dự án, Tên, Người Quản Lí, Ngày bắt đầu/kết thúc (DatePicker) -> Bấm "Tạo Dự Án".', 'Mã dự án không được trùng lặp (ví dụ: DA-2026-01).'],
    ['4', 'Chi Tiết Dự Án', 'Phân bổ nhân sự vào DA', 'Bấm vào 1 dự án -> Chọn tab "Thành viên" -> Bấm "+ Thêm thành viên" -> Chọn nhân viên & vai trò.', 'Người Quản Lí dự án có quyền điều phối công việc trong dự án đó.'],
    ['5', 'Quản Lý Công Việc', 'Lập danh mục công việc (WBS)', 'Vào menu "Công Việc" -> Bấm "+ Thêm Công Việc" -> Chọn dự án, hạng mục cha (nếu có), người thực hiện, thời gian -> Bấm Lưu.', 'Nên chia nhỏ công việc theo hạng mục (Phase) để dễ theo dõi.'],
    ['6', 'Quản Lý Công Việc', 'Cập nhật tiến độ & Lọc', 'Kéo thanh slider tiến độ trên từng dòng để cập nhật % hoặc đổi trạng thái trong ô Dropdown. Gõ từ khóa vào ô tìm kiếm.', 'Khi tìm kiếm hoặc lọc, trạng thái đóng/mở của các nhóm dự án sẽ được giữ nguyên.'],
    ['7', 'Biểu Đồ Gantt', 'Xem dòng thời gian thi công', 'Vào menu "Biểu Đồ Gantt" -> Hệ thống mặc định lọc "Tháng này" để tối ưu tốc độ. Có thể chọn "Quý này", "Năm nay" hoặc "Tùy chỉnh...".', 'Thanh công cụ và bộ lọc đã được gộp thành 1 hàng duy nhất.'],
    ['8', 'Biểu Đồ Gantt', 'Đóng / Mở nhánh công việc', 'Bấm chuột trực tiếp vào tên dự án hoặc hạng mục công việc bên cột trái để Thu gọn / Mở rộng nhánh con.', 'Không cần bấm chính xác vào mũi tên nhỏ, bấm vào chữ là thu gọn/mở rộng.'],
    ['9', 'Biểu Đồ Gantt', 'Chuyển chế độ xem & Hôm nay', 'Bấm nút "Ngày", "Tuần", "Tháng" trên thanh điều khiển. Bấm nút "Hôm Nay" để cuộn nhanh đến ngày hiện tại.', 'Có thể bấm "Xuất Excel / CSV" để tải file tiến độ về máy.'],
    ['10', 'Báo Cáo & Thống Kê', 'Xuất báo cáo định kỳ', 'Vào menu "Báo Cáo" -> Chọn tab cần xem (Tiến độ dự án, Chi tiết việc, Việc trễ hạn, Phân bổ tải) -> Bấm "Xuất Excel".', 'Hỗ trợ xuất file Excel chuẩn định dạng để in ấn và báo cáo ban giám đốc.'],
    ['11', 'Quản Lý Nhân Sự', 'Thêm nhân sự & Khóa tài khoản', 'Vào menu "Nhân Sự" -> Bấm "+ Thêm Nhân Viên" để tạo mới. Bấm icon Khóa nếu nhân sự nghỉ việc hoặc tạm dừng quyền truy cập.', 'Tài khoản bị khóa sẽ không thể đăng nhập và hiển thị cảnh báo từ server.']
  ];

  let gRow = 5;
  guideList.forEach(g => {
    ws4.getRow(gRow).values = ['', g[0], g[1], g[2], g[3], g[4]];
    gRow++;
  });
  applyTableStyles(ws4, 4, gRow - 1, 2, 6);

  // ==========================================
  // SHEET 5: QUY TRÌNH NGHIỆP VỤ (WORKFLOWS)
  // ==========================================
  const ws5 = workbook.addWorksheet('5. Quy Trình Nghiệp Vụ');
  ws5.views = [{ showGridLines: true }];
  ws5.columns = [
    { width: 6 },
    { width: 14 },
    { width: 26 },
    { width: 22 },
    { width: 45 },
    { width: 30 }
  ];

  ws5.mergeCells('B2:F2');
  ws5.getCell('B2').value = 'QUY TRÌNH NGHIỆP VỤ QUẢN LÝ DỰ ÁN XÂY DỰNG (CORE WORKFLOWS)';
  ws5.getCell('B2').font = titleFont;
  ws5.getRow(2).height = 25;

  ws5.getRow(4).values = ['', 'Quy Trình', 'Giai Đoạn', 'Bên Thực Hiện', 'Nội Dung & Các Bước Thực Hiện', 'Tiêu Chuẩn Hoàn Thành'];

  const workflows = [
    ['WF-01', '1. Khởi Tạo Dự Án', 'Ban Giám Đốc / Admin', 'Tạo dự án mới, nhập thông tin địa điểm, thời hạn cam kết, bổ nhiệm Người Quản Lí (Project Manager).', 'Dự án hiển thị trên hệ thống ở trạng thái Chưa bắt đầu.'],
    ['WF-02', '2. Lập Kế Hoạch & WBS', 'Người Quản Lí', 'Phân rã dự án thành các Hạng mục chính (Phase) và các Công việc con (Tasks). Thiết lập ngày bắt đầu/kết thúc dự kiến và mối quan hệ phụ thuộc (FS/SS/FF).', 'Cây WBS và biểu đồ Gantt hoàn chỉnh.'],
    ['WF-03', '3. Phân Công Nhân Sự', 'Người Quản Lí / Giám Sát', 'Gán kỹ sư giám sát và thợ thi công vào từng đầu việc cụ thể.', 'Mỗi công việc đều có người phụ trách rõ ràng.'],
    ['WF-04', '4. Thi Công & Báo Cáo', 'Kỹ Sư / Thợ Thi Công', 'Thực hiện công việc tại công trường, cập nhật % tiến độ hàng ngày và ghi chú bình luận hiện trường nếu có phát sinh.', 'Tiến độ được cập nhật real-time lên Gantt.'],
    ['WF-05', '5. Giám Sát & Đôn Đốc', 'Giám Đốc / Người Quản Lí', 'Theo dõi màn hình Dashboard và Báo cáo Trễ Hạn. Hệ thống cảnh báo đỏ các công việc quá hạn để kịp thời xử lý.', 'Không để công việc bị trễ hạn kéo dài làm ảnh hưởng dự án.'],
    ['WF-06', '6. Nghiệm Thu & Đóng DA', 'Người Quản Lí / Giám Đốc', 'Kiểm tra 100% công việc con hoàn thành, hệ thống tự động chốt tiến độ dự án 100%, chuyển trạng thái dự án sang Hoàn thành.', 'Dự án kết thúc thành công, xuất báo cáo tổng kết.']
  ];

  let wRow = 5;
  workflows.forEach(w => {
    ws5.getRow(wRow).values = ['', w[0], w[1], w[2], w[3], w[4]];
    wRow++;
  });
  applyTableStyles(ws5, 4, wRow - 1, 2, 6);

  const outputPath = path.resolve('DOCUMENT_SRS_HUONG_DAN_SU_DUNG.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`Successfully generated SRS Excel document at: ${outputPath}`);
}

createSRSExcel().catch(err => {
  console.error('Error creating Excel document:', err);
  process.exit(1);
});
