import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import { LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: 'admin@construction.com',
      password: 'Admin@123456',
    },
  });

  const onSubmit = async (formData: LoginFormData) => {
    setLoading(true);
    setError(null);

    const result = await login(formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      showSuccess('Đăng nhập thành công! Chào mừng trở lại.');
      navigate('/');
    } else {
      const msg = result.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.';
      setError(msg);
      showError(msg);
    }
  };

  const handleQuickLogin = async (quickEmail: string, quickPass: string) => {
    setValue('email', quickEmail);
    setValue('password', quickPass);
    setLoading(true);
    setError(null);

    const result = await login(quickEmail, quickPass);
    setLoading(false);

    if (result.success) {
      showSuccess('Đăng nhập thành công! Chào mừng trở lại.');
      navigate('/');
    } else {
      const msg = result.message || 'Đăng nhập nhanh thất bại.';
      setError(msg);
      showError(msg);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(2, 132, 199, 0.15), transparent 70%)',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: 440,
          borderRadius: '8px',
          p: { xs: 3, sm: 4 },
          bgcolor: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            component="img"
            src="https://www.fcbvn.vn/landing/logo.svg"
            alt="FCBVN Logo"
            sx={{
              height: 48,
              maxWidth: 180,
              objectFit: 'contain',
              mb: 1.5,
              display: 'inline-block',
            }}
          />
          <Typography variant="h2" sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#0f172a' }}>
            HỆ THỐNG QUẢN LÝ THI CÔNG
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Quản lý Dự Án, Công Việc & Tiến Độ Gantt — FCBVN
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '8px' }}>
            {error}
          </Alert>
        )}

        {/* Login Form with react-hook-form */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Controller
            name="email"
            control={control}
            rules={{
              required: 'Trường này là bắt buộc',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Địa chỉ email không hợp lệ',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                fullWidth
                required
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                disabled={loading}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={{ required: 'Trường này là bắt buộc' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Mật khẩu"
                type="password"
                fullWidth
                required
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                disabled={loading}
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LogIn size={18} />}
            sx={{
              mt: 1,
              py: 1.3,
              fontSize: '0.95rem',
              fontWeight: 700,
              bgcolor: '#0284c7',
              '&:hover': { bgcolor: '#0369a1' },
            }}
          >
            {loading ? 'Đang Đăng Nhập...' : 'Đăng Nhập'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Chip label="Tài Khoản Mẫu Trải Nghiệm" size="small" sx={{ fontWeight: 600, color: '#64748b' }} />
        </Divider>

        {/* Quick Demo Login Accounts */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleQuickLogin('admin@construction.com', 'Admin@123456')}
            sx={{ textTransform: 'none', py: 0.8, fontSize: '0.75rem', fontWeight: 600 }}
          >
            Super Admin
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleQuickLogin('pm.viet@construction.com', 'Admin@123456')}
            sx={{ textTransform: 'none', py: 0.8, fontSize: '0.75rem', fontWeight: 600 }}
          >
            Project Manager
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleQuickLogin('sup.dung@construction.com', 'Admin@123456')}
            sx={{ textTransform: 'none', py: 0.8, fontSize: '0.75rem', fontWeight: 600 }}
          >
            Giám Sát (Supervisor)
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleQuickLogin('dev.hien@construction.com', 'Admin@123456')}
            sx={{ textTransform: 'none', py: 0.8, fontSize: '0.75rem', fontWeight: 600 }}
          >
            Kỹ Sư (Employee)
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
