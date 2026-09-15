import React from 'react';
import { Chip, Box, Typography, LinearProgress } from '@mui/material';
import { PriorityLevel } from '../../types';

interface PriorityBadgeProps {
  priority: PriorityLevel | string;
  size?: 'small' | 'medium';
}

const priorityMap: Record<string, { label: string; bg: string; color: string; border: string }> = {
  Low: { label: 'Thấp', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  Medium: { label: 'Trung bình', bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' },
  High: { label: 'Cao', bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
  Urgent: { label: 'Khẩn cấp', bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'small' }) => {
  const config = priorityMap[priority] || priorityMap.Medium;

  return (
    <Chip
      size={size}
      label={config.label}
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.8125rem',
      }}
    />
  );
};

export { ProgressBar } from './ProgressBar';
export type { ProgressBarProps } from './ProgressBar';

