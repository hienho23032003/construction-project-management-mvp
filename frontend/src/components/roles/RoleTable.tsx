import React, { memo } from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  Tooltip,
} from '@mui/material';
import { Lock, Sparkles, CheckCircle2, Users, Edit2, Trash2 } from 'lucide-react';
import { RoleItem } from '../../types';

interface RoleTableProps {
  roles: RoleItem[];
  getRoleModuleTags: (perms: string[]) => { name: string; count: number; total: number }[];
  onEditRole: (role: RoleItem) => void;
  onDeleteRole: (role: RoleItem) => void;
  canManageRoles: boolean;
}

export const RoleTable: React.FC<RoleTableProps> = memo(({
  roles,
  getRoleModuleTags,
  onEditRole,
  onDeleteRole,
  canManageRoles,
}) => {
  return (
    <TableContainer
      sx={{
        overflow: 'auto',
        maxHeight: 'calc(100vh - 270px)',
      }}
    >
      <Table stickyHeader sx={{ minWidth: { xs: 750, md: '100%' } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '50px', textAlign: 'center', whiteSpace: 'nowrap', py: 1.5 }}>
              STT
            </TableCell>
            <TableCell sx={{ width: '22%', whiteSpace: 'nowrap', py: 1.5 }}>
              Tên & Mã Vai Trò
            </TableCell>
            <TableCell sx={{ width: '25%', whiteSpace: 'nowrap', py: 1.5 }}>
              Mô Tả Nhiệm Vụ
            </TableCell>
            <TableCell sx={{ width: '13%', whiteSpace: 'nowrap', py: 1.5 }}>
              Phân Loại
            </TableCell>
            <TableCell align="center" sx={{ width: '12%', whiteSpace: 'nowrap', py: 1.5 }}>
              Nhân Sự
            </TableCell>
            <TableCell sx={{ width: '18%', whiteSpace: 'nowrap', py: 1.5 }}>
              Quyền Hạn Cấp
            </TableCell>
            <TableCell align="right" sx={{ width: '10%', whiteSpace: 'nowrap', py: 1.5 }}>
              Thao Tác
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {roles.map((role, idx) => {
            const moduleTags = getRoleModuleTags(role.permissions);
            const isSuperAdminRole = role.code === 'SuperAdmin';

            return (
              <TableRow key={role.id} hover>
                <TableCell sx={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 600, color: '#64748b' }}>
                  {idx + 1}
                </TableCell>
                {/* Role Name & Code */}
                <TableCell sx={{ whiteSpace: 'nowrap', maxWidth: 220 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }} noWrap>
                    {role.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      color: '#0284c7',
                      fontWeight: 600,
                      bgcolor: '#f0f9ff',
                      px: 0.8,
                      py: 0.2,
                      borderRadius: 1,
                      display: 'inline-block',
                      mt: 0.2,
                    }}
                  >
                    {role.code}
                  </Typography>
                </TableCell>

                {/* Description */}
                <TableCell sx={{ maxWidth: { xs: 180, sm: 260 } }}>
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{
                      color: '#64748b',
                      fontSize: '0.8rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block',
                    }}
                    title={role.description || ''}
                  >
                    {role.description || 'Chưa có mô tả chi tiết'}
                  </Typography>
                </TableCell>

                {/* Classification */}
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {role.isSystem ? (
                    <Chip
                      icon={<Lock size={12} />}
                      label="Hệ Thống"
                      size="small"
                      sx={{
                        bgcolor: '#f1f5f9',
                        color: '#475569',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                  ) : (
                    <Chip
                      icon={<Sparkles size={12} />}
                      label="Tùy Chỉnh"
                      size="small"
                      sx={{
                        bgcolor: '#fdf4ff',
                        color: '#a855f7',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                  )}
                </TableCell>

                {/* User Count */}
                <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#475569' }}>
                    <Users size={15} color="#0284c7" />
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.825rem' }}>
                      {role.userCount}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Permissions scope */}
                <TableCell sx={{ whiteSpace: 'nowrap', maxWidth: 200 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 0.5, overflow: 'hidden' }}>
                    {isSuperAdminRole ? (
                      <Chip
                        icon={<CheckCircle2 size={12} />}
                        label="Toàn Quyền"
                        size="small"
                        sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontSize: '0.7rem', fontWeight: 700 }}
                      />
                    ) : (
                      <Chip
                        label={`${role.permissions.length} quyền`}
                        size="small"
                        sx={{
                          bgcolor: '#e0f2fe',
                          color: '#0369a1',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                        }}
                      />
                    )}
                    {moduleTags.slice(0, 1).map((t) => (
                      <Chip
                        key={t.name}
                        label={`${t.name} (${t.count})`}
                        size="small"
                        sx={{ bgcolor: '#f8fafc', color: '#334155', fontSize: '0.7rem', height: 22 }}
                      />
                    ))}
                    {moduleTags.length > 1 && (
                      <Chip
                        label={`+${moduleTags.length - 1}`}
                        size="small"
                        sx={{ bgcolor: '#f1f5f9', color: '#475569', fontSize: '0.7rem', height: 22 }}
                      />
                    )}
                  </Box>
                </TableCell>

                {/* Actions */}
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Tooltip title="Chỉnh sửa quyền">
                      <IconButton
                        size="small"
                        onClick={() => onEditRole(role)}
                        disabled={!canManageRoles}
                        sx={{ color: '#0284c7', '&:hover': { bgcolor: '#f0f9ff' } }}
                      >
                        <Edit2 size={15} />
                      </IconButton>
                    </Tooltip>

                    {!role.isSystem && canManageRoles && (
                      <Tooltip title="Xóa vai trò">
                        <IconButton
                          size="small"
                          onClick={() => onDeleteRole(role)}
                          sx={{ color: '#dc2626', '&:hover': { bgcolor: '#fef2f2' } }}
                        >
                          <Trash2 size={15} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
});
