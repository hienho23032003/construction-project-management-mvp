import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Avatar,
  Tabs,
  Tab,
  Chip,
  Grid,
  Divider,
  IconButton,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  User as UserIcon,
  Key,
  Shield,
  Phone,
  Mail,
  Building,
  Calendar,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/api/endpoints';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../utils/dateUtils';
import { getVietnamesePermission, getVietnameseRole } from '../../utils/permissionUtils';

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ open, onClose }) => {
  const { user, updateUser, permissions } = useAuth();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState<number>(0);

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user && open) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setDepartment(user.department || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveTab(0);
    }
  }, [user, open]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showError('Họ và tên không được để trống.');
      return;
    }

    try {
      setIsUpdatingProfile(true);
      const res = await authApi.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        department: department.trim() || undefined,
      });

      if (res.data.success && res.data.data) {
        updateUser(res.data.data);
        showSuccess('Cập nhật thông tin cá nhân thành công!');
        onClose();
      } else {
        showError(res.data.message || 'Cập nhật thất bại.');
      }
    } catch (err: any) {
      showError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi cập nhật.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showError('Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.');
      return;
    }

    if (newPassword.length < 6) {
      showError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await authApi.changePassword({
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        showSuccess('Đổi mật khẩu thành công!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      } else {
        showError(res.data.message || 'Đổi mật khẩu thất bại.');
      }
    } catch (err: any) {
      showError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* Header Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          p: 3,
          color: '#ffffff',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Avatar
          sx={{
            bgcolor: '#ffffff',
            color: '#0284c7',
            width: 60,
            height: 60,
            fontWeight: 800,
            fontSize: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {user.fullName?.charAt(0) || 'U'}
        </Avatar>

        <Box sx={{ minWidth: 0, flexGrow: 1, pr: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#ffffff', fontSize: '1.2rem' }}>
            {user.fullName}
          </Typography>
          <Typography variant="body2" sx={{ color: '#e0f2fe', fontSize: '0.85rem' }}>
            {user.email}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.75, flexWrap: 'wrap' }}>
            <Chip
              label={user.roleName || user.role}
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.22)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.72rem',
                backdropFilter: 'blur(4px)',
              }}
            />
            {user.department && (
              <Chip
                label={user.department}
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  color: '#e0f2fe',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                }}
              />
            )}
          </Box>
        </Box>

        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: 'rgba(255, 255, 255, 0.8)',
            '&:hover': { color: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.15)' },
          }}
        >
          <X size={20} />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: '#e2e8f0', bgcolor: '#f8fafc', px: { xs: 1, sm: 2 } }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              minHeight: 48,
              px: { xs: 1.5, sm: 2 },
              minWidth: 'auto',
              whiteSpace: 'nowrap',
              gap: 1,
            },
          }}
        >
          <Tab icon={<UserIcon size={16} />} iconPosition="start" label="Thông Tin Cá Nhân" />
          <Tab icon={<Key size={16} />} iconPosition="start" label="Đổi Mật Khẩu" />
          <Tab icon={<Shield size={16} />} iconPosition="start" label="Quyền Hạn & Vai Trò" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {/* Tab 0: Profile info form */}
        {activeTab === 0 && (
          <form id="profile-form" onSubmit={handleUpdateProfile}>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  label="Họ Và Tên"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  fullWidth
                  required
                  placeholder="Nhập họ và tên..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <UserIcon size={18} color="#64748b" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Số Điện Thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  fullWidth
                  placeholder="09xx xxx xxx"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone size={18} color="#64748b" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phòng Ban / Bộ Phận"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  fullWidth
                  placeholder="VD: Ban Quản Lý Hiện Trường..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Building size={18} color="#64748b" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Địa Chỉ Email (Đăng Nhập)"
                  value={user.email}
                  fullWidth
                  disabled
                  helperText="Địa chỉ email là định danh tài khoản và không thể tự thay đổi."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={18} color="#94a3b8" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {user.createdAt && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b', fontSize: '0.8rem' }}>
                    <Calendar size={15} />
                    <span>Ngày tham gia hệ thống: <strong>{formatDate(user.createdAt)}</strong></span>
                  </Box>
                </Grid>
              )}
            </Grid>
          </form>
        )}

        {/* Tab 1: Change Password */}
        {activeTab === 1 && (
          <form id="password-form" onSubmit={handleChangePassword}>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  label="Mật Khẩu Hiện Tại"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  fullWidth
                  required
                  placeholder="Nhập mật khẩu đang sử dụng..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={18} color="#64748b" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Mật Khẩu Mới"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  required
                  placeholder="Tối thiểu 6 ký tự..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Key size={18} color="#64748b" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowNewPassword(!showNewPassword)}>
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Xác Nhận Mật Khẩu Mới"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  required
                  error={Boolean(confirmPassword && newPassword !== confirmPassword)}
                  helperText={
                    confirmPassword && newPassword !== confirmPassword
                      ? 'Mật khẩu xác nhận không khớp'
                      : 'Nhập lại mật khẩu mới để đảm bảo chính xác.'
                  }
                  placeholder="Nhập lại mật khẩu mới..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CheckCircle2 size={18} color="#64748b" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </form>
        )}

        {/* Tab 2: Permissions Overview */}
        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                Các Vai Trò Được Gán
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((r, i) => (
                    <Chip
                      key={i}
                      label={getVietnameseRole(r)}
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600, bgcolor: '#f0f9ff' }}
                    />
                  ))
                ) : (
                  <Chip
                    label={getVietnameseRole(user.roleName || user.role)}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600, bgcolor: '#f0f9ff' }}
                  />
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                Danh Sách Quyền Hạn ({permissions.length})
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.75,
                  flexWrap: 'wrap',
                  maxHeight: 220,
                  overflowY: 'auto',
                  p: 1.5,
                  bgcolor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  '&::-webkit-scrollbar': { width: '5px' },
                  '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '4px' },
                }}
              >
                {permissions.length > 0 ? (
                  permissions.map((p, idx) => (
                    <Tooltip key={idx} title={`Mã quyền: ${p}`} arrow placement="top">
                      <Chip
                        label={getVietnamesePermission(p)}
                        size="small"
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          bgcolor: '#e0f2fe',
                          color: '#0369a1',
                          border: '1px solid #bae6fd',
                        }}
                      />
                    </Tooltip>
                  ))
                ) : (
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Tài khoản sử dụng quyền mặc định theo vai trò.
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between' }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Đóng
        </Button>

        {activeTab === 0 && (
          <Button
            type="submit"
            form="profile-form"
            variant="contained"
            disabled={isUpdatingProfile}
            sx={{ bgcolor: '#0284c7' }}
          >
            {isUpdatingProfile ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </Button>
        )}

        {activeTab === 1 && (
          <Button
            type="submit"
            form="password-form"
            variant="contained"
            disabled={isChangingPassword}
            sx={{ bgcolor: '#0284c7' }}
          >
            {isChangingPassword ? 'Đang đổi mật khẩu...' : 'Cập Nhật Mật Khẩu'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
