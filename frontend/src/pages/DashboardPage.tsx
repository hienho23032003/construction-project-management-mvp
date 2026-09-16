import React, { useState, useMemo, useEffect } from 'react';
import { Box } from '@mui/material';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useDashboardQuery } from '../hooks/useDashboard';
import {
  useTaskDetailQuery,
  useTaskCommentsQuery,
  useTaskDependenciesQuery,
  useAddCommentMutation,
} from '../hooks/useTasks';
import { useAppSearchParams } from '../hooks/useAppSearchParams';
import { DashboardDateFilter } from '../components/dashboard/DashboardDateFilter';
import { DashboardKpiGrid } from '../components/dashboard/DashboardKpiGrid';
import { DashboardCharts } from '../components/dashboard/DashboardCharts';
import { DashboardAlerts } from '../components/dashboard/DashboardAlerts';
import { DashboardActivities } from '../components/dashboard/DashboardActivities';
import { DashboardSkeleton } from '../components/common/DashboardSkeleton';
import { TaskDetailDrawer } from '../components/tasks/TaskDetailDrawer';
import { usePermission } from '../hooks/usePermission';
import { PERMISSIONS } from '../constants/permissions';

export const DashboardPage: React.FC = () => {
  const { getParam, setParam, setParams, removeParams } = useAppSearchParams();

  const fromDateParam = getParam('fromDate');
  const toDateParam = getParam('toDate');
  const taskIdParam = getParam('taskId');

  const [fromDate, setFromDate] = useState<Date | null>(() => {
    if (fromDateParam === 'ALL') return null;
    if (fromDateParam) return new Date(fromDateParam);
    return startOfMonth(new Date());
  });
  const [toDate, setToDate] = useState<Date | null>(() => {
    if (toDateParam === 'ALL') return null;
    if (toDateParam) return new Date(toDateParam);
    return endOfMonth(new Date());
  });

  // Selected task for drawer
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(taskIdParam || null);
  const { data: selectedTask } = useTaskDetailQuery(selectedTaskId || undefined);
  const { data: comments = [], isLoading: loadingComments } = useTaskCommentsQuery(selectedTaskId || undefined);
  const { data: dependencies = [] } = useTaskDependenciesQuery(selectedTaskId || undefined);
  const addCommentMutation = useAddCommentMutation(selectedTaskId || undefined);

  // Sync taskId with URL
  useEffect(() => {
    if (taskIdParam && taskIdParam !== selectedTaskId) {
      setSelectedTaskId(taskIdParam);
    }
  }, [taskIdParam, selectedTaskId]);

  const handleAddComment = async (content: string, files?: File[]) => {
    if (!selectedTaskId) return;
    await addCommentMutation.mutateAsync({ content, files });
  };

  const { data, isLoading, isFetching } = useDashboardQuery(
    useMemo(
      () => ({
        fromDate: fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined,
        toDate: toDate ? format(toDate, 'yyyy-MM-dd') : undefined,
      }),
      [fromDate, toDate]
    )
  );

  const handleChangeRange = (from: Date | null, to: Date | null) => {
    setFromDate(from);
    setToDate(to);
    setParams({
      fromDate: from ? format(from, 'yyyy-MM-dd') : 'ALL',
      toDate: to ? format(to, 'yyyy-MM-dd') : 'ALL',
    });
  };

  const { can, isSuperAdmin } = usePermission();
  const canViewAll = isSuperAdmin || can(PERMISSIONS.DASHBOARD_VIEW_ALL);
  const canViewProject = canViewAll || can(PERMISSIONS.DASHBOARD_VIEW_PROJECT);

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
      {/* Date Filter Toolbar & Scope Indicator */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <DashboardDateFilter
          canViewAll={canViewAll}
          canViewProject={canViewProject}
          fromDate={fromDate}
          toDate={toDate}
          filterLoading={isFetching}
          onChangeRange={handleChangeRange}
        />
      </Box>

      {/* KPI Cards Grid */}
      <DashboardKpiGrid data={data} />

      {/* Row 2: Charts (Project Progress + Task Status Distribution) */}
      <DashboardCharts data={data} />

      {/* Row 3: Critical Overdue Tasks & Upcoming Deadlines */}
      <DashboardAlerts
        data={data}
        onSelectTask={(taskId) => {
          setSelectedTaskId(taskId);
          setParam('taskId', taskId);
        }}
      />

      {/* Row 4: Recent Activities Timeline */}
      <DashboardActivities
        data={data}
        canViewAll={canViewAll}
        canViewProject={canViewProject}
        onSelectTask={(taskId) => {
          setSelectedTaskId(taskId);
          setParam('taskId', taskId);
        }}
      />

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        task={selectedTask || null}
        onClose={() => {
          setSelectedTaskId(null);
          removeParams('taskId', 'tab', 'taskTab');
        }}
        comments={comments}
        dependencies={dependencies}
        loadingComments={loadingComments}
        onAddComment={handleAddComment}
      />
    </Box>
  );
};
