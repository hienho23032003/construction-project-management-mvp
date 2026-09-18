import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { vi } from 'date-fns/locale/vi';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ChatProvider } from './contexts/ChatContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppRoutes } from './routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 30_000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContextProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
          <ToastProvider>
            <AuthProvider>
              <NotificationProvider>
                <ChatProvider>
                  <BrowserRouter>
                    <AppRoutes />
                  </BrowserRouter>
                </ChatProvider>
              </NotificationProvider>
            </AuthProvider>
          </ToastProvider>
        </LocalizationProvider>
      </ThemeContextProvider>
    </QueryClientProvider>
  );
};

export default App;
