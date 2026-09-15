import React, { useState, useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from 'date-fns';
import { useDashboardQuery } from '../hooks/useDashboard';
import {
  useTaskDetailQuery,
  useTaskCommentsQuery,
  useTaskDependenciesQuery,
  useAddCommentMutation,
} from '../hooks/useTasks';
import { DashboardDateFilter, DatePreset } from '../components/dashboard/DashboardDateFilter';
import { DashboardKpiGrid } from '../components/dashboard/DashboardKpiGrid';
import { DashboardCharts } from '../components/dashboard/DashboardCharts';
import { DashboardAlerts } from '../components/dashboard/DashboardAlerts';
import { DashboardActivities } from '../components/dashboard/DashboardActivities';
import { DashboardSkeleton } from '../components/common/DashboardSkeleton';
import { TaskDetailDrawer } from '../components/tasks/TaskDetailDrawer';

export const DashboardPage: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<DatePreset>('all');
  const [customFromDate, setCustomFromDate] = useState<Date | null>(null);
  const [customToDate, setCustomToDate] = useState<Date | null>(null);

  // Selected task for drawer
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { data: selectedTask } = useTaskDetailQuery(selectedTaskId || undefined);
  const { data: comments = [], isLoading: loadingComments } = useTaskCommentsQuery(selectedTaskId || undefined);
  const { data: dependencies = [] } = useTaskDependenciesQuery(selectedTaskId || undefined);
  const addCommentMutation = useAddCommentMutation(selectedTaskId || undefined);

  const handleAddComment = async (content: string, files?: File[]) => {
    if (!selectedTaskId) return;
    await addCommentMutation.mutateAsync({ content, files });
  };

  // Active query parameters applied
  const [queryParams, setQueryParams] = useState<{ fromDate?: string; toDate?: string; label: string }>({
    label: 'Tất cả thời gian',
  });

  const { data, isLoading, isFetching } = useDashboardQuery(
    useMemo(
      () => ({
        fromDate: queryParams.fromDate,
        toDate: queryParams.toDate,
      }),
      [queryParams.fromDate, queryParams.toDate]
    )
  );

  const handleSelectPreset = (preset: DatePreset) => {
    setSelectedPreset(preset);
    const now = new Date();
    let from = '';
    let to = '';
    let label = 'Tất cả thời gian';

    if (preset === 'today') {
      from = format(now, 'yyyy-MM-dd');
      to = format(now, 'yyyy-MM-dd');
      label = `Hôm nay (${format(now, 'dd/MM/yyyy')})`;
    } else if (preset === 'week') {
      const s = startOfWeek(now, { weekStartsOn: 1 });
      const e = endOfWeek(now, { weekStartsOn: 1 });
      from = format(s, 'yyyy-MM-dd');
      to = format(e, 'yyyy-MM-dd');
      label = `Tuần này (${format(s, 'dd/MM')} - ${format(e, 'dd/MM/yyyy')})`;
    } else if (preset === 'month') {
      const s = startOfMonth(now);
      const e = endOfMonth(now);
      from = format(s, 'yyyy-MM-dd');
      to = format(e, 'yyyy-MM-dd');
      label = `Tháng này (${format(s, 'dd/MM')} - ${format(e, 'dd/MM/yyyy')})`;
    } else if (preset === 'quarter') {
      const s = startOfQuarter(now);
      const e = endOfQuarter(now);
      from = format(s, 'yyyy-MM-dd');
      to = format(e, 'yyyy-MM-dd');
      label = `Quý này (${format(s, 'dd/MM')} - ${format(e, 'dd/MM/yyyy')})`;
    } else if (preset === 'year') {
      const s = startOfYear(now);
      const e = endOfYear(now);
      from = format(s, 'yyyy-MM-dd');
      to = format(e, 'yyyy-MM-dd');
      label = `Năm nay (${format(s, 'dd/MM/yyyy')} - ${format(e, 'dd/MM/yyyy')})`;
    } else if (preset === 'all') {
      from = '';
      to = '';
      label = 'Tất cả thời gian';
    }

    setCustomFromDate(from ? new Date(from) : null);
    setCustomToDate(to ? new Date(to) : null);

    if (preset !== 'custom') {
      setQueryParams({
        fromDate: from || undefined,
        toDate: to || undefined,
        label,
      });
    }
  };

  const handleApplyCustom = () => {
    setSelectedPreset('custom');
    const from = customFromDate ? format(customFromDate, 'yyyy-MM-dd') : '';
    const to = customToDate ? format(customToDate, 'yyyy-MM-dd') : '';

    let label = 'Tùy chỉnh';
    if (from && to) {
      label = `${format(customFromDate!, 'dd/MM/yyyy')} - ${format(customToDate!, 'dd/MM/yyyy')}`;
    } else if (from) {
      label = `Từ ${format(customFromDate!, 'dd/MM/yyyy')}`;
    } else if (to) {
      label = `Đến ${format(customToDate!, 'dd/MM/yyyy')}`;
    } else {
      label = 'Tất cả thời gian';
    }

    setQueryParams({
      fromDate: from || undefined,
      toDate: to || undefined,
      label,
    });
  };

  const handleResetFilter = () => {
    setSelectedPreset('all');
    setCustomFromDate(null);
    setCustomToDate(null);
    setQueryParams({ label: 'Tất cả thời gian' });
  };

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
      {/* Date Filter Toolbar */}
      <DashboardDateFilter
        selectedPreset={selectedPreset}
        appliedLabel={queryParams.label}
        isFiltered={Boolean(queryParams.fromDate || queryParams.toDate)}
        fromDate={customFromDate}
        toDate={customToDate}
        filterLoading={isFetching}
        onSelectPreset={handleSelectPreset}
        onFromDateChange={(val) => {
          setCustomFromDate(val && !isNaN(val.getTime()) ? val : null);
          setSelectedPreset('custom');
        }}
        onToDateChange={(val) => {
          setCustomToDate(val && !isNaN(val.getTime()) ? val : null);
          setSelectedPreset('custom');
        }}
        onApplyCustom={handleApplyCustom}
        onResetFilter={handleResetFilter}
      />

      {/* KPI Cards Grid */}
      <DashboardKpiGrid data={data} />

      {/* Row 2: Charts (Project Progress + Task Status Distribution) */}
      <DashboardCharts data={data} />

      {/* Row 3: Critical Overdue Tasks & Upcoming Deadlines */}
      <DashboardAlerts data={data} onSelectTask={(taskId) => setSelectedTaskId(taskId)} />

      {/* Row 4: Recent Activities Timeline */}
      <DashboardActivities data={data} onSelectTask={(taskId) => setSelectedTaskId(taskId)} />

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        task={selectedTask || null}
        onClose={() => setSelectedTaskId(null)}
        comments={comments}
        dependencies={dependencies}
        loadingComments={loadingComments}
        onAddComment={handleAddComment}
      />
    </Box>
  );
};
