import React, { memo } from 'react';
import { Card, CardContent, Box, Typography, Chip, IconButton } from '@mui/material';
import { MapPin, User, Calendar, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Project } from '../../types';
import { StatusChip } from '../common/StatusChip';
import { PriorityBadge, ProgressBar } from '../common/PriorityBadge';

interface ProjectCardProps {
  project: Project;
  onCardClick: (id: string) => void;
  onEditClick?: (p: Project, e: React.MouseEvent) => void;
  onDeleteClick?: (id: string, e: React.MouseEvent) => void;
  canEdit?: boolean;
  isAdmin?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = memo(({
  project: p,
  onCardClick,
  onEditClick,
  onDeleteClick,
  canEdit = false,
  isAdmin = false,
}) => {
  return (
    <Card
      onClick={() => onCardClick(p.id)}
      sx={{
        height: '100%',
        cursor: 'pointer',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 20px -4px rgba(2, 132, 199, 0.20)',
          borderColor: '#0284c7',
        },
      }}
    >
      <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Top Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={p.code}
              size="small"
              sx={{ bgcolor: '#0284c7', color: '#ffffff', fontWeight: 800, fontSize: '0.75rem' }}
            />
            <PriorityBadge priority={p.priority} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StatusChip status={p.status} isOverdue={p.isOverdue} />
            {canEdit && onEditClick && (
              <IconButton size="small" onClick={(e) => onEditClick(p, e)}>
                <Edit size={16} color="#64748b" />
              </IconButton>
            )}
            {isAdmin && onDeleteClick && (
              <IconButton size="small" onClick={(e) => onDeleteClick(p.id, e)}>
                <Trash2 size={16} color="#ef4444" />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Title */}
        <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a', mb: 1.5, lineHeight: 1.3 }}>
          {p.name}
        </Typography>

        {/* Metadata */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 2.5 }}>
          {p.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapPin size={15} color="#94a3b8" />
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500 }} noWrap>
                {p.location}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <User size={15} color="#94a3b8" />
            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500 }}>
              Quản lý (PM): <strong>{p.managerName || 'Chưa gán'}</strong>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calendar size={15} color="#94a3b8" />
            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500 }}>
              Hạn: {format(new Date(p.startDate), 'dd/MM/yyyy')} - {format(new Date(p.plannedEndDate), 'dd/MM/yyyy')}
            </Typography>
          </Box>
        </Box>

        {/* Progress */}
        <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
              Tiến Độ Tổng Hợp
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              {p.completedTaskCount}/{p.taskCount} công việc ({p.memberCount} thành viên)
            </Typography>
          </Box>
          <ProgressBar value={p.progress} height={8} />
        </Box>
      </CardContent>
    </Card>
  );
});
