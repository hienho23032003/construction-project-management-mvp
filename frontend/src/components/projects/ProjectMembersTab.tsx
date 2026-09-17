import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Plus, Trash2, Mail, Briefcase, ChevronRight } from 'lucide-react';
import { ProjectMember } from '../../types';
import { getMediaUrl } from '../../utils/fileUtils';
import { getDynamicRoleColor } from '../../utils/roleColors';
import { usePermission } from '../../hooks/usePermission';
import { PERMISSIONS } from '../../constants/permissions';

interface ProjectMembersTabProps {
  members: ProjectMember[];
  canManageMembers?: boolean;
  canEditTask?: boolean;
  onOpenAddMember: () => void;
  onRemoveMember: (userId: string) => void;
}

export const ProjectMembersTab: React.FC<ProjectMembersTabProps> = memo(({
  members,
  canManageMembers,
  canEditTask,
  onOpenAddMember,
  onRemoveMember,
}) => {
  const navigate = useNavigate();
  const { can, isSuperAdmin } = usePermission();
  const canViewEmployee = isSuperAdmin || can(PERMISSIONS.EMPLOYEES_VIEW);
  const allowManage = canManageMembers ?? canEditTask ?? false;

  const handleCardClick = (userId: string) => {
    if (canViewEmployee) {
      navigate(`/employees/${userId}`);
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '0.95rem', sm: '1.05rem' }, color: 'text.primary' }}>
          Đội Ngũ Ban Quản Lý & Kỹ Sư Công Trình ({members.length} nhân sự)
        </Typography>
        {allowManage && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Plus size={15} />}
            onClick={onOpenAddMember}
            sx={{ fontWeight: 600, whiteSpace: 'nowrap', minWidth: 'fit-content' }}
          >
            Thêm Thành Viên
          </Button>
        )}
      </Box>

      {members.length === 0 ? (
        <Typography variant="body2" sx={{ color: '#94a3b8', py: 2 }}>
          Chưa có nhân sự nào được phân bổ vào dự án này.
        </Typography>
      ) : (
        <Grid container spacing={1.5}>
          {members.map((m) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              xl={2.4}
              key={m.id}
              sx={{
                width: { xl: '20%' },
                maxWidth: { xl: '20%' },
                flexBasis: { xl: '20%' },
              }}
            >
              <Card
                onClick={() => handleCardClick(m.userId)}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  borderRadius: '8px',
                  boxShadow: 'none',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: canViewEmployee ? 'pointer' : 'default',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                  '&:hover': canViewEmployee
                    ? {
                        transform: 'translateY(-2px)',
                        borderColor: 'primary.main',
                        boxShadow: (theme) =>
                          theme.palette.mode === 'dark'
                            ? '0 8px 20px -4px rgba(0, 0, 0, 0.5)'
                            : '0 8px 20px -4px rgba(2, 132, 199, 0.12)',
                      }
                    : undefined,
                }}
              >
                <CardContent sx={{ p: 1.5, pb: '12px !important', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center', minWidth: 0, flex: 1 }}>
                      <Avatar
                        src={getMediaUrl(m.avatarUrl)}
                        sx={{ bgcolor: '#0284c7', width: 36, height: 36, fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}
                      >
                        {(m.fullName || 'U').charAt(0)}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                            fontSize: '0.8125rem',
                            lineHeight: 1.2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={m.fullName}
                        >
                          {m.fullName}
                        </Typography>
                        <Chip
                          label={m.roles?.[0] || m.roleName || m.roleInProject || 'Thành viên'}
                          size="small"
                          sx={{
                            mt: 0.35,
                            height: 19,
                            fontSize: '0.67rem',
                            fontWeight: 700,
                            ...(() => {
                              const roleText = m.roles?.[0] || m.roleName || m.roleInProject || 'Thành viên';
                              const roleColors = getDynamicRoleColor(roleText);
                              return {
                                bgcolor: roleColors.bg,
                                color: roleColors.text,
                                border: `1px solid ${roleColors.border}`,
                              };
                            })(),
                            maxWidth: '100%',
                            '& .MuiChip-label': {
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              px: 0.75,
                            },
                          }}
                        />
                      </Box>
                    </Box>
                    {allowManage && (
                      <Tooltip title="Xóa khỏi dự án">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveMember(m.userId);
                          }}
                          sx={{ p: 0.35, color: 'text.secondary', '&:hover': { color: '#ef4444' } }}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>

                  <Box sx={{ mt: 'auto', pt: 1, display: 'flex', flexDirection: 'column', gap: 0.4, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                      <Mail size={12} color="#7b7b7b" style={{ flexShrink: 0 }} />
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.725rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={m.email}
                      >
                        {m.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                      <Briefcase size={12} color="#7b7b7b" style={{ flexShrink: 0 }} />
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.725rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={m.department ? `Phòng: ${m.department}` : 'Phòng: -'}
                      >
                        Phòng: {m.department || '-'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
});
