import React from 'react';
import { Select, MenuItem, Box, SelectChangeEvent, useTheme } from '@mui/material';
import { TaskStatus } from '../../types';
import { getStatusConfig } from './StatusChip';

interface StatusSelectProps {
  value: TaskStatus | string;
  onChange: (newStatus: TaskStatus) => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
  isOverdue?: boolean;
  sx?: any;
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'NotStarted', label: 'Chưa bắt đầu' },
  { value: 'InProgress', label: 'Đang thực hiện' },
  { value: 'Completed', label: 'Hoàn thành' },
  { value: 'OnHold', label: 'Tạm dừng' },
];

export const StatusSelect: React.FC<StatusSelectProps> = ({
  value,
  onChange,
  disabled = false,
  size = 'small',
  isOverdue,
  sx,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const currentKey = value || 'NotStarted';
  const currentStyle = getStatusConfig(currentKey, isDark);

  const handleChange = (e: SelectChangeEvent<unknown>) => {
    onChange(e.target.value as TaskStatus);
  };

  return (
    <Select
      size={size}
      value={currentKey}
      onChange={handleChange}
      disabled={disabled}
      onClick={(e) => e.stopPropagation()}
      renderValue={(selected) => {
        const item = getStatusConfig(selected as string, isDark);
        return (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              fontWeight: 700,
              fontSize: size === 'small' ? '0.75rem' : '0.8125rem',
              color: item.color,
              whiteSpace: 'nowrap',
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: item.color,
                mr: 0.8,
                flexShrink: 0,
              }}
            />
            {item.label}
          </Box>
        );
      }}
      sx={{
        height: size === 'small' ? 28 : 34,
        minWidth: 130,
        backgroundColor: currentStyle.bg,
        color: currentStyle.color,
        fontWeight: 700,
        fontSize: size === 'small' ? '0.75rem' : '0.8125rem',
        borderRadius: '6px',
        border: `1px solid ${currentStyle.border}`,
        transition: 'all 0.2s ease',
        '& .MuiOutlinedInput-notchedOutline': {
          border: 'none',
        },
        '&:hover': {
          backgroundColor: currentStyle.bg,
          filter: isDark ? 'brightness(1.15)' : 'brightness(0.96)',
        },
        '& .MuiSelect-select': {
          py: 0.5,
          pl: 1.25,
          pr: '28px !important',
          display: 'flex',
          alignItems: 'center',
        },
        '& .MuiSelect-icon': {
          color: currentStyle.color,
          right: 4,
        },
        ...sx,
      }}
      MenuProps={{
        PaperProps: {
          sx: {
            borderRadius: '8px',
            boxShadow: isDark
              ? '0 10px 25px rgba(0,0,0,0.6)'
              : '0 8px 20px rgba(0,0,0,0.08)',
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          },
        },
      }}
    >
      {statusOptions.map((opt) => {
        const optStyle = getStatusConfig(opt.value, isDark);
        return (
          <MenuItem
            key={opt.value}
            value={opt.value}
            sx={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: isDark ? '#eeeeee' : optStyle.color,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 0.85,
              '&:hover': {
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : optStyle.bg,
              },
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: optStyle.color,
                flexShrink: 0,
              }}
            />
            {opt.label}
          </MenuItem>
        );
      })}
    </Select>
  );
};
