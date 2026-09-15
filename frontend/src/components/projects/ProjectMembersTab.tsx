import React, { memo } from 'react';
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
} from '@mui/material';
import { Plus, Trash2, Mail, Briefcase } from 'lucide-react';
import { ProjectMember } from '../../types';
import { getMediaUrl } from '../../utils/fileUtils';

interface ProjectMembersTabProps {
  members: ProjectMember[];
  canEditTask: boolean;
  onOpenAddMember: () => void;
  onRemoveMember: (userId: string) => void;
}

export const ProjectMembersTab: React.FC<ProjectMembersTabProps> = memo(({
  members,
  canEditTask,
  onOpenAddMember,
  onRemoveMember,
}) => {
  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
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
        <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '0.95rem', sm: '1.05rem' }, color: '#0f172a' }}>
          Đội Ngũ Ban Quản Lý & Kỹ Sư Công Trình ({members.length} nhân sự)
        </Typography>
        {canEditTask && (
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
        <Grid container spacing={2}>
          {members.map((m) => (
            <Grid item xs={12} sm={6} md={4} key={m.id}>
              <Card sx={{ border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: 'none' }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <Avatar
                        src={getMediaUrl(m.avatarUrl)}
                        sx={{ bgcolor: '#0284c7', width: 40, height: 40, fontWeight: 700 }}
                      >
                        {(m.fullName || 'U').charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {m.fullName}
                        </Typography>
                        <Chip
                          label={m.roleInProject || 'Thành viên'}
                          size="small"
                          sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, bgcolor: '#e0f2fe', color: '#0369a1' }}
                        />
                      </Box>
                    </Box>
                    {canEditTask && (
                      <IconButton size="small" onClick={() => onRemoveMember(m.userId)}>
                        <Trash2 size={15} color="#ef4444" />
                      </IconButton>
                    )}
                  </Box>

                  <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Mail size={13} color="#94a3b8" />
                      <Typography variant="caption" sx={{ color: '#64748b' }} noWrap>
                        {m.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Briefcase size={13} color="#94a3b8" />
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
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
