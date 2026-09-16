import React, { memo, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Lock, Sparkles, CheckCircle2, Users, Edit2, Trash2 } from 'lucide-react';
import { RoleItem } from '../../types';
import { CommonTable, ColumnDef } from '../common/CommonTable';
import { getRoleChipStyle } from '../../utils/roleColors';

interface RoleTableProps {
  roles: RoleItem[];
  getRoleModuleTags: (perms: string[]) => { name: string; count: number; total: number }[];
  onEditRole: (role: RoleItem) => void;
  onDeleteRole: (role: RoleItem) => void;
  canManageRoles: boolean;
  loading?: boolean;
}

export const RoleTable: React.FC<RoleTableProps> = memo(({
  roles,
  getRoleModuleTags,
  onEditRole,
  onDeleteRole,
  canManageRoles,
  loading = false,
}) => {
  const columns: ColumnDef<RoleItem>[] = useMemo(
    () => [
      {
        id: 'name',
        header: 'Tên & Chip Vai Trò',
        minWidth: 200,
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, whiteSpace: 'nowrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={row.name}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  height: 24,
                  whiteSpace: 'nowrap',
                  ...getRoleChipStyle(row.color, row.code || row.name),
                }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'monospace',
                color: '#64748b',
                fontWeight: 600,
                fontSize: '0.7rem',
                whiteSpace: 'nowrap',
              }}
            >
              Mã: {row.code}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'description',
        header: 'Mô Tả Nhiệm Vụ',
        minWidth: 220,
        accessorKey: 'description',
        cell: ({ value }) => (
          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              fontSize: '0.8rem',
              whiteSpace: 'nowrap',
            }}
            title={value || ''}
          >
            {value || 'Chưa có mô tả chi tiết'}
          </Typography>
        ),
      },
      {
        id: 'classification',
        header: 'Phân Loại',
        minWidth: 110,
        cell: ({ row }) =>
          row.isSystem ? (
            <Chip
              icon={<Lock size={12} />}
              label="Hệ Thống"
              size="small"
              sx={{
                bgcolor: '#f1f5f9',
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.7rem',
                whiteSpace: 'nowrap',
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
                whiteSpace: 'nowrap',
              }}
            />
          ),
      },
      {
        id: 'userCount',
        header: 'Nhân Sự',
        align: 'center',
        minWidth: 90,
        accessorKey: 'userCount',
        cell: ({ value }) => (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#475569', whiteSpace: 'nowrap' }}>
            <Users size={15} color="#0284c7" />
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.825rem' }}>
              {value}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'permissions',
        header: 'Quyền Hạn Cấp',
        minWidth: 200,
        cell: ({ row }) => {
          const moduleTags = getRoleModuleTags(row.permissions);
          const isSuperAdminRole = row.code === 'SuperAdmin';

          return (
            <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 0.5, whiteSpace: 'nowrap' }}>
              {isSuperAdminRole ? (
                <Chip
                  icon={<CheckCircle2 size={12} />}
                  label="Toàn Quyền"
                  size="small"
                  sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}
                />
              ) : (
                <Chip
                  label={`${row.permissions.length} quyền`}
                  size="small"
                  sx={{
                    bgcolor: '#e0f2fe',
                    color: '#0369a1',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    whiteSpace: 'nowrap',
                  }}
                />
              )}
              {moduleTags.slice(0, 1).map((t) => (
                <Chip
                  key={t.name}
                  label={`${t.name} (${t.count})`}
                  size="small"
                  sx={{ bgcolor: '#f8fafc', color: '#334155', fontSize: '0.7rem', height: 22, whiteSpace: 'nowrap' }}
                />
              ))}
              {moduleTags.length > 1 && (
                <Chip
                  label={`+${moduleTags.length - 1}`}
                  size="small"
                  sx={{ bgcolor: '#f1f5f9', color: '#475569', fontSize: '0.7rem', height: 22, whiteSpace: 'nowrap' }}
                />
              )}
            </Box>
          );
        },
      },
      {
        id: 'actions',
        header: 'Thao Tác',
        align: 'right',
        minWidth: 90,
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
            <Tooltip title="Chỉnh sửa quyền">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditRole(row);
                }}
                disabled={!canManageRoles}
                sx={{ color: '#0284c7', '&:hover': { bgcolor: '#f0f9ff' } }}
              >
                <Edit2 size={15} />
              </IconButton>
            </Tooltip>

            {!row.isSystem && canManageRoles && (
              <Tooltip title="Xóa vai trò">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRole(row);
                  }}
                  sx={{ color: '#dc2626', '&:hover': { bgcolor: '#fef2f2' } }}
                >
                  <Trash2 size={15} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ],
    [canManageRoles, getRoleModuleTags, onDeleteRole, onEditRole]
  );

  return (
    <CommonTable<RoleItem>
      data={roles}
      columns={columns}
      loading={loading}
      showSTT
      rowKey="id"
      emptyMessage="Không tìm thấy vai trò nào"
    />
  );
});
