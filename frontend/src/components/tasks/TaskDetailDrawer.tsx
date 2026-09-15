import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  X,
  SendHorizontal,
  FileText,
  MessageSquare,
  History,
  Clock,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Edit3,
  UserCheck,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { TaskItem, TaskComment, TaskDependency, ActivityLog } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useTaskActivitiesQuery } from '../../hooks/useTasks';
import { StatusChip, getVietnameseStatus } from '../common/StatusChip';
import { PriorityBadge, ProgressBar } from '../common/PriorityBadge';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

interface TaskDetailDrawerProps {
  task: TaskItem | null;
  onClose: () => void;
  comments: TaskComment[];
  dependencies: TaskDependency[];
  loadingComments: boolean;
  onAddComment: (content: string) => Promise<void>;
  activities?: ActivityLog[];
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

const getActionConfig = (action: string | number) => {
  const actStr = String(action).toLowerCase();
  if (actStr === 'taskcreated' || actStr === '2') {
    return {
      label: 'Tạo công việc',
      color: '#10b981',
      bg: '#ecfdf5',
      border: '#a7f3d0',
      icon: <PlusCircle size={12} color="#059669" />,
    };
  }
  if (actStr === 'statuschanged' || actStr === '5') {
    return {
      label: 'Đổi trạng thái',
      color: '#0284c7',
      bg: '#f0f9ff',
      border: '#bae6fd',
      icon: <CheckCircle2 size={12} color="#0284c7" />,
    };
  }
  if (actStr === 'progresschanged' || actStr === '6') {
    return {
      label: 'Cập nhật tiến độ',
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fde68a',
      icon: <TrendingUp size={12} color="#d97706" />,
    };
  }
  if (actStr === 'deadlinechanged' || actStr === '7') {
    return {
      label: 'Đổi thời hạn',
      color: '#8b5cf6',
      bg: '#f5f3ff',
      border: '#ddd6fe',
      icon: <Calendar size={12} color="#8b5cf6" />,
    };
  }
  if (actStr === 'taskassigned' || actStr === '4') {
    return {
      label: 'Gán người phụ trách',
      color: '#4f46e5',
      bg: '#eef2ff',
      border: '#c7d2fe',
      icon: <UserCheck size={12} color="#4f46e5" />,
    };
  }
  if (actStr === 'commentadded' || actStr === '8') {
    return {
      label: 'Bình luận mới',
      color: '#0d9488',
      bg: '#f0fdfa',
      border: '#99f6e4',
      icon: <MessageSquare size={12} color="#0d9488" />,
    };
  }
  return {
    label: 'Cập nhật công việc',
    color: '#64748b',
    bg: '#f8fafc',
    border: '#e2e8f0',
    icon: <Edit3 size={12} color="#64748b" />,
  };
};

const cleanDetails = (details?: string) => {
  if (!details) return '';
  const cleaned = details
    .replace(/:\s*['"]?[\w\d_-]+['"]?\s*(->|→|➔|-->)\s*['"]?[\w\d_-]+['"]?/gi, '')
    .trim();
  return getVietnameseStatus(cleaned);
};

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  onClose,
  comments,
  dependencies,
  loadingComments,
  onAddComment,
  activities: initialActivities,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  const { data: fetchedActivities = [], isLoading: loadingActivities } = useTaskActivitiesQuery(task?.id);
  const activities = initialActivities || fetchedActivities;

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

  useEffect(() => {
    setActiveTab(0);
  }, [task?.id]);

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
          width: { xs: '100%', sm: 600, md: 720 },
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        {/* Header Section */}
        <Box sx={{ p: { xs: 2, sm: 2.5 }, pb: 1.5, bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={task.projectCode}
                sx={{
                  bgcolor: '#0284c7',
                  color: '#ffffff',
                  fontWeight: 800,
                  height: 24,
                  fontSize: '0.75rem',
                }}
              />
              <PriorityBadge priority={task.priority} />
              {task.isOverdue && (
                <Chip
                  icon={<ShieldAlert size={13} style={{ marginLeft: 4 }} />}
                  label={`Trễ ${task.overdueDays || 1} ngày`}
                  size="small"
                  sx={{
                    bgcolor: '#fef2f2',
                    color: '#ef4444',
                    border: '1px solid #fecaca',
                    fontWeight: 700,
                    height: 24,
                    fontSize: '0.75rem',
                  }}
                />
              )}
            </Box>
            <IconButton size="small" onClick={onClose} sx={{ color: '#64748b' }}>
              <X size={20} />
            </IconButton>
          </Box>

          <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.25rem' }, color: '#0f172a', lineHeight: 1.4 }}>
            {task.name}
          </Typography>

          {/* Navigation Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 44,
              mt: 1.5,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                minHeight: 44,
                py: 0.5,
                px: { xs: 1.5, sm: 2 },
                gap: 0.75,
              },
            }}
          >
            <Tab icon={<FileText size={16} />} iconPosition="start" label="Chi Tiết" />
            <Tab
              icon={<MessageSquare size={16} />}
              iconPosition="start"
              label={`Trao Đổi (${comments.length})`}
            />
            <Tab
              icon={<History size={16} />}
              iconPosition="start"
              label={`Lịch Sử (${activities.length})`}
            />
          </Tabs>
        </Box>

        {/* Tab Content Container */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* TAB 0: CHI TIẾT */}
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Properties Grid */}
              <Paper sx={{ p: 2, borderRadius: '8px', border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>
                      Trạng thái hiện tại:
                    </Typography>
                    <StatusChip status={task.status} isOverdue={task.isOverdue} />
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>
                      Tiến độ hoàn thành:
                    </Typography>
                    <ProgressBar value={task.progress} height={8} showText={true} />
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>
                      Ngày bắt đầu dự kiến:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                      {formatDate(task.startDate)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>
                      Hạn hoàn thành (Deadline):
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: task.isOverdue ? '#ef4444' : '#0f172a' }}>
                      {formatDate(task.plannedEndDate)}
                    </Typography>
                  </Box>

                  {task.actualEndDate && (
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>
                        Ngày thực tế hoàn thành:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#10b981' }}>
                        {formatDate(task.actualEndDate)}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.75 }}>
                      Nhân sự phụ trách thi công:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {task.assignees.length === 0 ? (
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                          Chưa phân công nhân sự
                        </Typography>
                      ) : (
                        task.assignees.map((a) => (
                          <Chip
                            key={a.id}
                            avatar={
                              <Avatar
                                sx={{
                                  bgcolor: '#0284c7 !important',
                                  color: '#ffffff !important',
                                  fontWeight: 700,
                                }}
                              >
                                {a.fullName.charAt(0)}
                              </Avatar>
                            }
                            label={a.fullName}
                            size="small"
                            sx={{
                              bgcolor: '#ffffff',
                              border: '1px solid #e2e8f0',
                              fontWeight: 600,
                              height: 26,
                              '& .MuiChip-avatar': {
                                color: '#ffffff !important',
                                bgcolor: '#0284c7 !important',
                              },
                            }}
                          />
                        ))
                      )}
                    </Box>
                  </Box>
                </Box>
              </Paper>

              {/* Description */}
              {task.description && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>
                    Mô Tả Yêu Cầu Kỹ Thuật
                  </Typography>
                  <Box sx={{ bgcolor: '#ffffff', p: 2, borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {task.description}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Task Dependencies */}
              {dependencies.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>
                    Liên Kết Phụ Thuộc Công Việc ({dependencies.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {dependencies.map((d) => (
                      <Box
                        key={d.id}
                        sx={{
                          p: 1.5,
                          borderRadius: '8px',
                          bgcolor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                            {d.predecessorTaskName}
                          </Typography>
                          <ArrowRight size={14} color="#64748b" />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0284c7' }}>
                            {d.successorTaskName}
                          </Typography>
                        </Box>
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
                            borderRadius: '6px',
                            flexShrink: 0,
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* TAB 1: TRAO ĐỔI & BÌNH LUẬN */}
          {activeTab === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
              <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, pr: 0.5 }}>
                {loadingComments ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={28} />
                  </Box>
                ) : comments.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6, color: '#94a3b8' }}>
                    <MessageSquare size={36} strokeWidth={1.5} style={{ marginBottom: 8, opacity: 0.6 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Chưa có trao đổi nào cho công việc này.
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                      Hãy gửi ý kiến hoặc báo cáo hiện trường đầu tiên bên dưới.
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
                                width: 30,
                                height: 30,
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
                              bgcolor: isSelf ? '#0284c7' : '#ffffff',
                              color: isSelf ? '#ffffff' : '#0f172a',
                              border: isSelf ? 'none' : '1px solid #e2e8f0',
                              p: 1.5,
                              borderRadius: isSelf ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                              boxShadow: isSelf
                                ? '0 2px 8px rgba(2, 132, 199, 0.25)'
                                : '0 1px 3px rgba(0, 0, 0, 0.04)',
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 0.5 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                  color: isSelf ? '#ffffff' : '#0f172a',
                                  fontSize: '0.78rem',
                                }}
                              >
                                {isSelf ? `${c.userName} (Bạn)` : c.userName}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: isSelf ? 'rgba(255, 255, 255, 0.8)' : '#94a3b8',
                                  fontSize: '0.7rem',
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
                                fontSize: '0.85rem',
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
                                width: 30,
                                height: 30,
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

              {/* Add Comment Input */}
              <Box
                component="form"
                onSubmit={handleSubmit(onSubmitComment)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  p: 1.5,
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
          )}

          {/* TAB 2: LỊCH SỬ CẬP NHẬT */}
          {activeTab === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {loadingActivities ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : activities.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, color: '#94a3b8' }}>
                  <History size={36} strokeWidth={1.5} style={{ marginBottom: 8, opacity: 0.6 }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Chưa có nhật ký thay đổi nào được ghi nhận.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ position: 'relative', pl: 3.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Timeline connecting line */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 11,
                      top: 12,
                      bottom: 12,
                      width: 2,
                      bgcolor: '#e2e8f0',
                    }}
                  />

                  {activities.map((act) => {
                    const cfg = getActionConfig(act.action);

                    return (
                      <Box key={act.id} sx={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                        {/* Timeline Node Icon */}
                        <Box
                          sx={{
                            position: 'absolute',
                            left: -28,
                            top: 10,
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            bgcolor: '#ffffff',
                            border: `2px solid ${cfg.color}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                            zIndex: 1,
                          }}
                        >
                          {cfg.icon}
                        </Box>

                        {/* Timeline Card */}
                        <Paper
                          sx={{
                            p: 2,
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            bgcolor: '#ffffff',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: '#cbd5e1',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            },
                          }}
                        >
                          {/* Top Row: User & Time */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar
                                sx={{
                                  width: 24,
                                  height: 24,
                                  fontSize: '0.7rem',
                                  bgcolor: '#0284c7 !important',
                                  color: '#ffffff !important',
                                  fontWeight: 700,
                                }}
                              >
                                {act.userName ? act.userName.charAt(0) : 'U'}
                              </Avatar>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                                {act.userName || 'Hệ thống'}
                              </Typography>
                              <Chip
                                label={cfg.label}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  bgcolor: cfg.bg,
                                  color: cfg.color,
                                  border: `1px solid ${cfg.border}`,
                                }}
                              />
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Clock size={12} color="#94a3b8" />
                              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                                {formatDateTime(act.createdAt)}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Details Message */}
                          <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.85rem', mb: act.oldValue || act.newValue ? 1 : 0 }}>
                            {cleanDetails(act.details)}
                          </Typography>

                          {/* Diff changes if present */}
                          {act.oldValue && act.newValue && (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                flexWrap: 'wrap',
                                p: 1,
                                bgcolor: '#f8fafc',
                                borderRadius: '6px',
                                border: '1px solid #f1f5f9',
                                mt: 0.75,
                              }}
                            >
                              <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>
                                Thay đổi:
                              </Typography>
                              <Chip
                                label={getVietnameseStatus(act.oldValue)}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  bgcolor: '#fee2e2',
                                  color: '#991b1b',
                                  border: '1px solid #fecaca',
                                }}
                              />
                              <ArrowRight size={13} color="#94a3b8" />
                              <Chip
                                label={getVietnameseStatus(act.newValue)}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  bgcolor: '#dcfce7',
                                  color: '#166534',
                                  border: '1px solid #bbf7d0',
                                }}
                              />
                            </Box>
                          )}
                        </Paper>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};
