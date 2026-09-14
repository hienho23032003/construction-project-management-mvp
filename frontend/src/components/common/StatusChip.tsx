import React from 'react';
import { Chip } from '@mui/material';
import { ProjectStatus, TaskStatus } from '../../types';

interface StatusChipProps {
  status: ProjectStatus | TaskStatus | string;
  size?: 'small' | 'medium';
  isOverdue?: boolean;
}

export const statusMap: Record<string, { label: string; bg: string; color: string; border: string }> = {
  Completed: { label: 'Hoàn thành', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
  InProgress: { label: 'Đang thực hiện', bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
  NotStarted: { label: 'Chưa bắt đầu', bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
  OnHold: { label: 'Tạm dừng', bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  Overdue: { label: 'Trễ tiến độ', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  Cancelled: { label: 'Đã hủy', bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' },
};

export const getVietnameseStatus = (status: string, isOverdue?: boolean): string => {
  if (isOverdue && status !== 'Completed') return 'Trễ tiến độ';
  const found = Object.keys(statusMap).find((k) => k.toLowerCase() === (status || '').toLowerCase());
  return found ? statusMap[found].label : status || 'Chưa xác định';
};

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'small', isOverdue }) => {
  const effectiveKey = isOverdue && status !== 'Completed' ? 'Overdue' : status;
  const matchKey = Object.keys(statusMap).find((k) => k.toLowerCase() === (effectiveKey || '').toLowerCase());
  const config = matchKey ? statusMap[matchKey] : {
    label: getVietnameseStatus(status, isOverdue),
    bg: '#f1f5f9',
    color: '#475569',
    border: '#e2e8f0',
  };

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
