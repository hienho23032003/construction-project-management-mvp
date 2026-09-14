import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { User, UserRole, RoleItem } from '../../types';
import { useRolesQuery } from '../../hooks/useRoles';

export interface EmployeeFormData {
  fullName: string;
  email: string;
  password?: string;
  phone: string;
  department: string;
  role: UserRole | string;
  roleIds?: string[];
  isActive?: boolean;
}

interface EmployeeFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  editingUser?: User | null;
  isSubmitting?: boolean;
}

const getInitialRoleValue = (user: User | null | undefined, roles: RoleItem[]): string => {
  if (!user) {
    const engineer = roles.find((r) => r.code === 'FIELD_ENGINEER');
    return engineer ? engineer.code : 'Employee';
  }

  // 1. Match by roleIds
  if (user.roleIds && user.roleIds.length > 0) {
    const matched = roles.find((r) => user.roleIds?.includes(r.id));
    if (matched) return matched.code;
  }

  // 2. Match by enum string
  if (user.role) {
    const roleUpper = String(user.role).toUpperCase();
    if (roleUpper === 'SUPERADMIN' || roleUpper === 'SUPER_ADMIN') {
      const r = roles.find((x) => x.code === 'SUPER_ADMIN' || x.code === 'SuperAdmin');
      if (r) return r.code || 'SUPER_ADMIN';
      return 'SUPER_ADMIN';
    }
    if (roleUpper === 'PROJECTMANAGER' || roleUpper === 'PROJECT_MANAGER') {
      const r = roles.find((x) => x.code === 'PROJECT_MANAGER' || x.code === 'ProjectManager');
      if (r) return r.code || 'PROJECT_MANAGER';
      return 'PROJECT_MANAGER';
    }
    if (roleUpper === 'SUPERVISOR' || roleUpper === 'SITE_SUPERVISOR') {
      const r = roles.find((x) => x.code === 'SITE_SUPERVISOR' || x.code === 'Supervisor');
      if (r) return r.code || 'SITE_SUPERVISOR';
      return 'SITE_SUPERVISOR';
    }
    if (roleUpper === 'EMPLOYEE' || roleUpper === 'FIELD_ENGINEER') {
      const r = roles.find((x) => x.code === 'FIELD_ENGINEER' || x.code === 'Employee');
      if (r) return r.code || 'FIELD_ENGINEER';
      return 'FIELD_ENGINEER';
    }
    const directMatch = roles.find((x) => x.code === user.role || x.id === user.role);
    if (directMatch) return directMatch.code;
    return String(user.role);
  }

  return roles.length > 0 ? roles[0].code : 'Employee';
};

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  editingUser,
  isSubmitting = false,
}) => {
  const { data: roleList = [] } = useRolesQuery();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      department: '',
      role: 'FIELD_ENGINEER',
      roleIds: [],
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      const initialRole = getInitialRoleValue(editingUser, roleList);
      if (editingUser) {
        reset({
          fullName: editingUser.fullName || '',
          email: editingUser.email || '',
          password: '',
          phone: editingUser.phone || '',
          department: editingUser.department || '',
          role: initialRole,
          roleIds: editingUser.roleIds || [],
          isActive: editingUser.isActive ?? true,
        });
      } else {
        reset({
          fullName: '',
          email: '',
          password: '',
          phone: '',
          department: '',
          role: initialRole,
          roleIds: [],
          isActive: true,
        });
      }
    }
  }, [open, editingUser, roleList, reset]);

  const handleFormSubmit = (data: EmployeeFormData) => {
    const selectedCode = String(data.role || '');
    const matchedRole = roleList.find((r) => r.code === selectedCode || r.id === selectedCode);

    // Map back to UserRole enum for backend
    let enumRole: UserRole = 'Employee';
    const upper = selectedCode.toUpperCase();
    if (upper === 'SUPER_ADMIN' || upper === 'SUPERADMIN') enumRole = 'SuperAdmin';
    else if (upper === 'PROJECT_MANAGER' || upper === 'PROJECTMANAGER') enumRole = 'ProjectManager';
    else if (upper === 'SITE_SUPERVISOR' || upper === 'SUPERVISOR') enumRole = 'Supervisor';
    else enumRole = 'Employee';

    const payload: EmployeeFormData = {
      ...data,
      role: enumRole,
      roleIds: matchedRole ? [matchedRole.id] : undefined,
    };
    return onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle sx={{ fontWeight: 700, px: 3, pt: 2.5, pb: 1 }}>
          {editingUser ? `Chỉnh Sửa Nhân Sự: ${editingUser.fullName}` : 'Thêm Nhân Viên / Người Dùng Mới'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '24px !important', px: 3 }}>
          <Controller
            name="fullName"
            control={control}
            rules={{ required: 'Trường này là bắt buộc' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Họ Và Tên"
                fullWidth
                required
                placeholder="VD: Nguyễn Văn A..."
                error={Boolean(errors.fullName)}
                helperText={errors.fullName?.message}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            rules={{
              required: 'Trường này là bắt buộc',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Địa chỉ email không hợp lệ',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email Đăng Nhập"
                type="email"
                fullWidth
                required
                disabled={Boolean(editingUser)}
                placeholder="VD: nva@fcbvn.vn"
                error={Boolean(errors.email)}
                helperText={errors.email?.message || (editingUser ? 'Email đăng nhập không thể thay đổi' : undefined)}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={
              editingUser
                ? {
                    minLength: {
                      value: 6,
                      message: 'Mật khẩu mới tối thiểu 6 ký tự',
                    },
                  }
                : {
                    required: 'Mật khẩu khởi tạo là bắt buộc',
                    minLength: { value: 6, message: 'Tối thiểu 6 ký tự' },
                  }
            }
            render={({ field }) => (
              <TextField
                {...field}
                label={editingUser ? 'Mật Khẩu Mới (Để trống nếu không đổi)' : 'Mật Khẩu Khởi Tạo'}
                type="password"
                fullWidth
                required={!editingUser}
                placeholder={editingUser ? 'Nhập mật khẩu mới nếu muốn đổi...' : 'Tối thiểu 6 ký tự...'}
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
              />
            )}
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Số Điện Thoại"
                    fullWidth
                    placeholder="VD: 0912345678"
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phòng Ban / Đơn Vị"
                    fullWidth
                    placeholder="VD: Ban Quản Lý Dự Án"
                  />
                )}
              />
            </Grid>
          </Grid>

          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Vai Trò / Phân Quyền</InputLabel>
                <Select {...field} label="Vai Trò / Phân Quyền">
                  {roleList.length > 0 ? (
                    roleList.map((r) => (
                      <MenuItem key={r.id} value={r.code}>
                        {r.name.replace('Chỉ Huy Trưởng', 'Người Quản Lý')} ({r.code}) {r.isSystem ? '• Hệ thống' : '• Tùy chỉnh'}
                      </MenuItem>
                    ))
                  ) : (
                    <>
                      <MenuItem value="FIELD_ENGINEER">Kỹ Sư / Nhân Viên (FIELD_ENGINEER)</MenuItem>
                      <MenuItem value="SITE_SUPERVISOR">Giám Sát Hiện Trường (SITE_SUPERVISOR)</MenuItem>
                      <MenuItem value="PROJECT_MANAGER">Người Quản Lý (PM) (PROJECT_MANAGER)</MenuItem>
                      <MenuItem value="SUPER_ADMIN">Quản Trị Viên Toàn Quyền (SUPER_ADMIN)</MenuItem>
                    </>
                  )}
                </Select>
              </FormControl>
            )}
          />

          {editingUser && (
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value ?? true} onChange={(e) => field.onChange(e.target.checked)} color="primary" />}
                  label={field.value ? 'Trạng thái: Hoạt động' : 'Trạng thái: Đang khóa'}
                />
              )}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} variant="outlined" color="inherit" disabled={isSubmitting}>
            Hủy Bỏ
          </Button>
          <Button type="submit" variant="contained" sx={{ bgcolor: '#0284c7' }} disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : editingUser ? 'Lưu Thay Đổi' : 'Tạo Nhân Viên'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
