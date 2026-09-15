import React, { useState, useMemo, useEffect } from 'react';
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
import { useAppSearchParams } from '../hooks/useAppSearchParams';
import { DashboardDateFilter, DatePreset } from '../components/dashboard/DashboardDateFilter';
import { DashboardKpiGrid } from '../components/dashboard/DashboardKpiGrid';
import { DashboardCharts } from '../components/dashboard/DashboardCharts';
import { DashboardAlerts } from '../components/dashboard/DashboardAlerts';
import { DashboardActivities } from '../components/dashboard/DashboardActivities';
import { DashboardSkeleton } from '../components/common/DashboardSkeleton';
import { TaskDetailDrawer } from '../components/tasks/TaskDetailDrawer';

const computePresetDates = (preset: DatePreset, customFrom?: string, customTo?: string) => {
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
  } else if (preset === 'custom') {
    from = customFrom || '';
    to = customTo || '';
    if (from && to) {
      try {
        label = `${format(new Date(from), 'dd/MM/yyyy')} - ${format(new Date(to), 'dd/MM/yyyy')}`;
      } catch {
        label = 'Tùy chỉnh';
      }
    } else if (from) {
      try {
        label = `Từ ${format(new Date(from), 'dd/MM/yyyy')}`;
      } catch {
        label = 'Tùy chỉnh';
      }
    } else if (to) {
      try {
        label = `Đến ${format(new Date(to), 'dd/MM/yyyy')}`;
      } catch {
        label = 'Tùy chỉnh';
      }
    } else {
      label = 'Tất cả thời gian';
    }
  } else {
    from = '';
    to = '';
    label = 'Tất cả thời gian';
  }

  return { from, to, label };
};

export const DashboardPage: React.FC = () => {
  const { getParam, setParam, setParams, removeParams } = useAppSearchParams();

  const presetParam = (getParam('preset', 'all') as DatePreset);
  const fromDateParam = getParam('fromDate');
  const toDateParam = getParam('toDate');
  const taskIdParam = getParam('taskId');

  const initialComputed = useMemo(() => {
    return computePresetDates(presetParam, fromDateParam, toDateParam);
  }, [presetParam, fromDateParam, toDateParam]);

  const [selectedPreset, setSelectedPreset] = useState<DatePreset>(presetParam);
  const [customFromDate, setCustomFromDate] = useState<Date | null>(
    initialComputed.from ? new Date(initialComputed.from) : null
  );
  const [customToDate, setCustomToDate] = useState<Date | null>(
    initialComputed.to ? new Date(initialComputed.to) : null
  );

  // Active query parameters applied
  const [queryParams, setQueryParams] = useState<{ fromDate?: string; toDate?: string; label: string }>({
    fromDate: initialComputed.from || undefined,
    toDate: initialComputed.to || undefined,
    label: initialComputed.label,
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
        fromDate: queryParams.fromDate,
        toDate: queryParams.toDate,
      }),
      [queryParams.fromDate, queryParams.toDate]
    )
  );

  const handleSelectPreset = (preset: DatePreset) => {
    setSelectedPreset(preset);
    const computed = computePresetDates(preset);

    setCustomFromDate(computed.from ? new Date(computed.from) : null);
    setCustomToDate(computed.to ? new Date(computed.to) : null);

    if (preset !== 'custom') {
      setQueryParams({
        fromDate: computed.from || undefined,
        toDate: computed.to || undefined,
        label: computed.label,
      });
      setParams({
        preset: preset !== 'all' ? preset : null,
        fromDate: null,
        toDate: null,
      });
    }
  };

  const handleApplyCustom = () => {
    setSelectedPreset('custom');
    const from = customFromDate ? format(customFromDate, 'yyyy-MM-dd') : '';
    const to = customToDate ? format(customToDate, 'yyyy-MM-dd') : '';
    const computed = computePresetDates('custom', from, to);

    setQueryParams({
      fromDate: from || undefined,
      toDate: to || undefined,
      label: computed.label,
    });
    setParams({
      preset: 'custom',
      fromDate: from || null,
      toDate: to || null,
    });
  };

  const handleResetFilter = () => {
    setSelectedPreset('all');
    setCustomFromDate(null);
    setCustomToDate(null);
    setQueryParams({ label: 'Tất cả thời gian' });
    removeParams('preset', 'fromDate', 'toDate');
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
