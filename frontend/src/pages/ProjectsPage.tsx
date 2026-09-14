import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { CommonSelect } from '../components/common/CommonSelect';
import {
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
  FolderKanban,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Project } from '../types';
import {
  useProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from '../hooks/useProjects';
import { useUsersListQuery } from '../hooks/useEmployees';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectTable } from '../components/projects/ProjectTable';
import { ProjectFormModal, ProjectFormData } from '../components/projects/ProjectFormModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { CardGridSkeleton } from '../components/common/CardGridSkeleton';
import { TableSkeleton } from '../components/common/TableSkeleton';
import { CommonPagination } from '../components/common/CommonPagination';
import { useDebounce } from '../hooks/useDebounce';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'SuperAdmin';
  const canEditProject = isAdmin || user?.role === 'ProjectManager';

  // Filters & Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [sortBy, setSortBy] = useState('plannedEndDate');
  const [isDescending, setIsDescending] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  // Modals state
  const [openModal, setOpenModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Queries
  const queryParams = useMemo(
    () => ({
      pageIndex: page + 1,
      pageSize: rowsPerPage,
      search: debouncedSearch.trim() || undefined,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      sortBy,
      isDescending,
    }),
    [page, rowsPerPage, debouncedSearch, statusFilter, sortBy, isDescending]
  );

  const { data: pagedResult, isLoading, isFetching } = useProjectsQuery(queryParams);
  const { data: users = [] } = useUsersListQuery();

  // Mutations
  const createMutation = useCreateProjectMutation();
  const updateMutation = useUpdateProjectMutation();
  const deleteMutation = useDeleteProjectMutation();

  const projects = pagedResult?.items || [];
  const totalCount = pagedResult?.totalCount || 0;

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setIsDescending(!isDescending);
    } else {
      setSortBy(field);
      setIsDescending(false);
    }
  };

  const handleOpenEdit = (p: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(p);
    setOpenModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    if (editingProject) {
      await updateMutation.mutateAsync({ id: editingProject.id, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setOpenModal(false);
    setEditingProject(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#0f172a' }}>
            Quản Lý Công Trình & Dự Án
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.25 }}>
            Theo dõi tiến độ, phân bổ nguồn lực và trạng thái các dự án xây dựng
          </Typography>
        </Box>

        {canEditProject && (
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => {
              setEditingProject(null);
              setOpenModal(true);
            }}
            sx={{ fontWeight: 700 }}
          >
            Tạo Dự Án Mới
          </Button>
        )}
      </Box>

      {/* Filter Toolbar */}
      <Paper
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          bgcolor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <Box sx={{ minWidth: 260, flexGrow: 1, maxWidth: { xs: '100%', sm: 380 } }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Tìm theo mã dự án, tên công trình, địa điểm..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color="#94a3b8" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <CommonSelect
          label="Trạng Thái"
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setPage(0);
          }}
          minWidth={180}
          options={[
            { value: 'ALL', label: 'Tất cả trạng thái' },
            { value: 'InProgress', label: 'Đang thực hiện', color: '#0284c7' },
            { value: 'Completed', label: 'Hoàn thành', color: '#10b981' },
            { value: 'NotStarted', label: 'Chưa bắt đầu', color: '#64748b' },
            { value: 'OnHold', label: 'Tạm dừng', color: '#f59e0b' },
            { value: 'Overdue', label: 'Trễ tiến độ', color: '#ef4444' },
          ]}
        />

        <Box sx={{ ml: 'auto' }}>
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
      </Paper>

      {/* Projects Content */}
      {viewMode === 'grid' ? (
        isLoading || (isFetching && projects.length === 0) ? (
          <CardGridSkeleton count={rowsPerPage > 6 ? 6 : rowsPerPage} />
        ) : projects.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <FolderKanban size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
            <Typography variant="h4" sx={{ color: '#475569', fontWeight: 600 }}>
              Không tìm thấy công trình nào
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>
              Hãy thử thay đổi bộ lọc tìm kiếm hoặc tạo mới dự án đầu tiên.
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={2.5}>
              {projects.map((p) => (
                <Grid item xs={12} md={6} lg={4} key={p.id}>
                  <ProjectCard
                    project={p}
                    onCardClick={(id) => navigate(`/projects/${id}`)}
                    onEditClick={handleOpenEdit}
                    onDeleteClick={(id, e) => {
                      e.stopPropagation();
                      setDeleteId(id);
                    }}
                    canEdit={canEditProject}
                    isAdmin={isAdmin}
                  />
                </Grid>
              ))}
            </Grid>
            <Paper sx={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', mt: 1 }}>
              <CommonPagination
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={totalCount}
                onPageChange={(newPage) => setPage(newPage)}
                onRowsPerPageChange={(newRowsPerPage) => {
                  setRowsPerPage(newRowsPerPage);
                  setPage(0);
                }}
                rowsPerPageOptions={[6, 12, 24, 48]}
              />
            </Paper>
          </>
        )
      ) : (
        <Paper sx={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', bgcolor: '#ffffff' }}>
          <ProjectTable
            projects={projects}
            loading={isLoading || isFetching}
            page={page}
            rowsPerPage={rowsPerPage}
            sortBy={sortBy}
            isDescending={isDescending}
            onSort={handleSort}
            onRowClick={(id) => navigate(`/projects/${id}`)}
            onEditClick={handleOpenEdit}
            onDeleteClick={(id, e) => {
              e.stopPropagation();
              setDeleteId(id);
            }}
            canEdit={canEditProject}
            isAdmin={isAdmin}
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
            rowsPerPageOptions={[6, 12, 24, 48]}
          />
        </Paper>
      )}

      {/* Modals */}
      <ProjectFormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleFormSubmit}
        editingProject={editingProject}
        users={users}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Xác Nhận Xóa Công Trình"
        message="Hành động này sẽ xóa vĩnh viễn công trình cùng tất cả các đầu mối công việc, tiến độ Gantt và phân công liên quan. Bạn có chắc chắn muốn xóa?"
        confirmText="Xác Nhận Xóa"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
};
