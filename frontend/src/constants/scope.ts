export type ViewScope = 'all' | 'project' | 'personal';

export interface ScopeConfig {
  label: string;
  shortLabel: string;
  bgColor: string;
  color: string;
  borderColor: string;
}

export const SCOPE_CONFIGS: Record<ViewScope, ScopeConfig> = {
  all: {
    label: 'Chế độ: Toàn hệ thống',
    shortLabel: 'Toàn hệ thống',
    bgColor: '#eff6ff',
    color: '#1d4ed8',
    borderColor: '#bfdbfe',
  },
  project: {
    label: 'Chế độ: Dự án tham gia',
    shortLabel: 'Dự án tham gia',
    bgColor: '#f0fdf4',
    color: '#15803d',
    borderColor: '#bbf7d0',
  },
  personal: {
    label: 'Chế độ: Cá nhân',
    shortLabel: 'Cá nhân',
    bgColor: '#faf5ff',
    color: '#7e22ce',
    borderColor: '#e9d5ff',
  },
};

export const getViewScope = (canViewAll?: boolean, canViewProject?: boolean): ViewScope => {
  if (canViewAll) return 'all';
  if (canViewProject) return 'project';
  return 'personal';
};
