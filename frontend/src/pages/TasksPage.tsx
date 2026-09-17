import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  Autocomplete,
  Chip,
} from '@mui/material';
import {
  Search,
  LayoutGrid,
  List as ListIcon,
} from 'lucide-react';
import { TaskItem, TaskStatus, PriorityLevel } from '../types';
import { TaskTable } from '../components/tasks/TaskTable';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskDetailDrawer } from '../components/tasks/TaskDetailDrawer';
import { CardGridSkeleton } from '../components/common/CardGridSkeleton';
import { CommonPagination } from '../components/common/CommonPagination';
import { ScopeChip } from '../components/common/ScopeChip';
import { CommonInput } from '../components/common';
import {
  useTasksQuery,
  useTaskDetailQuery,
  useUpdateTaskStatusMutation,
  useUpdateTaskProgressMutation,
  useUpdateTaskPriorityMutation,
  useTaskCommentsQuery,
  useTaskDependenciesQuery,
  useAddCommentMutation,
} from '../hooks/useTasks';
import { useProjectsListQuery } from '../hooks/useProjects';
import { useDebounce } from '../hooks/useDebounce';
import { useAppSearchParams } from '../hooks/useAppSearchParams';
import { usePresenceHeartbeat } from '../hooks/usePresence';
import { ProjectPresenceAvatars } from '../components/presence/ProjectPresenceAvatars';

import { usePermission } from '../hooks/usePermission';
import { PERMISSIONS } from '../constants/permissions';

export const TasksPage: React.FC = () => {
  const { can, isSuperAdmin } = usePermission();
  const canViewAll = isSuperAdmin || can(PERMISSIONS.TASKS_VIEW_ALL);
  const canViewProject = canViewAll || can(PERMISSIONS.TASKS_VIEW_PROJECT);
  const canUpdateStatus = isSuperAdmin || can(PERMISSIONS.TASKS_UPDATE_STATUS);
  const canUpdateProgress = isSuperAdmin || can(PERMISSIONS.TASKS_UPDATE_PROGRESS);
  const canUpdatePriority = isSuperAdmin || can(PERMISSIONS.TASKS_EDIT) || can(PERMISSIONS.TASKS_UPDATE_STATUS);
  const canComment = isSuperAdmin || can(PERMISSIONS.TASKS_COMMENT);

  const { getParam, getNumberParam, setParam, setParams, removeParams } = useAppSearchParams();
  const taskIdParam = getParam('taskId');
  const projectParam = getParam('projectId', 'ALL');
  const statusParam = getParam('status', 'ALL');
  const priorityParam = getParam('priority', 'ALL');
  const searchParam = getParam('search');
  const viewParam = (getParam('view', 'table') === 'grid' ? 'grid' : 'table') as 'table' | 'grid';
  const pageParam = Math.max(0, getNumberParam('page', 1) - 1);

  // View mode
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(viewParam);

  // Pagination & Filtering & Sorting
  const [page, setPage] = useState(pageParam);
  const [rowsPerPage, setRowsPerPage] = useState(viewParam === 'grid' ? 10 : 10);
  const [sortBy, setSortBy] = useState('sortOrder');
  const [isDescending, setIsDescending] = useState(false);
  const [search, setSearch] = useState(searchParam);
  const [selectedProjectId, setSelectedProjectId] = useState(projectParam);
  const [selectedStatus, setSelectedStatus] = useState(statusParam);
  const [selectedPriority, setSelectedPriority] = useState(priorityParam);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const handleToggleGroup = useCallback((groupKey: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  }, []);

  const debouncedSearch = useDebounce(search, 300);

  // Selected task for drawer
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const tabParam = getParam('tab');
  const initialTab = useMemo(() => {
    if (tabParam === 'comments' || tabParam === 'discussion' || tabParam === '1') return 1;
    if (tabParam === 'history' || tabParam === 'activities' || tabParam === '2') return 2;
    return 0;
  }, [tabParam]);

  // Query single task if specified in URL (e.g. clicked from Notification)
  const { data: taskFromUrl } = useTaskDetailQuery(taskIdParam);

  useEffect(() => {
    if (taskFromUrl) {
      setSelectedTask(taskFromUrl);
    }
  }, [taskFromUrl]);

  // Sync debounced search with URL
  useEffect(() => {
    if (debouncedSearch.trim()) {
      if (getParam('search') !== debouncedSearch.trim()) {
        setParams({ search: debouncedSearch.trim(), page: null });
      }
    } else {
      setParam('search', null);
    }
  }, [debouncedSearch, getParam, setParam, setParams]);

  const handleProjectFilterChange = (val: string) => {
    setSelectedProjectId(val);
    setPage(0);
    setParams({ projectId: val !== 'ALL' ? val : null, page: null });
  };

  const handleStatusFilterChange = (val: string) => {
    setSelectedStatus(val);
    setPage(0);
    setParams({ status: val !== 'ALL' ? val : null, page: null });
  };

  const handlePriorityFilterChange = (val: string) => {
    setSelectedPriority(val);
    setPage(0);
    setParams({ priority: val !== 'ALL' ? val : null, page: null });
  };

  const handleViewModeChange = (val: 'table' | 'grid') => {
    setViewMode(val);
    setParam('view', val === 'grid' ? 'grid' : null);
    if (val === 'grid') {
      if (rowsPerPage === 20) {
        setRowsPerPage(15);
      } else if (rowsPerPage !== 10 && rowsPerPage !== 15 && rowsPerPage !== 20 && rowsPerPage !== 30 && rowsPerPage !== 50) {
        setRowsPerPage(10);
      }
      setPage(0);
    } else {
      if (rowsPerPage === 15 || rowsPerPage === 30) {
        setRowsPerPage(10);
      }
      setPage(0);
    }
  };

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    setParam('page', newPage > 0 ? newPage + 1 : null);
  }, [setParam]);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    handlePageChange(0);
  }, [handlePageChange]);

  // Query params memoized
  const queryParams = useMemo(() => ({
    pageIndex: page + 1,
    pageSize: rowsPerPage,
    projectId: selectedProjectId === 'ALL' ? undefined : selectedProjectId,
    status: selectedStatus === 'ALL' ? undefined : selectedStatus,
    priority: selectedPriority === 'ALL' ? undefined : selectedPriority,
    search: debouncedSearch.trim() || undefined,
    sortBy,
    isDescending,
  }), [page, rowsPerPage, selectedProjectId, selectedStatus, selectedPriority, debouncedSearch, sortBy, isDescending]);

  // Queries & Mutations
  const { data, isLoading } = useTasksQuery(queryParams);

  const { data: projects = [] } = useProjectsListQuery();
  const updateStatusMutation = useUpdateTaskStatusMutation();
  const updateProgressMutation = useUpdateTaskProgressMutation();
  const updatePriorityMutation = useUpdateTaskPriorityMutation();

  const selectedTaskId = selectedTask?.id;
  const { data: comments = [], isLoading: loadingComments } = useTaskCommentsQuery(selectedTaskId);
  const { data: dependencies = [] } = useTaskDependenciesQuery(selectedTaskId);
  const addCommentMutation = useAddCommentMutation(selectedTaskId);

  const tasks = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const handleSort = useCallback((field: string) => {
    setSortBy((prevSortBy) => {
      if (prevSortBy === field) {
        setIsDescending((prevDesc) => !prevDesc);
        return prevSortBy;
      } else {
        setIsDescending(false);
        return field;
      }
    });
  }, []);

  const handleAddComment = useCallback(async (content: string, files?: File[]) => {
    await addCommentMutation.mutateAsync({ content, files });
  }, [addCommentMutation]);

  const handleRowClick = useCallback((task: TaskItem) => {
    setSelectedTask(task);
    setParam('taskId', task.id);
  }, [setParam]);

  const handleCloseDrawer = useCallback(() => {
    setSelectedTask(null);
    removeParams('taskId', 'tab', 'taskTab');
  }, [removeParams]);

  const handleStatusChange = useCallback((taskId: string, status: TaskStatus) => {
    updateStatusMutation.mutate({ id: taskId, status });
  }, [updateStatusMutation]);

  const handleProgressChange = useCallback((taskId: string, progress: number) => {
    updateProgressMutation.mutate({ id: taskId, progress });
  }, [updateProgressMutation]);

  const handlePriorityChange = useCallback((taskId: string, priority: PriorityLevel) => {
    updatePriorityMutation.mutate({ id: taskId, priority });
  }, [updatePriorityMutation]);

  usePresenceHeartbeat({
    projectId: selectedProjectId !== 'ALL' ? selectedProjectId : undefined,
    enabled: selectedProjectId !== 'ALL',
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 }, width: '100%', maxWidth: '100%', minWidth: 0 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.35rem' }, color: 'text.primary' }}>
              Quản Lý Công Việc & Tiến Độ Thi Công
            </Typography>
            <ScopeChip canViewAll={canViewAll} canViewProject={canViewProject} />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            {canViewAll
              ? 'Tra cứu, cập nhật tiến độ, bình luận và theo dõi deadline toàn hệ thống'
              : canViewProject
              ? 'Tra cứu, cập nhật tiến độ và theo dõi các công việc trong toàn bộ các dự án bạn tham gia'
              : 'Danh sách các công việc được phân công hoặc phụ trách bởi bạn'}
          </Typography>
        </Box>
        {selectedProjectId !== 'ALL' && (
          <ProjectPresenceAvatars projectId={selectedProjectId} />
        )}
      </Box>

      {/* Filters Toolbar */}
      <Paper sx={{ p: { xs: 1.5, sm: 2 }, border: '1px solid', borderColor: 'divider', borderRadius: '8px', bgcolor: 'background.paper', display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', width: '100%', maxWidth: '100%' }}>
        {/* Compact Search Input */}
        <Box sx={{ width: { xs: '100%', sm: 260, md: 320 }, minWidth: 0 }}>
          <CommonInput
            isSearch
            clearable
            placeholder="Tìm công việc..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            onClear={() => {
              setSearch('');
              setPage(0);
            }}
          />
        </Box>

        <Autocomplete
          size="small"
          options={[{ id: 'ALL', code: 'ALL', name: 'Tất cả dự án' }, ...projects]}
          getOptionLabel={(p) => (p.id === 'ALL' ? 'Tất cả dự án' : `${p.code} - ${p.name}`)}
          value={
            selectedProjectId === 'ALL'
              ? { id: 'ALL', code: 'ALL', name: 'Tất cả dự án' }
              : projects.find((p) => p.id === selectedProjectId) || { id: 'ALL', code: 'ALL', name: 'Tất cả dự án' }
          }
          onChange={(_, val) => handleProjectFilterChange(val ? val.id : 'ALL')}
          isOptionEqualToValue={(opt, val) => opt.id === val.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Dự Án"
              placeholder="Gõ tìm kiếm dự án..."
            />
          )}
          sx={{ width: { xs: '100%', sm: 240 }, minWidth: { xs: '100%', sm: 240 } }}
        />

        <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' }, flexWrap: 'nowrap' }}>
          <FormControl size="small" sx={{ width: { xs: '50%', sm: 145 }, minWidth: { xs: '50%', sm: 145 } }}>
            <InputLabel>Trạng Thái</InputLabel>
            <Select
              value={selectedStatus}
              label="Trạng Thái"
              onChange={(e) => handleStatusFilterChange(e.target.value)}
            >
              <MenuItem value="ALL">Tất cả</MenuItem>
              <MenuItem value="InProgress">Đang thực hiện</MenuItem>
              <MenuItem value="Completed">Hoàn thành</MenuItem>
              <MenuItem value="NotStarted">Chưa bắt đầu</MenuItem>
              <MenuItem value="OnHold">Tạm dừng</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ width: { xs: '50%', sm: 135 }, minWidth: { xs: '50%', sm: 135 } }}>
            <InputLabel>Độ Ưu Tiên</InputLabel>
            <Select
              value={selectedPriority}
              label="Độ Ưu Tiên"
              onChange={(e) => handlePriorityFilterChange(e.target.value)}
            >
              <MenuItem value="ALL">Tất cả</MenuItem>
              <MenuItem value="Urgent">Khẩn cấp</MenuItem>
              <MenuItem value="High">Cao</MenuItem>
              <MenuItem value="Medium">Trung bình</MenuItem>
              <MenuItem value="Low">Thấp</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ ml: { xs: 0, sm: 'auto' } }}>
          <ToggleButtonGroup
            size="small"
            value={viewMode}
            exclusive
            onChange={(_, val) => val && handleViewModeChange(val)}
          >
            <ToggleButton value="table">
              <ListIcon size={18} />
            </ToggleButton>
            <ToggleButton value="grid">
              <LayoutGrid size={18} />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {/* Task Content (Table or Grid) */}
      {isLoading && tasks.length === 0 && viewMode === 'grid' ? (
        <CardGridSkeleton count={rowsPerPage > 6 ? 6 : rowsPerPage} />
      ) : viewMode === 'grid' ? (
        <>
          {tasks.length === 0 ? (
            <Paper sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center', borderRadius: '8px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Không tìm thấy công việc nào phù hợp với điều kiện lọc.
              </Typography>
            </Paper>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)',
                  xl: 'repeat(5, 1fr)',
                  '@media (min-width: 1400px)': {
                    gridTemplateColumns: 'repeat(5, 1fr)',
                  },
                },
                gap: 1.5,
                width: '100%',
                p: '2px',
              }}
            >
              {tasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  canUpdateStatus={canUpdateStatus}
                  canUpdateProgress={canUpdateProgress}
                  onCardClick={handleRowClick}
                  onStatusChange={handleStatusChange}
                  onProgressChange={handleProgressChange}
                />
              ))}
            </Box>
          )}
          <Paper sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', overflow: 'hidden', mt: 1, bgcolor: 'background.paper' }}>
            <CommonPagination
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={totalCount}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[10, 15, 20, 30, 50, 100]}
            />
          </Paper>
        </>
      ) : (
        <Paper sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', overflow: 'hidden', bgcolor: 'background.paper' }}>
          <TaskTable
            tasks={tasks}
            loading={isLoading}
            page={page}
            rowsPerPage={rowsPerPage}
            sortBy={sortBy}
            isDescending={isDescending}
            collapsedGroups={collapsedGroups}
            onToggleGroup={handleToggleGroup}
            onSort={handleSort}
            onRowClick={handleRowClick}
            onStatusChange={handleStatusChange}
            onProgressChange={handleProgressChange}
            onPriorityChange={handlePriorityChange}
            canUpdateStatus={canUpdateStatus}
            canUpdateProgress={canUpdateProgress}
            canUpdatePriority={canUpdatePriority}
          />
          <CommonPagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={totalCount}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[10, 20, 50, 100]}
          />
        </Paper>
      )}

      {/* Task Detail & Comments Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        onClose={handleCloseDrawer}
        comments={comments}
        dependencies={dependencies}
        loadingComments={loadingComments}
        onAddComment={handleAddComment}
        initialTab={initialTab}
      />
    </Box>
  );
};
