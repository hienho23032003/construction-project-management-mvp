import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
} from '@mui/material';
import { User } from '../../types';

export interface ProjectMemberFormData {
  userId: string;
  roleInProject: string;
}

interface ProjectMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectMemberFormData) => Promise<void>;
  users: User[];
  isSubmitting?: boolean;
}

export const ProjectMemberModal: React.FC<ProjectMemberModalProps> = ({
  open,
  onClose,
  onSubmit,
  users,
  isSubmitting = false,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectMemberFormData>({
    defaultValues: {
      userId: '',
      roleInProject: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({ userId: '', roleInProject: '' });
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ fontWeight: 700, px: 3, pt: 2.5, pb: 1 }}>Thêm Nhân Sự Vào Dự Án</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '24px !important', px: 3 }}>
          <Controller
            name="userId"
            control={control}
            rules={{ required: 'Trường này là bắt buộc' }}
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
                    label="Chọn Nhân Viên"
                    placeholder="Tìm kiếm theo tên, phòng ban..."
                    required
                    error={Boolean(errors.userId)}
                    helperText={errors.userId?.message}
                  />
                )}
              />
            )}
          />

          <Controller
            name="roleInProject"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Vai trò / Chức danh trong dự án"
                fullWidth
                placeholder="VD: Giám sát kết cấu, Kỹ sư MEP..."
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} variant="outlined" color="inherit" disabled={isSubmitting}>
            Hủy Bỏ
          </Button>
          <Button type="submit" variant="contained" sx={{ bgcolor: '#0284c7' }} disabled={isSubmitting}>
            {isSubmitting ? 'Đang thêm...' : 'Thêm Vào Dự Án'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
