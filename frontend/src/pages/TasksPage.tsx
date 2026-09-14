import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
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
} from '@mui/material';
import {
  Search,
  LayoutGrid,
  List as ListIcon,
} from 'lucide-react';
import { TaskItem, TaskStatus } from '../types';
import { TaskTable } from '../components/tasks/TaskTable';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskDetailDrawer } from '../components/tasks/TaskDetailDrawer';
import { CardGridSkeleton } from '../components/common/CardGridSkeleton';
import { CommonPagination } from '../components/common/CommonPagination';
import {
  useTasksQuery,
  useTaskDetailQuery,
  useUpdateTaskStatusMutation,
  useUpdateTaskProgressMutation,
  useTaskCommentsQuery,
  useTaskDependenciesQuery,
  useAddCommentMutation,
} from '../hooks/useTasks';
import { useProjectsListQuery } from '../hooks/useProjects';
import { useDebounce } from '../hooks/useDebounce';

export const TasksPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const taskIdParam = searchParams.get('taskId');

  // View mode
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Pagination & Filtering & Sorting
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('sortOrder');
  const [isDescending, setIsDescending] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
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

  // Query single task if specified in URL (e.g. clicked from Notification)
  const { data: taskFromUrl } = useTaskDetailQuery(taskIdParam);

  useEffect(() => {
    if (taskFromUrl) {
      setSelectedTask(taskFromUrl);
    }
  }, [taskFromUrl]);

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

  const handleAddComment = useCallback(async (content: string) => {
    await addCommentMutation.mutateAsync(content);
  }, [addCommentMutation]);

  const handleRowClick = useCallback((task: TaskItem) => {
    setSelectedTask(task);
    setSearchParams((prevParams) => {
      const next = new URLSearchParams(prevParams);
      next.set('taskId', task.id);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const handleCloseDrawer = useCallback(() => {
    setSelectedTask(null);
    setSearchParams((prevParams) => {
      if (prevParams.has('taskId')) {
        const next = new URLSearchParams(prevParams);
        next.delete('taskId');
        return next;
      }
      return prevParams;
    }, { replace: true });
  }, [setSearchParams]);

  const handleStatusChange = useCallback((taskId: string, status: TaskStatus) => {
    updateStatusMutation.mutate({ id: taskId, status });
  }, [updateStatusMutation]);

  const handleProgressChange = useCallback((taskId: string, progress: number) => {
    updateProgressMutation.mutate({ id: taskId, progress });
  }, [updateProgressMutation]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#0f172a' }}>
            Quản Lý Công Việc & Tiến Độ Thi Công
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.25 }}>
            Tra cứu, cập nhật tiến độ, bình luận và theo dõi deadline toàn hệ thống
          </Typography>
        </Box>
      </Box>

      {/* Filters Toolbar */}
      <Paper sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Compact Search Input */}
        <Box sx={{ width: { xs: '100%', sm: 260 } }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Tìm công việc..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color="#94a3b8" />
                </InputAdornment>
              ),
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
          onChange={(_, val) => {
            setSelectedProjectId(val ? val.id : 'ALL');
            setPage(0);
          }}
          isOptionEqualToValue={(opt, val) => opt.id === val.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Dự Án"
              placeholder="Gõ tìm kiếm dự án..."
            />
          )}
          sx={{ minWidth: { xs: '100%', sm: 260 }, width: { xs: '100%', sm: 260 } }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Trạng Thái</InputLabel>
          <Select
            value={selectedStatus}
            label="Trạng Thái"
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="ALL">Tất cả</MenuItem>
            <MenuItem value="InProgress">Đang thực hiện</MenuItem>
            <MenuItem value="Completed">Hoàn thành</MenuItem>
            <MenuItem value="NotStarted">Chưa bắt đầu</MenuItem>
            <MenuItem value="OnHold">Tạm dừng</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Độ Ưu Tiên</InputLabel>
          <Select
            value={selectedPriority}
            label="Độ Ưu Tiên"
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="ALL">Tất cả</MenuItem>
            <MenuItem value="Urgent">Khẩn cấp</MenuItem>
            <MenuItem value="High">Cao</MenuItem>
            <MenuItem value="Medium">Trung bình</MenuItem>
            <MenuItem value="Low">Thấp</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ ml: 'auto' }}>
          <ToggleButtonGroup
            size="small"
            value={viewMode}
            exclusive
            onChange={(_, val) => val && setViewMode(val)}
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
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Không tìm thấy công việc nào phù hợp với điều kiện lọc.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {tasks.map((t) => (
                <Grid item xs={12} sm={6} md={4} key={t.id}>
                  <TaskCard
                    task={t}
                    onCardClick={handleRowClick}
                    onStatusChange={handleStatusChange}
                    onProgressChange={handleProgressChange}
                  />
                </Grid>
              ))}
            </Grid>
          )}
          <Paper sx={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', mt: 1 }}>
            <CommonPagination
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={totalCount}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[10, 20, 50, 100]}
            />
          </Paper>
        </>
      ) : (
        <Paper sx={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', bgcolor: '#ffffff' }}>
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
      />
    </Box>
  );
};
