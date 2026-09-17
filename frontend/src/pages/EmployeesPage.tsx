import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { CommonSelect } from '../components/common/CommonSelect';
import {
  Users,
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePermission } from '../hooks/usePermission';
import { PERMISSIONS } from '../constants/permissions';
import { User } from '../types';
import { EmployeeCard } from '../components/employees/EmployeeCard';
import { EmployeeTable } from '../components/employees/EmployeeTable';
import { EmployeeFormModal, EmployeeFormData } from '../components/employees/EmployeeFormModal';
import { ResetPasswordModal } from '../components/employees/ResetPasswordModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { CardGridSkeleton } from '../components/common/CardGridSkeleton';
import { TableSkeleton } from '../components/common/TableSkeleton';
import { CommonPagination } from '../components/common/CommonPagination';
import { CommonButton, CommonInput } from '../components/common';
import { useDebounce } from '../hooks/useDebounce';
import {
  useUsersQuery,
  useUserWorkloadQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useToggleUserStatusMutation,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
} from '../hooks/useEmployees';
import { useRolesQuery } from '../hooks/useRoles';

export const roleLabels: Record<string, string> = {
  SuperAdmin: 'Quản Trị Viên (Super Admin)',
  ProjectManager: 'Người Quản Lý (PM)',
  Supervisor: 'Giám Sát Hiện Trường',
  Employee: 'Kỹ Sư / Nhân Viên',
};

export const EmployeesPage: React.FC = () => {
  const { can, isSuperAdmin } = usePermission();
  const canCreate = isSuperAdmin || can(PERMISSIONS.EMPLOYEES_CREATE);
  const canEdit = isSuperAdmin || can(PERMISSIONS.EMPLOYEES_EDIT);
  const canDelete = isSuperAdmin || can(PERMISSIONS.EMPLOYEES_DELETE);
  const canResetPassword = isSuperAdmin || can(PERMISSIONS.EMPLOYEES_RESET_PASSWORD);

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('fullName');
  const [isDescending, setIsDescending] = useState(false);

  const handleViewModeChange = (val: 'grid' | 'table') => {
    setViewMode(val);
    if (val === 'grid') {
      if (rowsPerPage === 20) {
        setRowsPerPage(15);
      } else if (rowsPerPage !== 10 && rowsPerPage !== 15 && rowsPerPage !== 20 && rowsPerPage !== 30 && rowsPerPage !== 50 && rowsPerPage !== 100) {
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

  // Modal & Dialog state
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetPasswordTarget, setResetPasswordTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [toggleTarget, setToggleTarget] = useState<User | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const { data: roleList = [] } = useRolesQuery();

  const roleFilterOptions = React.useMemo(() => {
    const base = [{ value: 'ALL', label: 'Tất Cả Vai Trò' }];
    if (roleList && roleList.length > 0) {
      roleList.forEach((r) => {
        base.push({
          value: r.id,
          label: r.name,
        });
      });
    }
    return base;
  }, [roleList]);

  // Queries & Mutations
  const { data, isLoading, isFetching } = useUsersQuery({
    pageIndex: page + 1,
    pageSize: rowsPerPage,
    search: debouncedSearch.trim() || undefined,
    role: roleFilter === 'ALL' ? undefined : roleFilter,
    sortBy,
    isDescending,
  });

  const { data: workloads = [] } = useUserWorkloadQuery();
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const toggleStatusMutation = useToggleUserStatusMutation();
  const deleteMutation = useDeleteUserMutation();
  const resetPasswordMutation = useResetUserPasswordMutation();

  const users = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setIsDescending(!isDescending);
    } else {
      setSortBy(field);
      setIsDescending(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setOpenModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setOpenModal(true);
  };

  const handleResetPassword = async (userId: string, newPassword: string) => {
    await resetPasswordMutation.mutateAsync({ id: userId, newPassword });
    setResetPasswordTarget(null);
  };

  const handleSubmitUser = async (formData: EmployeeFormData) => {
    if (editingUser) {
      await updateMutation.mutateAsync({
        id: editingUser.id,
        data: {
          fullName: formData.fullName,
          phone: formData.phone,
          department: formData.department,
          role: formData.role,
          roleIds: formData.roleIds,
          isActive: formData.isActive ?? true,
          newPassword: formData.password || undefined,
        },
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setOpenModal(false);
    setEditingUser(null);
  };

  const handleConfirmToggleStatus = async () => {
    if (toggleTarget) {
      await toggleStatusMutation.mutateAsync(toggleTarget.id);
      setToggleTarget(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 }, width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, width: '100%' }}>
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.35rem' }, color: 'text.primary' }}>
            Quản Lý Nhân Sự & Tải Công Việc (Workload)
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            Danh sách kỹ sư, phân quyền vai trò và phân bổ khối lượng công việc hiện trường
          </Typography>
        </Box>

        {canCreate && (
          <CommonButton
            variant="primary"
            startIcon={<Plus size={18} />}
            onClick={handleOpenCreate}
          >
            Thêm Nhân Viên Mới
          </CommonButton>
        )}
      </Box>

      {/* Filter & Toolbar */}
      <Paper sx={{ p: { xs: 1.5, sm: 2 }, border: '1px solid', borderColor: 'divider', borderRadius: '8px', bgcolor: 'background.paper', display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', width: '100%', maxWidth: '100%' }}>
        {/* Compact Search Input */}
        <Box sx={{ width: { xs: '100%', sm: 300, md: 360 }, minWidth: 0 }}>
          <CommonInput
            isSearch
            clearable
            placeholder="Tìm theo họ tên, email, phòng..."
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

        {/* Role Filter */}
        <Box sx={{ minWidth: 180, flex: { xs: '1 1 100%', sm: '0 0 auto' } }}>
          <CommonSelect
            size="small"
            value={roleFilter}
            onChange={(val) => {
              setRoleFilter(val);
              setPage(0);
            }}
            options={roleFilterOptions}
          />
        </Box>

        {/* View mode toggle */}
        <Box sx={{ ml: 'auto' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, val) => val && handleViewModeChange(val)}
            size="small"
          >
            <ToggleButton value="table" aria-label="table view">
              <ListIcon size={16} />
            </ToggleButton>
            <ToggleButton value="grid" aria-label="grid view">
              <LayoutGrid size={16} />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {/* Content Section */}
      {viewMode === 'grid' ? (
        isLoading ? (
          <CardGridSkeleton count={rowsPerPage > 10 ? 10 : rowsPerPage} />
        ) : (
          <>
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
              }}
            >
              {users.map((u) => {
                const workload = workloads.find((w: any) => w.userId === u.id) || {
                  activeTasks: 0,
                  completedTasks: 0,
                  overdueTasks: 0,
                };
                return (
                  <EmployeeCard
                    key={u.id}
                    user={u}
                    workload={workload}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    canResetPassword={canResetPassword}
                    onEdit={handleOpenEdit}
                    onResetPassword={(target) => setResetPasswordTarget(target)}
                    onToggleStatus={(target) => setToggleTarget(target)}
                    onDelete={(target) => setDeleteTarget(target)}
                  />
                );
              })}
            </Box>
            <Paper sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', overflow: 'hidden', mt: 1, bgcolor: 'background.paper' }}>
              <CommonPagination
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={totalCount}
                onPageChange={(newPage) => setPage(newPage)}
                onRowsPerPageChange={(newRowsPerPage) => {
                  setRowsPerPage(newRowsPerPage);
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 15, 20, 30, 50, 100]}
              />
            </Paper>
          </>
        )
      ) : (
        <Paper sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', overflow: 'hidden', bgcolor: 'background.paper' }}>
          <EmployeeTable
            users={users}
            workloads={workloads}
            loading={isLoading || isFetching}
            page={page}
            rowsPerPage={rowsPerPage}
            sortBy={sortBy}
            isDescending={isDescending}
            onSort={handleSort}
            canEdit={canEdit}
            canDelete={canDelete}
            canResetPassword={canResetPassword}
            onEdit={handleOpenEdit}
            onResetPassword={(target) => setResetPasswordTarget(target)}
            onToggleStatus={(target) => setToggleTarget(target)}
            onDelete={(target) => setDeleteTarget(target)}
          />
          <CommonPagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={totalCount}
            onPageChange={(newPage) => setPage(newPage)}
            onRowsPerPageChange={(newRowsPerPage) => {
              setRowsPerPage(newRowsPerPage);
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50, 100]}
          />
        </Paper>
      )}

      {/* Add / Edit User Modal */}
      <EmployeeFormModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingUser(null);
        }}
        onSubmit={handleSubmitUser}
        editingUser={editingUser}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        open={Boolean(resetPasswordTarget)}
        onClose={() => setResetPasswordTarget(null)}
        onSubmit={handleResetPassword}
        user={resetPasswordTarget}
        isSubmitting={resetPasswordMutation.isPending}
      />

      {/* Lock / Unlock Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(toggleTarget)}
        title={toggleTarget?.isActive ? 'Khóa Tài Khoản Nhân Sự' : 'Mở Khóa Tài Khoản Nhân Sự'}
        message={
          toggleTarget?.isActive
            ? `Bạn có chắc chắn muốn khóa tài khoản của "${toggleTarget?.fullName}" (${toggleTarget?.email})? Nhân viên này sẽ không thể đăng nhập vào hệ thống.`
            : `Bạn có muốn mở khóa tài khoản của "${toggleTarget?.fullName}" (${toggleTarget?.email}) để nhân viên có thể đăng nhập bình thường?`
        }
        confirmText={toggleTarget?.isActive ? 'Khóa Tài Khoản' : 'Mở Khóa'}
        confirmColor={toggleTarget?.isActive ? 'warning' : 'primary'}
        onConfirm={handleConfirmToggleStatus}
        onCancel={() => setToggleTarget(null)}
      />

      {/* Delete User Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xác Nhận Xóa Nhân Viên"
        message={`Bạn có chắc chắn muốn xóa tài khoản "${deleteTarget?.fullName}" (${deleteTarget?.email})? Hành động này sẽ xóa toàn bộ phân quyền và gỡ phân công công việc của nhân viên.`}
        confirmText="Xóa Nhân Viên"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};
