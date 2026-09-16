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
} from '@mui/material';
import {
  Menu as MenuIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { getMediaUrl } from '../utils/fileUtils';

const titleMap: Record<string, string> = {
  '/': 'Tổng Quan',
  '/projects': 'Công Trình & Dự Án',
  '/tasks': 'Công Việc',
  '/gantt': 'Tiến Độ Gantt',
  '/employees': 'Nhân Sự & Workload',
  '/reports': 'Báo Cáo & Xuất Dữ Liệu',
  '/roles': 'Phân Quyền & Vai Trò',
  '/login-history': 'Lịch Sử Đăng Nhập',
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
  const location = useLocation();

  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const currentTitle =
    titleMap[location.pathname] ||
    Object.entries(titleMap).find(([path]) => path !== '/' && location.pathname.startsWith(path))?.[1] ||
    'FCBVN — Quản Lý Thi Công';

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        flexShrink: 0,
        bgcolor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderRadius: 0,
        color: '#0f172a',
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
              sx={{ display: { xs: 'none', md: 'inline-flex' }, color: '#475569' }}
            >
              {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </IconButton>
          </Tooltip>

          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.15rem' } }}>
            {currentTitle}
          </Typography>
        </Box>

        {/* Right Action Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Notification Button */}
          <IconButton
            onClick={onOpenNotifications}
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
            <Avatar
              src={getMediaUrl(user?.avatarUrl)}
              sx={{ bgcolor: '#0284c7', width: 36, height: 36, fontWeight: 700, fontSize: '0.85rem' }}
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
            width: 230,
            borderRadius: '8px',
            mt: 1,
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            '& .MuiMenu-list': {
              padding: '0 !important',
              paddingTop: '0 !important',
              paddingBottom: '0 !important',
            },
            '& .MuiDivider-root': {
              margin: '0 !important',
              marginTop: '0 !important',
              marginBottom: '0 !important',
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, bgcolor: '#ffffff' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
            {user?.fullName}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            {user?.email}
          </Typography>
        </Box>
        <Divider sx={{ margin: '0 !important', my: '0 !important' }} />
        <MenuItem
          onClick={() => {
            setUserMenuAnchor(null);
            onOpenProfile();
          }}
          sx={{
            gap: 1.25,
            m: '0 !important',
            my: '0 !important',
            borderRadius: 0,
            py: 1.25,
            px: 2,
            '&:hover': { bgcolor: '#f0f9ff' },
          }}
        >
          <UserIcon size={16} color="#0284c7" />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Thông Tin Cá Nhân
          </Typography>
        </MenuItem>
        <Divider sx={{ margin: '0 !important', my: '0 !important' }} />
        <MenuItem
          onClick={logout}
          sx={{
            color: '#ef4444',
            gap: 1.25,
            m: '0 !important',
            my: '0 !important',
            borderRadius: 0,
            py: 1.25,
            px: 2,
            '&:hover': { bgcolor: '#fef2f2' },
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
