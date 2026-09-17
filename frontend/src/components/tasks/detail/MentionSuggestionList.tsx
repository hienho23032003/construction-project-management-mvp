import React, { memo } from 'react';
import { Paper, List, ListItemButton, Avatar, Typography, Box, useTheme, ClickAwayListener } from '@mui/material';
import { ProjectMember } from '../../../types';
import { getMediaUrl } from '../../../utils/fileUtils';
import { useUsersListQuery } from '../../../hooks/useEmployees';

interface MentionSuggestionListProps {
  members: ProjectMember[];
  selectedIndex: number;
  onSelect: (member: ProjectMember) => void;
  filterText: string;
  onClose?: () => void;
}

export const MentionSuggestionList: React.FC<MentionSuggestionListProps> = memo(({
  members,
  selectedIndex,
  onSelect,
  filterText,
  onClose,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { data: allUsers = [] } = useUsersListQuery();

  const enrichedMembers = members.map((m) => {
    const fullUser = allUsers.find(
      (u) => u.id.toLowerCase() === (m.userId || m.id || '').toLowerCase()
    );
    const resolvedRole = (fullUser?.roles && fullUser.roles.length > 0 ? fullUser.roles[0] : null)
      || fullUser?.roleName
      || (m.roles && m.roles.length > 0 ? m.roles[0] : null)
      || m.roleName
      || (m.roleInProject && m.roleInProject !== 'Thành viên' && m.roleInProject !== 'Thành viên dự án' ? m.roleInProject : null)
      || fullUser?.role
      || 'Thành viên';

    return {
      ...m,
      avatarUrl: m.avatarUrl || fullUser?.avatarUrl,
      fullName: m.fullName || fullUser?.fullName || m.email,
      department: m.department || fullUser?.department,
      roleName: resolvedRole,
      roleInProject: resolvedRole,
    };
  });

  const filtered = enrichedMembers.filter((m) => {
    const name = (m.fullName || m.email || '').toLowerCase();
    const role = (m.roleInProject || m.department || '').toLowerCase();
    const query = filterText.toLowerCase();
    return name.includes(query) || role.includes(query);
  }).slice(0, 6);

  if (filtered.length === 0) return null;

  return (
    <ClickAwayListener onClickAway={() => onClose?.()}>
      <Paper
        elevation={8}
        sx={{
          position: 'absolute',
          bottom: '100%',
          left: 8,
          mb: 1,
          minWidth: 280,
          maxWidth: 380,
          width: 'max-content',
          maxHeight: 260,
          overflowY: 'auto',
          zIndex: 1300,
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        }}
      >
        <Box sx={{ p: 1, px: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: isDark ? '#1e293b' : '#f8fafc' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', fontSize: '0.72rem' }}>
            GỢI Ý THÀNH VIÊN DỰ ÁN (@)
          </Typography>
        </Box>
        <List sx={{ p: 0.5 }}>
          {filtered.map((member, index) => {
            const isSelected = index === selectedIndex;
            const displayName = member.fullName || member.email || 'Thành viên';
            const avatarUrl = getMediaUrl(member.avatarUrl);
            const roleDisplay = member.roleInProject || member.department;

            return (
              <ListItemButton
                key={member.id || member.userId}
                selected={isSelected}
                onClick={() => onSelect(member)}
                sx={{
                  py: 0.75,
                  px: 1,
                  borderRadius: '6px',
                  mb: 0.25,
                  gap: 1.25,
                  '&.Mui-selected': {
                    bgcolor: isDark ? 'rgba(2, 132, 199, 0.25)' : '#e0f2fe',
                  },
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                  },
                }}
              >
                <Avatar
                  src={avatarUrl || undefined}
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: '0.8rem',
                    bgcolor: '#0284c7',
                    color: '#ffffff',
                    fontWeight: 700,
                    flexShrink: 0,
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                  }}
                >
                  {displayName.charAt(0)}
                </Avatar>

                <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      color: 'text.primary',
                    }}
                  >
                    {displayName}
                  </Typography>
                  {roleDisplay && (
                    <Typography
                      variant="caption"
                      noWrap
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.72rem',
                        display: 'block',
                      }}
                    >
                      {roleDisplay}
                    </Typography>
                  )}
                </Box>
              </ListItemButton>
            );
          })}
        </List>
      </Paper>
    </ClickAwayListener>
  );
});

MentionSuggestionList.displayName = 'MentionSuggestionList';
