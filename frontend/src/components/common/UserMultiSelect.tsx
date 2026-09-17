import React from 'react';
import {
  Autocomplete,
  TextField,
  Chip,
  Avatar,
  Checkbox,
  Box,
  Typography,
  useTheme,
  SxProps,
  Theme,
} from '@mui/material';
import { User } from '../../types';
import { getMediaUrl } from '../../utils/fileUtils';
import { getDynamicRoleColor } from '../../utils/roleColors';

export interface UserMultiSelectProps {
  users: User[];
  value: string[];
  onChange: (userIds: string[]) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  defaultRoleFallback?: string;
  maxDropdownHeight?: number;
  sx?: SxProps<Theme>;
}

export const UserMultiSelect: React.FC<UserMultiSelectProps> = ({
  users,
  value = [],
  onChange,
  label = 'Người Thực Hiện',
  placeholder,
  required = false,
  disabled = false,
  error = false,
  helperText,
  defaultRoleFallback = 'Thành viên',
  maxDropdownHeight = 280,
  sx,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const selectedUsers = users.filter((u) => value?.includes(u.id));

  return (
    <Autocomplete
      multiple
      disabled={disabled}
      options={users}
      getOptionLabel={(option) => {
        if (typeof option === 'string') return option;
        const roleDisplay = (option.roles && option.roles.length > 0 ? option.roles[0] : null) || option.roleName || option.role || '';
        return `${option.fullName} (${roleDisplay}${option.department ? ` - ${option.department}` : ''})`;
      }}
      value={selectedUsers}
      onChange={(_, newValue) => {
        const ids = newValue.map((u) => (typeof u === 'string' ? u : u.id));
        onChange(ids);
      }}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      renderOption={(props, option, { selected }) => {
        const roleDisplay = (option.roles && option.roles.length > 0 ? option.roles[0] : null) || option.roleName || option.role || defaultRoleFallback;
        const roleColors = getDynamicRoleColor(roleDisplay, isDark);

        return (
          <li
            {...props}
            key={option.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              gap: 12,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, flex: 1 }}>
              <Avatar
                src={getMediaUrl(option.avatarUrl)}
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '0.8rem',
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
                    sx={{
                      fontWeight: selected ? 700 : 600,
                      fontSize: '0.85rem',
                      color: 'text.primary',
                      whiteSpace: 'nowrap',
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
                      mt: 0.25,
                    }}
                  >
                    {option.department ? `${option.department} • ${option.email}` : option.email}
                  </Typography>
                )}
              </Box>
            </Box>
            <Checkbox
              size="small"
              checked={selected}
              sx={{
                p: 0.5,
                color: '#94a3b8',
                '&.Mui-checked': { color: '#0284c7' },
              }}
            />
          </li>
        );
      }}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const fullName = typeof option === 'string' ? option : option.fullName;
          const avatarUrl = typeof option === 'string' ? undefined : option.avatarUrl;
          const id = typeof option === 'string' ? option : option.id;
          return (
            <Chip
              {...getTagProps({ index })}
              key={id}
              avatar={
                <Avatar
                  src={getMediaUrl(avatarUrl)}
                  sx={{ width: 20, height: 20, fontSize: '0.65rem' }}
                >
                  {(fullName || 'U').charAt(0)}
                </Avatar>
              }
              label={fullName}
              size="small"
              sx={{
                fontWeight: 600,
                bgcolor: '#e0f2fe',
                color: '#0369a1',
                m: '2px',
                height: 26,
                fontSize: '0.75rem',
                '& .MuiChip-deleteIcon': {
                  color: '#0284c7',
                  '&:hover': { color: '#0369a1' },
                },
              }}
            />
          );
        })
      }
      slotProps={{
        popper: {
          placement: 'bottom-start',
          modifiers: [
            {
              name: 'flip',
              enabled: false,
            },
          ],
          sx: {
            zIndex: 1400,
            maxWidth: '100%',
            '& .MuiAutocomplete-paper': {
              maxHeight: maxDropdownHeight,
              maxWidth: '100%',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: isDark
                ? '0 10px 30px rgba(0,0,0,0.45)'
                : '0 8px 30px rgba(0,0,0,0.18)',
              mt: 0.5,
            },
            '& .MuiAutocomplete-listbox': {
              maxHeight: maxDropdownHeight - 20,
              overflowY: 'auto',
              p: 0.5,
            },
          },
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          minHeight: '44px',
          height: 'auto !important',
          py: '3px',
        },
        ...sx,
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={
            selectedUsers.length > 0
              ? ''
              : (placeholder ?? 'Tìm kiếm và chọn nhân sự...')
          }
          required={required && selectedUsers.length === 0}
          error={error}
          helperText={helperText}
        />
      )}
    />
  );
};
