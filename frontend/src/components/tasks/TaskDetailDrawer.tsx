import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Chip,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  X,
  FileText,
  MessageSquare,
  History,
  ShieldAlert,
} from 'lucide-react';
import { useAppSearchParams } from '../../hooks/useAppSearchParams';
import { usePermission } from '../../hooks/usePermission';
import { useAuth } from '../../contexts/AuthContext';
import { PERMISSIONS } from '../../constants/permissions';
import { TaskItem, TaskComment, TaskDependency, ActivityLog } from '../../types';
import { useTaskActivitiesQuery } from '../../hooks/useTasks';
import { PriorityBadge } from '../common';
import { CoEditingWarningBanner } from '../presence/ProjectPresenceAvatars';
import { TaskOverviewTab } from './detail/TaskOverviewTab';
import { TaskCommentsTab } from './detail/TaskCommentsTab';
import { TaskActivitiesTab } from './detail/TaskActivitiesTab';

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
  const isAssigned = Boolean(
    user?.id &&
      task?.assignees?.some(
        (a) =>
          a.userId?.toLowerCase() === user.id.toLowerCase() ||
          a.id?.toLowerCase() === user.id.toLowerCase()
      )
  );
  const canComment = isSuperAdmin || can(PERMISSIONS.TASKS_COMMENT) || isAssigned;
  const { getParam, setParam } = useAppSearchParams();
  const urlTab = getParam('taskTab') || getParam('tab');

  const getTabNumber = (tabStr: string | null): number => {
    if (tabStr === 'comments' || tabStr === 'discussion' || tabStr === '1') return 1;
    if (tabStr === 'history' || tabStr === 'activities' || tabStr === '2') return 2;
    return 0;
  };

  const [activeTab, setActiveTab] = useState(urlTab ? getTabNumber(urlTab) : initialTab);

  const { data: fetchedActivities = [], isLoading: loadingActivities } = useTaskActivitiesQuery(task?.id);
  const activities = initialActivities || fetchedActivities;

  useEffect(() => {
    if (urlTab) {
      setActiveTab(getTabNumber(urlTab));
    } else {
      setActiveTab(initialTab);
    }
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
          width: { xs: '100%', sm: 720, md: 880, lg: 960 },
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        {/* Header Section */}
        <Box sx={{ p: { xs: 2, sm: 2.5 }, pb: 1.5, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
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
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
                    color: '#ef4444',
                    border: '1px solid',
                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.3)' : '#fecaca',
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
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
                    color: '#ef4444',
                    border: '1px solid',
                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.3)' : '#fecaca',
                    fontWeight: 700,
                    height: 24,
                    fontSize: '0.75rem',
                  }}
                />
              )}
            </Box>
            <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
              <X size={20} />
            </IconButton>
          </Box>

          <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.25rem' }, color: 'text.primary', lineHeight: 1.4 }}>
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
            <TaskOverviewTab
              task={task}
              dependencies={dependencies}
              isCompletedLate={isCompletedLate}
              completedLateDays={completedLateDays}
            />
          )}

          {/* TAB 1: TRAO ĐỔI & BÌNH LUẬN */}
          {activeTab === 1 && (
            <TaskCommentsTab
              comments={comments}
              loadingComments={loadingComments}
              canComment={canComment}
              projectId={task.projectId}
              onAddComment={onAddComment}
            />
          )}

          {/* TAB 2: LỊCH SỬ CẬP NHẬT */}
          {activeTab === 2 && (
            <TaskActivitiesTab
              activities={activities}
              loadingActivities={loadingActivities}
            />
          )}
        </Box>
      </Box>
    </Drawer>
  );
};
