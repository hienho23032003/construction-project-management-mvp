import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import { X } from 'lucide-react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { PriorityLevel, TaskItem, TaskStatus, User } from '../../types';
import { useProjectMembersQuery, useProjectsListQuery } from '../../hooks/useProjects';
import { useUsersListQuery } from '../../hooks/useEmployees';
import { usePresenceHeartbeat } from '../../hooks/usePresence';
import { CoEditingWarningBanner } from '../presence/ProjectPresenceAvatars';
import { CommonButton, CommonInput, UserMultiSelect } from '../common';
import { useAuth } from '../../contexts/AuthContext';

export interface TaskFormData {
  name: string;
  description: string;
  startDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
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
  onlySelfAssign?: boolean;
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
  onlySelfAssign = false,
}) => {
  const { user: currentUser } = useAuth();
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

  const { data: allUsers = [] } = useUsersListQuery();
  const targetProjectId = projectId || editingTask?.projectId || selectedProjId;
  const { data: projectMembers = [] } = useProjectMembersQuery(targetProjectId || undefined);

  // Filter selectable assignees: Only show members belonging to the current project, with exact dynamic roles from API
  const selectableUsers = useMemo(() => {
    const userPool = allUsers.length > 0 ? allUsers : users;

    if (onlySelfAssign && currentUser) {
      const u = userPool.find((usr) => usr.id === currentUser.id);
      const roleName = (u?.roles && u.roles.length > 0 ? u.roles[0] : null)
        || u?.roleName
        || (currentUser.roles && currentUser.roles.length > 0 ? currentUser.roles[0] : null)
        || currentUser.roleName
        || currentUser.role
        || 'Nhân viên';

      return [{
        id: currentUser.id,
        fullName: currentUser.fullName,
        email: currentUser.email,
        department: currentUser.department || u?.department || '',
        avatarUrl: currentUser.avatarUrl || u?.avatarUrl,
        role: currentUser.role || u?.role || 'Employee',
        roleName,
        roles: u?.roles || currentUser.roles || (roleName ? [roleName] : []),
        isActive: true,
        createdAt: '',
      }];
    }

    // If a project context exists, strictly restrict assignees to members of this project
    if (targetProjectId) {
      const memberMap = new Map<string, User>();
      
      // 1. Add members from projectMembers query
      if (projectMembers && projectMembers.length > 0) {
        projectMembers.forEach((m) => {
          const u = userPool.find((usr) => usr.id === m.userId);
          const resolvedRole = (u?.roles && u.roles.length > 0 ? u.roles[0] : null)
            || u?.roleName
            || (m.roles && m.roles.length > 0 ? m.roles[0] : null)
            || m.roleName
            || u?.role
            || m.roleInProject
            || 'Nhân viên';

          memberMap.set(m.userId, {
            id: m.userId,
            fullName: m.fullName || u?.fullName || 'Nhân sự',
            email: m.email || u?.email || '',
            department: m.department || u?.department || '',
            avatarUrl: m.avatarUrl || u?.avatarUrl,
            role: u?.role || 'Employee',
            roleName: resolvedRole,
            roles: u?.roles || m.roles || (resolvedRole ? [resolvedRole] : []),
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
            const u = userPool.find((user) => user.id === uId);
            const resolvedRole = (u?.roles && u.roles.length > 0 ? u.roles[0] : null)
              || u?.roleName
              || u?.role
              || 'Nhân viên';

            memberMap.set(uId, {
              id: uId,
              fullName: a.fullName || u?.fullName || '',
              email: a.email || u?.email || '',
              department: a.department || u?.department || '',
              avatarUrl: u?.avatarUrl,
              role: u?.role || 'Employee',
              roleName: resolvedRole,
              roles: u?.roles || (resolvedRole ? [resolvedRole] : []),
              isActive: true,
              createdAt: a.assignedAt || '',
            });
          }
        });
      }

      return Array.from(memberMap.values());
    }

    // Only if no project was specified at all do we fall back to all users
    return userPool.length > 0 ? userPool : users;
  }, [targetProjectId, projectMembers, users, allUsers, editingTask, onlySelfAssign, currentUser]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<TaskFormData>({
    defaultValues: {
      name: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      plannedEndDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      actualEndDate: '',
      priority: 'Medium',
      status: 'NotStarted',
      assigneeIds: onlySelfAssign && currentUser ? [currentUser.id] : [],
    },
  });

  const watchedStartDate = watch('startDate');
  const watchedEndDate = watch('plannedEndDate');
  const watchedStatus = watch('status');

  useEffect(() => {
    if (open) {
      if (editingTask) {
        reset({
          name: editingTask.name,
          description: editingTask.description || '',
          startDate: editingTask.startDate ? editingTask.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
          plannedEndDate: editingTask.plannedEndDate ? editingTask.plannedEndDate.split('T')[0] : new Date().toISOString().split('T')[0],
          actualEndDate: editingTask.actualEndDate ? editingTask.actualEndDate.split('T')[0] : (editingTask.status === 'Completed' ? (editingTask.plannedEndDate ? editingTask.plannedEndDate.split('T')[0] : new Date().toISOString().split('T')[0]) : ''),
          priority: editingTask.priority,
          status: editingTask.status,
          assigneeIds: editingTask.assignees ? editingTask.assignees.map((a) => a.userId || a.id) : (onlySelfAssign && currentUser ? [currentUser.id] : []),
        });
      } else {
        reset({
          name: '',
          description: '',
          startDate: new Date().toISOString().split('T')[0],
          plannedEndDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          actualEndDate: '',
          priority: 'Medium',
          status: 'NotStarted',
          assigneeIds: onlySelfAssign && currentUser ? [currentUser.id] : [],
        });
      }
    }
  }, [open, editingTask, reset, onlySelfAssign, currentUser]);

  usePresenceHeartbeat({
    projectId: targetProjectId || undefined,
    taskId: editingTask?.id,
    taskName: editingTask?.name,
    isEditing: Boolean(editingTask && open),
    enabled: open && Boolean(targetProjectId),
  });

  const handleFormSubmit = async (data: TaskFormData) => {
    const assignees = Array.isArray(data.assigneeIds) ? data.assigneeIds : [];
    const payload: any = {
      ...data,
      projectId: targetProjectId,
      parentId: parentTaskId || null,
      assigneeIds: assignees,
      assigneeUserIds: assignees,
    };
    if (!data.actualEndDate || data.actualEndDate.trim() === '') {
      delete payload.actualEndDate;
    }
    await onSubmit(payload);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: '1.25rem',
          px: 3,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '1.15rem', color: 'text.primary', pr: 2, wordBreak: 'break-word' }}>
          {editingTask ? `Chỉnh Sửa Công Việc: ${editingTask.name}` : parentTaskId ? 'Thêm Công Việc Con' : 'Tạo Công Việc Mới'}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            flexShrink: 0,
            '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
          }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 3, overflowY: 'auto' }}>
          {editingTask && targetProjectId && (
            <CoEditingWarningBanner projectId={targetProjectId} taskId={editingTask.id} />
          )}
          {!projectId && (
            <FormControl fullWidth size="small">
              <InputLabel>Thuộc Dự Án *</InputLabel>
              <Select
                value={selectedProjId}
                label="Thuộc Dự Án *"
                onChange={(e) => setSelectedProjId(e.target.value)}
                disabled={Boolean(editingTask)}
              >
                {allProjects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Controller
            name="name"
            control={control}
            rules={{ required: 'Tên công việc không được để trống' }}
            render={({ field }) => (
              <CommonInput
                {...field}
                label="Tên Công Việc"
                required
                fullWidth
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
                placeholder="Ví dụ: Đổ bê tông móng trục A-B..."
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <CommonInput
                {...field}
                label="Mô Tả Yêu Cầu Kỹ Thuật"
                fullWidth
                multiline
                rows={2.5}
                placeholder="Nhập yêu cầu kỹ thuật, nghiệm thu..."
              />
            )}
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Controller
                name="startDate"
                control={control}
                rules={{
                  required: 'Trường này là bắt buộc',
                  validate: (val) => {
                    const end = watch('plannedEndDate');
                    if (val && end && new Date(val) > new Date(end)) {
                      return 'Ngày bắt đầu không được lớn hơn hạn kết thúc';
                    }
                    return true;
                  },
                }}
                render={({ field }) => (
                  <DatePicker
                    label="Ngày Bắt Đầu"
                    value={field.value ? new Date(field.value) : null}
                    maxDate={watchedEndDate ? new Date(watchedEndDate) : undefined}
                    onChange={(newValue) => {
                      field.onChange(
                        newValue && !isNaN(newValue.getTime()) ? format(newValue, 'yyyy-MM-dd') : ''
                      );
                      trigger('plannedEndDate');
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
                rules={{
                  required: 'Trường này là bắt buộc',
                  validate: (val) => {
                    const start = watch('startDate');
                    if (val && start && new Date(val) < new Date(start)) {
                      return 'Hạn kết thúc không được nhỏ hơn ngày bắt đầu';
                    }
                    return true;
                  },
                }}
                render={({ field }) => (
                  <DatePicker
                    label="Hạn Kết Thúc Dự Kiến"
                    value={field.value ? new Date(field.value) : null}
                    minDate={watchedStartDate ? new Date(watchedStartDate) : undefined}
                    onChange={(newValue) => {
                      field.onChange(
                        newValue && !isNaN(newValue.getTime()) ? format(newValue, 'yyyy-MM-dd') : ''
                      );
                      trigger('startDate');
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

          {watchedStatus === 'Completed' && (
            <Controller
              name="actualEndDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Ngày Hoàn Thành Thực Tế"
                  value={field.value ? new Date(field.value) : (watchedEndDate ? new Date(watchedEndDate) : new Date())}
                  onChange={(newValue) => {
                    field.onChange(
                      newValue && !isNaN(newValue.getTime()) ? format(newValue, 'yyyy-MM-dd') : ''
                    );
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: 'Dùng để đánh giá hoàn thành đúng hạn hay trễ hạn',
                    },
                  }}
                />
              )}
            />
          )}

          <Controller
            name="assigneeIds"
            control={control}
            render={({ field }) => (
              <UserMultiSelect
                users={selectableUsers}
                value={field.value || []}
                onChange={field.onChange}
                label="Người Thực Hiện"
                placeholder="Chọn nhân sự trong dự án..."
                disabled={onlySelfAssign}
                helperText={onlySelfAssign ? 'Chỉ được tạo công việc cho chính bạn (Do không có quyền Xem toàn bộ)' : undefined}
                defaultRoleFallback="Thành viên"
              />
            )}
          />
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#141414' : '#f8fafc',
            borderTop: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1.5,
          }}
        >
          <CommonButton onClick={onClose} variant="secondary" disabled={isSubmitting}>
            Hủy Bỏ
          </CommonButton>
          <CommonButton type="submit" variant="primary" loading={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Lưu Công Việc'}
          </CommonButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};
