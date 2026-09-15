/**
 * Global Notification and Error Message Constants
 */

export const ERROR_MESSAGES = {
  // Generic / Network
  SERVER_ERROR: 'Có lỗi xảy ra từ máy chủ. Vui lòng thử lại sau.',
  NETWORK_ERROR: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập.',
  FORBIDDEN: 'Bạn không có quyền thực hiện hành động này.',
  NOT_FOUND: 'Không tìm thấy dữ liệu yêu cầu.',
  UNKNOWN_ERROR: 'Đã xảy ra lỗi không xác định.',

  // Validation
  REQUIRED_FIELD: 'Trường này là bắt buộc nhập.',
  INVALID_EMAIL: 'Địa chỉ email không đúng định dạng.',
  INVALID_PHONE: 'Số điện thoại không hợp lệ.',
  PASSWORD_TOO_SHORT: 'Mật khẩu phải có ít nhất 6 ký tự.',
  PASSWORD_MISMATCH: 'Xác nhận mật khẩu mới không khớp.',
  INVALID_DATE_RANGE: 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.',
  INVALID_CODE_FORMAT: 'Mã chỉ được chứa chữ cái, số, dấu gạch dưới (_) hoặc gạch ngang (-).',
  PERCENTAGE_OUT_OF_RANGE: 'Tiến độ phải nằm trong khoảng từ 0% đến 100%.',
  EMPTY_FULL_NAME: 'Họ và tên không được để trống.',
  EMPTY_PASSWORD_FIELDS: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.',

  // Projects
  PROJECT_CREATE_FAILED: 'Tạo dự án mới thất bại.',
  PROJECT_UPDATE_FAILED: 'Cập nhật thông tin dự án thất bại.',
  PROJECT_DELETE_FAILED: 'Xóa dự án thất bại.',
  PROJECT_CODE_EXISTS: 'Mã dự án đã tồn tại trong hệ thống.',
  PROJECT_MEMBER_ADD_FAILED: 'Thêm thành viên vào dự án thất bại.',
  PROJECT_MEMBER_REMOVE_FAILED: 'Xóa thành viên khỏi dự án thất bại.',

  // Tasks
  TASK_CREATE_FAILED: 'Tạo công việc mới thất bại.',
  TASK_UPDATE_FAILED: 'Cập nhật công việc thất bại.',
  TASK_DELETE_FAILED: 'Xóa công việc thất bại.',
  TASK_STATUS_UPDATE_FAILED: 'Cập nhật trạng thái công việc thất bại.',
  TASK_PROGRESS_UPDATE_FAILED: 'Cập nhật tiến độ công việc thất bại.',
  TASK_COMMENT_FAILED: 'Gửi bình luận thất bại.',

  // Employees & Users
  USER_CREATE_FAILED: 'Tạo tài khoản nhân viên thất bại.',
  USER_UPDATE_FAILED: 'Cập nhật thông tin nhân viên thất bại.',
  USER_DELETE_FAILED: 'Xóa tài khoản nhân viên thất bại.',
  USER_EMAIL_EXISTS: 'Email nhân viên đã tồn tại trong hệ thống.',

  // Roles & Permissions
  ROLE_CREATE_FAILED: 'Tạo vai trò mới thất bại.',
  ROLE_UPDATE_FAILED: 'Cập nhật vai trò thất bại.',
  ROLE_DELETE_FAILED: 'Xóa vai trò thất bại.',
  ROLE_SYSTEM_CANNOT_DELETE: 'Không thể xóa vai trò mặc định của hệ thống.',

  // Authentication
  LOGIN_FAILED: 'Email hoặc mật khẩu không chính xác.',
  CHANGE_PASSWORD_FAILED: 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.',
  PROFILE_UPDATE_FAILED: 'Cập nhật thông tin cá nhân thất bại.',
} as const;

export const SUCCESS_MESSAGES = {
  // Authentication & Profile
  LOGIN_SUCCESS: 'Đăng nhập thành công!',
  LOGOUT_SUCCESS: 'Đã đăng xuất khỏi hệ thống.',
  PROFILE_UPDATE_SUCCESS: 'Cập nhật thông tin cá nhân thành công!',
  CHANGE_PASSWORD_SUCCESS: 'Đổi mật khẩu thành công!',

  // Projects
  PROJECT_CREATE_SUCCESS: 'Tạo dự án mới thành công!',
  PROJECT_UPDATE_SUCCESS: 'Cập nhật thông tin dự án thành công!',
  PROJECT_DELETE_SUCCESS: 'Đã xóa dự án khỏi hệ thống!',
  PROJECT_MEMBER_ADD_SUCCESS: 'Thêm thành viên vào dự án thành công!',
  PROJECT_MEMBER_REMOVE_SUCCESS: 'Đã xóa thành viên khỏi dự án!',

  // Tasks
  TASK_CREATE_SUCCESS: 'Tạo công việc mới thành công!',
  TASK_UPDATE_SUCCESS: 'Cập nhật công việc thành công!',
  TASK_DELETE_SUCCESS: 'Đã xóa công việc thành công!',
  TASK_STATUS_UPDATE_SUCCESS: 'Cập nhật trạng thái công việc thành công!',
  TASK_PROGRESS_UPDATE_SUCCESS: 'Cập nhật tiến độ thành công!',
  TASK_COMMENT_SUCCESS: 'Đã gửi bình luận phản hồi!',

  // Employees
  USER_CREATE_SUCCESS: 'Tạo nhân viên mới thành công!',
  USER_UPDATE_SUCCESS: 'Cập nhật nhân sự thành công!',
  USER_DELETE_SUCCESS: 'Đã xóa tài khoản nhân sự!',
  USER_STATUS_UPDATE_SUCCESS: 'Cập nhật trạng thái hoạt động thành công!',

  // Roles & Permissions
  ROLE_CREATE_SUCCESS: 'Tạo vai trò mới thành công!',
  ROLE_UPDATE_SUCCESS: 'Cập nhật vai trò & ma trận phân quyền thành công!',
  ROLE_DELETE_SUCCESS: 'Đã xóa vai trò thành công!',

  // Export
  EXPORT_SUCCESS: 'Xuất dữ liệu báo cáo thành công!',
} as const;

export const CONFIRM_MESSAGES = {
  // Delete Dialogs
  DELETE_PROJECT_TITLE: 'Xác Nhận Xóa Dự Án',
  DELETE_PROJECT_CONTENT: 'Bạn có chắc chắn muốn xóa dự án này? Tất cả các công việc con và tài liệu liên quan sẽ bị xóa vĩnh viễn.',

  DELETE_TASK_TITLE: 'Xác Nhận Xóa Công Việc',
  DELETE_TASK_CONTENT: 'Hành động này sẽ xóa công việc và toàn bộ các công việc con bên dưới nó. Bạn có chắc chắn muốn xóa?',

  DELETE_EMPLOYEE_TITLE: 'Xác Nhận Xóa Nhân Sự',
  DELETE_EMPLOYEE_CONTENT: 'Bạn có chắc chắn muốn xóa tài khoản nhân viên này khỏi hệ thống?',

  DELETE_ROLE_TITLE: 'Xác Nhận Xóa Vai Trò',
  DELETE_ROLE_CONTENT: 'Bạn có chắc chắn muốn xóa vai trò này? Các tài khoản đang được gán vai trò này sẽ trở về quyền mặc định.',

  REMOVE_MEMBER_TITLE: 'Xác Nhận Xóa Thành Viên',
  REMOVE_MEMBER_CONTENT: 'Bạn có chắc chắn muốn xóa nhân sự này khỏi ban quản lý dự án?',

  LOGOUT_TITLE: 'Xác Nhận Đăng Xuất',
  LOGOUT_CONTENT: 'Bạn có chắc chắn muốn đăng xuất khỏi phiên làm việc hiện tại?',
} as const;

export const EMPTY_MESSAGES = {
  NO_PROJECTS: 'Chưa có dự án nào trong hệ thống.',
  NO_TASKS: 'Chưa có công việc nào được tạo trong dự án này.',
  NO_MEMBERS: 'Chưa có thành viên nào tham gia dự án.',
  NO_ACTIVITIES: 'Chưa có nhật ký hoạt động nào được ghi nhận.',
  NO_OVERDUE_TASKS: 'Không có công việc nào bị quá hạn. Tiến độ rất tốt!',
  NO_UPCOMING_DEADLINES: 'Không có deadline nào trong 7 ngày tới.',
  NO_EMPLOYEES: 'Không tìm thấy nhân viên nào phù hợp.',
  NO_ROLES: 'Không tìm thấy vai trò nào.',
  NO_COMMENTS: 'Chưa có trao đổi nào. Hãy là người đầu tiên để lại bình luận!',
} as const;
