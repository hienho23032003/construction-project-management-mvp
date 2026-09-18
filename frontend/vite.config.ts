import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5047',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5047',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled', '@mui/x-date-pickers'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-charts': ['recharts', 'lucide-react'],
          'vendor-date': ['date-fns'],
        },
      },
    },
  },
});
