import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Box,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
} from '@mui/material';
import { GroupAdd as GroupAddIcon } from '@mui/icons-material';
import { User, Project } from '../../types';
import { userApi, projectApi, chatApi } from '../../services/api/endpoints';

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newConversationId: string) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState<string>('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle('');
      setProjectId('');
      setSelectedUserIds([]);
      setError(null);
      setLoading(true);

      Promise.all([userApi.getAllList(), projectApi.getAllList()])
        .then(([userRes, projRes]) => {
          if (userRes.data.success && userRes.data.data) setUsers(userRes.data.data);
          if (projRes.data.success && projRes.data.data) setProjects(projRes.data.data);
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Vui lòng nhập tên nhóm.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await chatApi.createGroupChat({
        title: title.trim(),
        projectId: projectId ? projectId : undefined,
        memberIds: selectedUserIds,
      });

      if (res.data.success && res.data.data) {
        onSuccess(res.data.data.id);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tạo nhóm trò chuyện.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
        <GroupAddIcon color="primary" /> Tạo nhóm trò chuyện mới
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {error && (
              <Typography variant="body2" color="error" sx={{ backgroundColor: 'error.light', p: 1.5, borderRadius: 1 }}>
                {error}
              </Typography>
            )}

            <TextField
              label="Tên nhóm trò chuyện"
              placeholder="VD: Đội Kỹ Thuật Tầng 3, Nhóm Vật Tư..."
              fullWidth
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <FormControl fullWidth>
              <InputLabel>Gắn với Dự án (Tùy chọn)</InputLabel>
              <Select
                value={projectId}
                label="Gắn với Dự án (Tùy chọn)"
                onChange={(e) => setProjectId(e.target.value)}
              >
                <MenuItem value="">
                  <em>Không gắn dự án</em>
                </MenuItem>
                {projects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    [{p.code}] {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Chọn thành viên ({selectedUserIds.length})</InputLabel>
              <Select
                multiple
                value={selectedUserIds}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedUserIds(typeof val === 'string' ? val.split(',') : val);
                }}
                input={<OutlinedInput label={`Chọn thành viên (${selectedUserIds.length})`} />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((userId) => {
                      const u = users.find((item) => item.id === userId);
                      return <Chip key={userId} label={u?.fullName || userId} size="small" />;
                    })}
                  </Box>
                )}
              >
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    <Checkbox checked={selectedUserIds.indexOf(u.id) > -1} />
                    <Avatar src={u.avatarUrl} sx={{ width: 28, height: 28, mr: 1, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
                      {u.fullName.charAt(0)}
                    </Avatar>
                    <ListItemText primary={u.fullName} secondary={u.department || u.email} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting || loading}>
          {submitting ? 'Đang tạo...' : 'Tạo nhóm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
