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
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { Project, PriorityLevel, ProjectStatus, User } from '../../types';

export interface ProjectFormData {
  code: string;
  name: string;
  description: string;
  location: string;
  managerId: string;
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
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      code: '',
      name: '',
      description: '',
      location: '',
      managerId: '',
      startDate: new Date().toISOString().split('T')[0],
      plannedEndDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      priority: 'Medium',
      status: 'NotStarted',
    },
  });

  useEffect(() => {
    if (editingProject) {
      reset({
        code: editingProject.code,
        name: editingProject.name,
        description: editingProject.description || '',
        location: editingProject.location || '',
        managerId: editingProject.managerId || '',
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
        startDate: new Date().toISOString().split('T')[0],
        plannedEndDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
        priority: 'Medium',
        status: 'NotStarted',
      });
    }
  }, [editingProject, open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ fontWeight: 700, px: 3, pt: 2.5, pb: 1 }}>
          {editingProject ? `Chỉnh Sửa Công Trình ${editingProject.code}` : 'Tạo Mới Công Trình / Dự Án'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '24px !important', px: 3 }}>
          {!editingProject && (
            <Controller
              name="code"
              control={control}
              rules={{ required: 'Trường này là bắt buộc' }}
              render={({ field }) => (
                <TextField
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
              <TextField
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
              <TextField
                {...field}
                label="Địa Điểm / Vị Trí"
                fullWidth
                placeholder="VD: Quận 7, TP. Hồ Chí Minh"
              />
            )}
          />

          <Controller
            name="managerId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={users}
                getOptionLabel={(option) =>
                  typeof option === 'string'
                    ? option
                    : `${option.fullName} (${option.roleName || option.role} - ${option.department || ''})`
                }
                value={users.find((u) => u.id === field.value) || null}
                onChange={(_, newValue) => field.onChange(newValue ? newValue.id : '')}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Người Quản Lý / Project Manager (PM)"
                    placeholder="Tìm kiếm và chọn nhân sự..."
                  />
                )}
              />
            )}
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Controller
                name="startDate"
                control={control}
                rules={{ required: 'Trường này là bắt buộc' }}
                render={({ field }) => (
                  <DatePicker
                    label="Ngày Bắt Đầu *"
                    value={field.value ? new Date(field.value) : null}
                    onChange={(newValue) => {
                      field.onChange(
                        newValue && !isNaN(newValue.getTime()) ? format(newValue, 'yyyy-MM-dd') : ''
                      );
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
                rules={{ required: 'Trường này là bắt buộc' }}
                render={({ field }) => (
                  <DatePicker
                    label="Hạn Kết Thúc Dự Kiến *"
                    value={field.value ? new Date(field.value) : null}
                    onChange={(newValue) => {
                      field.onChange(
                        newValue && !isNaN(newValue.getTime()) ? format(newValue, 'yyyy-MM-dd') : ''
                      );
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
              <TextField
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
          <Button onClick={onClose} variant="outlined" color="inherit" disabled={isSubmitting}>
            Hủy Bỏ
          </Button>
          <Button type="submit" variant="contained" sx={{ bgcolor: '#0284c7' }} disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Lưu Dự Án'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
