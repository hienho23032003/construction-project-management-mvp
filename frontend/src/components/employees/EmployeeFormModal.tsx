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
  IconButton,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { X } from 'lucide-react';
import { User, UserRole, RoleItem } from '../../types';
import { useRolesQuery } from '../../hooks/useRoles';
import { getRoleChipStyle } from '../../utils/roleColors';
import { CommonButton, CommonInput } from '../common';

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
  if (!roles || roles.length === 0) {
    return user?.role || 'Employee';
  }

  if (!user) {
    const engineer = roles.find((r) => r.code === 'FIELD_ENGINEER');
    return engineer ? engineer.id : roles[0].id;
  }

  // 1. Match by user.roleIds
  if (user.roleIds && user.roleIds.length > 0) {
    const matched = roles.find((r) => user.roleIds?.includes(r.id));
    if (matched) return matched.id;
  }

  // 2. Match by user.roles (role names from dynamic roles)
  if (user.roles && user.roles.length > 0) {
    const matched = roles.find(
      (r) =>
        r.name.trim().toLowerCase() === user.roles![0].trim().toLowerCase() ||
        r.code.trim().toLowerCase() === user.roles![0].trim().toLowerCase()
    );
    if (matched) return matched.id;
  }

  // 3. Match by user.roleName
  if (user.roleName) {
    const matched = roles.find(
      (r) =>
        r.name.trim().toLowerCase() === user.roleName!.trim().toLowerCase() ||
        r.code.trim().toLowerCase() === user.roleName!.trim().toLowerCase()
    );
    if (matched) return matched.id;
  }

  // 4. Match by legacy enum string or code
  if (user.role) {
    const roleUpper = String(user.role).toUpperCase();
    if (roleUpper === 'SUPERADMIN' || roleUpper === 'SUPER_ADMIN') {
      const r = roles.find((x) => x.code === 'SUPER_ADMIN' || x.code === 'SuperAdmin');
      if (r) return r.id;
    }
    if (roleUpper === 'PROJECTMANAGER' || roleUpper === 'PROJECT_MANAGER') {
      const r = roles.find((x) => x.code === 'PROJECT_MANAGER' || x.code === 'ProjectManager');
      if (r) return r.id;
    }
    if (roleUpper === 'SUPERVISOR' || roleUpper === 'SITE_SUPERVISOR') {
      const r = roles.find((x) => x.code === 'SITE_SUPERVISOR' || x.code === 'Supervisor');
      if (r) return r.id;
    }
    if (roleUpper === 'EMPLOYEE' || roleUpper === 'FIELD_ENGINEER') {
      const r = roles.find((x) => x.code === 'FIELD_ENGINEER' || x.code === 'Employee');
      if (r) return r.id;
    }
    const directMatch = roles.find((x) => x.code === user.role || x.id === user.role);
    if (directMatch) return directMatch.id;
  }

  return roles[0].id;
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
      role: '',
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
    const selectedVal = String(data.role || '');
    const matchedRole = roleList.find((r) => r.id === selectedVal || r.code === selectedVal);

    // Map back to UserRole enum for backend
    let enumRole: UserRole = 'Employee';
    if (matchedRole) {
      const upper = (matchedRole.code || '').toUpperCase();
      if (upper === 'SUPER_ADMIN' || upper === 'SUPERADMIN') enumRole = 'SuperAdmin';
      else if (upper === 'PROJECT_MANAGER' || upper === 'PROJECTMANAGER') enumRole = 'ProjectManager';
      else if (upper === 'SITE_SUPERVISOR' || upper === 'SUPERVISOR') enumRole = 'Supervisor';
      else enumRole = 'Employee';
    }

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
        <DialogTitle
          sx={{
            fontWeight: 700,
            px: 3,
            pt: 2.5,
            pb: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '1.15rem', color: 'text.primary' }}>
            {editingUser ? `Chỉnh Sửa Nhân Sự: ${editingUser.fullName}` : 'Thêm Nhân Viên / Người Dùng Mới'}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
            }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '24px !important', px: 3 }}>
          <Controller
            name="fullName"
            control={control}
            rules={{ required: 'Trường này là bắt buộc' }}
            render={({ field }) => (
              <CommonInput
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
              <CommonInput
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
              <CommonInput
                {...field}
                label={editingUser ? 'Mật Khẩu Mới (Để trống nếu không đổi)' : 'Mật Khẩu Khởi Tạo'}
                isPassword
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
                  <CommonInput
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
                  <CommonInput
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
                <Select
                  {...field}
                  label="Vai Trò / Phân Quyền"
                  renderValue={(selectedId) => {
                    const matched = roleList.find((r) => r.id === selectedId || r.code === selectedId);
                    if (matched) {
                      const cleanName = matched.name.replace('Chỉ Huy Trưởng', 'Quản Lý (PM)').replace('Người Quản Lý', 'Quản Lý (PM)');
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={cleanName}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              ...getRoleChipStyle(matched.color, matched.code || matched.name),
                            }}
                          />
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            ({matched.code})
                          </Typography>
                        </Box>
                      );
                    }
                    return selectedId;
                  }}
                >
                  {roleList.length > 0 ? (
                    roleList.map((r) => {
                      const cleanName = r.name.replace('Chỉ Huy Trưởng', 'Quản Lý (PM)').replace('Người Quản Lý', 'Quản Lý (PM)');
                      return (
                        <MenuItem key={r.id} value={r.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={cleanName}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  ...getRoleChipStyle(r.color, r.code || r.name),
                                }}
                              />
                              <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'monospace' }}>
                                ({r.code})
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                              {r.isSystem ? '• Hệ thống' : '• Tùy chỉnh'}
                            </Typography>
                          </Box>
                        </MenuItem>
                      );
                    })
                  ) : (
                    <>
                      <MenuItem value="FIELD_ENGINEER">Kỹ Sư / Nhân Viên (FIELD_ENGINEER)</MenuItem>
                      <MenuItem value="SITE_SUPERVISOR">Giám Sát Hiện Trường (SITE_SUPERVISOR)</MenuItem>
                      <MenuItem value="PROJECT_MANAGER">Quản Lý (PM) (PROJECT_MANAGER)</MenuItem>
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
          <CommonButton onClick={onClose} variant="secondary" disabled={isSubmitting}>
            Hủy Bỏ
          </CommonButton>
          <CommonButton type="submit" variant="primary" loading={isSubmitting}>
            {editingUser ? 'Lưu Thay Đổi' : 'Tạo Nhân Viên'}
          </CommonButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};
