import React, { useEffect, useCallback, memo, useState } from 'react';
import { useForm, Controller, useWatch, Control } from 'react-hook-form';
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
  useTheme,
} from '@mui/material';
import { X, Settings, CheckSquare, Square, Palette, Check } from 'lucide-react';
import { RoleItem, PermissionModuleGroup } from '../../types';
import { usePermissionsMatrixQuery } from '../../hooks/useRoles';
import { ROLE_COLOR_PRESETS, getRoleChipStyle } from '../../utils/roleColors';
import { CommonButton, CommonInput, CommonChip } from '../common';

export interface RoleFormData {
  name: string;
  code: string;
  description: string;
  color?: string;
  permissions: string[];
}

interface RoleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RoleFormData) => Promise<void>;
  initialData?: RoleItem | null;
  isSubmitting?: boolean;
}

// -------------------------------------------------------------
// Isolated Color Picker Component - 100% Zero-Lag Local Dragging
// -------------------------------------------------------------
interface RoleColorPickerProps {
  value: string;
  onChange: (newColor: string) => void;
  control: Control<RoleFormData>;
}

const RoleColorPicker: React.FC<RoleColorPickerProps> = memo(({
  value,
  onChange,
  control,
}) => {
  const [localColor, setLocalColor] = useState(value || '#0284c7');
  const roleName = useWatch({ control, name: 'name' }) || '';

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    if (value) {
      setLocalColor(value);
    }
  }, [value]);

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 100% direct local state update - Zero parent re-renders while dragging
    setLocalColor(e.target.value);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sync to form only when user finishes / releases mouse
    setLocalColor(e.target.value);
    onChange(e.target.value);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalColor(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
      onChange(val);
    }
  };

  const handleSelectPreset = (presetColor: string) => {
    setLocalColor(presetColor);
    onChange(presetColor);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        bgcolor: 'background.paper',
        p: 1.5,
        borderRadius: '8px',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Preset color swatches */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        {ROLE_COLOR_PRESETS.map((preset) => {
          const isSelected =
            localColor.toLowerCase() === preset.color.toLowerCase() ||
            localColor.toLowerCase() === preset.key.toLowerCase();
          return (
            <Tooltip key={preset.key} title={preset.name} arrow>
              <Box
                onClick={() => handleSelectPreset(preset.color)}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: preset.color,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.1s ease',
                  border: isSelected ? '3px solid #ffffff' : '2px solid transparent',
                  boxShadow: isSelected
                    ? `0 0 0 2px ${preset.color}, 0 2px 6px rgba(0,0,0,0.2)`
                    : 'none',
                  '&:hover': { transform: 'scale(1.15)' },
                }}
              >
                {isSelected && <Check size={14} color="#ffffff" strokeWidth={3} />}
              </Box>
            </Tooltip>
          );
        })}

        {/* Custom color picker input + Hex code input */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: { xs: 0, sm: 'auto' }, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>
            Mã màu:
          </Typography>
          <input
            type="text"
            value={localColor}
            onChange={handleHexInputChange}
            maxLength={7}
            style={{
              width: 76,
              height: 30,
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              fontWeight: 600,
              padding: '2px 8px',
              border: `1px solid ${isDark ? '#333333' : '#cbd5e1'}`,
              borderRadius: '6px',
              color: 'inherit',
              background: 'transparent',
            }}
          />
          <input
            type="color"
            value={localColor.startsWith('#') ? localColor : '#0284c7'}
            onInput={handleCustomInput}
            onChange={handleCustomChange}
            style={{
              width: 32,
              height: 32,
              border: `1px solid ${isDark ? '#3a3b3c' : '#cbd5e1'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              padding: '2px',
              background: isDark ? '#242526' : '#ffffff',
            }}
          />
        </Box>
      </Box>

      {/* Live Preview */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}>
          Xem trước hiển thị:
        </Typography>
        <Chip
          label={roleName.trim() ? roleName : 'Tên Vai Trò Mẫu'}
          size="small"
          sx={{
            height: 24,
            fontSize: '0.75rem',
            fontWeight: 700,
            ...getRoleChipStyle(localColor, roleName),
          }}
        />
      </Box>
    </Box>
  );
});

// -------------------------------------------------------------
// Memoized Permission Matrix Section
// -------------------------------------------------------------
interface PermissionMatrixProps {
  matrix: PermissionModuleGroup[];
  control: Control<RoleFormData>;
  setValue: (name: keyof RoleFormData, value: any, options?: any) => void;
  getValues: (name: keyof RoleFormData) => any;
  loadingMatrix: boolean;
}

const PermissionMatrixSection: React.FC<PermissionMatrixProps> = memo(({
  matrix,
  control,
  setValue,
  getValues,
  loadingMatrix,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const selectedPermissions: string[] = useWatch({ control, name: 'permissions' }) || [];
  const totalAvailablePerms = matrix.reduce((acc, g) => acc + g.permissions.length, 0);

  const handleTogglePermission = useCallback((code: string) => {
    if (code === 'dashboard.view') return; // Mandatory, cannot be unchecked
    const current: string[] = getValues('permissions') || [];
    const next = current.includes(code)
      ? current.filter((p) => p !== code)
      : [...current, code];
    if (!next.includes('dashboard.view')) next.push('dashboard.view');
    setValue('permissions', next, { shouldDirty: true });
  }, [getValues, setValue]);

  const handleToggleModule = useCallback((moduleGroup: PermissionModuleGroup) => {
    const current: string[] = getValues('permissions') || [];
    const moduleCodes = moduleGroup.permissions.map((p) => p.code);
    const allSelected = moduleCodes.every((code) => current.includes(code));

    let newPerms: string[];
    if (allSelected) {
      newPerms = current.filter((p) => !moduleCodes.includes(p) || p === 'dashboard.view');
    } else {
      newPerms = Array.from(new Set([...current, ...moduleCodes]));
    }
    if (!newPerms.includes('dashboard.view')) newPerms.push('dashboard.view');
    setValue('permissions', newPerms, { shouldDirty: true });
  }, [getValues, setValue]);

  const handleSelectAll = useCallback(() => {
    const current: string[] = getValues('permissions') || [];
    const allCodes = matrix.flatMap((g) => g.permissions.map((p) => p.code));
    if (current.length === allCodes.length) {
      setValue('permissions', ['dashboard.view'], { shouldDirty: true });
    } else {
      setValue('permissions', allCodes, { shouldDirty: true });
    }
  }, [matrix, getValues, setValue]);

  return (
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
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', whiteSpace: 'nowrap' }}>
            Ma Trận Phân Quyền Chi Tiết
          </Typography>
          <Chip
            label={`${selectedPermissions.length}/${totalAvailablePerms} quyền đã chọn`}
            size="small"
            sx={{ bgcolor: isDark ? 'rgba(45, 136, 255, 0.16)' : '#e0f2fe', color: isDark ? '#2d88ff' : '#0284c7', fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap' }}
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
        <Typography variant="body2" sx={{ color: 'text.secondary', py: 3, textAlign: 'center' }}>
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
                  border: selectedInModule.length > 0
                    ? `1px solid ${isDark ? 'rgba(45, 136, 255, 0.35)' : '#bae6fd'}`
                    : `1px solid ${theme.palette.divider}`,
                  bgcolor: selectedInModule.length > 0
                    ? (isDark ? 'rgba(45, 136, 255, 0.06)' : 'rgba(240, 249, 255, 0.4)')
                    : (isDark ? '#1e1f20' : '#ffffff'),
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
                          sx={{ color: '#2d88ff', '&.Mui-checked': { color: '#2d88ff' } }}
                        />
                      }
                      label={
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {moduleGroup.moduleName}
                        </Typography>
                      }
                      sx={{ mr: 0.5 }}
                    />
                    {moduleGroup.description && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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
                      bgcolor: selectedInModule.length > 0 ? (isDark ? '#2d88ff' : '#0284c7') : 'transparent',
                      color: selectedInModule.length > 0 ? '#ffffff' : (isDark ? '#b0b3b8' : '#94a3b8'),
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  />
                </Box>
                <Divider sx={{ my: 1, borderColor: isDark ? '#3e4042' : 'divider' }} />

                {/* Permissions Grid */}
                <Grid container spacing={1}>
                  {moduleGroup.permissions.map((perm) => {
                    const isLocked = perm.code === 'dashboard.view';
                    const isChecked = isLocked || selectedPermissions.includes(perm.code);
                    return (
                      <Grid item xs={12} sm={6} key={perm.code}>
                        <Box
                          onClick={() => !isLocked && handleTogglePermission(perm.code)}
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1,
                            p: 1,
                            borderRadius: '8px',
                            cursor: isLocked ? 'default' : 'pointer',
                            bgcolor: isChecked
                              ? (isDark ? 'rgba(45, 136, 255, 0.15)' : '#e0f2fe')
                              : (isDark ? '#2f3031' : '#f8fafc'),
                            border: isChecked
                              ? `1px solid ${isDark ? 'rgba(45, 136, 255, 0.4)' : '#7dd3fc'}`
                              : `1px solid ${isDark ? '#3e4042' : '#f1f5f9'}`,
                            opacity: isLocked ? 0.92 : 1,
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              bgcolor: isLocked
                                ? (isDark ? 'rgba(45, 136, 255, 0.15)' : '#e0f2fe')
                                : isChecked
                                ? (isDark ? 'rgba(45, 136, 255, 0.22)' : '#bae6fd')
                                : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9'),
                            },
                          }}
                        >
                          <Checkbox
                            checked={isChecked}
                            disabled={isLocked}
                            size="small"
                            sx={{
                              p: 0.2,
                              color: '#2d88ff',
                              '&.Mui-checked': { color: '#2d88ff' },
                              '&.Mui-disabled': { color: '#2d88ff' },
                            }}
                          />
                          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: isChecked ? 600 : 500, fontSize: '0.8125rem', color: 'text.primary' }}
                              >
                                {perm.name}
                              </Typography>
                              {isLocked && (
                                <Chip
                                  label="Mặc định bắt buộc"
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    bgcolor: isDark ? 'rgba(45, 136, 255, 0.3)' : '#0284c7',
                                    color: isDark ? '#70b5ff' : '#ffffff',
                                    borderRadius: '4px',
                                  }}
                                />
                              )}
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'block' }}
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
  );
});

// -------------------------------------------------------------
// Main Modal Component
// -------------------------------------------------------------
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
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<RoleFormData>({
    defaultValues: {
      name: '',
      code: '',
      description: '',
      color: '#0284c7',
      permissions: ['dashboard.view'],
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        const perms = initialData.permissions || [];
        reset({
          name: initialData.name,
          code: initialData.code,
          description: initialData.description || '',
          color: initialData.color || '#0284c7',
          permissions: perms.includes('dashboard.view') ? perms : [...perms, 'dashboard.view'],
        });
      } else {
        reset({
          name: '',
          code: '',
          description: '',
          color: '#0284c7',
          permissions: ['dashboard.view'],
        });
      }
    }
  }, [open, initialData, reset]);

  const isEditing = Boolean(initialData);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                p: 0.8,
                borderRadius: '8px',
                bgcolor: isDark ? 'rgba(56, 189, 248, 0.16)' : 'rgba(2, 132, 199, 0.1)',
                color: isDark ? '#38bdf8' : '#0284c7',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Settings size={22} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '0.95rem', sm: '1.1rem' }, color: 'text.primary' }}>
                {isEditing ? `Chỉnh Sửa Vai Trò: ${initialData?.name}` : 'Tạo Vai Trò & Phân Quyền Mới'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Thiết lập thông tin và ma trận quyền hạn cho vai trò này trong hệ thống
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 1.5, sm: 2.5 }, maxHeight: '72vh', overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* General Info */}
            <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2.5 }, borderRadius: '8px', bgcolor: isDark ? '#1e1f20' : '#f8fafc', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                Thông Tin Cơ Bản
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Trường này là bắt buộc' }}
                    render={({ field }) => (
                      <CommonInput
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
                      <CommonInput
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
                      <CommonInput
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

                {/* Role Chip Color Option */}
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                      <Palette size={15} color={isDark ? '#2d88ff' : '#0284c7'} />
                      Màu Sắc Đại Diện Cho Vai Trò (Role Chip Color)
                    </Box>
                  </Typography>

                  <Controller
                    name="color"
                    control={control}
                    render={({ field }) => (
                      <RoleColorPicker
                        value={field.value || '#0284c7'}
                        onChange={field.onChange}
                        control={control}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Permission Matrix */}
            <PermissionMatrixSection
              matrix={matrix}
              control={control}
              setValue={setValue}
              getValues={getValues}
              loadingMatrix={loadingMatrix}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 }, borderTop: '1px solid', borderColor: 'divider', justifyContent: 'space-between', gap: 1 }}>
          <CommonButton onClick={onClose} variant="secondary" disabled={isSubmitting}>
            Hủy Bỏ
          </CommonButton>
          <CommonButton
            type="submit"
            variant="primary"
            loading={isSubmitting}
          >
            {isEditing ? 'Lưu Thay Đổi' : 'Tạo Vai Trò Mới'}
          </CommonButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};
