import React, { useState, useMemo, useEffect } from 'react';
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
  Chip,
} from '@mui/material';
import { CommonSelect } from '../components/common/CommonSelect';
import {
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
  FolderKanban,
} from 'lucide-react';
import { usePermission } from '../hooks/usePermission';
import { PERMISSIONS } from '../constants/permissions';
import { useAuth } from '../contexts/AuthContext';
import { Project } from '../types';
import {
  useProjectsQuery,
  useProjectDetailQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from '../hooks/useProjects';
import { useUsersListQuery } from '../hooks/useEmployees';
import { useAppSearchParams } from '../hooks/useAppSearchParams';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectTable } from '../components/projects/ProjectTable';
import { ProjectFormModal, ProjectFormData } from '../components/projects/ProjectFormModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { CardGridSkeleton } from '../components/common/CardGridSkeleton';
import { ScopeChip } from '../components/common/ScopeChip';
import { TableSkeleton } from '../components/common/TableSkeleton';
import { CommonPagination } from '../components/common/CommonPagination';
import { CommonButton, CommonInput } from '../components/common';
import { useDebounce } from '../hooks/useDebounce';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { getParam, getNumberParam, getBooleanParam, setParam, setParams, removeParams } = useAppSearchParams();
  const { can, isSuperAdmin } = usePermission();

  const canViewAllProjects = isSuperAdmin || can(PERMISSIONS.PROJECTS_VIEW_ALL);
  const canViewProjectScope = canViewAllProjects || can(PERMISSIONS.PROJECTS_VIEW_PROJECT);
  const canCreateProject = isSuperAdmin || can(PERMISSIONS.PROJECTS_CREATE);
  const canEditProject = isSuperAdmin || can(PERMISSIONS.PROJECTS_EDIT);
  const canDeleteProject = isSuperAdmin || can(PERMISSIONS.PROJECTS_DELETE);

  const editProjectIdParam = getParam('editProjectId') || getParam('edit');
  const createProjectParam = getBooleanParam('createProject');
  const searchParam = getParam('search');
  const statusParam = getParam('status', 'ALL');
  const viewParam = (getParam('view', 'table') === 'grid' ? 'grid' : 'table') as 'grid' | 'table';
  const pageParam = Math.max(0, getNumberParam('page', 1) - 1);

  // Filters & Pagination
  const [page, setPage] = useState(pageParam);
  const [rowsPerPage, setRowsPerPage] = useState(viewParam === 'grid' ? 10 : 10);
  const [search, setSearch] = useState(searchParam);
  const [statusFilter, setStatusFilter] = useState(statusParam);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(viewParam);
  const [sortBy, setSortBy] = useState('plannedEndDate');
  const [isDescending, setIsDescending] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  // Modals state
  const [openModal, setOpenModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Single project detail query if editProjectId is present in URL
  const { data: projectFromUrl } = useProjectDetailQuery(editProjectIdParam || undefined);

  // Sync debounced search to URL
  useEffect(() => {
    if (debouncedSearch.trim()) {
      if (getParam('search') !== debouncedSearch.trim()) {
        setParams({ search: debouncedSearch.trim(), page: null });
      }
    } else {
      setParam('search', null);
    }
  }, [debouncedSearch, getParam, setParam, setParams]);

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(0);
    setParams({ status: val !== 'ALL' ? val : null, page: null });
  };

  const handleViewModeChange = (val: 'grid' | 'table') => {
    setViewMode(val);
    setParam('view', val === 'grid' ? 'grid' : null);
    if (val === 'grid') {
      if (rowsPerPage === 20) {
        setRowsPerPage(15);
      } else if (rowsPerPage !== 10 && rowsPerPage !== 15 && rowsPerPage !== 20 && rowsPerPage !== 30 && rowsPerPage !== 50) {
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setParam('page', newPage > 0 ? newPage + 1 : null);
  };

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

  // Sync URL params to open modal
  useEffect(() => {
    if (editProjectIdParam) {
      if (projectFromUrl) {
        setEditingProject(projectFromUrl);
        setOpenModal(true);
      } else {
        const found = pagedResult?.items.find((p) => p.id === editProjectIdParam);
        if (found) {
          setEditingProject(found);
          setOpenModal(true);
        }
      }
    } else if (createProjectParam) {
      setEditingProject(null);
      setOpenModal(true);
    }
  }, [editProjectIdParam, createProjectParam, projectFromUrl, pagedResult]);

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

  const handleOpenCreate = () => {
    setEditingProject(null);
    setOpenModal(true);
    setParams({ createProject: true, editProjectId: null, edit: null });
  };

  const handleOpenEdit = (p: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(p);
    setOpenModal(true);
    setParams({ editProjectId: p.id, createProject: null });
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingProject(null);
    removeParams('editProjectId', 'edit', 'createProject');
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    if (editingProject) {
      await updateMutation.mutateAsync({ id: editingProject.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    handleCloseModal();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 }, width: '100%', maxWidth: '100%', minWidth: 0 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
          width: '100%',
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.35rem' }, color: 'text.primary' }}>
              Quản Lý Công Trình & Dự Án
            </Typography>
            <ScopeChip canViewAll={canViewAllProjects} canViewProject={canViewProjectScope} />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            {canViewAllProjects
              ? 'Theo dõi tiến độ, phân bổ nguồn lực và trạng thái các dự án xây dựng toàn hệ thống'
              : canViewProjectScope
              ? 'Theo dõi các dự án công trình mà bạn được phân công hoặc tham gia quản lý'
              : 'Theo dõi các dự án công trình do bạn quản lý hoặc được phân công công việc'}
          </Typography>
        </Box>

        {canCreateProject && (
          <CommonButton
            variant="primary"
            startIcon={<Plus size={18} />}
            onClick={handleOpenCreate}
          >
            Tạo Dự Án Mới
          </CommonButton>
        )}
      </Box>

      {/* Filter Toolbar */}
      <Paper
        sx={{
          p: { xs: 1.5, sm: 2 },
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px',
          bgcolor: 'background.paper',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        <Box sx={{ width: { xs: '100%', sm: 300, md: 360 }, minWidth: 0 }}>
          <CommonInput
            isSearch
            clearable
            placeholder="Tìm theo mã dự án, tên công trình, địa điểm..."
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

        <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <CommonSelect
            label="Trạng Thái"
            value={statusFilter}
            onChange={handleStatusChange}
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
        </Box>

        <Box sx={{ ml: { xs: 0, sm: 'auto' } }}>
          <ToggleButtonGroup
            size="small"
            value={viewMode}
            exclusive
            onChange={(_, val) => val && handleViewModeChange(val)}
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
          <Paper sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center', borderRadius: '8px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <FolderKanban size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
            <Typography variant="h4" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Không tìm thấy công trình nào
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Hãy thử thay đổi bộ lọc tìm kiếm hoặc tạo mới dự án đầu tiên.
            </Typography>
          </Paper>
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
                p: '2px',
              }}
            >
              {projects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onCardClick={(id) => navigate(`/projects/${id}`)}
                  onEditClick={handleOpenEdit}
                  onDeleteClick={(id, e) => {
                    e.stopPropagation();
                    setDeleteId(id);
                  }}
                  canEdit={canEditProject}
                  canDelete={canDeleteProject}
                />
              ))}
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
            canDelete={canDeleteProject}
          />
          <CommonPagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={totalCount}
            onPageChange={handlePageChange}
            onRowsPerPageChange={(newRowsPerPage) => {
              setRowsPerPage(newRowsPerPage);
              handlePageChange(0);
            }}
            rowsPerPageOptions={[6, 12, 24, 48]}
          />
        </Paper>
      )}

      {/* Modals */}
      <ProjectFormModal
        open={openModal}
        onClose={handleCloseModal}
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
