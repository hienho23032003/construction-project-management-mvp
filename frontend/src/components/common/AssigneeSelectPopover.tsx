import React, { useState, useMemo, memo, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Popover,
  TextField,
  List,
  ListItemButton,
  Checkbox,
  Tooltip,
  useTheme,
  InputAdornment,
  Button,
} from '@mui/material';
import { Search, UserPlus, Users, Check, X } from 'lucide-react';
import { User, TaskAssignee, ProjectMember } from '../../types';
import { getMediaUrl } from '../../utils/fileUtils';
import { useUsersListQuery } from '../../hooks/useEmployees';
import { useProjectMembersQuery } from '../../hooks/useProjects';

interface AssigneeSelectPopoverProps {
  assignees: TaskAssignee[];
  taskId: string;
  projectId?: string;
  disabled?: boolean;
  onAssigneesChange?: (taskId: string, newAssigneeUserIds: string[]) => void | Promise<void>;
  size?: 'small' | 'medium';
}

import { getDynamicRoleColor } from '../../utils/roleColors';

export const AssigneeSelectPopover: React.FC<AssigneeSelectPopoverProps> = memo(({
  assignees,
  taskId,
  projectId,
  disabled = false,
  onAssigneesChange,
  size = 'small',
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [search, setSearch] = useState('');

  // Fetch project members if projectId is provided, otherwise fallback to system user list
  const { data: projectMembers = [] } = useProjectMembersQuery(projectId);
  const { data: allUsers = [] } = useUsersListQuery();

  const getCleanRoleName = (u?: User, member?: ProjectMember): string => {
    // 1. If user has explicit assigned system roles from API (e.g. "Kỹ sư cơ điện (ME)", "Chỉ huy trưởng / PM")
    if (u?.roles && u.roles.length > 0 && u.roles[0]) {
      return u.roles[0];
    }
    if (u?.roleName) {
      return u.roleName;
    }
    if (member?.roles && member.roles.length > 0 && member.roles[0]) {
      return member.roles[0];
    }
    if (member?.roleName) {
      return member.roleName;
    }
    // 2. If project role has a specific title (not generic "Thành viên")
    if (member?.roleInProject && member.roleInProject !== 'Thành viên' && member.roleInProject !== 'Thành viên dự án' && member.roleInProject !== 'Member') {
      return member.roleInProject;
    }
    // 3. Translate standard enum role
    const roleVal = (u?.role as string) || '';
    if (roleVal === 'SuperAdmin') return 'Quản trị viên';
    if (roleVal === 'ProjectManager') return 'Quản lý (PM)';
    if (roleVal === 'Supervisor') return 'Giám sát';
    if (roleVal === 'Engineer') return 'Kỹ sư';
    if (roleVal === 'Worker') return 'Công nhân';
    return u?.roleName || member?.roleName || 'Nhân viên';
  };

  // Combine and normalize user list with roles and avatars
  const candidateUsers: User[] = useMemo(() => {
    if (projectMembers.length > 0) {
      return projectMembers.map((m) => {
        const fullUser = allUsers.find((u) => u.id === m.userId);
        const resolvedRole = getCleanRoleName(fullUser, m);
        return {
          id: m.userId,
          fullName: m.fullName || fullUser?.fullName || 'Nhân sự',
          email: m.email || fullUser?.email || '',
          department: m.department || fullUser?.department,
          avatarUrl: m.avatarUrl || fullUser?.avatarUrl,
          role: fullUser?.role || 'Employee',
          roleName: resolvedRole,
          roles: fullUser?.roles || m.roles || (resolvedRole ? [resolvedRole] : []),
          isActive: true,
          createdAt: m.joinedAt,
        };
      });
    }
    return allUsers.map((u) => ({
      ...u,
      roleName: getCleanRoleName(u),
    }));
  }, [projectMembers, allUsers]);

  const propAssigneeIds = useMemo(() => {
    return assignees.map((a) => (a.userId || a.id));
  }, [assignees]);

  // Local selection state for immediate UI responsiveness
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(propAssigneeIds);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingCommitRef = useRef<string[] | null>(null);

  // Sync prop changes when popover is closed and no pending changes
  useEffect(() => {
    if (!anchorEl && pendingCommitRef.current === null) {
      setLocalSelectedIds(propAssigneeIds);
    }
  }, [propAssigneeIds, anchorEl]);

  // Flush pending changes
  const flushChanges = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (pendingCommitRef.current !== null && onAssigneesChange) {
      const idsToSave = pendingCommitRef.current;
      pendingCommitRef.current = null;
      onAssigneesChange(taskId, idsToSave);
    }
  }, [taskId, onAssigneesChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (pendingCommitRef.current !== null && onAssigneesChange) {
        onAssigneesChange(taskId, pendingCommitRef.current);
        pendingCommitRef.current = null;
      }
    };
  }, [taskId, onAssigneesChange]);

  const currentAssigneeIds = useMemo(() => {
    return new Set(localSelectedIds.map((id) => id.toLowerCase()));
  }, [localSelectedIds]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return candidateUsers;
    return candidateUsers.filter(
      (u) =>
        (u.fullName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.roleName || u.role || '').toLowerCase().includes(q) ||
        (u.department || '').toLowerCase().includes(q)
    );
  }, [candidateUsers, search]);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled || !onAssigneesChange) return;
    e.stopPropagation();
    setLocalSelectedIds(propAssigneeIds);
    setAnchorEl(e.currentTarget);
    setSearch('');
  };

  const handleClose = (e?: any) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    flushChanges();
    setAnchorEl(null);
  };

  const handleToggleUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAssigneesChange) return;

    const normalizedId = userId.toLowerCase();
    let updatedIds: string[];

    const isCurrentlySelected = localSelectedIds.some((id) => id.toLowerCase() === normalizedId);
    if (isCurrentlySelected) {
      updatedIds = localSelectedIds.filter((id) => id.toLowerCase() !== normalizedId);
    } else {
      updatedIds = [...localSelectedIds, userId];
    }

    setLocalSelectedIds(updatedIds);
    pendingCommitRef.current = updatedIds;

    // Reset 10-second debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      if (pendingCommitRef.current !== null && onAssigneesChange) {
        const idsToSave = pendingCommitRef.current;
        pendingCommitRef.current = null;
        onAssigneesChange(taskId, idsToSave);
      }
    }, 10000); // 10s debounce
  };

  const open = Boolean(anchorEl);

  return (
    <>
      {/* Trigger Chip / Button */}
      <Box
        onClick={handleOpen}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: disabled || !onAssigneesChange ? 'default' : 'pointer',
          borderRadius: '6px',
          p: '2px 4px',
          transition: 'background-color 0.15s ease',
          '&:hover': {
            bgcolor: disabled || !onAssigneesChange ? 'transparent' : 'action.hover',
          },
        }}
      >
        {assignees.length === 0 ? (
          <Chip
            icon={<UserPlus size={13} style={{ marginLeft: 6 }} />}
            label="Chưa gán"
            size="small"
            variant="outlined"
            sx={{
              height: 24,
              fontSize: '0.72rem',
              fontWeight: 500,
              color: 'text.secondary',
              borderStyle: 'dashed',
              cursor: disabled || !onAssigneesChange ? 'default' : 'pointer',
              '&:hover': {
                borderColor: '#0284c7',
                color: '#0284c7',
              },
            }}
          />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'nowrap' }}>
            <Chip
              avatar={
                <Avatar
                  src={getMediaUrl(assignees[0].avatarUrl)}
                  sx={{
                    width: 20,
                    height: 20,
                    fontSize: '0.68rem',
                    bgcolor: '#0284c7',
                    color: '#ffffff',
                    fontWeight: 700,
                  }}
                >
                  {assignees[0].fullName?.charAt(0) || 'U'}
                </Avatar>
              }
              label={assignees[0].fullName}
              size="small"
              sx={{
                height: 24,
                fontSize: '0.72rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                maxWidth: assignees.length > 1 ? 120 : 160,
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f8fafc',
                border: `1px solid ${theme.palette.divider}`,
                cursor: disabled || !onAssigneesChange ? 'default' : 'pointer',
                '& .MuiChip-label': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                },
              }}
            />
            {assignees.length > 1 && (
              <Tooltip
                title={
                  <Box sx={{ p: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.25, display: 'block', color: 'inherit' }}>
                      Toàn bộ người thực hiện ({assignees.length}):
                    </Typography>
                    {assignees.map((a) => (
                      <Box key={a.id || a.userId} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Avatar
                          src={getMediaUrl(a.avatarUrl)}
                          sx={{ width: 18, height: 18, fontSize: '0.65rem', bgcolor: '#0284c7', color: '#fff' }}
                        >
                          {a.fullName.charAt(0)}
                        </Avatar>
                        <Typography variant="caption" sx={{ color: 'inherit' }}>
                          {a.fullName}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                }
                arrow
                placement="top"
              >
                <Chip
                  label={`+${assignees.length - 1}`}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#f1f5f9',
                    color: 'text.secondary',
                    cursor: disabled || !onAssigneesChange ? 'default' : 'pointer',
                    flexShrink: 0,
                  }}
                />
              </Tooltip>
            )}
          </Box>
        )}
      </Box>

      {/* Popover Dropdown */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            width: 'max-content',
            minWidth: { xs: 320, sm: 400 },
            maxWidth: { xs: 'calc(100vw - 32px)', sm: 560 },
            maxHeight: 420,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '10px',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            overflow: 'hidden',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 1.5,
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c1d1e' : '#f8fafc',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Users size={16} color="#0284c7" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: 'text.primary' }}>
                Phân Công Người Thực Hiện
              </Typography>
            </Box>
            <Chip
              label={`${localSelectedIds.length} đã chọn`}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.68rem',
                fontWeight: 700,
                bgcolor: localSelectedIds.length > 0 ? '#e0f2fe' : 'action.hover',
                color: localSelectedIds.length > 0 ? '#0284c7' : 'text.secondary',
              }}
            />
          </Box>

          {/* Search Input */}
          <TextField
            size="small"
            autoFocus
            fullWidth
            placeholder="Tìm theo tên, chức vụ, vai trò..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={14} color="#94a3b8" />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <Box
                    component="span"
                    onClick={() => setSearch('')}
                    sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#94a3b8', '&:hover': { color: '#64748b' } }}
                  >
                    <X size={14} />
                  </Box>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 34,
                fontSize: '0.8rem',
                borderRadius: '6px',
                bgcolor: 'background.paper',
              },
            }}
          />
        </Box>

        {/* User Options List */}
        <List sx={{ p: 0.5, flexGrow: 1, overflowY: 'auto' }}>
          {filteredUsers.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.disabled' }}>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                Không tìm thấy nhân sự phù hợp
              </Typography>
            </Box>
          ) : (
            filteredUsers.map((user) => {
              const isSelected = currentAssigneeIds.has(user.id.toLowerCase());
              const roleDisplay = user.roleName || user.role || 'Thành viên';
              const roleColors = getDynamicRoleColor(roleDisplay, isDark);

              return (
                <ListItemButton
                  key={user.id}
                  onClick={(e) => handleToggleUser(user.id, e)}
                  sx={{
                    py: 0.75,
                    px: 1,
                    borderRadius: '6px',
                    mb: 0.25,
                    gap: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: isSelected
                      ? isDark
                        ? 'rgba(2, 132, 199, 0.15)'
                        : '#f0f9ff'
                      : 'transparent',
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, flex: 1 }}>
                    {/* Avatar */}
                    <Avatar
                      src={getMediaUrl(user.avatarUrl)}
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        bgcolor: isSelected ? '#0284c7' : '#64748b',
                        color: '#ffffff',
                        flexShrink: 0,
                      }}
                    >
                      {user.fullName.charAt(0)}
                    </Avatar>

                    {/* Name & Role next to / below name */}
                    <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isSelected ? 700 : 600,
                            fontSize: '0.84rem',
                            color: 'text.primary',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {user.fullName}
                        </Typography>

                        {/* Role Chip right next to Name */}
                        {roleDisplay && (
                          <Chip
                            label={roleDisplay}
                            size="small"
                            sx={{
                              height: 19,
                              fontSize: '0.67rem',
                              fontWeight: 700,
                              bgcolor: roleColors.bg,
                              color: roleColors.text,
                              border: `1px solid ${roleColors.border}`,
                              '& .MuiChip-label': { px: 0.75 },
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Box>

                      {(user.department || user.email) && (
                        <Typography
                          variant="caption"
                          noWrap
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.72rem',
                            display: 'block',
                            lineHeight: 1.2,
                          }}
                        >
                          {user.department || user.email}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Checkbox */}
                  <Checkbox
                    size="small"
                    checked={isSelected}
                    sx={{
                      p: 0.5,
                      color: '#94a3b8',
                      '&.Mui-checked': {
                        color: '#0284c7',
                      },
                    }}
                  />
                </ListItemButton>
              );
            })
          )}
        </List>
      </Popover>
    </>
  );
});

AssigneeSelectPopover.displayName = 'AssigneeSelectPopover';
