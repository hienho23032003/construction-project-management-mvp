import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import { X } from 'lucide-react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { Project, PriorityLevel, ProjectStatus, User } from '../../types';
import { CommonButton, CommonInput, UserMultiSelect } from '../common';

export interface ProjectFormData {
  code: string;
  name: string;
  description: string;
  location: string;
  managerId: string;
  managerIds?: string[];
  startDate: string;
  plannedEndDate: string;
  priority: PriorityLevel;
  status: ProjectStatus;
}

interface ProjectFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  editingProject?: Project | null;
  users: User[];
  isSubmitting?: boolean;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  editingProject,
  users,
  isSubmitting = false,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      code: '',
      name: '',
      description: '',
      location: '',
      managerId: '',
      managerIds: [],
      startDate: new Date().toISOString().split('T')[0],
      plannedEndDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      priority: 'Medium',
      status: 'NotStarted',
    },
  });

  useEffect(() => {
    if (editingProject) {
      const initialManagerIds =
        editingProject.managerIds && editingProject.managerIds.length > 0
          ? editingProject.managerIds
          : editingProject.managerId
          ? [editingProject.managerId]
          : [];

      reset({
        code: editingProject.code,
        name: editingProject.name,
        description: editingProject.description || '',
        location: editingProject.location || '',
        managerId: initialManagerIds[0] || '',
        managerIds: initialManagerIds,
        startDate: editingProject.startDate.split('T')[0],
        plannedEndDate: editingProject.plannedEndDate.split('T')[0],
        priority: editingProject.priority,
        status: editingProject.status,
      });
    } else {
      reset({
        code: '',
        name: '',
        description: '',
        location: '',
        managerId: '',
        managerIds: [],
        startDate: new Date().toISOString().split('T')[0],
        plannedEndDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
        priority: 'Medium',
        status: 'NotStarted',
      });
    }
  }, [editingProject, open, reset]);

  const handleFormSubmit = (data: ProjectFormData) => {
    const managerIds = data.managerIds && data.managerIds.length > 0 ? data.managerIds : (data.managerId ? [data.managerId] : []);
    const managerId = managerIds[0] || '';
    return onSubmit({
      ...data,
      managerId,
      managerIds,
    });
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
            {editingProject ? `Chỉnh Sửa Công Trình ${editingProject.code}` : 'Tạo Mới Công Trình / Dự Án'}
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
          {!editingProject && (
            <Controller
              name="code"
              control={control}
              rules={{ required: 'Trường này là bắt buộc' }}
              render={({ field }) => (
                <CommonInput
                  {...field}
                  label="Mã Công Trình (Code)"
                  fullWidth
                  required
                  placeholder="VD: CV5, PRJ-2026..."
                  error={Boolean(errors.code)}
                  helperText={errors.code?.message}
                />
              )}
            />
          )}

          <Controller
            name="name"
            control={control}
            rules={{ required: 'Trường này là bắt buộc' }}
            render={({ field }) => (
              <CommonInput
                {...field}
                label="Tên Công Trình"
                fullWidth
                required
                placeholder="VD: Tòa nhà văn phòng SkyTower..."
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
              />
            )}
          />

          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <CommonInput
                {...field}
                label="Địa Điểm / Vị Trí"
                fullWidth
                placeholder="VD: Quận 7, TP. Hồ Chí Minh"
              />
            )}
          />

          <Controller
            name="managerIds"
            control={control}
            rules={{
              validate: (val) => (val && val.length > 0) || 'Vui lòng chọn ít nhất 1 người quản lý dự án',
            }}
            render={({ field }) => (
              <UserMultiSelect
                users={users}
                value={field.value || []}
                onChange={field.onChange}
                label="Người Quản Lý / Project Manager (PM)"
                placeholder="Tìm kiếm và chọn một hoặc nhiều quản lý..."
                required
                error={Boolean(errors.managerIds)}
                helperText={errors.managerIds?.message}
                defaultRoleFallback="Quản lý dự án"
              />
            )}
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Controller
                name="startDate"
                control={control}
                rules={{
                  required: 'Trường này là bắt buộc',
                  validate: (val) => {
                    const end = watch('plannedEndDate');
                    if (val && end && new Date(val) > new Date(end)) {
                      return 'Ngày bắt đầu không được lớn hơn hạn kết thúc';
                    }
                    return true;
                  },
                }}
                render={({ field }) => (
                  <DatePicker
                    label="Ngày Bắt Đầu"
                    value={field.value ? new Date(field.value) : null}
                    maxDate={watch('plannedEndDate') ? new Date(watch('plannedEndDate')) : undefined}
                    onChange={(newValue) => {
                      field.onChange(
                        newValue && !isNaN(newValue.getTime()) ? format(newValue, 'yyyy-MM-dd') : ''
                      );
                      trigger('plannedEndDate');
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: Boolean(errors.startDate),
                        helperText: errors.startDate?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="plannedEndDate"
                control={control}
                rules={{
                  required: 'Trường này là bắt buộc',
                  validate: (val) => {
                    const start = watch('startDate');
                    if (val && start && new Date(val) < new Date(start)) {
                      return 'Hạn kết thúc không được nhỏ hơn ngày bắt đầu';
                    }
                    return true;
                  },
                }}
                render={({ field }) => (
                  <DatePicker
                    label="Hạn Kết Thúc Dự Kiến"
                    value={field.value ? new Date(field.value) : null}
                    minDate={watch('startDate') ? new Date(watch('startDate')) : undefined}
                    onChange={(newValue) => {
                      field.onChange(
                        newValue && !isNaN(newValue.getTime()) ? format(newValue, 'yyyy-MM-dd') : ''
                      );
                      trigger('startDate');
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: Boolean(errors.plannedEndDate),
                        helperText: errors.plannedEndDate?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Độ Ưu Tiên</InputLabel>
                    <Select {...field} label="Độ Ưu Tiên">
                      <MenuItem value="Low">Thấp</MenuItem>
                      <MenuItem value="Medium">Trung bình</MenuItem>
                      <MenuItem value="High">Cao</MenuItem>
                      <MenuItem value="Urgent">Khẩn cấp</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            {editingProject && (
              <Grid item xs={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Trạng Thái</InputLabel>
                      <Select {...field} label="Trạng Thái">
                        <MenuItem value="NotStarted">Chưa bắt đầu</MenuItem>
                        <MenuItem value="InProgress">Đang thực hiện</MenuItem>
                        <MenuItem value="Completed">Hoàn thành</MenuItem>
                        <MenuItem value="OnHold">Tạm dừng</MenuItem>
                        <MenuItem value="Overdue">Trễ tiến độ</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            )}
          </Grid>

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <CommonInput
                {...field}
                label="Mô Tả Dự Án"
                multiline
                rows={3}
                fullWidth
                placeholder="Nhập mô tả hoặc ghi chú quan trọng về công trình..."
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <CommonButton onClick={onClose} variant="secondary" disabled={isSubmitting}>
            Hủy Bỏ
          </CommonButton>
          <CommonButton type="submit" variant="primary" loading={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Lưu Dự Án'}
          </CommonButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};
