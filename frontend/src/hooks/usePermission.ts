import { useAuth } from '../contexts/AuthContext';

export const usePermission = () => {
  const { user, permissions } = useAuth();

  const isSuperAdmin = user?.role === 'SuperAdmin' || user?.roles?.includes('SuperAdmin') || false;

  const can = (permissionCode: string): boolean => {
    if (isSuperAdmin) return true;
    return permissions.includes(permissionCode);
  };

  const canAny = (...permissionCodes: string[]): boolean => {
    if (isSuperAdmin) return true;
    return permissionCodes.some((code) => permissions.includes(code));
  };

  const canAll = (...permissionCodes: string[]): boolean => {
    if (isSuperAdmin) return true;
    return permissionCodes.every((code) => permissions.includes(code));
  };

  const hasRole = (roleCode: string): boolean => {
    if (user?.role === roleCode) return true;
    if (user?.roles && user.roles.includes(roleCode)) return true;
    return false;
  };

  return {
    isSuperAdmin,
    permissions,
    can,
    canAny,
    canAll,
    hasRole,
  };
};
