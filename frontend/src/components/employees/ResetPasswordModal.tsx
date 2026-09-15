import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Typography,
  Box,
  InputAdornment,
  Alert,
  Tooltip,
} from '@mui/material';
import { X, KeyRound, Eye, EyeOff, RefreshCw, Copy, Check } from 'lucide-react';
import { User } from '../../types';

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (userId: string, newPassword: string) => Promise<void>;
  user: User | null;
  isSubmitting?: boolean;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  open,
  onClose,
  onSubmit,
  user,
  isSubmitting = false,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRandomPassword = () => {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghjkmnpqrstuvwxyz';
    const numbers = '23456789';
    const special = '@#$%&*';
    const all = uppercase + lowercase + numbers + special;

    let pwd = '';
    pwd += uppercase[Math.floor(Math.random() * uppercase.length)];
    pwd += lowercase[Math.floor(Math.random() * lowercase.length)];
    pwd += numbers[Math.floor(Math.random() * numbers.length)];
    pwd += special[Math.floor(Math.random() * special.length)];

    for (let i = 0; i < 6; i++) {
      pwd += all[Math.floor(Math.random() * all.length)];
    }
    // Shuffle
    const shuffled = pwd.split('').sort(() => 0.5 - Math.random()).join('');
    setNewPassword(shuffled);
    setError(null);
  };

  const handleCopy = () => {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setNewPassword('');
    setError(null);
    setCopied(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newPassword || newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    setError(null);
    await onSubmit(user.id, newPassword);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.15)',
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                backgroundColor: 'warning.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'warning.dark',
              }}
            >
              <KeyRound size={20} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Đặt lại mật khẩu
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cập nhật mật khẩu đăng nhập mới cho tài khoản
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} disabled={isSubmitting} size="small">
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {user && (
            <Box
              sx={{
                p: 2,
                mb: 3,
                mt: 1,
                borderRadius: 2,
                backgroundColor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                {user.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: <strong>{user.email}</strong>
              </Typography>
              {user.department && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Phòng ban: {user.department}
                </Typography>
              )}
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Mật khẩu mới <span style={{ color: 'red' }}>*</span>
          </Typography>

          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
            disabled={isSubmitting}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshCw size={15} />}
              onClick={generateRandomPassword}
              disabled={isSubmitting}
              sx={{ textTransform: 'none', borderRadius: 1.5 }}
            >
              Tạo mật khẩu ngẫu nhiên
            </Button>
            {newPassword && (
              <Tooltip title={copied ? 'Đã sao chép!' : 'Sao chép mật khẩu'}>
                <Button
                  variant="outlined"
                  size="small"
                  color={copied ? 'success' : 'inherit'}
                  startIcon={copied ? <Check size={15} /> : <Copy size={15} />}
                  onClick={handleCopy}
                  sx={{ textTransform: 'none', borderRadius: 1.5 }}
                >
                  {copied ? 'Đã sao chép' : 'Sao chép'}
                </Button>
              </Tooltip>
            )}
          </Box>

          <Alert severity="info" sx={{ mt: 2.5 }}>
            Sau khi đặt lại, nhân viên sẽ cần sử dụng mật khẩu mới này để đăng nhập vào hệ thống.
          </Alert>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: 1,
          }}
        >
          <Button onClick={handleClose} disabled={isSubmitting} sx={{ textTransform: 'none' }}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting || !newPassword}
            sx={{ textTransform: 'none', fontWeight: 600, px: 3, borderRadius: 2 }}
          >
            {isSubmitting ? 'Đang lưu...' : 'Xác nhận đặt lại'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
