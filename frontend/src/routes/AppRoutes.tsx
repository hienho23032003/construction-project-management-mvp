import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermission } from '../hooks/usePermission';
import { ROUTERS_PATHS } from '../constants/router-paths';
import { MainLayout } from '../layouts/MainLayout';
import { Box, CircularProgress } from '@mui/material';
import { LoginPage, protectedChildRoutes, ForbiddenPage, prefetchRoutes } from './routes.config';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      prefetchRoutes();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTERS_PATHS.LOGIN} replace />;
  }

  return <>{children}</>;
};

interface PermissionGuardProps {
  permission?: string;
  children: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ permission, children }) => {
  const { can, isSuperAdmin } = usePermission();

  if (!permission || isSuperAdmin || can(permission)) {
    return <>{children}</>;
  }

  return <ForbiddenPage />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path={ROUTERS_PATHS.LOGIN} element={<LoginPage />} />

        <Route
          path={ROUTERS_PATHS.HOME}
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {protectedChildRoutes.map((route, idx) => {
            const Component = route.component;
            const element = route.permission ? (
              <PermissionGuard permission={route.permission}>
                <Component />
              </PermissionGuard>
            ) : (
              <Component />
            );

            if (route.index) {
              return <Route key="route-index" index element={element} />;
            }

            return <Route key={route.path || `route-${idx}`} path={route.path} element={element} />;
          })}
        </Route>

        <Route path={ROUTERS_PATHS.ALL} element={<Navigate to={ROUTERS_PATHS.HOME} replace />} />
      </Routes>
    </Suspense>
  );
};
