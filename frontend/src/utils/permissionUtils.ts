import { PERMISSION_LABELS, ROLE_LABELS } from '../constants';

export const PERMISSION_NAME_MAP = PERMISSION_LABELS;
export const ROLE_NAME_MAP = ROLE_LABELS;

/**
 * Translates a permission code (e.g. "projects.view" or "Projects.View") into friendly Vietnamese.
 */
export const getVietnamesePermission = (permCode: string): string => {
  if (!permCode) return '';
  const normalized = permCode.toLowerCase().trim();
  return (PERMISSION_LABELS as Record<string, string>)[normalized] || (PERMISSION_LABELS as Record<string, string>)[permCode] || permCode;
};

/**
 * Translates a role code (e.g. "SuperAdmin", "ProjectManager") into friendly Vietnamese.
 */
export const getVietnameseRole = (role: string): string => {
  if (!role) return '';
  return ROLE_LABELS[role] || role;
};

