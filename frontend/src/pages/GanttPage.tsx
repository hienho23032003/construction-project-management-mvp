import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Autocomplete,
  TextField,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Plus } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useProjectsListQuery } from '../hooks/useProjects';
import {
  useGanttDataQuery,
  useTaskDetailQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from '../hooks/useTasks';
import { useUsersListQuery } from '../hooks/useEmployees';
import { InteractiveGantt } from '../components/gantt/InteractiveGantt';
import { GanttSkeleton } from '../components/common/GanttSkeleton';
import { EmptyStateIllustration } from '../components/common/EmptyStateIllustration';
import { TaskFormModal, TaskFormData } from '../components/tasks/TaskFormModal';
import { GanttTask } from '../types';

const getInitialMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  };
};

export const GanttPage: React.FC = () => {
  const { canEditTask } = useAuth();
  const initialMonth = useMemo(() => getInitialMonthRange(), []);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDatePreset, setSelectedDatePreset] = useState<string>('THIS_MONTH');
  const [customStartDate, setCustomStartDate] = useState<string>(initialMonth.start);
  const [customEndDate, setCustomEndDate] = useState<string>(initialMonth.end);

  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    taskId?: string | null;
    projectId?: string;
    parentTaskId?: string | null;
  }>({
    open: false,
    mode: 'create',
    taskId: null,
    projectId: undefined,
    parentTaskId: null,
  });

  const { data: projects = [], isLoading: isProjectsLoading } = useProjectsListQuery();

  const ganttQueryParams = useMemo(() => {
    const params: {
      projectId?: string;
      status?: string;
      activeOnly?: boolean;
      fromDate?: string;
      toDate?: string;
    } = {};

    if (selectedProjectId !== 'ALL') {
      params.projectId = selectedProjectId;
    }

    if (selectedStatus === 'ACTIVE_ONLY') {
      params.activeOnly = true;
    } else if (selectedStatus !== 'ALL') {
      params.status = selectedStatus;
    }

    if (customStartDate) {
      params.fromDate = customStartDate;
    }
    if (customEndDate) {
      params.toDate = customEndDate;
    }

    return params;
  }, [selectedProjectId, selectedStatus, customStartDate, customEndDate]);

  const {
    data: ganttData,
    isLoading: isGanttLoading,
    isFetching: isGanttFetching,
    refetch,
  } = useGanttDataQuery(ganttQueryParams);

  const activeEditingTaskId = modalState.mode === 'edit' ? modalState.taskId : null;
  const { data: editingTask } = useTaskDetailQuery(activeEditingTaskId);
  const { data: users = [] } = useUsersListQuery();

  const createTaskMutation = useCreateTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();

  const showLoading = (isGanttLoading || isProjectsLoading) || (!ganttData && isGanttFetching);

  const handlePresetChange = (preset: string) => {
    setSelectedDatePreset(preset);
    const now = new Date();
    if (preset === 'ALL') {
      setCustomStartDate('');
      setCustomEndDate('');
    } else if (preset === 'THIS_MONTH') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setCustomStartDate(format(start, 'yyyy-MM-dd'));
      setCustomEndDate(format(end, 'yyyy-MM-dd'));
    } else if (preset === 'THIS_QUARTER') {
      const q = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), q * 3, 1);
      const end = new Date(now.getFullYear(), q * 3 + 3, 0);
      setCustomStartDate(format(start, 'yyyy-MM-dd'));
      setCustomEndDate(format(end, 'yyyy-MM-dd'));
    } else if (preset === 'NEXT_6_MONTHS') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = addDays(start, 180);
      setCustomStartDate(format(start, 'yyyy-MM-dd'));
      setCustomEndDate(format(end, 'yyyy-MM-dd'));
    } else if (preset === 'THIS_YEAR') {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      setCustomStartDate(format(start, 'yyyy-MM-dd'));
      setCustomEndDate(format(end, 'yyyy-MM-dd'));
    }
  };

  const tasksList = ganttData?.tasks || [];
  const linksList = ganttData?.links || [];

  const handleTaskClick = useCallback((task: GanttTask) => {
    if (task.type === 'project' || task.type === 'phase') {
      return;
    }
    setModalState({
      open: true,
      mode: 'edit',
      taskId: task.realTaskId || task.id,
      projectId: task.projectId,
      parentTaskId: task.parentId || null,
    });
  }, []);

  const handleOpenCreate = useCallback(() => {
    setModalState({
      open: true,
      mode: 'create',
      taskId: null,
      projectId: selectedProjectId !== 'ALL' ? selectedProjectId : undefined,
      parentTaskId: null,
    });
  }, [selectedProjectId]);

  const handleCloseModal = useCallback(() => {
    setModalState({
      open: false,
      mode: 'create',
      taskId: null,
      projectId: undefined,
      parentTaskId: null,
    });
  }, []);

  const handleSaveTask = async (formData: TaskFormData) => {
    if (modalState.mode === 'edit' && modalState.taskId) {
      await updateTaskMutation.mutateAsync({
        id: modalState.taskId,
        data: formData,
      });
    } else {
      const finalProjectId =
        formData.projectId ||
        modalState.projectId ||
        (selectedProjectId !== 'ALL' ? selectedProjectId : undefined);

      if (!finalProjectId) return;

      await createTaskMutation.mutateAsync({
        ...formData,
        projectId: finalProjectId,
        parentId: modalState.parentTaskId || undefined,
      });
    }
    handleCloseModal();
    refetch();
  };

  const filterBar = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', width: { xs: '100%', lg: 'auto' } }}>
      <Autocomplete
        size="small"
        options={[{ id: 'ALL', code: 'ALL', name: 'Tất cả công trình (Tổng quan)' }, ...projects]}
        getOptionLabel={(p) => (p.id === 'ALL' ? 'Tất cả công trình (Tổng quan)' : `${p.code} - ${p.name}`)}
        value={
          selectedProjectId === 'ALL'
            ? { id: 'ALL', code: 'ALL', name: 'Tất cả công trình (Tổng quan)' }
            : projects.find((p) => p.id === selectedProjectId) || { id: 'ALL', code: 'ALL', name: 'Tất cả công trình (Tổng quan)' }
        }
        onChange={(_, val) => setSelectedProjectId(val ? val.id : 'ALL')}
        isOptionEqualToValue={(opt, val) => opt.id === val.id}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Chọn dự án..."
            sx={{
              bgcolor: '#ffffff',
              '& .MuiOutlinedInput-root': { height: 32, fontSize: '0.8rem' },
            }}
          />
        )}
        sx={{ width: { xs: '100%', sm: 240, md: 280 } }}
      />

      <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' }, flexWrap: 'nowrap' }}>
        <FormControl size="small" sx={{ width: { xs: '50%', sm: 145 }, minWidth: { xs: '50%', sm: 145 } }}>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            displayEmpty
            sx={{
              height: 32,
              bgcolor: '#ffffff',
              fontSize: '0.8rem',
            }}
          >
            <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
            <MenuItem value="ACTIVE_ONLY">Chưa xong (Đang & Chưa làm)</MenuItem>
            <MenuItem value="InProgress">Đang thực hiện</MenuItem>
            <MenuItem value="NotStarted">Chưa bắt đầu</MenuItem>
            <MenuItem value="Completed">Hoàn thành</MenuItem>
            <MenuItem value="OnHold">Tạm dừng</MenuItem>
            <MenuItem value="Overdue">Trễ tiến độ</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ width: { xs: '50%', sm: 135 }, minWidth: { xs: '50%', sm: 135 } }}>
          <Select
            value={selectedDatePreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            sx={{
              height: 32,
              bgcolor: '#ffffff',
              fontSize: '0.8rem',
            }}
          >
            <MenuItem value="ALL">Tất cả thời gian</MenuItem>
            <MenuItem value="THIS_MONTH">Tháng này</MenuItem>
            <MenuItem value="THIS_QUARTER">Quý này</MenuItem>
            <MenuItem value="NEXT_6_MONTHS">6 tháng tới</MenuItem>
            <MenuItem value="THIS_YEAR">Năm nay</MenuItem>
            <MenuItem value="CUSTOM">Tùy chỉnh...</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {selectedDatePreset === 'CUSTOM' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: { xs: '100%', sm: 'auto' } }}>
          <DatePicker
            label="Từ ngày"
            value={customStartDate ? new Date(customStartDate) : null}
            onChange={(newVal) =>
              setCustomStartDate(newVal && !isNaN(newVal.getTime()) ? format(newVal, 'yyyy-MM-dd') : '')
            }
            slotProps={{
              textField: {
                size: 'small',
                sx: {
                  width: { xs: 'calc(50% - 10px)', sm: 135 },
                  bgcolor: '#ffffff',
                  '& .MuiOutlinedInput-root': { height: 32, fontSize: '0.78rem' },
                },
              },
            }}
          />
          <Typography variant="caption" sx={{ color: '#64748b' }}>-</Typography>
          <DatePicker
            label="Đến ngày"
            value={customEndDate ? new Date(customEndDate) : null}
            onChange={(newVal) =>
              setCustomEndDate(newVal && !isNaN(newVal.getTime()) ? format(newVal, 'yyyy-MM-dd') : '')
            }
            slotProps={{
              textField: {
                size: 'small',
                sx: {
                  width: { xs: 'calc(50% - 10px)', sm: 135 },
                  bgcolor: '#ffffff',
                  '& .MuiOutlinedInput-root': { height: 32, fontSize: '0.78rem' },
                },
              },
            }}
          />
        </Box>
      )}

      {tasksList.length > 0 && (
        <Chip
          label={`${tasksList.filter((t) => t.type !== 'project').length} việc`}
          size="small"
          sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 700, height: 26, fontSize: '0.75rem' }}
        />
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        height: {
          xs: 'calc(100vh - 175px)',
          sm: 'calc(100vh - 150px)',
          md: 'calc(100vh - 132px)',
        },
        minHeight: 520,
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      {/* Header & Main Create Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
          flexShrink: 0,
          width: '100%',
        }}
      >
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.35rem' }, color: '#0f172a' }}>
            Biểu Đồ Tiến Độ Gantt Toàn Hệ Thống
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.25, fontSize: { xs: '0.78rem', sm: '0.875rem' } }}>
            Theo dõi dòng thời gian thi công, phân cấp công việc và nhấp vào công việc để chỉnh sửa chi tiết
          </Typography>
        </Box>

        {canEditTask && (
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={handleOpenCreate}
            sx={{
              bgcolor: '#0284c7',
              '&:hover': { bgcolor: '#0369a1' },
              borderRadius: '8px',
              fontWeight: 600,
              px: 2,
              py: 0.8,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
            }}
          >
            Thêm Công Việc
          </Button>
        )}
      </Box>

      {/* Interactive Gantt Component or Skeleton Loading or Empty State */}
      {showLoading ? (
        <GanttSkeleton />
      ) : tasksList.length > 0 ? (
        <Box sx={{ flexGrow: 1, minHeight: 0, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <InteractiveGantt
            tasks={tasksList}
            links={linksList}
            canEdit={canEditTask}
            onTaskUpdated={refetch}
            onTaskClick={handleTaskClick}
            filterBar={filterBar}
          />
        </Box>
      ) : (
        <Paper
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            overflow: 'hidden',
          }}
        >
          {/* Top toolbar when empty so user can still switch filters */}
          <Box
            sx={{
              p: 1.25,
              px: 2,
              borderBottom: '1px solid #e2e8f0',
              bgcolor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            {filterBar}
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              p: 6,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
            }}
          >
            <EmptyStateIllustration width={154} height={121} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#334155', mt: 1 }}>
              Không có công việc nào trong khoảng thời gian này
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 460 }}>
              Không tìm thấy dữ liệu tiến độ phù hợp với bộ lọc hiện tại. Hãy thử chọn khoảng thời gian khác (hoặc "Tất cả thời gian") hoặc thay đổi bộ lọc trạng thái.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handlePresetChange('ALL')}
              sx={{ mt: 1, textTransform: 'none', borderRadius: '6px', fontWeight: 600 }}
            >
              Xem Tất Cả Thời Gian
            </Button>
          </Box>
        </Paper>
      )}

      {/* Task Form Modal (Create or Edit) */}
      {modalState.open && (
        <TaskFormModal
          open={modalState.open}
          onClose={handleCloseModal}
          onSubmit={handleSaveTask}
          editingTask={editingTask}
          projectId={
            modalState.projectId ||
            editingTask?.projectId ||
            (selectedProjectId !== 'ALL' ? selectedProjectId : undefined)
          }
          parentTaskId={modalState.parentTaskId}
          users={users}
          isSubmitting={createTaskMutation.isPending || updateTaskMutation.isPending}
        />
      )}
    </Box>
  );
};
