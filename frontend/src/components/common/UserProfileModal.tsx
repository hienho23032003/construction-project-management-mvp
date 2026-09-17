import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Avatar,
  Tabs,
  Tab,
  Chip,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { CommonButton, CommonInput } from './index';
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
  Camera,
  Upload,
  RefreshCw,
  Sun,
  Moon,
  Palette,
  Check,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useAppTheme } from '../../contexts/ThemeContext';
import { useTheme } from '@mui/material';
import { authApi } from '../../services/api/endpoints';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../utils/dateUtils';
import { getVietnamesePermission, getVietnameseRole } from '../../utils/permissionUtils';
import { getMediaUrl } from '../../utils/fileUtils';

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ open, onClose }) => {
  const { user, updateUser, permissions } = useAuth();
  const { mode, setMode, isDark } = useAppTheme();
  const theme = useTheme();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<number>(0);

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Local Avatar Preview State (only uploads when clicking "Lưu Thay Đổi")
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const cleanupPreview = () => {
    if (avatarPreviewUrl && avatarPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    setSelectedAvatarFile(null);
    setAvatarPreviewUrl(null);
  };

  const handleModalClose = () => {
    cleanupPreview();
    onClose();
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Vui lòng chỉ chọn tệp hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showError('Kích thước ảnh không được vượt quá 10MB.');
      return;
    }

    if (avatarPreviewUrl && avatarPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }

    const preview = URL.createObjectURL(file);
    setSelectedAvatarFile(file);
    setAvatarPreviewUrl(preview);
    showSuccess('Đã chọn ảnh đại diện. Vui lòng bấm "Lưu Thay Đổi" để lưu và cập nhật hệ thống.');
  };

  useEffect(() => {
    if (user && open) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setDepartment(user.department || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveTab(0);
      cleanupPreview();
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
      let latestUser = user;

      // 1. Upload avatar if user selected a new file
      if (selectedAvatarFile) {
        const avatarRes = await authApi.uploadAvatar(selectedAvatarFile);
        if (avatarRes.data.success && avatarRes.data.data) {
          latestUser = avatarRes.data.data;
        } else {
          showError(avatarRes.data.message || 'Tải ảnh đại diện lên thất bại.');
          setIsUpdatingProfile(false);
          return;
        }
      }

      // 2. Update text fields (fullName, phone, department, avatarUrl)
      const res = await authApi.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        department: department.trim() || undefined,
        avatarUrl: latestUser?.avatarUrl,
      });

      if (res.data.success && res.data.data) {
        latestUser = res.data.data;
      }

      if (latestUser) {
        updateUser(latestUser);
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        queryClient.invalidateQueries({ queryKey: ['employees'] });
        showSuccess('Cập nhật thông tin và ảnh đại diện thành công!');
        handleModalClose();
      } else {
        showError('Cập nhật thất bại.');
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
      showError('Mật khẩu xác nhận không khớp với mật khẩu mới.');
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
        setActiveTab(0);
        handleModalClose();
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

  const currentDisplayAvatar = avatarPreviewUrl || getMediaUrl(user.avatarUrl);

  return (
    <Dialog
      open={open}
      onClose={handleModalClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        },
      }}
    >
      {/* Header Banner */}
      <Box
        sx={{
          background: isDark
            ? 'linear-gradient(135deg, #0369a1 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          px: 3,
          py: 3,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarFileChange}
          accept="image/*, .jfif, .pjpeg, .pjp, .bmp, .png, .jpg, .jpeg, .webp"
          style={{ display: 'none' }}
        />

        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={currentDisplayAvatar}
            sx={{
              bgcolor: '#ffffff',
              color: '#0284c7',
              width: 64,
              height: 64,
              fontWeight: 800,
              fontSize: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              border: '2px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            {user.fullName?.charAt(0) || 'U'}
          </Avatar>
          <Tooltip title={selectedAvatarFile ? "Đã chọn ảnh mới (Chưa lưu)" : "Chọn ảnh đại diện"}>
            <IconButton
              size="small"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUpdatingProfile}
              sx={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                bgcolor: selectedAvatarFile ? '#16a34a' : '#ffffff',
                color: selectedAvatarFile ? '#ffffff' : '#0284c7',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                p: 0.6,
                '&:hover': { bgcolor: selectedAvatarFile ? '#15803d' : '#f0f9ff' },
              }}
            >
              <Camera size={14} />
            </IconButton>
          </Tooltip>
        </Box>

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
          onClick={handleModalClose}
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
      <Box sx={{ borderBottom: 1, borderColor: theme.palette.divider, bgcolor: isDark ? 'background.paper' : '#f8fafc', px: { xs: 1, sm: 2 } }}>
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
          <Tab icon={<Shield size={16} />} iconPosition="start" label="Quyền Hạn" />
          <Tab icon={<Palette size={16} />} iconPosition="start" label="Giao Diện" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {/* Tab 0: Profile info form */}
        {activeTab === 0 && (
          <form id="profile-form" onSubmit={handleUpdateProfile}>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <CommonInput
                  label="Họ và tên"
                  fullWidth
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  disabled={isUpdatingProfile}
                  startIcon={<UserIcon size={18} color={isDark ? '#38bdf8' : '#0284c7'} />}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <CommonInput
                  label="Số điện thoại"
                  fullWidth
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912..."
                  disabled={isUpdatingProfile}
                  startIcon={<Phone size={18} color={isDark ? '#38bdf8' : '#0284c7'} />}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <CommonInput
                  label="Phòng ban / Bộ phận"
                  fullWidth
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Ban chỉ huy, kỹ thuật..."
                  disabled={isUpdatingProfile}
                  startIcon={<Building size={18} color={isDark ? '#38bdf8' : '#0284c7'} />}
                />
              </Grid>

              <Grid item xs={12}>
                <CommonInput
                  label="Địa chỉ Email"
                  fullWidth
                  value={user.email}
                  disabled
                  helperText="Địa chỉ email là định danh tài khoản, không thể thay đổi."
                  startIcon={<Mail size={18} color="#94a3b8" />}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <CommonInput
                  label="Vai trò"
                  fullWidth
                  value={user.roleName || user.role}
                  disabled
                  startIcon={<Shield size={18} color="#94a3b8" />}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <CommonInput
                  label="Ngày tham gia"
                  fullWidth
                  value={formatDate(user.createdAt)}
                  disabled
                  startIcon={<Calendar size={18} color="#94a3b8" />}
                />
              </Grid>
            </Grid>
          </form>
        )}

        {/* Tab 1: Password change form */}
        {activeTab === 1 && (
          <form id="password-form" onSubmit={handleChangePassword}>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <CommonInput
                  label="Mật khẩu hiện tại"
                  isPassword
                  fullWidth
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu đang sử dụng..."
                  disabled={isChangingPassword}
                  startIcon={<Lock size={18} color={isDark ? '#38bdf8' : '#0284c7'} />}
                />
              </Grid>

              <Grid item xs={12}>
                <CommonInput
                  label="Mật khẩu mới"
                  isPassword
                  fullWidth
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ít nhất 6 ký tự..."
                  disabled={isChangingPassword}
                  helperText="Mật khẩu phải có độ dài tối thiểu 6 ký tự."
                  startIcon={<Key size={18} color={isDark ? '#38bdf8' : '#0284c7'} />}
                />
              </Grid>

              <Grid item xs={12}>
                <CommonInput
                  label="Xác nhận mật khẩu mới"
                  isPassword
                  fullWidth
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới..."
                  disabled={isChangingPassword}
                  error={Boolean(confirmPassword && newPassword !== confirmPassword)}
                  helperText={
                    confirmPassword && newPassword !== confirmPassword
                      ? 'Mật khẩu xác nhận không trùng khớp.'
                      : ''
                  }
                  startIcon={<CheckCircle2 size={18} color={isDark ? '#38bdf8' : '#0284c7'} />}
                />
              </Grid>
            </Grid>
          </form>
        )}

        {/* Tab 2: Permissions Overview */}
        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
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
                      sx={{ fontWeight: 600, bgcolor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#f0f9ff' }}
                    />
                  ))
                ) : (
                  <Chip
                    label={getVietnameseRole(user.roleName || user.role)}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600, bgcolor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#f0f9ff' }}
                  />
                )}
              </Box>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                Danh Sách Quyền Hạn ({permissions.length} quyền)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 220, overflowY: 'auto', p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                {permissions.map((p, i) => (
                  <Chip
                    key={i}
                    size="small"
                    label={getVietnamesePermission(p)}
                    icon={<CheckCircle2 size={13} color={isDark ? '#4ade80' : '#16a34a'} />}
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      bgcolor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4',
                      color: isDark ? '#4ade80' : '#15803d',
                      borderColor: isDark ? 'rgba(34, 197, 94, 0.3)' : '#bbf7d0',
                    }}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* Tab 3: Appearance & Theme Settings */}
        {activeTab === 3 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                Chủ Đề Giao Diện (Theme Mode)
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                Lựa chọn chế độ hiển thị phù hợp với môi trường làm việc của bạn.
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box
                  onClick={() => setMode('light')}
                  sx={{
                    p: 2.5,
                    borderRadius: '8px',
                    border: '2px solid',
                    borderColor: mode === 'light' ? '#0284c7' : 'divider',
                    bgcolor: mode === 'light' ? (isDark ? 'rgba(56, 189, 248, 0.08)' : '#f0f9ff') : 'background.paper',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    '&:hover': {
                      borderColor: '#0284c7',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '8px',
                          bgcolor: '#fef3c7',
                          color: '#d97706',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Sun size={22} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          Chế Độ Sáng (Light)
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Mặc định, rõ ràng
                        </Typography>
                      </Box>
                    </Box>
                    {mode === 'light' && (
                      <Box
                        sx={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          bgcolor: '#0284c7',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={14} strokeWidth={3} />
                      </Box>
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4 }}>
                    Giao diện sáng tiêu chuẩn, độ tương phản cao, tối ưu hiển thị dưới ánh sáng mạnh ngoài công trường.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box
                  onClick={() => setMode('dark')}
                  sx={{
                    p: 2.5,
                    borderRadius: '8px',
                    border: '2px solid',
                    borderColor: mode === 'dark' ? '#38bdf8' : 'divider',
                    bgcolor: mode === 'dark' ? (isDark ? 'rgba(56, 189, 248, 0.08)' : '#f0f9ff') : 'background.paper',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    '&:hover': {
                      borderColor: '#38bdf8',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '8px',
                          bgcolor: '#1e293b',
                          color: '#38bdf8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Moon size={22} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          Chế Độ Tối (Dark)
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Dịu mắt, tiết kiệm pin
                        </Typography>
                      </Box>
                    </Box>
                    {mode === 'dark' && (
                      <Box
                        sx={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          bgcolor: '#38bdf8',
                          color: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={14} strokeWidth={3} />
                      </Box>
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4 }}>
                    Tông màu Slate sẫm êm dịu, bảo vệ thị lực khi làm việc ban đêm hoặc trong điều kiện thiếu sáng.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between' }}>
        <CommonButton onClick={onClose} variant="secondary">
          Đóng
        </CommonButton>

        {activeTab === 0 && (
          <CommonButton
            type="submit"
            form="profile-form"
            variant="primary"
            loading={isUpdatingProfile}
          >
            Lưu Thay Đổi
          </CommonButton>
        )}

        {activeTab === 1 && (
          <CommonButton
            type="submit"
            form="password-form"
            variant="primary"
            loading={isChangingPassword}
          >
            Cập Nhật Mật Khẩu
          </CommonButton>
        )}
      </DialogActions>
    </Dialog>
  );
};
