import React from 'react';
import { Box, Chip, Typography, useTheme, SxProps, Theme } from '@mui/material';
import { Flag, Ban } from 'lucide-react';
import { PriorityLevel } from '../../types';

interface PriorityBadgeProps {
  priority?: PriorityLevel | string;
  size?: 'small' | 'medium';
  variant?: 'chip' | 'flagOnly' | 'compact';
  sx?: SxProps<Theme>;
}

export const getPriorityConfig = (priority?: string, isDark: boolean = false) => {
  switch (priority) {
    case 'Urgent':
      return {
        label: 'Khẩn cấp',
        viLabel: 'Khẩn cấp',
        color: isDark ? '#f87171' : '#ef4444',
        bg: isDark ? 'rgba(248, 113, 113, 0.16)' : '#fef2f2',
        border: isDark ? 'rgba(248, 113, 113, 0.35)' : '#fecaca',
        flagColor: '#ef4444',
      };
    case 'High':
      return {
        label: 'Cao',
        viLabel: 'Cao',
        color: isDark ? '#fbbf24' : '#d97706',
        bg: isDark ? 'rgba(251, 191, 36, 0.16)' : '#fffbeb',
        border: isDark ? 'rgba(251, 191, 36, 0.35)' : '#fde68a',
        flagColor: '#f59e0b',
      };
    case 'Medium':
    case 'Normal':
      return {
        label: 'Bình thường',
        viLabel: 'Bình thường',
        color: isDark ? '#60a5fa' : '#2563eb',
        bg: isDark ? 'rgba(59, 130, 246, 0.16)' : '#eff6ff',
        border: isDark ? 'rgba(59, 130, 246, 0.35)' : '#bfdbfe',
        flagColor: '#3b82f6',
      };
    case 'Low':
      return {
        label: 'Thấp',
        viLabel: 'Thấp',
        color: isDark ? '#9ca3af' : '#64748b',
        bg: isDark ? 'rgba(156, 163, 175, 0.16)' : '#f8fafc',
        border: isDark ? 'rgba(156, 163, 175, 0.35)' : '#e2e8f0',
        flagColor: '#9ca3af',
      };
    default:
      return {
        label: 'Mặc định',
        viLabel: 'Mặc định',
        color: isDark ? '#9ca3af' : '#64748b',
        bg: isDark ? 'rgba(156, 163, 175, 0.12)' : '#f1f5f9',
        border: isDark ? 'rgba(156, 163, 175, 0.25)' : '#e2e8f0',
        flagColor: '#9ca3af',
      };
  }
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'small',
  variant = 'compact',
  sx,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const config = getPriorityConfig(priority ? String(priority) : undefined, isDark);

  if (variant === 'flagOnly') {
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          color: config.flagColor,
          ...sx,
        }}
        title={`Mức độ ưu tiên: ${config.label}`}
      >
        <Flag size={size === 'small' ? 14 : 16} fill={config.flagColor} strokeWidth={1.5} />
      </Box>
    );
  }

  return (
    <Box
      sx={[
        {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.6,
          px: size === 'small' ? 0.9 : 1.25,
          py: size === 'small' ? 0.25 : 0.4,
          borderRadius: '6px',
          bgcolor: config.bg,
          color: config.color,
          border: `1px solid ${config.border}`,
          fontWeight: 700,
          fontSize: size === 'small' ? '0.725rem' : '0.8rem',
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          userSelect: 'none',
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Flag size={size === 'small' ? 12 : 14} fill={config.flagColor} strokeWidth={1.5} color={config.flagColor} />
      <span>{config.label}</span>
    </Box>
  );
};

