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
import { getMediaUrl } from '../utils/fileUtils';

export const EXPANDED_DRAWER_WIDTH = 270;
export const COLLAPSED_DRAWER_WIDTH = 76;

interface MenuItemDef {
  text: string;
  icon: any;
  path: string;
  permission?: string;
}

const allMenuItems: MenuItemDef[] = [
  { text: 'Tổng Quan', icon: LayoutDashboard, path: '/' },
  { text: 'Công Trình & Dự Án', icon: FolderKanban, path: '/projects', permission: 'projects.view' },
  { text: 'Công Việc', icon: CheckSquare, path: '/tasks', permission: 'tasks.view' },
  { text: 'Tiến Độ Gantt', icon: BarChart3, path: '/gantt', permission: 'gantt.view' },
  { text: 'Nhân Sự & Workload', icon: Users, path: '/employees', permission: 'employees.view' },
  { text: 'Báo Cáo & Xuất Dữ Liệu', icon: FileText, path: '/reports', permission: 'reports.view' },
  { text: 'Phân Quyền & Vai Trò', icon: Settings, path: '/roles', permission: 'roles.view' },
  { text: 'Lịch Sử Đăng Nhập', icon: History, path: '/login-history', permission: 'audit.view_sessions' },
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
        bgcolor: '#ffffff',
        color: '#0f172a',
        borderRadius: 0,
        transition: 'all 0.25s ease',
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          px: collapsed && !isMobile ? 1.5 : 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
          borderBottom: '1px solid #e2e8f0',
          height: 64,
          minHeight: 64,
          maxHeight: 64,
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden', width: '100%', justifyContent: collapsed && !isMobile ? 'center' : 'flex-start' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 0.5,
              borderRadius: '8px',
              bgcolor: '#f0f9ff',
              border: '1px solid #e0f2fe',
            }}
          >
            <Box
              component="img"
              src="https://www.fcbvn.vn/landing/logo.svg"
              alt="FCBVN Logo"
              sx={{
                height: 32,
                maxWidth: collapsed && !isMobile ? 32 : 120,
                objectFit: 'contain',
              }}
            />
          </Box>
          {(!collapsed || isMobile) && (
            <Box sx={{ overflow: 'hidden' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: '#0f172a',
                  lineHeight: 1.2,
                  letterSpacing: '0.02em',
                }}
              >
                FCB<span style={{ color: '#0284c7' }}>VN</span>
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', fontWeight: 500 }} noWrap>
                Quản Lý Công Trình
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

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
                bgcolor: isActive ? '#e0f2fe' : 'transparent',
                backgroundColor: isActive ? '#e0f2fe' : 'transparent',
                color: isActive ? '#0284c7' : '#475569',
                border: isActive ? '1px solid #bae6fd' : '1px solid transparent',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: isActive ? '#dbeafe' : '#f1f5f9',
                  color: isActive ? '#0284c7' : '#0f172a',
                  '& .menu-icon': {
                    color: '#0284c7',
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
                  color: isActive ? '#0284c7' : '#64748b',
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
                    color: isActive ? '#0284c7' : '#334155',
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
          borderTop: '1px solid #e2e8f0',
          bgcolor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
          cursor: 'pointer',
          borderRadius: 0,
          transition: 'background-color 0.2s',
          '&:hover': { bgcolor: '#f1f5f9' },
        }}
      >
        {collapsed && !isMobile ? (
          <Tooltip
            title={
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: '#0f172a' }}>
                  {user?.fullName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#0284c7' }}>
                  {user?.roleName || user?.role}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.25 }}>
                  (Nhấp để xem hồ sơ)
                </Typography>
              </Box>
            }
            placement="right"
            arrow
          >
            <Avatar
              src={getMediaUrl(user?.avatarUrl)}
              sx={{ bgcolor: '#0284c7', width: 36, height: 36, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', color: '#ffffff' }}
            >
              {user?.fullName?.charAt(0) || 'U'}
            </Avatar>
          </Tooltip>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', overflow: 'hidden' }}>
            <Avatar
              src={getMediaUrl(user?.avatarUrl)}
              sx={{ bgcolor: '#0284c7', width: 36, height: 36, fontWeight: 700, fontSize: '0.9rem', flexShrink: 0, color: '#ffffff' }}
            >
              {user?.fullName?.charAt(0) || 'U'}
            </Avatar>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="subtitle2" noWrap sx={{ color: '#0f172a', fontWeight: 600, fontSize: '0.8125rem' }}>
                {user?.fullName}
              </Typography>
              <Typography variant="caption" noWrap sx={{ color: '#0284c7', display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>
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
        <Box sx={{ py: 1, px: 2, bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', fontWeight: 500 }}>
            Design by <span style={{ color: '#0284c7', fontWeight: 700 }}>Phạm Thế Hiển</span>
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
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: EXPANDED_DRAWER_WIDTH, borderRadius: 0, borderRight: '1px solid #e2e8f0', bgcolor: '#ffffff' },
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
            borderRight: '1px solid #e2e8f0',
            borderRadius: 0,
            bgcolor: '#ffffff',
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
