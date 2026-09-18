import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Users,
  FileText,
  Settings,
  History,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePermission } from '../hooks/usePermission';
import { useAppTheme } from '../contexts/ThemeContext';
import { getMediaUrl } from '../utils/fileUtils';
import { ROUTERS_PATHS } from '../constants/router-paths';
import { PERMISSIONS } from '../constants/permissions';

export const EXPANDED_DRAWER_WIDTH = 270;
export const COLLAPSED_DRAWER_WIDTH = 76;

interface MenuItemDef {
  text: string;
  icon: any;
  path: string;
  permission?: string;
}

const allMenuItems: MenuItemDef[] = [
  { text: 'Tổng Quan', icon: LayoutDashboard, path: ROUTERS_PATHS.DASHBOARD, permission: PERMISSIONS.DASHBOARD_VIEW },
  { text: 'Công Trình & Dự Án', icon: FolderKanban, path: ROUTERS_PATHS.PROJECTS, permission: PERMISSIONS.PROJECTS_VIEW },
  { text: 'Công Việc', icon: CheckSquare, path: ROUTERS_PATHS.TASKS, permission: PERMISSIONS.TASKS_VIEW },
  { text: 'Tiến Độ Gantt', icon: BarChart3, path: ROUTERS_PATHS.GANTT, permission: PERMISSIONS.GANTT_VIEW },
  { text: 'Nhân Sự & Workload', icon: Users, path: ROUTERS_PATHS.EMPLOYEES, permission: PERMISSIONS.EMPLOYEES_VIEW },
  { text: 'Báo Cáo & Xuất Dữ Liệu', icon: FileText, path: ROUTERS_PATHS.REPORTS, permission: PERMISSIONS.REPORTS_VIEW },
  { text: 'Phân Quyền & Vai Trò', icon: Settings, path: ROUTERS_PATHS.ROLES, permission: PERMISSIONS.ROLES_VIEW },
  { text: 'Lịch Sử Đăng Nhập', icon: History, path: ROUTERS_PATHS.LOGIN_HISTORY, permission: PERMISSIONS.AUDIT_VIEW_SESSIONS },
];

interface SidebarNavProps {
  mobileOpen: boolean;
  collapsed: boolean;
  isMobile: boolean;
  onDrawerToggle: () => void;
  onOpenProfile: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  mobileOpen,
  collapsed,
  isMobile,
  onDrawerToggle,
  onOpenProfile,
}) => {
  const { user } = useAuth();
  const { can, isSuperAdmin } = usePermission();
  const { isDark } = useAppTheme();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = allMenuItems.filter((item) => {
    if (isSuperAdmin) return true;
    if (!item.permission) return true;
    return can(item.permission);
  });

  const currentDrawerWidth = isMobile
    ? EXPANDED_DRAWER_WIDTH
    : collapsed
    ? COLLAPSED_DRAWER_WIDTH
    : EXPANDED_DRAWER_WIDTH;

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderRadius: 0,
      }}
    >

      {/* Navigation Links */}
      <List sx={{ px: collapsed && !isMobile ? 1 : 1.5, py: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

          const buttonContent = (
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                if (isMobile) onDrawerToggle();
              }}
              sx={{
                borderRadius: '8px',
                py: 1.2,
                px: collapsed && !isMobile ? 1 : 1.5,
                justifyContent: collapsed && !isMobile ? 'center' : 'initial',
                bgcolor: isActive
                  ? isDark
                    ? 'rgba(45, 136, 255, 0.16)'
                    : '#e0f2fe'
                  : 'transparent',
                backgroundColor: isActive
                  ? isDark
                    ? 'rgba(45, 136, 255, 0.16)'
                    : '#e0f2fe'
                  : 'transparent',
                color: isActive ? (isDark ? '#2d88ff' : '#0284c7') : isDark ? '#b0b3b8' : '#475569',
                border: isActive
                  ? isDark
                    ? '1px solid rgba(45, 136, 255, 0.3)'
                    : '1px solid #bae6fd'
                  : '1px solid transparent',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: isActive
                    ? isDark
                      ? 'rgba(45, 136, 255, 0.24)'
                      : '#dbeafe'
                    : isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : '#f1f5f9',
                  color: isActive ? (isDark ? '#2d88ff' : '#0284c7') : isDark ? '#e4e6eb' : '#0f172a',
                  '& .menu-icon': {
                    color: isDark ? '#2d88ff' : '#0284c7',
                  },
                },
              }}
            >
              <ListItemIcon
                className="menu-icon"
                sx={{
                  minWidth: collapsed && !isMobile ? 0 : 36,
                  mr: collapsed && !isMobile ? 0 : 1,
                  justifyContent: 'center',
                  color: isActive ? (isDark ? '#2d88ff' : '#0284c7') : isDark ? '#b0b3b8' : '#64748b',
                  transition: 'color 0.15s ease',
                }}
              >
                <Icon size={20} />
              </ListItemIcon>
              {(!collapsed || isMobile) && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? (isDark ? '#2d88ff' : '#0284c7') : isDark ? '#b0b3b8' : '#334155',
                  }}
                />
              )}
            </ListItemButton>
          );

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.75 }}>
              {collapsed && !isMobile ? (
                <Tooltip title={item.text} placement="right" arrow>
                  <Box sx={{ width: '100%' }}>{buttonContent}</Box>
                </Tooltip>
              ) : (
                buttonContent
              )}
            </ListItem>
          );
        })}
      </List>

      {/* User Role Card at Bottom */}
      <Box
        onClick={onOpenProfile}
        sx={{
          p: collapsed && !isMobile ? 1.5 : 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: isDark ? 'rgba(0, 0, 0, 0.2)' : '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
          cursor: 'pointer',
          borderRadius: 0,
          transition: 'background-color 0.2s',
          '&:hover': { bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9' },
        }}
      >
        {collapsed && !isMobile ? (
          <Tooltip
            title={
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: 'text.primary' }}>
                  {user?.fullName}
                </Typography>
                <Typography variant="caption" sx={{ color: isDark ? '#38bdf8' : '#0284c7' }}>
                  {user?.roleName || user?.role}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                  (Nhấp để xem hồ sơ)
                </Typography>
              </Box>
            }
            placement="right"
            arrow
          >
            <Avatar
              src={getMediaUrl(user?.avatarUrl)}
              sx={{
                bgcolor: '#0284c7',
                width: 36,
                height: 36,
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                color: '#ffffff',
                border: isDark ? '2px solid #38bdf8' : 'none',
              }}
            >
              {user?.fullName?.charAt(0) || 'U'}
            </Avatar>
          </Tooltip>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', overflow: 'hidden' }}>
            <Avatar
              src={getMediaUrl(user?.avatarUrl)}
              sx={{
                bgcolor: '#0284c7',
                width: 36,
                height: 36,
                fontWeight: 700,
                fontSize: '0.9rem',
                flexShrink: 0,
                color: '#ffffff',
                border: isDark ? '2px solid #38bdf8' : 'none',
              }}
            >
              {user?.fullName?.charAt(0) || 'U'}
            </Avatar>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="subtitle2" noWrap sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.8125rem' }}>
                {user?.fullName}
              </Typography>
              <Typography variant="caption" noWrap sx={{ color: isDark ? '#38bdf8' : '#0284c7', display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>
                {user?.roleName ||
                  (user?.roles && user.roles.length > 0 ? user.roles[0] : null) ||
                  (user?.role === 'SuperAdmin'
                    ? 'Super Admin'
                    : user?.role === 'ProjectManager'
                    ? 'Quản Lý (PM)'
                    : user?.role === 'Supervisor'
                    ? 'Giám Sát Hiện Trường'
                    : 'Kỹ Sư / Nhân Viên')}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Credit Footer */}
      {(!collapsed || isMobile) && (
        <Box sx={{ py: 1, px: 2, bgcolor: isDark ? 'rgba(0, 0, 0, 0.3)' : '#f8fafc', borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ fontSize: '0.68rem', color: isDark ? '#64748b' : '#94a3b8', display: 'block', fontWeight: 500 }}>
            Design by <span style={{ color: isDark ? '#38bdf8' : '#0284c7', fontWeight: 700 }}>Phạm Thế Hiển</span>
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { md: currentDrawerWidth },
        flexShrink: { md: 0 },
        transition: 'width 0.25s ease',
        height: '100vh',
      }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: EXPANDED_DRAWER_WIDTH,
            borderRadius: 0,
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: currentDrawerWidth,
            borderRight: `1px solid ${theme.palette.divider}`,
            borderRadius: 0,
            bgcolor: 'background.paper',
            transition: 'width 0.25s ease',
            overflowX: 'hidden',
            height: '100vh',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};
