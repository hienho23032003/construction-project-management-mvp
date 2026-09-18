import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  User as UserIcon,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useAppTheme } from '../contexts/ThemeContext';
import { getMediaUrl } from '../utils/fileUtils';
import { ROUTERS_PATHS } from '../constants/router-paths';

const titleMap: Record<string, string> = {
  [ROUTERS_PATHS.DASHBOARD]: 'Tổng Quan',
  [ROUTERS_PATHS.PROJECTS]: 'Công Trình & Dự Án',
  [ROUTERS_PATHS.TASKS]: 'Công Việc',
  [ROUTERS_PATHS.GANTT]: 'Tiến Độ Gantt',
  [ROUTERS_PATHS.EMPLOYEES]: 'Nhân Sự & Workload',
  [ROUTERS_PATHS.REPORTS]: 'Báo Cáo & Xuất Dữ Liệu',
  [ROUTERS_PATHS.ROLES]: 'Phân Quyền & Vai Trò',
  [ROUTERS_PATHS.LOGIN_HISTORY]: 'Lịch Sử Đăng Nhập',
};

interface TopAppBarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onDrawerToggle: () => void;
  onOpenNotifications: (e: React.MouseEvent<HTMLElement>) => void;
  onOpenProfile: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  collapsed,
  onToggleCollapse,
  onDrawerToggle,
  onOpenNotifications,
  onOpenProfile,
}) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { isDark, toggleTheme } = useAppTheme();
  const theme = useTheme();
  const location = useLocation();

  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const currentTitle =
    titleMap[location.pathname] ||
    Object.entries(titleMap).find(([path]) => path !== '/' && location.pathname.startsWith(path))?.[1] ||
    'Hệ Thống Quản Lý Dự Án';

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        flexShrink: 0,
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderRadius: 0,
        color: 'text.primary',
        zIndex: 1100,
        height: 64,
        minHeight: 64,
        maxHeight: 64,
        boxSizing: 'border-box',
      }}
    >
      <Toolbar
        sx={{
          height: 64,
          minHeight: '64px !important',
          maxHeight: 64,
          justifyContent: 'space-between',
          px: { xs: 2, md: 3 },
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Mobile hamburger menu */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon size={22} />
          </IconButton>

          {/* Desktop toggle collapse sidebar */}
          <Tooltip title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={onToggleCollapse}
              sx={{
                display: { xs: 'none', md: 'inline-flex' },
                color: isDark ? '#94a3b8' : '#475569',
                '&:hover': { color: isDark ? '#38bdf8' : '#0284c7' },
              }}
            >
              {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </IconButton>
          </Tooltip>

          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.15rem' } }}>
            {currentTitle}
          </Typography>
        </Box>

        {/* Right Action Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          {/* Dark / Light Mode Toggle Button */}
          <Tooltip title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}>
            <IconButton
              onClick={toggleTheme}
              sx={{
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                color: isDark ? '#fbbf24' : '#64748b',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(251, 191, 36, 0.15)' : '#e2e8f0',
                  color: isDark ? '#fcd34d' : '#0284c7',
                  transform: 'scale(1.06)',
                },
              }}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </IconButton>
          </Tooltip>

          {/* Notification Button */}
          <IconButton
            onClick={onOpenNotifications}
            sx={{
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
              color: isDark ? '#f1f5f9' : '#334155',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.14)' : '#e2e8f0',
              },
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <Bell size={20} color={isDark ? '#e2e8f0' : '#334155'} />
            </Badge>
          </IconButton>

          {/* User Avatar & Menu */}
          <IconButton
            onClick={(e) => setUserMenuAnchor(e.currentTarget)}
            sx={{ p: 0.5 }}
          >
            <Avatar
              src={getMediaUrl(user?.avatarUrl)}
              sx={{
                bgcolor: '#0284c7',
                width: 36,
                height: 36,
                fontWeight: 700,
                fontSize: '0.85rem',
                border: isDark ? '2px solid #38bdf8' : 'none',
              }}
            >
              {user?.fullName?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>

      {/* User Profile Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            width: 240,
            borderRadius: '8px',
            mt: 1,
            boxShadow: isDark
              ? '0 10px 25px rgba(0,0,0,0.6)'
              : '0 10px 25px rgba(0,0,0,0.1)',
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            overflow: 'hidden',
            '& .MuiMenu-list': {
              padding: '0 !important',
            },
            '& .MuiDivider-root': {
              margin: '0 !important',
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {user?.fullName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {user?.email}
          </Typography>
        </Box>
        <Divider sx={{ margin: '0 !important' }} />
        <MenuItem
          onClick={() => {
            setUserMenuAnchor(null);
            onOpenProfile();
          }}
          sx={{
            gap: 1.25,
            m: '0 !important',
            borderRadius: 0,
            py: 1.25,
            px: 2,
            '&:hover': { bgcolor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#f0f9ff' },
          }}
        >
          <UserIcon size={16} color={isDark ? '#38bdf8' : '#0284c7'} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Thông Tin Cá Nhân
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            toggleTheme();
          }}
          sx={{
            gap: 1.25,
            m: '0 !important',
            borderRadius: 0,
            py: 1.25,
            px: 2,
            '&:hover': { bgcolor: isDark ? 'rgba(251, 191, 36, 0.12)' : '#fffbeb' },
          }}
        >
          {isDark ? (
            <Sun size={16} color="#fbbf24" />
          ) : (
            <Moon size={16} color="#0284c7" />
          )}
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {isDark ? 'Giao Diện: Tối (Bấm đổi Sáng)' : 'Giao Diện: Sáng (Bấm đổi Tối)'}
          </Typography>
        </MenuItem>
        <Divider sx={{ margin: '0 !important' }} />
        <MenuItem
          onClick={logout}
          sx={{
            color: '#ef4444',
            gap: 1.25,
            m: '0 !important',
            borderRadius: 0,
            py: 1.25,
            px: 2,
            '&:hover': { bgcolor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2' },
          }}
        >
          <LogOut size={16} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Đăng Xuất
          </Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};
