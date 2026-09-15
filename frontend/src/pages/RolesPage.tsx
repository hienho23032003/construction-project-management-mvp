import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Settings,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  CheckCircle2,
  Lock,
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  X,
} from 'lucide-react';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import { RoleItem } from '../types';
import {
  useRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  usePermissionsMatrixQuery,
} from '../hooks/useRoles';
import { usePermission } from '../hooks/usePermission';
import { RoleModal, RoleFormData } from '../components/roles/RoleModal';
import { RoleTable } from '../components/roles/RoleTable';
import { useDebounce } from '../hooks/useDebounce';

export const RolesPage: React.FC = () => {
  const { data: roles = [], isLoading } = useRolesQuery();
  const { data: matrix = [] } = usePermissionsMatrixQuery();
  const createMutation = useCreateRoleMutation();
  const updateMutation = useUpdateRoleMutation();
  const deleteMutation = useDeleteRoleMutation();
  const { can, isSuperAdmin } = usePermission();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleItem | null>(null);

  const canManageRoles = isSuperAdmin || can('roles.manage');

  const filteredRoles = useMemo(() => {
    if (!debouncedSearch) return roles;
    const term = debouncedSearch.toLowerCase().trim();
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.code.toLowerCase().includes(term) ||
        (r.description && r.description.toLowerCase().includes(term))
    );
  }, [roles, debouncedSearch]);

  const handleOpenCreate = () => {
    setEditingRole(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (role: RoleItem) => {
    setEditingRole(role);
    setModalOpen(true);
  };

  const handleOpenDelete = (role: RoleItem) => {
    setRoleToDelete(role);
    setDeleteConfirmOpen(true);
  };

  const handleSubmitRole = async (data: RoleFormData) => {
    if (editingRole) {
      await updateMutation.mutateAsync({
        id: editingRole.id,
        data: {
          name: data.name,
          code: data.code,
          description: data.description,
          permissions: data.permissions,
        },
      });
    } else {
      await createMutation.mutateAsync({
        name: data.name,
        code: data.code,
        description: data.description,
        permissions: data.permissions,
      });
    }
    setModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (roleToDelete) {
      await deleteMutation.mutateAsync(roleToDelete.id);
      setDeleteConfirmOpen(false);
      setRoleToDelete(null);
    }
  };

  // Helper to get module coverage for a role
  const getRoleModuleTags = (perms: string[]) => {
    if (perms.length === 0) return [];
    const moduleMap = new Map<string, { name: string; count: number; total: number }>();

    matrix.forEach((g) => {
      const activeInModule = g.permissions.filter((p) => perms.includes(p.code)).length;
      if (activeInModule > 0) {
        moduleMap.set(g.module, {
          name: g.moduleName,
          count: activeInModule,
          total: g.permissions.length,
        });
      }
    });

    return Array.from(moduleMap.values());
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 }, width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1.5,
          width: '100%',
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: '8px',
                bgcolor: 'rgba(2, 132, 199, 0.1)',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <Settings size={26} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.15rem', sm: '1.35rem' } }}>
                Phân Quyền & Quản Lý Vai Trò
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Tự định nghĩa các vai trò, thiết lập ma trận quyền hạn cho từng chức năng và gắn vai trò cho nhân sự
              </Typography>
            </Box>
          </Box>
        </Box>

        {canManageRoles && (
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={handleOpenCreate}
            sx={{
              bgcolor: '#0284c7',
              '&:hover': { bgcolor: '#0369a1' },
              borderRadius: '8px',
              px: 2.5,
              py: 1,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
              whiteSpace: 'nowrap',
            }}
          >
            Thêm Vai Trò Mới
          </Button>
        )}
      </Box>

      {/* Filter Toolbar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: '#ffffff',
          p: { xs: 1.5, sm: 2 },
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          flexWrap: 'wrap',
          gap: 1.5,
          width: '100%',
          maxWidth: '100%',
        }}
      >
        <TextField
          size="small"
          placeholder="Tìm kiếm vai trò theo tên, mã hoặc mô tả..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 320, md: 360 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} color="#94a3b8" />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: { xs: 0, sm: 'auto' } }}>
          <Typography variant="caption" sx={{ color: '#66594d', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
            Tổng cộng: {filteredRoles.length} vai trò
          </Typography>

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
      </Box>

      {/* Roles Grid or Table */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : filteredRoles.length === 0 ? (
        <Box
          sx={{
            p: { xs: 4, sm: 8 },
            textAlign: 'center',
            bgcolor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <Typography variant="h6" sx={{ color: '#475569', fontWeight: 700 }}>
            Không tìm thấy vai trò nào
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
            Thử tìm kiếm với từ khóa khác hoặc tạo mới vai trò.
          </Typography>
        </Box>
      ) : viewMode === 'table' ? (
        <Paper sx={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', bgcolor: '#ffffff', width: '100%', maxWidth: '100%' }}>
          <RoleTable
            roles={filteredRoles}
            getRoleModuleTags={getRoleModuleTags}
            onEditRole={handleOpenEdit}
            onDeleteRole={handleOpenDelete}
            canManageRoles={canManageRoles}
          />
        </Paper>
      ) : (
        <Grid container spacing={{ xs: 2, sm: 2.5 }} sx={{ width: '100%', m: 0 }}>
          {filteredRoles.map((role) => {
            const moduleTags = getRoleModuleTags(role.permissions);
            const isSuperAdminRole = role.code === 'SuperAdmin';

            return (
              <Grid item xs={12} md={6} lg={4} key={role.id} sx={{ minWidth: 0, width: '100%', pl: { xs: '0 !important', sm: '20px !important' }, pt: { xs: '16px !important', sm: '20px !important' } }}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: '#38bdf8',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header: Title & Badges */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem', lineHeight: 1.3 }}>
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
                          }}
                        >
                          {role.code}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
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
                      </Box>
                    </Box>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748b',
                        fontSize: '0.8125rem',
                        mb: 2,
                        minHeight: 38,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {role.description || 'Không có mô tả chi tiết cho vai trò này.'}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    {/* Assigned Users Count & Total Perms */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#475569' }}>
                        <Users size={16} color="#0284c7" />
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                          {role.userCount} nhân sự
                        </Typography>
                      </Box>
                      <Chip
                        label={isSuperAdminRole ? 'Toàn Quyền Hệ Thống' : `${role.permissions.length} quyền`}
                        size="small"
                        sx={{
                          bgcolor: isSuperAdminRole ? '#dcfce7' : '#e0f2fe',
                          color: isSuperAdminRole ? '#15803d' : '#0369a1',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                        }}
                      />
                    </Box>

                    {/* Module Coverage Badges */}
                    <Box sx={{ flexGrow: 1, mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 0.8 }}>
                        CHỨC NĂNG ĐƯỢC CẤP QUYỀN:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                        {isSuperAdminRole ? (
                          <Chip
                            icon={<CheckCircle2 size={12} />}
                            label="Tất cả module & chức năng"
                            size="small"
                            sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontSize: '0.72rem', fontWeight: 600 }}
                          />
                        ) : moduleTags.length === 0 ? (
                          <Typography variant="caption" sx={{ color: '#cbd5e1', fontStyle: 'italic' }}>
                            Chưa có quyền nào được gán
                          </Typography>
                        ) : (
                          moduleTags.map((tag) => (
                            <Chip
                              key={tag.name}
                              label={`${tag.name} (${tag.count}/${tag.total})`}
                              size="small"
                              sx={{
                                bgcolor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                color: '#334155',
                                fontSize: '0.7rem',
                                fontWeight: 500,
                              }}
                            />
                          ))
                        )}
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #f1f5f9' }}>
                      <Button
                        size="small"
                        startIcon={<Edit2 size={14} />}
                        onClick={() => handleOpenEdit(role)}
                        disabled={!canManageRoles}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          color: '#0284c7',
                          borderRadius: '8px',
                        }}
                      >
                        Chỉnh Sửa Quyền
                      </Button>

                      {!role.isSystem && canManageRoles && (
                        <Tooltip title="Xóa vai trò này">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDelete(role)}
                            sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fef2f2' } }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Role Edit/Create Modal */}
      <RoleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitRole}
        initialData={editingRole}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: '#ef4444',
            px: 3,
            pt: 2.5,
            pb: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Xác Nhận Xóa Vai Trò</span>
          <IconButton
            aria-label="close"
            onClick={() => setDeleteConfirmOpen(false)}
            size="small"
            sx={{
              color: '#94a3b8',
              '&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' },
            }}
          >
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#475569' }}>
            Bạn có chắc chắn muốn xóa vai trò <strong>"{roleToDelete?.name}"</strong>? Các nhân sự đang được gán vai trò này sẽ bị hủy liên kết.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} variant="outlined" color="inherit">
            Hủy Bỏ
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa Vai Trò'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
