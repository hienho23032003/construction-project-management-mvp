import React, { useState } from 'react';
import {
  Box,
  Typography,
  Popover,
  MenuItem,
  useTheme,
  ButtonBase,
  SxProps,
  Theme,
} from '@mui/material';
import { Flag, Check, Ban, ChevronDown } from 'lucide-react';
import { PriorityLevel } from '../../types';
import { getPriorityConfig } from './PriorityBadge';

export interface PrioritySelectProps {
  value?: PriorityLevel | string;
  onChange: (priority: PriorityLevel) => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
  variant?: 'button' | 'badge' | 'flagOnly';
  showClear?: boolean;
  sx?: SxProps<Theme>;
}

const PRIORITY_OPTIONS: { value: PriorityLevel; label: string; flagColor: string; description: string }[] = [
  { value: 'Urgent', label: 'Khẩn cấp', flagColor: '#ef4444', description: 'Khẩn cấp' },
  { value: 'High', label: 'Cao', flagColor: '#f59e0b', description: 'Cao' },
  { value: 'Medium', label: 'Bình thường', flagColor: '#3b82f6', description: 'Bình thường' },
  { value: 'Low', label: 'Thấp', flagColor: '#9ca3af', description: 'Thấp' },
];

export const PrioritySelect: React.FC<PrioritySelectProps> = ({
  value = 'Medium',
  onChange,
  disabled = false,
  size = 'small',
  variant = 'badge',
  showClear = true,
  sx,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);
  const normalizedValue: PriorityLevel =
    value === 'Normal' ? 'Medium' : (value as PriorityLevel) || 'Medium';

  const currentConfig = getPriorityConfig(normalizedValue, isDark);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (!disabled) {
      setAnchorEl(e.currentTarget);
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAnchorEl(null);
  };

  const handleSelect = (nextVal: PriorityLevel, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(nextVal);
    handleClose(e);
  };

  return (
    <>
      <ButtonBase
        onClick={handleClick}
        disabled={disabled}
        sx={[
          {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.6,
            px: size === 'small' ? 1 : 1.25,
            py: size === 'small' ? 0.35 : 0.5,
            borderRadius: '6px',
            bgcolor: currentConfig.bg,
            color: currentConfig.color,
            border: `1px solid ${currentConfig.border}`,
            fontWeight: 700,
            fontSize: size === 'small' ? '0.75rem' : '0.8125rem',
            lineHeight: 1.2,
            cursor: disabled ? 'default' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
            '&:hover': !disabled
              ? {
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                  borderColor: currentConfig.flagColor,
                }
              : undefined,
          },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
      >
        <Flag
          size={size === 'small' ? 13 : 15}
          fill={currentConfig.flagColor}
          color={currentConfig.flagColor}
          strokeWidth={1.5}
        />
        <span>{currentConfig.label}</span>
        {!disabled && (
          <ChevronDown
            size={12}
            style={{
              opacity: 0.7,
              marginLeft: 2,
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.15s ease',
            }}
          />
        )}
      </ButtonBase>

      {/* Popover Menu matching screenshot */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={(_e, reason) => handleClose()}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            mt: 0.75,
            width: 170,
            borderRadius: '8px',
            bgcolor: isDark ? '#1a1a1a' : '#ffffff',
            border: `1px solid ${isDark ? '#2e2e2e' : '#e2e8f0'}`,
            boxShadow: isDark
              ? '0 12px 28px rgba(0, 0, 0, 0.7), 0 2px 8px rgba(0, 0, 0, 0.4)'
              : '0 10px 25px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            p: 0.75,
          },
        }}
      >
        {/* Header: Priority */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            px: 1.25,
            pt: 0.5,
            pb: 0.75,
            fontWeight: 700,
            fontSize: '0.725rem',
            color: isDark ? '#8e8e93' : '#64748b',
            letterSpacing: '0.02em',
          }}
        >
          Mức Độ Ưu Tiên
        </Typography>

        {/* Priority Option List */}
        {PRIORITY_OPTIONS.map((opt) => {
          const isSelected = normalizedValue === opt.value;
          return (
            <MenuItem
              key={opt.value}
              onClick={(e) => handleSelect(opt.value, e)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 0.75,
                px: 1.25,
                borderRadius: '6px',
                my: 0.25,
                color: isDark ? '#ffffff' : '#0f172a',
                fontSize: '0.8125rem',
                fontWeight: isSelected ? 700 : 500,
                '&:hover': {
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Flag size={15} fill={opt.flagColor} color={opt.flagColor} strokeWidth={1.5} />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.8125rem',
                    color: isDark ? '#f1f5f9' : '#0f172a',
                  }}
                >
                  {opt.label}
                </Typography>
              </Box>

              {isSelected && (
                <Check
                  size={15}
                  strokeWidth={2.5}
                  color={isDark ? '#f1f5f9' : '#0f172a'}
                />
              )}
            </MenuItem>
          );
        })}

        {/* Clear Option */}
        {showClear && (
          <MenuItem
            onClick={(e) => handleSelect('Medium', e)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              py: 0.75,
              px: 1.25,
              borderRadius: '6px',
              my: 0.25,
              mt: 0.5,
              borderTop: `1px solid ${isDark ? '#2e2e2e' : '#f1f5f9'}`,
              color: isDark ? '#a1a1aa' : '#64748b',
              fontSize: '0.8125rem',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                color: isDark ? '#ffffff' : '#0f172a',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Ban size={15} strokeWidth={1.75} />
              <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                Mặc định
              </Typography>
            </Box>
          </MenuItem>
        )}
      </Popover>
    </>
  );
};

