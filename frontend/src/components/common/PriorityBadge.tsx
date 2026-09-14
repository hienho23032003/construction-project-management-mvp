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

interface ProgressBarProps {
  value: number;
  height?: number;
  showText?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, height = 8, showText = true }) => {
  const clamped = Math.min(100, Math.max(0, value));

  let color = '#0284c7';
  if (clamped >= 100) color = '#10b981';
  else if (clamped < 30) color = '#f59e0b';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
      <Box sx={{ width: '100%' }}>
        <LinearProgress
          variant="determinate"
          value={clamped}
          sx={{
            height,
            borderRadius: height / 2,
            backgroundColor: '#e2e8f0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
              borderRadius: height / 2,
            },
          }}
        />
      </Box>
      {showText && (
        <Typography variant="body2" sx={{ minWidth: 40, fontWeight: 600, fontSize: '0.8rem', color: '#334155' }}>
          {clamped}%
        </Typography>
      )}
    </Box>
  );
};
