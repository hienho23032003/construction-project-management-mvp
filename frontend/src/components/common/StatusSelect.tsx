import React from 'react';
import { Select, MenuItem, Box, SelectChangeEvent } from '@mui/material';
import { TaskStatus } from '../../types';
import { statusMap } from './StatusChip';

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
  const currentKey = value || 'NotStarted';
  const currentStyle = statusMap[currentKey] || statusMap['NotStarted'];

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
        const item = statusMap[selected as string] || statusMap['NotStarted'];
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
          filter: 'brightness(0.96)',
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
            mt: 0.5,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
          },
        },
      }}
    >
      {statusOptions.map((opt) => {
        const style = statusMap[opt.value] || statusMap['NotStarted'];
        return (
          <MenuItem
            key={opt.value}
            value={opt.value}
            sx={{
              py: 0.6,
              px: 1,
              fontSize: '0.8125rem',
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 1.25,
                py: 0.4,
                borderRadius: '5px',
                backgroundColor: style.bg,
                color: style.color,
                border: `1px solid ${style.border}`,
                fontWeight: 600,
                fontSize: '0.75rem',
                width: '100%',
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: style.color,
                  mr: 1,
                  flexShrink: 0,
                }}
              />
              {opt.label}
            </Box>
          </MenuItem>
        );
      })}
    </Select>
  );
};
