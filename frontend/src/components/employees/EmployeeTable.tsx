import React, { memo, useMemo } from 'react';
import {
  Box,
  Avatar,
  Chip,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Edit2, Lock, Unlock, Trash2 } from 'lucide-react';
import { User } from '../../types';
import { roleLabels } from '../../pages/EmployeesPage';
import { CommonTable, ColumnDef } from '../common/CommonTable';

interface EmployeeTableProps {
  users: User[];
  workloads: any[];
  page?: number;
  rowsPerPage?: number;
  sortBy: string;
  isDescending: boolean;
  onSort: (field: string) => void;
  isAdmin?: boolean;
  onEdit?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
  onDelete?: (user: User) => void;
  loading?: boolean;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = memo(({
  users,
  workloads,
  page = 0,
  rowsPerPage = 9,
  sortBy,
  isDescending,
  onSort,
  isAdmin = false,
  onEdit,
  onToggleStatus,
  onDelete,
  loading = false,
}) => {
  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        id: 'fullName',
        header: 'Họ Và Tên',
        accessorKey: 'fullName',
        sortable: true,
        width: '15%',
        minWidth: 160,
        ellipsis: true,
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 32, height: 32, fontSize: '0.85rem' }}>
              {row.fullName.charAt(0)}
            </Avatar>
            <Typography
              variant="body2"
              noWrap
              sx={{
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {row.fullName}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'email',
        header: 'Email',
        accessorKey: 'email',
        sortable: true,
        width: '20%',
        minWidth: 150,
        ellipsis: true,
      },
      {
        id: 'phone',
        width: '10%',
        header: 'Số Điện Thoại',
        accessorFn: (row) => row.phone || '-',
      },
      {
        id: 'department',
        header: 'Phòng Ban',
        accessorKey: 'department',
        sortable: true,
        width: '18%',
        minWidth: 130,
        ellipsis: true,
        cell: ({ value }) => value || 'Chưa phân ban',
      },
      {
        id: 'role',
        header: 'Vai Trò',
        accessorKey: 'role',
        sortable: true,
        width: '18%',
        cell: ({ row }) => (
          <Chip
            label={roleLabels[row.role] || row.roleName || row.role}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.7rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              bgcolor:
                row.role === 'SuperAdmin'
                  ? '#fee2e2'
                  : row.role === 'ProjectManager'
                  ? '#e0f2fe'
                  : '#ecfdf5',
              color:
                row.role === 'SuperAdmin'
                  ? '#b91c1c'
                  : row.role === 'ProjectManager'
                  ? '#0369a1'
                  : '#047857',
            }}
          />
        ),
      },
      {
        id: 'status',
        header: 'Trạng Thái',
        align: 'center',
        width: '12%',
        cell: ({ row }) => {
          const isUserActive = row.isActive ?? true;
          return (
            <Chip
              label={isUserActive ? 'Hoạt động' : 'Đã khóa'}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 700,
                bgcolor: isUserActive ? '#dcfce7' : '#fee2e2',
                color: isUserActive ? '#15803d' : '#b91c1c',
              }}
            />
          );
        },
      },
      {
        id: 'workload',
        header: 'Đang làm / Xong / Trễ',
        align: 'center',
        width: '15%',
        cell: ({ row }) => {
          const workload = workloads.find((w) => w.userId === row.id) || {
            activeTasks: 0,
            completedTasks: 0,
            overdueTasks: 0,
          };
          return (
            <span>
              <span style={{ color: '#0284c7', fontWeight: 700 }}>{workload.activeTasks}</span> /{' '}
              <span style={{ color: '#10b981', fontWeight: 700 }}>{workload.completedTasks}</span> /{' '}
              <span style={{ color: '#ef4444', fontWeight: 700 }}>{workload.overdueTasks}</span>
            </span>
          );
        },
      },
      ...(isAdmin
        ? [
            {
              id: 'actions',
              header: 'Thao Tác',
              align: 'center' as const,
              width: '12%',
              cell: ({ row }: { row: User }) => {
                const isUserActive = row.isActive ?? true;
                return (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Tooltip title="Chỉnh sửa thông tin">
                      <IconButton
                        size="small"
                        onClick={() => onEdit && onEdit(row)}
                        sx={{ color: '#0284c7', '&:hover': { bgcolor: '#e0f2fe' } }}
                      >
                        <Edit2 size={16} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={isUserActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
                      <IconButton
                        size="small"
                        onClick={() => onToggleStatus && onToggleStatus(row)}
                        sx={{
                          color: isUserActive ? '#f59e0b' : '#10b981',
                          '&:hover': { bgcolor: isUserActive ? '#fef3c7' : '#dcfce7' },
                        }}
                      >
                        {isUserActive ? <Lock size={16} /> : <Unlock size={16} />}
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Xóa tài khoản">
                      <IconButton
                        size="small"
                        onClick={() => onDelete && onDelete(row)}
                        sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                );
              },
            },
          ]
        : []),
    ],
    [isAdmin, onDelete, onEdit, onToggleStatus, workloads]
  );

  return (
    <CommonTable<User>
      data={users}
      columns={columns}
      loading={loading}
      showSTT
      sttConfig={{
        page,
        rowsPerPage,
      }}
      sortBy={sortBy}
      isDescending={isDescending}
      onSort={onSort}
      rowKey="id"
      rowSx={(row: User) => ({
        opacity: (row.isActive ?? true) ? 1 : 0.65,
      })}
      emptyMessage="Không tìm thấy nhân viên nào"
    />
  );
});
