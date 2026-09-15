import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Paper,
  Divider,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { X, Settings, CheckSquare, Square } from 'lucide-react';
import { RoleItem, PermissionModuleGroup } from '../../types';
import { usePermissionsMatrixQuery } from '../../hooks/useRoles';

export interface RoleFormData {
  name: string;
  code: string;
  description: string;
  permissions: string[];
}

interface RoleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RoleFormData) => Promise<void>;
  initialData?: RoleItem | null;
  isSubmitting?: boolean;
}

export const RoleModal: React.FC<RoleModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  const { data: matrix = [], isLoading: loadingMatrix } = usePermissionsMatrixQuery();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RoleFormData>({
    defaultValues: {
      name: '',
      code: '',
      description: '',
      permissions: [],
    },
  });

  const selectedPermissions = watch('permissions') || [];

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name,
          code: initialData.code,
          description: initialData.description || '',
          permissions: initialData.permissions || [],
        });
      } else {
        reset({
          name: '',
          code: '',
          description: '',
          permissions: [],
        });
      }
    }
  }, [open, initialData, reset]);

  const handleTogglePermission = (code: string) => {
    if (selectedPermissions.includes(code)) {
      setValue(
        'permissions',
        selectedPermissions.filter((p) => p !== code),
        { shouldDirty: true }
      );
    } else {
      setValue('permissions', [...selectedPermissions, code], { shouldDirty: true });
    }
  };

  const handleToggleModule = (moduleGroup: PermissionModuleGroup) => {
    const moduleCodes = moduleGroup.permissions.map((p) => p.code);
    const allSelected = moduleCodes.every((code) => selectedPermissions.includes(code));

    if (allSelected) {
      setValue(
        'permissions',
        selectedPermissions.filter((p) => !moduleCodes.includes(p)),
        { shouldDirty: true }
      );
    } else {
      const newPerms = Array.from(new Set([...selectedPermissions, ...moduleCodes]));
      setValue('permissions', newPerms, { shouldDirty: true });
    }
  };

  const handleSelectAll = () => {
    const allCodes = matrix.flatMap((g) => g.permissions.map((p) => p.code));
    if (selectedPermissions.length === allCodes.length) {
      setValue('permissions', [], { shouldDirty: true });
    } else {
      setValue('permissions', allCodes, { shouldDirty: true });
    }
  };

  const isEditing = Boolean(initialData);
  const totalAvailablePerms = matrix.reduce((acc, g) => acc + g.permissions.length, 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px',
          m: { xs: 1, sm: 2 },
          width: { xs: 'calc(100% - 16px)', sm: '100%' },
          maxWidth: '800px',
        },
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                p: 0.8,
                borderRadius: '8px',
                bgcolor: 'rgba(2, 132, 199, 0.1)',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Settings size={22} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '0.95rem', sm: '1.1rem' }, color: '#0f172a' }}>
                {isEditing ? `Chỉnh Sửa Vai Trò: ${initialData?.name}` : 'Tạo Vai Trò & Phân Quyền Mới'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Thiết lập thông tin và ma trận quyền hạn cho vai trò này trong hệ thống
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8' }}>
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 1.5, sm: 2.5 }, maxHeight: '72vh', overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* General Info */}
            <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2.5 }, borderRadius: '8px', bgcolor: '#f8fafc' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>
                Thông Tin Cơ Bản
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Trường này là bắt buộc' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Tên Vai Trò"
                        fullWidth
                        required
                        placeholder="VD: Quản Lý Khối Thi Công..."
                        error={Boolean(errors.name)}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="code"
                    control={control}
                    rules={{
                      required: 'Trường này là bắt buộc',
                      pattern: {
                        value: /^[A-Za-z0-9_-]+$/,
                        message: 'Mã chỉ chứa chữ, số, gạch dưới (_) hoặc gạch ngang (-)',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Mã Vai Trò (Code)"
                        fullWidth
                        required
                        disabled={isEditing && initialData?.isSystem}
                        placeholder="VD: ConstructionManager..."
                        error={Boolean(errors.code)}
                        helperText={errors.code?.message || (initialData?.isSystem ? 'Vai trò hệ thống không được đổi mã' : '')}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Mô Tả Nhiệm Vụ & Quyền Hạn"
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        placeholder="Mô tả phạm vi trách nhiệm của vai trò này..."
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Permission Matrix */}
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                  gap: 1.25,
                  mb: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                    Ma Trận Phân Quyền Chi Tiết
                  </Typography>
                  <Chip
                    label={`${selectedPermissions.length}/${totalAvailablePerms} quyền đã chọn`}
                    size="small"
                    sx={{ bgcolor: '#e0f2fe', color: '#0284c7', fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                  />
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleSelectAll}
                  startIcon={selectedPermissions.length === totalAvailablePerms ? <Square size={14} /> : <CheckSquare size={14} />}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.8rem',
                    py: 0.4,
                    px: 1.5,
                    borderRadius: '8px',
                    whiteSpace: 'nowrap',
                    width: { xs: '100%', sm: 'auto' },
                  }}
                >
                  {selectedPermissions.length === totalAvailablePerms ? 'Bỏ chọn tất cả' : 'Chọn tất cả quyền'}
                </Button>
              </Box>

              {loadingMatrix ? (
                <Typography variant="body2" sx={{ color: '#64748b', py: 3, textAlign: 'center' }}>
                  Đang tải ma trận quyền...
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {matrix.map((moduleGroup) => {
                    const moduleCodes = moduleGroup.permissions.map((p) => p.code);
                    const selectedInModule = moduleCodes.filter((c) => selectedPermissions.includes(c));
                    const isAllModuleSelected = selectedInModule.length === moduleCodes.length;
                    const isPartiallySelected = selectedInModule.length > 0 && !isAllModuleSelected;

                    return (
                      <Paper
                        key={moduleGroup.module}
                        variant="outlined"
                        sx={{
                          p: { xs: 1.5, sm: 2 },
                          borderRadius: '8px',
                          border: selectedInModule.length > 0 ? '1px solid #bae6fd' : '1px solid #e2e8f0',
                          bgcolor: selectedInModule.length > 0 ? 'rgba(240, 249, 255, 0.4)' : '#ffffff',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {/* Module Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', minWidth: 0, flex: 1 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={isAllModuleSelected}
                                  indeterminate={isPartiallySelected}
                                  onChange={() => handleToggleModule(moduleGroup)}
                                  size="small"
                                  sx={{ color: '#0284c7', '&.Mui-checked': { color: '#0284c7' } }}
                                />
                              }
                              label={
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                  {moduleGroup.moduleName}
                                </Typography>
                              }
                              sx={{ mr: 0.5 }}
                            />
                            {moduleGroup.description && (
                              <Typography variant="caption" sx={{ color: '#64748b' }}>
                                ({moduleGroup.description})
                              </Typography>
                            )}
                          </Box>
                          <Chip
                            label={`${selectedInModule.length}/${moduleCodes.length}`}
                            size="small"
                            variant={selectedInModule.length > 0 ? 'filled' : 'outlined'}
                            sx={{
                              fontSize: '0.7rem',
                              height: 20,
                              bgcolor: selectedInModule.length > 0 ? '#0284c7' : 'transparent',
                              color: selectedInModule.length > 0 ? '#ffffff' : '#94a3b8',
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          />
                        </Box>
                        <Divider sx={{ my: 1 }} />

                        {/* Permissions Grid */}
                        <Grid container spacing={1}>
                          {moduleGroup.permissions.map((perm) => {
                            const isChecked = selectedPermissions.includes(perm.code);
                            return (
                              <Grid item xs={12} sm={6} key={perm.code}>
                                <Box
                                  onClick={() => handleTogglePermission(perm.code)}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 1,
                                    p: 1,
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    bgcolor: isChecked ? '#e0f2fe' : '#f8fafc',
                                    border: isChecked ? '1px solid #7dd3fc' : '1px solid #f1f5f9',
                                    transition: 'all 0.15s ease',
                                    '&:hover': {
                                      bgcolor: isChecked ? '#bae6fd' : '#f1f5f9',
                                    },
                                  }}
                                >
                                  <Checkbox
                                    checked={isChecked}
                                    size="small"
                                    sx={{ p: 0.2, color: '#0284c7', '&.Mui-checked': { color: '#0284c7' } }}
                                  />
                                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: isChecked ? 600 : 500, fontSize: '0.8125rem', color: '#0f172a' }}
                                    >
                                      {perm.name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}
                                    >
                                      {perm.description}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Paper>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 }, borderTop: '1px solid #e2e8f0', justifyContent: 'space-between', gap: 1 }}>
          <Button onClick={onClose} variant="outlined" color="inherit" disabled={isSubmitting} sx={{ borderRadius: '8px', px: { xs: 2, sm: 2.5 } }}>
            Hủy Bỏ
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{
              bgcolor: '#0284c7',
              '&:hover': { bgcolor: '#0369a1' },
              borderRadius: '8px',
              px: { xs: 2, sm: 3 },
              fontWeight: 600,
            }}
          >
            {isSubmitting ? 'Đang lưu...' : isEditing ? 'Lưu Thay Đổi' : 'Tạo Vai Trò Mới'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
