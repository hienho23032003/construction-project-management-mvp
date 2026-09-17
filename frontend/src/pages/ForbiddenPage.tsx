import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import { ArrowUpRight, Lock, Send, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleSendRequest = () => {
    setRequestModalOpen(false);
    setRequestReason('');
    setToastMessage('Yêu cầu cấp quyền của bạn đã được gửi thành công tới Quản trị viên!');
    setToastOpen(true);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Negative margins to completely cancel MainLayout padding and make grid background full-bleed
        m: { xs: -1.5, sm: -2.5, md: -3 },
        mt: { xs: -1.5, sm: -2.5, md: -3 },
        mb: { xs: -9, md: -3 },
        width: {
          xs: 'calc(100% + 24px)',
          sm: 'calc(100% + 40px)',
          md: 'calc(100% + 48px)',
        },
        minHeight: 'calc(100vh - 64px)',
        height: '100%',
        p: { xs: 2, sm: 4 },
        overflow: 'hidden',
        bgcolor: '#ffffff',
        // Subtle grid background matching the screenshot
        backgroundImage: `
          linear-gradient(to right, rgba(226, 232, 240, 0.6) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(226, 232, 240, 0.6) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        backgroundPosition: 'center center',
      }}
    >
      {/* Soft Radial Ambient Glow */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: 320, sm: 540 },
          height: { xs: 320, sm: 540 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(243, 232, 255, 0.04) 50%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Main Content Container */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 620,
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 4,
          px: { xs: 2, sm: 3 },
        }}
      >
        {/* Concentric Circle Lock Badge */}
        <Box
          sx={{
            position: 'relative',
            width: { xs: 84, sm: 96 },
            height: { xs: 84, sm: 96 },
            borderRadius: '50%',
            bgcolor: 'rgba(238, 242, 255, 0.85)',
            border: '8px solid rgba(245, 243, 255, 0.9)',
            boxShadow: '0 0 0 1px rgba(199, 210, 254, 0.5), 0 12px 28px -4px rgba(99, 102, 241, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            '&:hover': {
              transform: 'scale(1.04)',
              boxShadow: '0 0 0 1px rgba(165, 180, 252, 0.8), 0 16px 36px -4px rgba(99, 102, 241, 0.25)',
            },
          }}
        >
          <Box
            sx={{
              width: { xs: 52, sm: 60 },
              height: { xs: 52, sm: 60 },
              borderRadius: '50%',
              bgcolor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid #e0e7ff',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.1)',
            }}
          >
            {/* Custom Styled Padlock Icon */}
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={26} color="#6366f1" strokeWidth={2.4} />
            </Box>
          </Box>
        </Box>

        {/* Heading in Vietnamese */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '1.65rem', sm: '2.15rem' },
            fontWeight: 800,
            color: 'text.primary',
            letterSpacing: '-0.025em',
            mb: 1.5,
            lineHeight: 1.2,
          }}
        >
          Truy Cập Bị Từ Chối
        </Typography>

        {/* Subtitle / Description in Vietnamese */}
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            fontSize: { xs: '0.9rem', sm: '1.025rem' },
            lineHeight: 1.6,
            maxWidth: 520,
            mb: 3.5,
          }}
        >
          Bạn không có quyền truy cập vào trang này. Nếu bạn cho rằng đây là sự nhầm lẫn, vui lòng liên hệ với quản trị viên hệ thống.
        </Typography>

        {/* Action Buttons with explicit whitespace nowrap and balanced width */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            width: '100%',
            maxWidth: 480,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Back to Dashboard Button (Outline) - No word wrap */}
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
            endIcon={<ArrowUpRight size={16} strokeWidth={2.2} />}
            sx={{
              whiteSpace: 'nowrap',
              width: { xs: '100%', sm: 'auto' },
              minWidth: { xs: '100%', sm: 200 },
              py: 1.2,
              px: 2.5,
              bgcolor: 'background.paper',
              color: 'text.primary',
              border: '1.5px solid',
              borderColor: 'divider',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'primary.main',
              },
            }}
          >
            Quay lại Dashboard
          </Button>

          {/* Request Access Button (Solid Purple/Indigo) - No word wrap */}
          <Button
            variant="contained"
            onClick={() => setRequestModalOpen(true)}
            startIcon={<Send size={15} />}
            sx={{
              whiteSpace: 'nowrap',
              width: { xs: '100%', sm: 'auto' },
              minWidth: { xs: '100%', sm: 190 },
              py: 1.2,
              px: 2.5,
              bgcolor: '#0284c7',
              color: '#ffffff',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
              '&:hover': {
                bgcolor: '#0369a1',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
              },
            }}
          >
            Yêu Cầu Cấp Quyền
          </Button>
        </Stack>

        {/* User context & secondary actions */}
        <Box
          sx={{
            mt: 4,
            pt: 2.5,
            borderTop: '1px dashed',
            borderColor: 'divider',
            width: '100%',
            maxWidth: 480,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
            Đang đăng nhập với tài khoản:{' '}
            <strong style={{ color: 'inherit' }}>{user?.fullName || user?.email || 'N/A'}</strong>
            {user?.role ? ` (${user.role})` : ''}
          </Typography>

          <Button
            size="small"
            variant="text"
            startIcon={<LogOut size={14} />}
            onClick={logout}
            sx={{
              color: 'text.secondary',
              fontSize: '0.8rem',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { color: '#ef4444', bgcolor: 'transparent' },
            }}
          >
            Đổi tài khoản khác (Đăng xuất)
          </Button>
        </Box>
      </Box>

      {/* Request Access Dialog */}
      <Dialog
        open={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.15rem', pb: 1, color: 'text.primary' }}>
          Gửi Yêu Cầu Cấp Quyền
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
            Hệ thống sẽ gửi thông báo trực tiếp tới <strong>Quản Trị Viên (SuperAdmin)</strong> kèm thông tin tài khoản của bạn để xét duyệt quyền truy cập.
          </Typography>
          <TextField
            label="Lý do / Hạng mục cần cấp quyền"
            multiline
            rows={3}
            fullWidth
            placeholder="Ví dụ: Tôi cần quyền truy cập để quản lý tiến độ công trình SkyTower..."
            value={requestReason}
            onChange={(e) => setRequestReason(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setRequestModalOpen(false)}
            sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSendRequest}
            startIcon={<Send size={15} />}
            sx={{
              bgcolor: '#0284c7',
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '8px',
              '&:hover': { bgcolor: '#0369a1' },
            }}
          >
            Gửi Yêu Cầu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast feedback */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="success"
          icon={<CheckCircle2 size={18} />}
          sx={{
            width: '100%',
            fontWeight: 600,
            borderRadius: '8px',
            bgcolor: '#0f172a',
            color: '#ffffff',
            '& .MuiAlert-icon': { color: '#4ade80' },
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
