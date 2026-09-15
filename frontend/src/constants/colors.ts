/**
 * Global Color Constants for FCBVN Construction Project Management
 */

export const COLORS = {
  // Brand / Primary Colors (Cyan-Blue)
  primary: {
    main: '#0284c7',
    light: '#38bdf8',
    dark: '#0369a1',
    lighter: '#e0f2fe',
    contrastText: '#ffffff',
    glow: 'rgba(2, 132, 199, 0.25)',
  },

  // Secondary Colors (Deep Teal)
  secondary: {
    main: '#0f766e',
    light: '#14b8a6',
    dark: '#115e59',
    lighter: '#ccfbf1',
    contrastText: '#ffffff',
  },

  // Neutral / Background Colors
  background: {
    default: '#f8fafc',
    paper: '#ffffff',
    subtle: '#f1f5f9',
    hover: '#f0f9ff',
    active: '#e0f2fe',
    sidebar: '#ffffff',
    card: '#ffffff',
  },

  // Border & Divider Colors
  border: {
    light: '#f1f5f9',
    main: '#e2e8f0',
    dark: '#cbd5e1',
    active: '#bae6fd',
    focus: '#0284c7',
  },

  // Typography & Text Colors
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    muted: '#64748b',
    disabled: '#94a3b8',
    inverse: '#ffffff',
    link: '#0284c7',
    linkHover: '#0369a1',
  },

  // Semantic Status Colors
  success: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    contrastText: '#ffffff',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    contrastText: '#ffffff',
  },
  info: {
    main: '#0284c7',
    light: '#38bdf8',
    dark: '#0369a1',
    bg: '#f0f9ff',
    border: '#bae6fd',
    contrastText: '#ffffff',
  },
} as const;

/**
 * Task and Project Status Color Definitions
 */
export const STATUS_COLORS = {
  Completed: {
    main: '#10b981',
    light: '#ecfdf5',
    dark: '#047857',
    border: '#a7f3d0',
    contrastText: '#ffffff',
    label: 'Đã hoàn thành',
  },
  InProgress: {
    main: '#0284c7',
    light: '#f0f9ff',
    dark: '#0369a1',
    border: '#bae6fd',
    contrastText: '#ffffff',
    label: 'Đang thực hiện',
  },
  NotStarted: {
    main: '#64748b',
    light: '#f8fafc',
    dark: '#334155',
    border: '#e2e8f0',
    contrastText: '#ffffff',
    label: 'Chưa bắt đầu',
  },
  OnHold: {
    main: '#f59e0b',
    light: '#fffbeb',
    dark: '#b45309',
    border: '#fde68a',
    contrastText: '#ffffff',
    label: 'Tạm dừng',
  },
  Overdue: {
    main: '#ef4444',
    light: '#fef2f2',
    dark: '#b91c1c',
    border: '#fecaca',
    contrastText: '#ffffff',
    label: 'Quá hạn',
  },
  Cancelled: {
    main: '#94a3b8',
    light: '#f1f5f9',
    dark: '#475569',
    border: '#cbd5e1',
    contrastText: '#ffffff',
    label: 'Đã hủy',
  },
} as const;

/**
 * Priority Level Colors
 */
export const PRIORITY_COLORS = {
  Low: {
    main: '#64748b',
    bg: '#f1f5f9',
    border: '#e2e8f0',
    label: 'Thấp',
  },
  Medium: {
    main: '#0284c7',
    bg: '#e0f2fe',
    border: '#bae6fd',
    label: 'Trung bình',
  },
  High: {
    main: '#f59e0b',
    bg: '#fef3c7',
    border: '#fde68a',
    label: 'Cao',
  },
  Urgent: {
    main: '#ef4444',
    bg: '#fee2e2',
    border: '#fecaca',
    label: 'Khẩn cấp',
  },
} as const;

/**
 * User Role Badge Colors
 */
export const ROLE_COLORS = {
  SuperAdmin: {
    bg: '#fee2e2',
    color: '#b91c1c',
    border: '#fca5a5',
  },
  ProjectManager: {
    bg: '#e0f2fe',
    color: '#0369a1',
    border: '#7dd3fc',
  },
  Supervisor: {
    bg: '#ecfdf5',
    color: '#047857',
    border: '#6ee7b7',
  },
  Engineer: {
    bg: '#f0fdf4',
    color: '#15803d',
    border: '#86efac',
  },
  Worker: {
    bg: '#f8fafc',
    color: '#475569',
    border: '#cbd5e1',
  },
  Guest: {
    bg: '#f1f5f9',
    color: '#64748b',
    border: '#e2e8f0',
  },
} as const;

/**
 * Charts Palette Colors
 */
export const CHART_PALETTE = [
  '#0284c7', // Cyan Blue
  '#10b981', // Emerald Green
  '#f59e0b', // Amber Orange
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Teal
  '#f97316', // Orange
  '#6366f1', // Indigo
] as const;
