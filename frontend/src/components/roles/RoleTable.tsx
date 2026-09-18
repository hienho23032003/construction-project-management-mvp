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
        width: 220,
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
                color: 'text.disabled',
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
        width: 320,
        minWidth: 270,
        ellipsis: true,
        accessorKey: 'description',
        cell: ({ value }) => (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.8rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
            title={value || 'Chưa có mô tả chi tiết'}
          >
            {value || 'Chưa có mô tả chi tiết'}
          </Typography>
        ),
      },
      {
        id: 'classification',
        header: 'Phân Loại',
        width: 120,
        minWidth: 110,
        cell: ({ row }) =>
          row.isSystem ? (
            <Chip
              icon={<Lock size={12} />}
              label="Hệ Thống"
              size="small"
              sx={{
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                color: (theme) => theme.palette.mode === 'dark' ? '#b4b4b4' : '#475569',
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
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(217, 70, 239, 0.15)' : '#fdf4ff',
                color: (theme) => theme.palette.mode === 'dark' ? '#e879f9' : '#a21caf',
                border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(217, 70, 239, 0.3)' : '1px solid #f5d0fe',
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
        width: 90,
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
        id: 'permissionsCount',
        header: 'Phạm Vi Quyền Hạn',
        width: 250,
        minWidth: 230,
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
                  sx={{
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4',
                    color: (theme) => theme.palette.mode === 'dark' ? '#4ade80' : '#16a34a',
                    border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid #bbf7d0',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                />
              ) : (
                <Chip
                  label={`${row.permissions.length} quyền`}
                  size="small"
                  sx={{
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe',
                    color: (theme) => theme.palette.mode === 'dark' ? '#38bdf8' : '#0369a1',
                    border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid #bae6fd',
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
                  sx={{
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#141414' : '#f8fafc',
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'divider',
                    fontSize: '0.7rem',
                    height: 22,
                    whiteSpace: 'nowrap',
                  }}
                />
              ))}
              {moduleTags.length > 1 && (
                <Chip
                  label={`+${moduleTags.length - 1}`}
                  size="small"
                  sx={{
                    bgcolor: 'action.hover',
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'divider',
                    fontSize: '0.7rem',
                    height: 22,
                    whiteSpace: 'nowrap',
                  }}
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
        width: 90,
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
