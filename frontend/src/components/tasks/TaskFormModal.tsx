import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { PriorityLevel, TaskItem, TaskStatus, User } from '../../types';
import { useProjectMembersQuery, useProjectsListQuery } from '../../hooks/useProjects';

export interface TaskFormData {
  name: string;
  description: string;
  startDate: string;
  plannedEndDate: string;
  priority: PriorityLevel;
  status: TaskStatus;
  assigneeIds: string[];
  assigneeUserIds?: string[];
  projectId?: string;
}

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  editingTask?: TaskItem | null;
  parentTaskId?: string | null;
  projectId?: string;
  users?: User[];
  isSubmitting?: boolean;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  editingTask,
  parentTaskId,
  projectId,
  users = [],
  isSubmitting = false,
}) => {
  const { data: allProjects = [] } = useProjectsListQuery();
  const [selectedProjId, setSelectedProjId] = React.useState<string>('');

  useEffect(() => {
    if (projectId) {
      setSelectedProjId(projectId);
    } else if (editingTask?.projectId) {
      setSelectedProjId(editingTask.projectId);
    } else if (allProjects.length > 0 && !selectedProjId) {
      setSelectedProjId(allProjects[0].id);
    }
  }, [projectId, editingTask, allProjects, selectedProjId]);

  const targetProjectId = projectId || editingTask?.projectId || selectedProjId;
  const { data: projectMembers = [] } = useProjectMembersQuery(targetProjectId || undefined);

  // Filter selectable assignees: Only show members belonging to the current project
  const selectableUsers = useMemo(() => {
    // If a project context exists, strictly restrict assignees to members of this project
    if (targetProjectId) {
      const memberMap = new Map<string, User>();
      
      // 1. Add members from projectMembers query
      if (projectMembers && projectMembers.length > 0) {
        projectMembers.forEach((m) => {
          memberMap.set(m.userId, {
            id: m.userId,
            fullName: m.fullName,
            email: m.email,
            department: m.department || '',
            role: 'Employee',
            roleName: m.roleInProject || 'Thành viên dự án',
            isActive: true,
            createdAt: m.joinedAt,
          });
        });
      }

      // 2. Preserve already assigned users if they exist in editingTask
      if (editingTask?.assignees) {
        editingTask.assignees.forEach((a) => {
          const uId = a.userId || a.id;
          if (uId && !memberMap.has(uId)) {
            const u = users.find((user) => user.id === uId);
            memberMap.set(uId, {
              id: uId,
              fullName: a.fullName || u?.fullName || '',
              email: a.email || u?.email || '',
              department: a.department || u?.department || '',
              role: u?.role || 'Employee',
              roleName: 'Đã phân công',
              isActive: true,
              createdAt: a.assignedAt || '',
            });
          }
        });
      }

      return Array.from(memberMap.values());
    }

    // Only if no project was specified at all do we fall back to all users
    return users;
  }, [targetProjectId, projectMembers, users, editingTask]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    defaultValues: {
      name: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      plannedEndDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      priority: 'Medium',
      status: 'NotStarted',
      assigneeIds: [],
    },
  });

  useEffect(() => {
    if (open) {
      if (editingTask) {
        reset({
          name: editingTask.name,
          description: editingTask.description || '',
          startDate: editingTask.startDate ? editingTask.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
          plannedEndDate: editingTask.plannedEndDate ? editingTask.plannedEndDate.split('T')[0] : new Date().toISOString().split('T')[0],
          priority: editingTask.priority,
          status: editingTask.status,
          assigneeIds: editingTask.assignees ? editingTask.assignees.map((a) => a.userId || a.id) : [],
        });
      } else {
        reset({
          name: '',
          description: '',
          startDate: new Date().toISOString().split('T')[0],
          plannedEndDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          priority: 'Medium',
          status: 'NotStarted',
          assigneeIds: [],
        });
      }
    }
  }, [open, editingTask, reset]);

  const handleFormSubmit = async (formData: TaskFormData) => {
    const payload: TaskFormData = {
      ...formData,
      projectId: targetProjectId,
      assigneeIds: formData.assigneeIds || [],
      assigneeUserIds: formData.assigneeIds || [],
    };
    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle sx={{ fontWeight: 700, px: 3, pt: 2.5, pb: 1 }}>
          {editingTask
            ? `Chỉnh Sửa Công Việc: ${editingTask.name}`
            : parentTaskId
            ? 'Thêm Công Việc Con (Sub-task)'
            : 'Thêm Hạng Mục / Công Việc Mới'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '24px !important', px: 3 }}>
          {!editingTask && !projectId && allProjects.length > 0 && (
            <Autocomplete
              options={allProjects}
              getOptionLabel={(p) => `${p.code} - ${p.name}`}
              value={allProjects.find((p) => p.id === targetProjectId) || null}
              onChange={(_, val) => setSelectedProjId(val ? val.id : '')}
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Dự Án / Công Trình"
                  required
                  placeholder="Gõ tìm kiếm dự án..."
                />
              )}
            />
          )}

          <Controller
            name="name"
            control={control}
            rules={{ required: 'Trường này là bắt buộc' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Tên Công Việc"
                fullWidth
                required
                placeholder="VD: Gia công lắp dựng cốt thép đài móng..."
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Mô Tả Yêu Cầu Kỹ Thuật"
                multiline
                rows={2}
                fullWidth
                placeholder="Nhập yêu cầu kỹ thuật, nghiệm thu..."
              />
            )}
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Controller
                name="startDate"
                control={control}
                rules={{ required: 'Trường này là bắt buộc' }}
                render={({ field }) => (
                  <DatePicker
                    label="Ngày Bắt Đầu *"
                    value={field.value ? new Date(field.value) : null}
                    onChange={(newValue) => {
                      field.onChange(
                        newValue && !isNaN(newValue.getTime()) ? format(newValue, 'yyyy-MM-dd') : ''
                      );
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: Boolean(errors.startDate),
                        helperText: errors.startDate?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="plannedEndDate"
                control={control}
                rules={{ required: 'Trường này là bắt buộc' }}
                render={({ field }) => (
                  <DatePicker
                    label="Hạn Kết Thúc Dự Kiến *"
                    value={field.value ? new Date(field.value) : null}
                    onChange={(newValue) => {
                      field.onChange(
                        newValue && !isNaN(newValue.getTime()) ? format(newValue, 'yyyy-MM-dd') : ''
                      );
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: Boolean(errors.plannedEndDate),
                        helperText: errors.plannedEndDate?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Mức Độ Ưu Tiên</InputLabel>
                    <Select {...field} label="Mức Độ Ưu Tiên">
                      <MenuItem value="Low">Thấp</MenuItem>
                      <MenuItem value="Medium">Trung bình</MenuItem>
                      <MenuItem value="High">Cao</MenuItem>
                      <MenuItem value="Urgent">Khẩn cấp</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Trạng Thái</InputLabel>
                    <Select {...field} label="Trạng Thái">
                      <MenuItem value="NotStarted">Chưa bắt đầu</MenuItem>
                      <MenuItem value="InProgress">Đang thực hiện</MenuItem>
                      <MenuItem value="Completed">Hoàn thành</MenuItem>
                      <MenuItem value="OnHold">Tạm dừng</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>

          <Controller
            name="assigneeIds"
            control={control}
            render={({ field }) => (
              <Autocomplete
                multiple
                options={selectableUsers}
                getOptionLabel={(option) =>
                  typeof option === 'string'
                    ? option
                    : `${option.fullName} (${option.roleName || option.role}${option.department ? ` - ${option.department}` : ''})`
                }
                value={selectableUsers.filter((u) => field.value?.includes(u.id))}
                onChange={(_, newValue) => field.onChange(newValue.map((u) => (typeof u === 'string' ? u : u.id)))}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Người Thực Hiện (Chỉ nhân sự thuộc dự án)"
                    placeholder="Chọn nhân sự trong dự án..."
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.fullName}
                      size="small"
                      sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600, bgcolor: '#e0f2fe', color: '#0369a1' }}
                    />
                  ))
                }
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} variant="outlined" color="inherit" disabled={isSubmitting}>
            Hủy Bỏ
          </Button>
          <Button type="submit" variant="contained" sx={{ bgcolor: '#0284c7' }} disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Lưu Công Việc'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
