import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, useTheme } from '@mui/material';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Menu as MenuIcon,
} from 'lucide-react';
import { useAppTheme } from '../contexts/ThemeContext';
import { ROUTERS_PATHS } from '../constants/router-paths';

interface MobileBottomNavProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}

const navItems = [
  { text: 'Tổng Quan', icon: LayoutDashboard, path: ROUTERS_PATHS.DASHBOARD },
  { text: 'Dự Án', icon: FolderKanban, path: ROUTERS_PATHS.PROJECTS },
  { text: 'Tasks', icon: CheckSquare, path: ROUTERS_PATHS.TASKS },
  { text: 'Gantt', icon: BarChart3, path: ROUTERS_PATHS.GANTT },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  mobileOpen,
  onDrawerToggle,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { isDark } = useAppTheme();

  return (
    <Box
      sx={{
        display: { xs: 'flex', md: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        bgcolor: 'background.paper',
        borderTop: `1px solid ${theme.palette.divider}`,
        boxShadow: isDark
          ? '0 -4px 16px rgba(0,0,0,0.5)'
          : '0 -4px 16px rgba(0,0,0,0.06)',
        zIndex: 1050,
        alignItems: 'center',
        justifyContent: 'space-around',
        px: 1,
      }}
    >
      {navItems.map((item) => {
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
              color: isActive ? (isDark ? '#38bdf8' : '#0284c7') : isDark ? '#94a3b8' : '#64748b',
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
        onClick={onDrawerToggle}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          py: 0.5,
          px: 1.5,
          borderRadius: '8px',
          color: mobileOpen ? (isDark ? '#38bdf8' : '#0284c7') : isDark ? '#94a3b8' : '#64748b',
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
  );
};
