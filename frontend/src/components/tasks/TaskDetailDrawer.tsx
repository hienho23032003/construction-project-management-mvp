import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAppSearchParams } from '../../hooks/useAppSearchParams';
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
  Dialog,
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
  Paperclip,
  Image as ImageIcon,
  Download,
  Maximize2,
  Trash2,
  FileSpreadsheet,
  FileArchive,
  File,
} from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import { PERMISSIONS } from '../../constants/permissions';
import { TaskItem, TaskComment, TaskCommentAttachment, TaskDependency, ActivityLog } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useTaskActivitiesQuery } from '../../hooks/useTasks';
import { StatusChip, getVietnameseStatus } from '../common/StatusChip';
import { PriorityBadge, ProgressBar } from '../common';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import { getMediaUrl } from '../../utils/fileUtils';
import { CoEditingWarningBanner } from '../presence/ProjectPresenceAvatars';

interface TaskDetailDrawerProps {
  task: TaskItem | null;
  onClose: () => void;
  comments: TaskComment[];
  dependencies: TaskDependency[];
  loadingComments: boolean;
  onAddComment: (content: string, files?: File[]) => Promise<void>;
  activities?: ActivityLog[];
  initialTab?: number;
}

interface CommentFormData {
  content: string;
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const isImageAttachment = (filePath?: string, fileName?: string): boolean => {
  const target = (fileName || filePath || '').toLowerCase();
  return (
    target.endsWith('.jpg') ||
    target.endsWith('.jpeg') ||
    target.endsWith('.png') ||
    target.endsWith('.webp') ||
    target.endsWith('.gif') ||
    target.endsWith('.bmp') ||
    target.endsWith('.svg')
  );
};

const getFileIconComponent = (fileName?: string) => {
  const name = (fileName || '').toLowerCase();
  if (name.endsWith('.pdf')) {
    return <FileText size={18} color="#dc2626" />;
  }
  if (name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.csv')) {
    return <FileSpreadsheet size={18} color="#059669" />;
  }
  if (name.endsWith('.doc') || name.endsWith('.docx')) {
    return <FileText size={18} color="#0284c7" />;
  }
  if (name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.7z')) {
    return <FileArchive size={18} color="#d97706" />;
  }
  if (name.endsWith('.dwg') || name.endsWith('.dxf')) {
    return <FileText size={18} color="#7c3aed" />;
  }
  return <File size={18} color="#64748b" />;
};

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
  initialTab = 0,
}) => {
  const { user } = useAuth();
  const { can, isSuperAdmin } = usePermission();
  const canComment = isSuperAdmin || can(PERMISSIONS.TASKS_COMMENT);
  const { getParam, setParam } = useAppSearchParams();
  const urlTab = getParam('taskTab') || getParam('tab');

  const getTabNumber = (tabStr: string | null): number => {
    if (tabStr === 'comments' || tabStr === 'discussion' || tabStr === '1') return 1;
    if (tabStr === 'history' || tabStr === 'activities' || tabStr === '2') return 2;
    return 0;
  };

  const [activeTab, setActiveTab] = useState(urlTab ? getTabNumber(urlTab) : initialTab);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const docInputRef = React.useRef<HTMLInputElement>(null);

  const { data: fetchedActivities = [], isLoading: loadingActivities } = useTaskActivitiesQuery(task?.id);
  const activities = initialActivities || fetchedActivities;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<CommentFormData>({
    defaultValues: {
      content: '',
    },
  });

  const contentValue = watch('content');
  const canSubmit = Boolean((contentValue && contentValue.trim().length > 0) || selectedFiles.length > 0);

  useEffect(() => {
    if (urlTab) {
      setActiveTab(getTabNumber(urlTab));
    } else {
      setActiveTab(initialTab);
    }
    setSelectedFiles([]);
  }, [task?.id, initialTab, urlTab]);

  const handleTabChange = (_: any, val: number) => {
    setActiveTab(val);
    const tabName = val === 1 ? 'comments' : val === 2 ? 'history' : 'details';
    const mainTab = getParam('tab');
    if (getParam('taskId')) {
      if (mainTab && ['overview', 'tasks', 'gantt', 'members', 'activities'].includes(mainTab)) {
        setParam('taskTab', tabName);
      } else {
        setParam('tab', tabName);
      }
    }
  };

  const handleFilesAdded = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    // Limit max 10 files per comment, max 25MB each
    const validFiles: File[] = [];
    for (const f of fileArray) {
      if (f.size > 25 * 1024 * 1024) {
        alert(`Tệp "${f.name}" vượt quá dung lượng tối đa 25MB.`);
        continue;
      }
      validFiles.push(f);
    }
    setSelectedFiles((prev) => [...prev, ...validFiles].slice(0, 10));
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
      handleFilesAdded(e.clipboardData.files);
    }
  };

  const onSubmitComment = async (formData: CommentFormData) => {
    const text = (formData.content || '').trim();
    if (!text && selectedFiles.length === 0) return;
    await onAddComment(text, selectedFiles);
    reset({ content: '' });
    setSelectedFiles([]);
  };

  if (!task) return null;

  const isCompleted = task.status === 'Completed';
  const isCompletedLate = isCompleted && Boolean(
    task.isCompletedLate || 
    (task.actualEndDate && new Date(task.actualEndDate.split('T')[0]).getTime() > new Date(task.plannedEndDate.split('T')[0]).getTime())
  );
  const completedLateDays = task.completedLateDays || (
    isCompletedLate && task.actualEndDate
      ? Math.max(1, Math.round((new Date(task.actualEndDate.split('T')[0]).getTime() - new Date(task.plannedEndDate.split('T')[0]).getTime()) / 86400000))
      : 0
  );

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
              {task.isOverdue && !isCompleted && (
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
              {isCompletedLate && (
                <Chip
                  icon={<ShieldAlert size={13} style={{ marginLeft: 4 }} />}
                  label={`Xong trễ ${completedLateDays} ngày`}
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
            onChange={handleTabChange}
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
          {task.projectId && (
            <CoEditingWarningBanner projectId={task.projectId} taskId={task.id} />
          )}

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
                      <Typography variant="body2" sx={{ fontWeight: 600, color: isCompletedLate ? '#ef4444' : '#10b981' }}>
                        {formatDate(task.actualEndDate)} {isCompletedLate ? `(Trễ ${completedLateDays} ngày)` : '(Đúng hạn)'}
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
                                src={getMediaUrl(a.avatarUrl) || undefined}
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
                  <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {comments.map((c) => {
                      const isSelf = user && (c.userId === user.id || c.userName === user.fullName || c.userName === user.email);
                      const imageAttachments = (c.attachments || []).filter((a) => isImageAttachment(a.filePath, a.fileName));
                      const docAttachments = (c.attachments || []).filter((a) => !isImageAttachment(a.filePath, a.fileName));

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
                              src={getMediaUrl(c.userAvatarUrl) || undefined}
                              sx={{
                                width: 32,
                                height: 32,
                                fontSize: '0.8rem',
                                mr: 1.25,
                                mt: 0.5,
                                bgcolor: '#64748b',
                                color: '#ffffff',
                                fontWeight: 700,
                                flexShrink: 0,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              }}
                            >
                              {c.userName.charAt(0)}
                            </Avatar>
                          )}

                          <Box
                            sx={{
                              maxWidth: '85%',
                              width: 'fit-content',
                              bgcolor: isSelf ? '#0284c7' : '#ffffff',
                              color: isSelf ? '#ffffff' : '#0f172a',
                              border: isSelf ? 'none' : '1px solid #e2e8f0',
                              p: 1.5,
                              borderRadius: isSelf ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                              boxShadow: isSelf
                                ? '0 2px 8px rgba(2, 132, 199, 0.25)'
                                : '0 1px 4px rgba(0, 0, 0, 0.04)',
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

                            {c.content && (
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
                            )}

                            {/* Image Attachments Gallery */}
                            {imageAttachments.length > 0 && (
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: 1,
                                  mt: c.content ? 1.25 : 0.5,
                                }}
                              >
                                {imageAttachments.map((img) => (
                                  <Box
                                    key={img.id}
                                    onClick={() => setPreviewImageUrl(getMediaUrl(img.filePath) || '')}
                                    sx={{
                                      position: 'relative',
                                      width: imageAttachments.length === 1 ? '100%' : 110,
                                      maxWidth: 240,
                                      height: imageAttachments.length === 1 ? 160 : 85,
                                      borderRadius: '8px',
                                      overflow: 'hidden',
                                      cursor: 'pointer',
                                      border: isSelf ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid #cbd5e1',
                                      '&:hover .img-overlay': { opacity: 1 },
                                    }}
                                  >
                                    <img
                                      src={getMediaUrl(img.filePath)}
                                      alt={img.fileName}
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                      }}
                                    />
                                    <Box
                                      className="img-overlay"
                                      sx={{
                                        position: 'absolute',
                                        inset: 0,
                                        bgcolor: 'rgba(0,0,0,0.3)',
                                        opacity: 0,
                                        transition: 'opacity 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#ffffff',
                                      }}
                                    >
                                      <Maximize2 size={18} />
                                    </Box>
                                  </Box>
                                ))}
                              </Box>
                            )}

                            {/* Document / File Attachments List */}
                            {docAttachments.length > 0 && (
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 0.75,
                                  mt: c.content || imageAttachments.length > 0 ? 1.25 : 0.5,
                                }}
                              >
                                {docAttachments.map((doc) => (
                                  <Box
                                    key={doc.id}
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: 1.5,
                                      p: 1,
                                      borderRadius: '6px',
                                      bgcolor: isSelf ? 'rgba(255, 255, 255, 0.15)' : '#f8fafc',
                                      border: isSelf ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid #e2e8f0',
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                      {getFileIconComponent(doc.fileName)}
                                      <Box sx={{ minWidth: 0 }}>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            fontWeight: 600,
                                            fontSize: '0.8rem',
                                            color: isSelf ? '#ffffff' : '#0f172a',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: 200,
                                          }}
                                          title={doc.fileName}
                                        >
                                          {doc.fileName}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: isSelf ? 'rgba(255, 255, 255, 0.75)' : '#64748b',
                                            fontSize: '0.7rem',
                                          }}
                                        >
                                          {formatFileSize(doc.fileSize)}
                                        </Typography>
                                      </Box>
                                    </Box>

                                    <IconButton
                                      component="a"
                                      href={getMediaUrl(doc.filePath)}
                                      download={doc.fileName}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      size="small"
                                      sx={{
                                        color: isSelf ? '#ffffff' : '#0284c7',
                                        bgcolor: isSelf ? 'rgba(255, 255, 255, 0.2)' : '#e0f2fe',
                                        '&:hover': {
                                          bgcolor: isSelf ? 'rgba(255, 255, 255, 0.3)' : '#bae6fd',
                                        },
                                        p: 0.75,
                                      }}
                                    >
                                      <Download size={15} />
                                    </IconButton>
                                  </Box>
                                ))}
                              </Box>
                            )}
                          </Box>

                          {isSelf && (
                            <Avatar
                              src={getMediaUrl(c.userAvatarUrl || user?.avatarUrl) || undefined}
                              sx={{
                                width: 32,
                                height: 32,
                                fontSize: '0.8rem',
                                ml: 1.25,
                                mt: 0.5,
                                bgcolor: '#0369a1',
                                color: '#ffffff',
                                fontWeight: 700,
                                flexShrink: 0,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
              {canComment ? (
                <Box
                  component="form"
                  onSubmit={handleSubmit(onSubmitComment)}
                  onPaste={handlePaste}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.25,
                    p: 1.5,
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                  }}
                >
                  {/* Hidden File Inputs */}
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
                    accept="image/*, .jfif, .pjpeg, .pjp, .bmp, .png, .jpg, .jpeg, .webp"
                    multiple
                    style={{ display: 'none' }}
                  />
                  <input
                    type="file"
                    ref={docInputRef}
                    onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.zip,.rar,.7z,.dwg,.dxf,.txt"
                    multiple
                    style={{ display: 'none' }}
                  />

                  <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        multiline
                        rows={2}
                        fullWidth
                        placeholder="Nhập nội dung trao đổi, hoặc chọn tệp/dán ảnh (Ctrl+V) để gửi..."
                        disabled={isSubmitting}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            if (canSubmit) {
                              handleSubmit(onSubmitComment)();
                            }
                          }
                        }}
                        sx={{
                          bgcolor: '#ffffff',
                          '& .MuiOutlinedInput-root': {
                            p: 1.25,
                            borderRadius: '8px',
                          },
                        }}
                      />
                    )}
                  />

                  {/* Selected Files Preview Queue */}
                  {selectedFiles.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 1, bgcolor: '#ffffff', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                      {selectedFiles.map((f, idx) => (
                        <Chip
                          key={idx}
                          icon={isImageAttachment(undefined, f.name) ? <ImageIcon size={14} /> : <Paperclip size={14} />}
                          label={`${f.name} (${formatFileSize(f.size)})`}
                          onDelete={() => handleRemoveFile(idx)}
                          deleteIcon={<X size={14} />}
                          size="small"
                          sx={{
                            bgcolor: '#f1f5f9',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            maxWidth: 260,
                            '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
                          }}
                        />
                      ))}
                    </Box>
                  )}

                  {/* Action Bar */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ImageIcon size={15} color="#0284c7" />}
                        onClick={() => imageInputRef.current?.click()}
                        disabled={isSubmitting}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          py: 0.5,
                          px: 1.25,
                          borderColor: '#cbd5e1',
                          color: '#334155',
                          '&:hover': { borderColor: '#0284c7', bgcolor: '#f0f9ff' },
                        }}
                      >
                        Thêm Ảnh
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Paperclip size={15} color="#059669" />}
                        onClick={() => docInputRef.current?.click()}
                        disabled={isSubmitting}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          py: 0.5,
                          px: 1.25,
                          borderColor: '#cbd5e1',
                          color: '#334155',
                          '&:hover': { borderColor: '#059669', bgcolor: '#ecfdf5' },
                        }}
                      >
                        Đính Kèm Tệp
                      </Button>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem', display: { xs: 'none', sm: 'block' } }}>
                        (Hỗ trợ Ctrl+V dán ảnh)
                      </Typography>
                    </Box>

                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting || !canSubmit}
                      startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SendHorizontal size={16} />}
                      sx={{
                        bgcolor: canSubmit ? '#0284c7' : '#94a3b8',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        py: 0.75,
                        px: 2,
                        borderRadius: '8px',
                        boxShadow: 'none',
                        '&:hover': { bgcolor: canSubmit ? '#0369a1' : '#94a3b8', boxShadow: canSubmit ? '0 2px 6px rgba(2, 132, 199, 0.25)' : 'none' },
                      }}
                    >
                      Gửi Trao Đổi
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    bgcolor: '#f8fafc',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '10px',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Bạn không có quyền gửi bình luận hoặc đính kèm tệp cho công việc này.
                  </Typography>
                </Paper>
              )}
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
                                src={getMediaUrl(act.userAvatarUrl) || undefined}
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

      {/* Image Lightbox Preview Modal */}
      <Dialog
        open={Boolean(previewImageUrl)}
        onClose={() => setPreviewImageUrl(null)}
        maxWidth="lg"
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden',
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          },
        }}
      >
        <Box sx={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
          <IconButton
            onClick={() => setPreviewImageUrl(null)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0, 0, 0, 0.65)',
              color: '#ffffff',
              zIndex: 10,
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.85)' },
            }}
          >
            <X size={20} />
          </IconButton>
          {previewImageUrl && (
            <img
              src={previewImageUrl}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              }}
            />
          )}
        </Box>
      </Dialog>
    </Drawer>
  );
};
