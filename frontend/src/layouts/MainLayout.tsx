import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { UserProfileModal } from '../components/common/UserProfileModal';
import { SidebarNav, EXPANDED_DRAWER_WIDTH, COLLAPSED_DRAWER_WIDTH } from './SidebarNav';
import { TopAppBar } from './TopAppBar';
import { NotificationPopover } from './NotificationPopover';
import { MobileBottomNav } from './MobileBottomNav';

export const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const toggleCollapse = () => setCollapsed(!collapsed);

  const currentDrawerWidth = isMobile
    ? EXPANDED_DRAWER_WIDTH
    : collapsed
    ? COLLAPSED_DRAWER_WIDTH
    : EXPANDED_DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex', height: '100vh', maxHeight: '100vh', bgcolor: '#f8fafc', width: '100vw', maxWidth: '100vw', overflow: 'hidden' }}>
      {/* Sidebar Navigation */}
      <SidebarNav
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        isMobile={isMobile}
        onDrawerToggle={handleDrawerToggle}
        onOpenProfile={() => setProfileOpen(true)}
      />

      {/* Main Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100vh',
          maxHeight: '100vh',
          width: { xs: '100%', md: `calc(100% - ${currentDrawerWidth}px)` },
          maxWidth: { xs: '100%', md: `calc(100% - ${currentDrawerWidth}px)` },
          transition: 'width 0.25s ease',
          overflow: 'hidden',
        }}
      >
        {/* Header Bar */}
        <TopAppBar
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
          onDrawerToggle={handleDrawerToggle}
          onOpenNotifications={(e) => setNotifAnchor(e.currentTarget)}
          onOpenProfile={() => setProfileOpen(true)}
        />

        {/* Notifications Popover */}
        <NotificationPopover
          anchorEl={notifAnchor}
          onClose={() => setNotifAnchor(null)}
        />

        {/* User Profile Modal */}
        <UserProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />

        {/* Page Outlet */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            height: 'calc(100vh - 64px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            p: { xs: 1.5, sm: 2.5, md: 3 },
            pb: { xs: 9, md: 3 },
            minWidth: 0,
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
        >
          <Outlet />
        </Box>

        {/* Mobile Bottom Navigation Bar */}
        <MobileBottomNav
          mobileOpen={mobileOpen}
          onDrawerToggle={handleDrawerToggle}
        />
      </Box>
    </Box>
  );
};
