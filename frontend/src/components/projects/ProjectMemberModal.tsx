import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  IconButton,
  Typography,
  Box,
  Avatar,
  Chip,
  useTheme,
} from '@mui/material';
import { X } from 'lucide-react';
import { User } from '../../types';
import { CommonButton, CommonInput } from '../common';
import { getMediaUrl } from '../../utils/fileUtils';
import { getDynamicRoleColor } from '../../utils/roleColors';

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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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
            Thêm Nhân Sự Vào Dự Án
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
                renderOption={(props, option, { selected }) => {
                  const roleDisplay = option.roleName || option.role || 'Thành viên';
                  const roleColors = getDynamicRoleColor(roleDisplay, isDark);

                  return (
                    <li {...props} key={option.id} style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', gap: 10 }}>
                      <Avatar
                        src={getMediaUrl(option.avatarUrl)}
                        sx={{
                          width: 30,
                          height: 30,
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          bgcolor: selected ? '#0284c7' : '#64748b',
                          color: '#ffffff',
                          flexShrink: 0,
                        }}
                      >
                        {option.fullName.charAt(0)}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{
                              fontWeight: selected ? 700 : 600,
                              fontSize: '0.84rem',
                              color: 'text.primary',
                            }}
                          >
                            {option.fullName}
                          </Typography>
                          <Chip
                            label={roleDisplay}
                            size="small"
                            sx={{
                              height: 19,
                              fontSize: '0.67rem',
                              fontWeight: 700,
                              bgcolor: roleColors.bg,
                              color: roleColors.text,
                              border: `1px solid ${roleColors.border}`,
                              '& .MuiChip-label': { px: 0.75 },
                            }}
                          />
                        </Box>
                        {(option.department || option.email) && (
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{
                              color: 'text.secondary',
                              fontSize: '0.72rem',
                              display: 'block',
                            }}
                          >
                            {option.department ? `${option.department} • ${option.email}` : option.email}
                          </Typography>
                        )}
                      </Box>
                    </li>
                  );
                }}
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
              <CommonInput
                {...field}
                label="Vai trò / Chức danh trong dự án"
                fullWidth
                placeholder="VD: Giám sát kết cấu, Kỹ sư MEP..."
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <CommonButton onClick={onClose} variant="secondary" disabled={isSubmitting}>
            Hủy Bỏ
          </CommonButton>
          <CommonButton type="submit" variant="primary" loading={isSubmitting}>
            {isSubmitting ? 'Đang thêm...' : 'Thêm Vào Dự Án'}
          </CommonButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};
