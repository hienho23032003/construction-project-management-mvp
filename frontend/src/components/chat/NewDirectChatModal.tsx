import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  IconButton,
  Chip,
  CircularProgress,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { User } from '../../types';
import { userApi } from '../../services/api/endpoints';
import { useAuth } from '../../contexts/AuthContext';

interface NewDirectChatModalProps {
  open: boolean;
  onClose: () => void;
  onSelectUser: (userId: string) => void;
}

export const NewDirectChatModal: React.FC<NewDirectChatModalProps> = ({
  open,
  onClose,
  onSelectUser,
}) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setSearch('');
      setLoading(true);
      userApi.getAllList()
        .then((res) => {
          if (res.data.success && res.data.data) {
            // Filter out current logged in user
            setUsers(res.data.data.filter((u) => u.id !== currentUser?.id));
          }
        })
        .catch((err) => console.error('Failed to load users:', err))
        .finally(() => setLoading(false));
    }
  }, [open, currentUser?.id]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q)) ||
        (u.roleName && u.roleName.toLowerCase().includes(q))
    );
  }, [users, search]);

  const handleUserClick = (userId: string) => {
    onSelectUser(userId);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Tìm kiếm người dùng & Chat 1-1
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        {/* Search Field */}
        <TextField
          fullWidth
          autoFocus
          size="small"
          placeholder="Nhập tên nhân sự, email, phòng ban..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
              backgroundColor: 'background.default',
            },
          }}
        />

        {/* Users List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">Không tìm thấy người dùng phù hợp.</Typography>
          </Box>
        ) : (
          <List dense disablePadding sx={{ maxHeight: 360, overflowY: 'auto' }}>
            {filteredUsers.map((u) => (
              <ListItemButton
                key={u.id}
                onClick={() => handleUserClick(u.id)}
                sx={{
                  borderRadius: 2,
                  mb: 0.75,
                  p: 1.25,
                  border: '1px solid transparent',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    borderColor: 'primary.light',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar src={u.avatarUrl} sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontWeight: 600 }}>
                    {u.fullName.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={700}>
                        {u.fullName}
                      </Typography>
                      {u.department && (
                        <Chip label={u.department} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {u.roleName || u.role} • {u.email}
                    </Typography>
                  }
                />
                <IconButton size="small" color="primary" sx={{ ml: 1 }}>
                  <ChatIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};
