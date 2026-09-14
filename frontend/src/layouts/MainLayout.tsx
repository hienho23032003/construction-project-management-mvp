import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Popover,
  Divider,
  Tooltip,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Users,
  FileText,
  Bell,
  LogOut,
  Menu as MenuIcon,
  HardHat,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  History,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { usePermission } from '../hooks/usePermission';
import { NotificationItem } from '../types';
import { UserProfileModal } from '../components/common/UserProfileModal';
import { format } from 'date-fns';

const EXPANDED_DRAWER_WIDTH = 260;
const COLLAPSED_DRAWER_WIDTH = 76;

interface MenuItemDef {
  text: string;
  icon: any;
  path: string;
  permission?: string;
  adminOnly?: boolean;
}

const allMenuItems: MenuItemDef[] = [
  { text: 'Tổng Quan', icon: LayoutDashboard, path: '/' },
  { text: 'Công Trình & Dự Án', icon: FolderKanban, path: '/projects', permission: 'projects.view' },
  { text: 'Công Việc', icon: CheckSquare, path: '/tasks', permission: 'tasks.view' },
  { text: 'Tiến Độ Gantt', icon: BarChart3, path: '/gantt', permission: 'gantt.view' },
  { text: 'Nhân Sự & Workload', icon: Users, path: '/employees', permission: 'employees.view' },
  { text: 'Báo Cáo & Xuất Dữ Liệu', icon: FileText, path: '/reports', permission: 'reports.view' },
  { text: 'Phân Quyền & Vai Trò', icon: ShieldCheck, path: '/roles', permission: 'roles.view' },
  { text: 'Lịch Sử Đăng Nhập', icon: History, path: '/login-history', permission: 'audit.view_sessions' },
];

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { can, isSuperAdmin } = usePermission();
  const { notifications, unreadCount, markAsRead, markAllAsRead, hasMore, loadMore, loadingMore } = useNotifications();

  const menuItems = allMenuItems.filter((item) => {
    if (isSuperAdmin) return true;
    if (!item.permission) return true;
    return can(item.permission);
  });
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const toggleCollapse = () => setCollapsed(!collapsed);

  const handleNotificationClick = async (n: NotificationItem) => {
    if (!n.isRead) {
      await markAsRead(n.id);
    }
    setNotifAnchor(null);

    if (n.referenceType === 'Project') {
      if (n.referenceId) {
        navigate(`/projects/${n.referenceId}`);
      } else {
        navigate('/projects');
      }
    } else if (n.referenceType === 'Task' || n.type !== 'ProjectAssigned') {
      if (n.referenceId) {
        navigate(`/tasks?taskId=${n.referenceId}`);
      } else {
        navigate('/tasks');
      }
    } else if (n.referenceId) {
      navigate(`/projects/${n.referenceId}`);
    } else {
      navigate('/tasks');
    }
  };

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
        bgcolor: '#0f172a',
        color: '#f8fafc',
        borderRadius: 0,
        transition: 'all 0.25s ease',
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          p: collapsed && !isMobile ? 1.5 : 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
          borderBottom: '1px solid #1e293b',
          minHeight: 64,
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
              bgcolor: 'rgba(255, 255, 255, 0.06)',
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
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
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
                  color: '#ffffff',
                  lineHeight: 1.2,
                  letterSpacing: '0.02em',
                }}
              >
                FCB<span style={{ color: '#38bdf8' }}>VN</span>
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.68rem', fontWeight: 500 }} noWrap>
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
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: '8px',
                py: 1.2,
                px: collapsed && !isMobile ? 1 : 1.5,
                justifyContent: collapsed && !isMobile ? 'center' : 'initial',
                bgcolor: isActive
                  ? 'linear-gradient(90deg, rgba(2, 132, 199, 0.28) 0%, rgba(2, 132, 199, 0.12) 100%)'
                  : 'transparent',
                backgroundColor: isActive ? 'rgba(2, 132, 199, 0.22)' : 'transparent',
                color: isActive ? '#ffffff' : '#e2e8f0', // High-contrast, bright, clear readable text
                border: isActive ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid transparent',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  '& .menu-icon': {
                    color: '#38bdf8',
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
                  color: isActive ? '#38bdf8' : '#94a3b8',
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
                    color: isActive ? '#ffffff' : '#e2e8f0',
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
        onClick={() => setProfileOpen(true)}
        sx={{
          p: collapsed && !isMobile ? 1.5 : 2,
          borderTop: '1px solid #1e293b',
          bgcolor: '#090d16',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
          cursor: 'pointer',
          borderRadius: 0,
          transition: 'background-color 0.2s',
          '&:hover': { bgcolor: '#131b2e' },
        }}
      >
        {collapsed && !isMobile ? (
          <Tooltip
            title={
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                  {user?.fullName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#38bdf8' }}>
                  {user?.roleName || user?.role}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.25 }}>
                  (Nhấp để xem hồ sơ)
                </Typography>
              </Box>
            }
            placement="right"
            arrow
          >
            <Avatar sx={{ bgcolor: '#0284c7', width: 36, height: 36, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
              {user?.fullName?.charAt(0) || 'U'}
            </Avatar>
          </Tooltip>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', overflow: 'hidden' }}>
            <Avatar sx={{ bgcolor: '#0284c7', width: 36, height: 36, fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
              {user?.fullName?.charAt(0) || 'U'}
            </Avatar>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="subtitle2" noWrap sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.8125rem' }}>
                {user?.fullName}
              </Typography>
              <Typography variant="caption" noWrap sx={{ color: '#38bdf8', display: 'block', fontSize: '0.7rem' }}>
                {user?.role === 'SuperAdmin'
                  ? 'Super Admin'
                  : user?.role === 'ProjectManager'
                  ? 'Project Manager'
                  : user?.role === 'Supervisor'
                  ? 'Giám Sát'
                  : 'Kỹ Sư / Nhân Viên'}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Sidebar Navigation */}
      <Box
        component="nav"
        sx={{
          width: { md: currentDrawerWidth },
          flexShrink: { md: 0 },
          transition: 'width 0.25s ease',
        }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: EXPANDED_DRAWER_WIDTH, borderRadius: 0, border: 'none' },
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
              border: 'none',
              borderRadius: 0,
              transition: 'width 0.25s ease',
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          transition: 'width 0.25s ease',
        }}
      >
        {/* Header Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            color: '#0f172a',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Mobile hamburger menu */}
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ display: { md: 'none' } }}
              >
                <MenuIcon size={22} />
              </IconButton>

              {/* Desktop toggle collapse sidebar */}
              <Tooltip title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}>
                <IconButton
                  color="inherit"
                  edge="start"
                  onClick={toggleCollapse}
                  sx={{ display: { xs: 'none', md: 'inline-flex' }, color: '#475569' }}
                >
                  {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                </IconButton>
              </Tooltip>

              <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.15rem' } }}>
                {menuItems.find((i) => i.path === location.pathname)?.text || 'FCBVN — Quản Lý Thi Công'}
              </Typography>
            </Box>

            {/* Right Action Icons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Notification Popover Button */}
              <IconButton
                onClick={(e) => setNotifAnchor(e.currentTarget)}
                sx={{
                  bgcolor: '#f1f5f9',
                  '&:hover': { bgcolor: '#e2e8f0' },
                }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <Bell size={20} color="#334155" />
                </Badge>
              </IconButton>

              {/* User Avatar & Menu */}
              <IconButton
                onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                sx={{ p: 0.5 }}
              >
                <Avatar sx={{ bgcolor: '#0284c7', width: 36, height: 36, fontWeight: 700, fontSize: '0.85rem' }}>
                  {user?.fullName?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Notifications Popover */}
        <Popover
          open={Boolean(notifAnchor)}
          anchorEl={notifAnchor}
          onClose={() => setNotifAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: { width: 360, maxHeight: 460, borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
          }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Thông Báo Hệ Thống
            </Typography>
            {unreadCount > 0 && (
              <Typography
                variant="caption"
                onClick={markAllAsRead}
                sx={{ color: '#0284c7', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                Đọc tất cả
              </Typography>
            )}
          </Box>
          <List sx={{ p: 0, maxHeight: 380, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', color: '#94a3b8' }}>
                <Typography variant="body2">Không có thông báo mới.</Typography>
              </Box>
            ) : (
              <>
                {notifications.map((n) => (
                  <ListItem
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderBottom: '1px solid #f1f5f9',
                      bgcolor: n.isRead ? '#ffffff' : '#f0f9ff',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#e0f2fe' },
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: n.isRead ? 500 : 700, fontSize: '0.8rem' }}>
                          {n.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.65rem' }}>
                          {format(new Date(n.createdAt), 'HH:mm dd/MM')}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.75rem' }}>
                        {n.message}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
                {hasMore && (
                  <Box sx={{ p: 1.5, textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
                    <Button
                      size="small"
                      disabled={loadingMore}
                      onClick={loadMore}
                      sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', color: '#0284c7' }}
                    >
                      {loadingMore ? <CircularProgress size={16} /> : 'Tải thêm thông báo...'}
                    </Button>
                  </Box>
                )}
              </>
            )}
          </List>
        </Popover>

        {/* User Profile Menu */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={() => setUserMenuAnchor(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{ sx: { width: 230, borderRadius: '8px', mt: 1, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {user?.fullName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              setUserMenuAnchor(null);
              setProfileOpen(true);
            }}
            sx={{ gap: 1.25 }}
          >
            <UserIcon size={16} color="#0284c7" />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Thông Tin Cá Nhân
            </Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={logout} sx={{ color: '#ef4444', gap: 1.25 }}>
            <LogOut size={16} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Đăng Xuất
            </Typography>
          </MenuItem>
        </Menu>

        {/* User Profile Modal */}
        <UserProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />

        {/* Page Outlet */}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2.5, md: 3 }, pb: { xs: 9, md: 3 }, overflowY: 'auto' }}>
          <Outlet />
        </Box>

        {/* Mobile Bottom Navigation Bar */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            bgcolor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
            zIndex: 1050,
            alignItems: 'center',
            justifyContent: 'space-around',
            px: 1,
          }}
        >
          {[
            { text: 'Tổng Quan', icon: LayoutDashboard, path: '/' },
            { text: 'Dự Án', icon: FolderKanban, path: '/projects' },
            { text: 'Tasks', icon: CheckSquare, path: '/tasks' },
            { text: 'Gantt', icon: BarChart3, path: '/gantt' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Box
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  py: 0.5,
                  px: 1.5,
                  borderRadius: '8px',
                  color: isActive ? '#0284c7' : '#64748b',
                  transition: 'all 0.15s ease',
                  '&:active': { transform: 'scale(0.95)' },
                }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <Typography variant="caption" sx={{ fontSize: '0.68rem', fontWeight: isActive ? 700 : 500, mt: 0.2 }}>
                  {item.text}
                </Typography>
              </Box>
            );
          })}

          {/* Menu Drawer Toggle Button */}
          <Box
            onClick={handleDrawerToggle}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              py: 0.5,
              px: 1.5,
              borderRadius: '8px',
              color: mobileOpen ? '#0284c7' : '#64748b',
              transition: 'all 0.15s ease',
              '&:active': { transform: 'scale(0.95)' },
            }}
          >
            <MenuIcon size={20} strokeWidth={2} />
            <Typography variant="caption" sx={{ fontSize: '0.68rem', fontWeight: 500, mt: 0.2 }}>
              Thêm
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
