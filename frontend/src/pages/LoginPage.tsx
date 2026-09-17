import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  BarChart3,
  ShieldCheck,
  Layers,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Award,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants';
import { CommonInput, CommonButton, CommonChip } from '../components/common';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

const DEMO_ACCOUNTS = [
  {
    role: 'Super Admin',
    email: 'admin@construction.com',
    password: 'Admin@123456',
    badgeColor: '#fee2e2',
    textColor: '#b91c1c',
    desc: 'Toàn quyền cấu hình & quản trị hệ thống',
  },
  {
    role: 'Project Manager',
    email: 'pm.viet@construction.com',
    password: 'Admin@123456',
    badgeColor: '#e0f2fe',
    textColor: '#0369a1',
    desc: 'Quản lý dự án, tiến độ & phân bổ công việc',
  },
  {
    role: 'Giám Sát (Supervisor)',
    email: 'sup.dung@construction.com',
    password: 'Admin@123456',
    badgeColor: '#ecfdf5',
    textColor: '#047857',
    desc: 'Giám sát công trường & duyệt báo cáo',
  },
  {
    role: 'Kỹ Sư (Engineer)',
    email: 'dev.hien@construction.com',
    password: 'Admin@123456',
    badgeColor: '#f1f5f9',
    textColor: '#334155',
    desc: 'Cập nhật tiến độ % & thực hiện task',
  },
];

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: 'admin@construction.com',
      password: 'Admin@123456',
      rememberMe: true,
    },
  });

  const onSubmit = async (formData: LoginFormData) => {
    setLoading(true);
    setError(null);

    const result = await login(formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      showSuccess(SUCCESS_MESSAGES.LOGIN_SUCCESS);
      navigate('/');
    } else {
      const msg = result.message || ERROR_MESSAGES.LOGIN_FAILED;
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
      showSuccess(SUCCESS_MESSAGES.LOGIN_SUCCESS);
      navigate('/');
    } else {
      const msg = result.message || ERROR_MESSAGES.LOGIN_FAILED;
      setError(msg);
      showError(msg);
    }
  };

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100vw', overflow: 'hidden', bgcolor: 'background.default' }}>
      {/* ======================================================== */}
      {/* LEFT COLUMN: 58% on desktop, hidden on mobile            */}
      {/* ======================================================== */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: { md: '56%', lg: '58%', xl: '60%' },
          flexShrink: 0,
          p: { md: 4.5, lg: 6, xl: 7 },
          background: 'linear-gradient(145deg, #075985 0%, #0369a1 40%, #0284c7 100%)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Decorative Background Glows */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Main Content Area */}
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 2.5, my: 'auto' }}>
          {/* Top Branding */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                p: 0.8,
                bgcolor: '#ffffff',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              }}
            >
              <Box
                component="img"
                src="https://www.fcbvn.vn/landing/logo.svg"
                alt="FCBVN Logo"
                sx={{ height: 32, objectFit: 'contain' }}
              />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', letterSpacing: '0.04em', lineHeight: 1.1 }}>
                FCB<span style={{ color: '#7dd3fc' }}>VN</span>
              </Typography>
              <Typography variant="caption" sx={{ color: '#bae6fd', fontWeight: 500, fontSize: '0.72rem' }}>
                Hệ Thống Quản Lý Thi Công & Dự Án
              </Typography>
            </Box>
          </Box>

          {/* Headline & Description */}
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: { md: '1.65rem', lg: '1.95rem', xl: '2.2rem' },
                lineHeight: 1.25,
                color: '#ffffff',
                mb: 1.2,
              }}
            >
              Nền Tảng Quản Lý Tiến Độ & Giám Sát Công Trình Chuẩn Quốc Tế
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#e0f2fe',
                fontSize: { md: '0.85rem', lg: '0.92rem' },
                lineHeight: 1.55,
                maxWidth: 680,
              }}
            >
              Tối ưu hóa quy trình phân rã cây công việc (WBS), theo dõi biểu đồ tiến độ Gantt tương tác đa tầng, tự động phát hiện trễ hạn và kiểm soát phân quyền chặt chẽ theo thời gian thực.
            </Typography>
          </Box>

          {/* Key Feature Highlights 3-Card Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { md: '1fr', lg: 'repeat(3, 1fr)' },
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                p: 1.8,
                borderRadius: '12px',
                bgcolor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', bgcolor: 'rgba(255, 255, 255, 0.16)' },
              }}
            >
              <Box sx={{ p: 0.7, borderRadius: '8px', bgcolor: 'rgba(56, 189, 248, 0.25)', color: '#38bdf8', width: 'fit-content', mb: 1 }}>
                <BarChart3 size={18} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem', mb: 0.3 }}>
                Tiến Độ Gantt Tương Tác
              </Typography>
              <Typography variant="caption" sx={{ color: '#bae6fd', fontSize: '0.72rem', lineHeight: 1.45, display: 'block' }}>
                Kéo thả timeline, tự động liên kết phụ thuộc và đường găng chính xác.
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.8,
                borderRadius: '12px',
                bgcolor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', bgcolor: 'rgba(255, 255, 255, 0.16)' },
              }}
            >
              <Box sx={{ p: 0.7, borderRadius: '8px', bgcolor: 'rgba(52, 211, 153, 0.25)', color: '#34d399', width: 'fit-content', mb: 1 }}>
                <Layers size={18} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem', mb: 0.3 }}>
                Cây Phân Rã WBS Đa Cấp
              </Typography>
              <Typography variant="caption" sx={{ color: '#bae6fd', fontSize: '0.72rem', lineHeight: 1.45, display: 'block' }}>
                Phân cấp hạng mục linh hoạt, phân bổ trọng số % và tính tiến độ tự động.
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.8,
                borderRadius: '12px',
                bgcolor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', bgcolor: 'rgba(255, 255, 255, 0.16)' },
              }}
            >
              <Box sx={{ p: 0.7, borderRadius: '8px', bgcolor: 'rgba(251, 191, 36, 0.25)', color: '#fbbf24', width: 'fit-content', mb: 1 }}>
                <ShieldCheck size={18} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem', mb: 0.3 }}>
                Bảo Mật & Phân Quyền
              </Typography>
              <Typography variant="caption" sx={{ color: '#bae6fd', fontSize: '0.72rem', lineHeight: 1.45, display: 'block' }}>
                Ma trận quyền hạn chi tiết cho SuperAdmin, PM, Giám Sát và Kỹ Sư.
              </Typography>
            </Box>
          </Box>

          {/* Live Construction Project Preview Widget */}
          <Box
            sx={{
              p: 2.2,
              borderRadius: '14px',
              bgcolor: 'rgba(15, 23, 42, 0.35)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            {/* Widget Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.8, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4ade80', boxShadow: '0 0 10px #4ade80' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem' }}>
                  Giám Sát Dự Án Trọng Điểm: <span style={{ color: '#7dd3fc' }}>FCB Tower Complex</span>
                </Typography>
              </Box>
              <Chip
                label="Tiến độ 76.5%"
                size="small"
                sx={{
                  bgcolor: 'rgba(14, 165, 233, 0.35)',
                  color: '#e0f2fe',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  height: 22,
                }}
              />
            </Box>

            {/* Gantt Timeline Mini Bars */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 2 }}>
              {/* Task 1 */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                  <Typography variant="caption" sx={{ color: '#e0f2fe', fontSize: '0.72rem', fontWeight: 600 }}>
                    1. Móng cọc cừ Larsen & Tường vây
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#4ade80', fontSize: '0.72rem', fontWeight: 700 }}>
                    100% (Đạt)
                  </Typography>
                </Box>
                <Box sx={{ width: '100%', height: 6, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ width: '100%', height: '100%', bgcolor: '#4ade80', borderRadius: 3 }} />
                </Box>
              </Box>

              {/* Task 2 */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                  <Typography variant="caption" sx={{ color: '#e0f2fe', fontSize: '0.72rem', fontWeight: 600 }}>
                    2. Kết cấu thân tầng 1 - tầng 18 (Đường găng)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#38bdf8', fontSize: '0.72rem', fontWeight: 700 }}>
                    82% (Đang thi công)
                  </Typography>
                </Box>
                <Box sx={{ width: '100%', height: 6, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ width: '82%', height: '100%', bgcolor: '#38bdf8', borderRadius: 3 }} />
                </Box>
              </Box>

              {/* Task 3 */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                  <Typography variant="caption" sx={{ color: '#e0f2fe', fontSize: '0.72rem', fontWeight: 600 }}>
                    3. Lắp đặt cơ điện MEP & Hoàn thiện mặt dựng
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#fbbf24', fontSize: '0.72rem', fontWeight: 700 }}>
                    45% (Đúng tiến độ)
                  </Typography>
                </Box>
                <Box sx={{ width: '100%', height: 6, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ width: '45%', height: '100%', bgcolor: '#fbbf24', borderRadius: 3 }} />
                </Box>
              </Box>
            </Box>

            {/* Micro Stats Counter Row */}
            <Box
              sx={{
                pt: 1.5,
                borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 1,
                textAlign: 'center',
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1 }}>
                  56
                </Typography>
                <Typography variant="caption" sx={{ color: '#bae6fd', fontSize: '0.65rem' }}>
                  Hạng mục WBS
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1 }}>
                  24
                </Typography>
                <Typography variant="caption" sx={{ color: '#bae6fd', fontSize: '0.65rem' }}>
                  Kỹ sư / Giám sát
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: '#4ade80', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1 }}>
                  0
                </Typography>
                <Typography variant="caption" sx={{ color: '#bae6fd', fontSize: '0.65rem' }}>
                  Hạng mục trễ hạn
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: '#facc15', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1 }}>
                  100%
                </Typography>
                <Typography variant="caption" sx={{ color: '#bae6fd', fontSize: '0.65rem' }}>
                  Nhật ký số hóa
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Quick Metrics & Commitments Bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pt: 1.5,
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <TrendingUp size={16} color="#38bdf8" />
              <Typography variant="caption" sx={{ color: '#e0f2fe', fontWeight: 600, fontSize: '0.78rem' }}>
                Hiệu suất tăng 40%
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <CheckCircle2 size={16} color="#34d399" />
              <Typography variant="caption" sx={{ color: '#e0f2fe', fontWeight: 600, fontSize: '0.78rem' }}>
                Kiểm soát 100% trễ hạn
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Award size={16} color="#fbbf24" />
              <Typography variant="caption" sx={{ color: '#e0f2fe', fontWeight: 600, fontSize: '0.78rem' }}>
                Chuẩn PMBOK & Agile
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <ShieldCheck size={16} color="#a78bfa" />
              <Typography variant="caption" sx={{ color: '#e0f2fe', fontWeight: 600, fontSize: '0.78rem' }}>
                Bảo Mật RBAC 256-Bit
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Bottom copyright in Left Panel */}
        <Box sx={{ position: 'relative', zIndex: 1, pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem' }}>
            © 2026 FCBVN Construction Management System. Phiên bản Doanh Nghiệp 2.0
          </Typography>
          <Typography variant="caption" sx={{ color: '#7dd3fc', fontWeight: 600, fontSize: '0.75rem' }}>
            Design by Phạm Thế Hiển
          </Typography>
        </Box>
      </Box>

      {/* ======================================================== */}
      {/* RIGHT COLUMN: 42% on desktop, 100% on mobile             */}
      {/* ======================================================== */}
      <Box
        sx={{
          width: { xs: '100%', md: '44%', lg: '42%', xl: '40%' },
          flexGrow: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 5, md: 4, lg: 5 },
          bgcolor: 'background.paper',
          borderLeft: { md: '1px solid' },
          borderColor: 'divider',
          overflowY: 'auto',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 440,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Mobile Brand Header */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box
              component="img"
              src="https://www.fcbvn.vn/landing/logo.svg"
              alt="FCBVN Logo"
              sx={{ height: 38, objectFit: 'contain' }}
            />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.1 }}>
                FCB<span style={{ color: '#0284c7' }}>VN</span>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                Quản Lý Thi Công & Dự Án
              </Typography>
            </Box>
          </Box>

          {/* Form Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', sm: '1.6rem' }, color: 'text.primary' }}>
              Đăng Nhập Hệ Thống
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontSize: '0.875rem' }}>
              Chào mừng bạn trở lại! Nhập thông tin tài khoản để tiếp tục làm việc.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '8px', fontSize: '0.85rem' }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}
          >
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Vui lòng nhập địa chỉ email',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Địa chỉ email không đúng định dạng',
                },
              }}
              render={({ field }) => (
                <CommonInput
                  {...field}
                  label="Email công việc"
                  type="email"
                  fullWidth
                  required
                  placeholder="name@construction.com"
                  error={errors.email?.message}
                  disabled={loading}
                  startAdornment={
                    <InputAdornment position="start">
                      <Mail size={18} color={isDark ? '#b0b3b8' : '#64748b'} />
                    </InputAdornment>
                  }
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              rules={{ required: 'Vui lòng nhập mật khẩu' }}
              render={({ field }) => (
                <CommonInput
                  {...field}
                  label="Mật khẩu"
                  isPassword
                  fullWidth
                  required
                  placeholder="Nhập mật khẩu..."
                  error={errors.password?.message}
                  disabled={loading}
                  startAdornment={
                    <InputAdornment position="start">
                      <Lock size={18} color={isDark ? '#b0b3b8' : '#64748b'} />
                    </InputAdornment>
                  }
                />
              )}
            />

            {/* Remember Me & Forgot Password */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Controller
                name="rememberMe"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        size="small"
                        sx={{ color: '#2d88ff', '&.Mui-checked': { color: '#2d88ff' } }}
                      />
                    }
                    label={<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Ghi nhớ đăng nhập</Typography>}
                    sx={{ userSelect: 'none' }}
                  />
                )}
              />
              <Typography
                variant="caption"
                sx={{
                  color: isDark ? '#2d88ff' : '#0284c7',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  '&:hover': { textDecoration: 'underline' },
                }}
                onClick={() => showSuccess('Vui lòng liên hệ Quản trị viên để đặt lại mật khẩu.')}
              >
                Quên mật khẩu?
              </Typography>
            </Box>

            {/* Submit Button */}
            <CommonButton
              type="submit"
              variant="primary"
              size="large"
              loading={loading}
              loadingText="Đang xác thực..."
              startIcon={<LogIn size={18} />}
              sx={{
                py: 1.3,
                fontSize: '0.95rem',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                '&:hover': { bgcolor: '#0369a1' },
                textTransform: 'none',
              }}
            >
              {loading ? 'Đang Xác Thực...' : 'Đăng Nhập'}
            </CommonButton>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Chip
              icon={<Sparkles size={13} color="#0284c7" />}
              label="Tài Khoản Mẫu Trải Nghiệm Nhanh"
              size="small"
              sx={{
                fontWeight: 600,
                color: isDark ? '#2d88ff' : '#0284c7',
                bgcolor: isDark ? '#18191a' : '#f0f9ff',
                border: '1px solid',
                borderColor: isDark ? '#3a3b3c' : '#bae6fd',
                fontSize: '0.75rem',
                px: 0.5,
              }}
            />
          </Divider>

          {/* Quick Demo Login 2x2 Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2 }}>
            {DEMO_ACCOUNTS.map((acc) => (
              <Tooltip key={acc.email} title={`${acc.desc} (${acc.email})`} arrow placement="top">
                <Box
                  onClick={() => handleQuickLogin(acc.email, acc.password)}
                  sx={{
                    p: 1.2,
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: isDark ? '#18191a' : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    '&:hover': {
                      bgcolor: isDark ? '#3a3b3c' : '#f0f9ff',
                      borderColor: '#2d88ff',
                      transform: 'translateY(-1px)',
                      boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.5)' : '0 2px 6px rgba(2, 132, 199, 0.1)',
                    },
                  }}
                >
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.primary' }} noWrap>
                      {acc.role}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'block' }} noWrap>
                      {acc.email.split('@')[0]}
                    </Typography>
                  </Box>
                  <Chip
                    label="Demo"
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      bgcolor: isDark ? '#3a3b3c' : acc.badgeColor,
                      color: isDark ? '#e4e6eb' : acc.textColor,
                      borderRadius: '4px',
                    }}
                  />
                </Box>
              </Tooltip>
            ))}
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: '0.72rem' }}>
              © 2026 FCBVN Management System
            </Typography>
            <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 600, display: 'block', mt: 0.3, fontSize: '0.72rem' }}>
              Design by Phạm Thế Hiển
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
