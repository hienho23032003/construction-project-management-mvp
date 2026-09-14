import React, { memo } from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
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
}) => {
  return (
    <TableContainer
      sx={{
        overflow: 'auto',
        maxHeight: 'calc(100vh - 270px)',
      }}
    >
      <Table stickyHeader sx={{ minWidth: { xs: 800, md: '100%' } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '50px', textAlign: 'center', whiteSpace: 'nowrap', py: 1.5 }}>
              STT
            </TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>
              <TableSortLabel
                active={sortBy === 'fullName'}
                direction={isDescending ? 'desc' : 'asc'}
                onClick={() => onSort('fullName')}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Họ Và Tên
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5, fontWeight: 700, fontSize: '0.8rem' }}>
              <TableSortLabel
                active={sortBy === 'email'}
                direction={isDescending ? 'desc' : 'asc'}
                onClick={() => onSort('email')}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Email
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5, fontWeight: 700, fontSize: '0.8rem' }}>Số Điện Thoại</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5, fontWeight: 700, fontSize: '0.8rem' }}>
              <TableSortLabel
                active={sortBy === 'department'}
                direction={isDescending ? 'desc' : 'asc'}
                onClick={() => onSort('department')}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Phòng Ban
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5, fontWeight: 700, fontSize: '0.8rem' }}>
              <TableSortLabel
                active={sortBy === 'role'}
                direction={isDescending ? 'desc' : 'asc'}
                onClick={() => onSort('role')}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Vai Trò
              </TableSortLabel>
            </TableCell>
            <TableCell align="center" sx={{ whiteSpace: 'nowrap', py: 1.5, fontWeight: 700, fontSize: '0.8rem' }}>
              Trạng Thái
            </TableCell>
            <TableCell align="center" sx={{ whiteSpace: 'nowrap', py: 1.5, fontWeight: 700, fontSize: '0.8rem' }}>
              Tải Công Việc (Đang làm / Xong / Trễ)
            </TableCell>
            {isAdmin && (
              <TableCell align="center" sx={{ whiteSpace: 'nowrap', py: 1.5, fontWeight: 700, fontSize: '0.8rem', width: 120 }}>
                Thao Tác
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u, idx) => {
            const workload = workloads.find((w) => w.userId === u.id) || {
              activeTasks: 0,
              completedTasks: 0,
              overdueTasks: 0,
            };
            const isUserActive = u.isActive ?? true;

            return (
              <TableRow key={u.id} hover sx={{ opacity: isUserActive ? 1 : 0.65 }}>
                <TableCell sx={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 600, color: '#64748b' }}>
                  {(page * rowsPerPage) + idx + 1}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', maxWidth: { xs: 160, sm: 220 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.85rem' }}>{u.fullName.charAt(0)}</Avatar>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.fullName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', maxWidth: { xs: 160, sm: 220 } }}>
                  <Typography variant="body2" noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.email}
                  </Typography>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{u.phone || '-'}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{u.department || 'Chưa phân ban'}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Chip
                    label={roleLabels[u.role] || u.roleName || u.role}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      bgcolor: u.role === 'SuperAdmin' ? '#fee2e2' : u.role === 'ProjectManager' ? '#e0f2fe' : '#ecfdf5',
                      color: u.role === 'SuperAdmin' ? '#b91c1c' : u.role === 'ProjectManager' ? '#0369a1' : '#047857',
                    }}
                  />
                </TableCell>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
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
                </TableCell>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                  <span style={{ color: '#0284c7', fontWeight: 700 }}>{workload.activeTasks}</span> /{' '}
                  <span style={{ color: '#10b981', fontWeight: 700 }}>{workload.completedTasks}</span> /{' '}
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>{workload.overdueTasks}</span>
                </TableCell>
                {isAdmin && (
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <Tooltip title="Chỉnh sửa thông tin">
                        <IconButton
                          size="small"
                          onClick={() => onEdit && onEdit(u)}
                          sx={{ color: '#0284c7', '&:hover': { bgcolor: '#e0f2fe' } }}
                        >
                          <Edit2 size={16} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={isUserActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
                        <IconButton
                          size="small"
                          onClick={() => onToggleStatus && onToggleStatus(u)}
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
                          onClick={() => onDelete && onDelete(u)}
                          sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
});
