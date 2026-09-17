import React from 'react';
import { Chip, useTheme } from '@mui/material';
import { ProjectStatus, TaskStatus } from '../../types';

interface StatusChipProps {
  status: ProjectStatus | TaskStatus | string;
  size?: 'small' | 'medium';
  isOverdue?: boolean;
}

export const getStatusConfig = (statusKey: string, isDark: boolean) => {
  const configs: Record<string, { label: string; bg: string; color: string; border: string }> = {
    Completed: {
      label: 'Hoàn thành',
      bg: isDark ? 'rgba(16, 185, 129, 0.16)' : '#ecfdf5',
      color: isDark ? '#34d399' : '#047857',
      border: isDark ? 'rgba(52, 211, 153, 0.35)' : '#a7f3d0',
    },
    InProgress: {
      label: 'Đang thực hiện',
      bg: isDark ? 'rgba(2, 132, 199, 0.16)' : '#f0f9ff',
      color: isDark ? '#38bdf8' : '#0369a1',
      border: isDark ? 'rgba(56, 189, 248, 0.35)' : '#bae6fd',
    },
    NotStarted: {
      label: 'Chưa bắt đầu',
      bg: isDark ? '#222222' : '#f8fafc',
      color: isDark ? '#b4b4b4' : '#475569',
      border: isDark ? '#333333' : '#e2e8f0',
    },
    OnHold: {
      label: 'Tạm dừng',
      bg: isDark ? 'rgba(245, 158, 11, 0.16)' : '#fffbeb',
      color: isDark ? '#fbbf24' : '#b45309',
      border: isDark ? 'rgba(251, 191, 36, 0.35)' : '#fde68a',
    },
    Overdue: {
      label: 'Trễ tiến độ',
      bg: isDark ? 'rgba(239, 68, 68, 0.16)' : '#fef2f2',
      color: isDark ? '#f87171' : '#b91c1c',
      border: isDark ? 'rgba(248, 113, 113, 0.35)' : '#fecaca',
    },
    Cancelled: {
      label: 'Đã hủy',
      bg: isDark ? '#242526' : '#f1f5f9',
      color: isDark ? '#71767b' : '#64748b',
      border: isDark ? '#3a3b3c' : '#cbd5e1',
    },
  };

  return configs[statusKey] || {
    label: statusKey,
    bg: isDark ? '#242526' : '#f1f5f9',
    color: isDark ? '#b0b3b8' : '#475569',
    border: isDark ? '#3a3b3c' : '#e2e8f0',
  };
};

export const statusMap = {
  Completed: { label: 'Hoàn thành', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
  InProgress: { label: 'Đang thực hiện', bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
  NotStarted: { label: 'Chưa bắt đầu', bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
  OnHold: { label: 'Tạm dừng', bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  Overdue: { label: 'Trễ tiến độ', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  Cancelled: { label: 'Đã hủy', bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' },
};

export const getVietnameseStatus = (status?: string | number, isOverdue?: boolean): string => {
  if (status === undefined || status === null) return 'Chưa xác định';
  const str = String(status).trim();
  if (!str) return 'Chưa xác định';
  if (isOverdue && str !== 'Completed' && str !== '2' && !str.toLowerCase().includes('completed')) {
    return 'Trễ tiến độ';
  }

  const exactMatch = Object.keys(statusMap).find((k) => k.toLowerCase() === str.toLowerCase());
  if (exactMatch) return (statusMap as any)[exactMatch].label;

  if (str === '0') return 'Chưa bắt đầu';
  if (str === '1') return 'Đang thực hiện';
  if (str === '2') return 'Hoàn thành';
  if (str === '3') return 'Tạm dừng';
  if (str === '4') return 'Đã hủy';

  return str
    .replace(/InProgress/gi, 'Đang thực hiện')
    .replace(/In\s*Progress/gi, 'Đang thực hiện')
    .replace(/NotStarted/gi, 'Chưa bắt đầu')
    .replace(/Not\s*Started/gi, 'Chưa bắt đầu')
    .replace(/Completed/gi, 'Hoàn thành')
    .replace(/OnHold/gi, 'Tạm dừng')
    .replace(/On\s*Hold/gi, 'Tạm dừng')
    .replace(/Overdue/gi, 'Trễ tiến độ')
    .replace(/Cancelled/gi, 'Đã hủy')
    .replace(/Canceled/gi, 'Đã hủy')
    .replace(/\bUrgent\b/gi, 'Khẩn cấp')
    .replace(/\bHigh\b/gi, 'Cao')
    .replace(/\bMedium\b/gi, 'Trung bình')
    .replace(/\bLow\b/gi, 'Thấp');
};

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'small', isOverdue }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const effectiveKey = isOverdue && status !== 'Completed' ? 'Overdue' : status;
  const matchKey = Object.keys(statusMap).find((k) => k.toLowerCase() === (effectiveKey || '').toLowerCase()) || String(effectiveKey);

  const config = getStatusConfig(matchKey, isDark);

  return (
    <Chip
      size={size}
      label={config.label || getVietnameseStatus(status, isOverdue)}
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
