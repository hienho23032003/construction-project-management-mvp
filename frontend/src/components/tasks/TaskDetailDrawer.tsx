import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Drawer,
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  Divider,
  TextField,
  List,
  ListItem,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { X, SendHorizontal } from 'lucide-react';
import { TaskItem, TaskComment, TaskDependency } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { StatusChip } from '../common/StatusChip';
import { PriorityBadge, ProgressBar } from '../common/PriorityBadge';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

interface TaskDetailDrawerProps {
  task: TaskItem | null;
  onClose: () => void;
  comments: TaskComment[];
  dependencies: TaskDependency[];
  loadingComments: boolean;
  onAddComment: (content: string) => Promise<void>;
}

interface CommentFormData {
  content: string;
}

const getDependencyTypeLabel = (type: string): string => {
  switch (type) {
    case 'FinishToStart':
    case '0':
      return 'Xong - Bắt đầu (FS)';
    case 'StartToStart':
    case '1':
      return 'Cùng Bắt đầu (SS)';
    case 'FinishToFinish':
    case '2':
      return 'Cùng Kết thúc (FF)';
    case 'StartToFinish':
    case '3':
      return 'Bắt đầu - Kết thúc (SF)';
    default:
      return type;
  }
};

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  onClose,
  comments,
  dependencies,
  loadingComments,
  onAddComment,
}) => {
  const { user } = useAuth();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CommentFormData>({
    defaultValues: {
      content: '',
    },
  });

  const onSubmitComment = async (formData: CommentFormData) => {
    if (!formData.content.trim()) return;
    await onAddComment(formData.content.trim());
    reset({ content: '' });
  };

  if (!task) return null;

  return (
    <Drawer
      anchor="right"
      open={Boolean(task)}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 600, md: 800 },
          p: 3,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Chip
              label={task.projectCode}
              sx={{ bgcolor: '#0284c7', color: '#ffffff', fontWeight: 800, height: 24, fontSize: '0.75rem', mr: 1 }}
            />
            <PriorityBadge priority={task.priority} />
            <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '1.2rem', mt: 1.5, color: '#0f172a' }}>
              {task.name}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Task Properties Overview */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              Trạng thái:
            </Typography>
            <StatusChip status={task.status} isOverdue={task.isOverdue} />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              Hạn hoàn thành:
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: task.isOverdue ? '#ef4444' : '#0f172a' }}>
              {formatDate(task.plannedEndDate)}
              {task.isOverdue && ` (Trễ ${task.overdueDays} ngày)`}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              Tiến độ thi công:
            </Typography>
            <Box sx={{ width: 140 }}>
              <ProgressBar value={task.progress} height={7} />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              Người phụ trách:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'flex-end', maxWidth: 280 }}>
              {task.assignees.length === 0 ? (
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  Chưa gán
                </Typography>
              ) : (
                task.assignees.map((a) => (
                  <Chip key={a.id} label={a.fullName} size="small" sx={{ height: 22, fontSize: '0.7rem' }} />
                ))
              )}
            </Box>
          </Box>

          {task.description && (
            <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 0.5 }}>
                Mô tả chi tiết:
              </Typography>
              <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.8rem' }}>
                {task.description}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Task Dependencies */}
        {dependencies.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Phụ Thuộc Công Việc ({dependencies.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {dependencies.map((d) => (
                <Box
                  key={d.id}
                  sx={{
                    p: 1.25,
                    borderRadius: '8px',
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    {d.predecessorTaskName} ➔ {d.successorTaskName}
                  </Typography>
                  <Chip
                    label={getDependencyTypeLabel(d.dependencyType)}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      bgcolor: '#e0f2fe',
                      color: '#0369a1',
                      border: '1px solid #bae6fd',
                      borderRadius: '8px',
                      flexShrink: 0,
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Comments Section */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          Trao Đổi & Báo Cáo Hiện Trường ({comments.length})
        </Typography>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, pr: 0.5 }}>
          {loadingComments ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : comments.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center', py: 3 }}>
              Chưa có bình luận nào cho công việc này.
            </Typography>
          ) : (
            <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {comments.map((c) => {
                const isSelf = user && (c.userId === user.id || c.userName === user.fullName || c.userName === user.email);

                return (
                  <ListItem
                    key={c.id}
                    sx={{
                      px: 0,
                      py: 0.25,
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: isSelf ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {!isSelf && (
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          fontSize: '0.75rem',
                          mr: 1.25,
                          mt: 0.5,
                          bgcolor: '#64748b',
                          color: '#ffffff',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {c.userName.charAt(0)}
                      </Avatar>
                    )}

                    <Box
                      sx={{
                        maxWidth: '82%',
                        width: 'fit-content',
                        bgcolor: isSelf ? '#0284c7' : '#f8fafc',
                        color: isSelf ? '#ffffff' : '#0f172a',
                        border: isSelf ? 'none' : '1px solid #e2e8f0',
                        p: 1.25,
                        px: 1.75,
                        borderRadius: isSelf ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        boxShadow: isSelf
                          ? '0 2px 8px rgba(2, 132, 199, 0.25)'
                          : '0 1px 3px rgba(0, 0, 0, 0.04)',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 0.35 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: isSelf ? '#ffffff' : '#0f172a',
                            fontSize: '0.75rem',
                          }}
                        >
                          {isSelf ? `${c.userName} (Bạn)` : c.userName}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: isSelf ? 'rgba(255, 255, 255, 0.8)' : '#94a3b8',
                            fontSize: '0.65rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatDateTime(c.createdAt)}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: isSelf ? '#ffffff' : '#334155',
                          fontSize: '0.825rem',
                          lineHeight: 1.5,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {c.content}
                      </Typography>
                    </Box>

                    {isSelf && (
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          fontSize: '0.75rem',
                          ml: 1.25,
                          mt: 0.5,
                          bgcolor: '#0369a1',
                          color: '#ffffff',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {c.userName.charAt(0)}
                      </Avatar>
                    )}
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>

        {/* Add Comment Input with react-hook-form */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmitComment)}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            p: 1,
            bgcolor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        >
          <Controller
            name="content"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                multiline
                rows={2}
                fullWidth
                placeholder="Nhập nội dung trao đổi, tiến độ hoặc ghi chú hiện trường..."
                disabled={isSubmitting}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSubmit(onSubmitComment)();
                  }
                }}
                sx={{
                  bgcolor: '#ffffff',
                  '& .MuiOutlinedInput-root': {
                    p: 1,
                  },
                }}
              />
            )}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>
              Mẹo: Nhấn <strong>Ctrl + Enter</strong> để gửi nhanh
            </Typography>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SendHorizontal size={16} />}
              sx={{
                bgcolor: '#0284c7',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.8rem',
                py: 0.75,
                px: 2,
                borderRadius: '8px',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#0369a1', boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)' },
              }}
            >
              Gửi tin nhắn
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};
