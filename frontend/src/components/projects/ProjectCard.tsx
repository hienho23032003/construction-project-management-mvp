import React, { memo } from 'react';
import { Card, CardContent, Box, Typography, Chip, IconButton } from '@mui/material';
import { MapPin, User, Calendar, Edit, Trash2 } from 'lucide-react';
import { Project } from '../../types';
import { StatusChip } from '../common/StatusChip';
import { PriorityBadge, ProgressBar } from '../common/PriorityBadge';
import { formatDate } from '../../utils/dateUtils';

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
      variant="outlined"
      onClick={() => onCardClick(p.id)}
      sx={{
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#ffffff',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
          borderColor: '#bae6fd',
        },
      }}
    >
      <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header: Code & Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Chip
            label={p.code}
            size="small"
            sx={{ fontWeight: 800, bgcolor: '#0284c7', color: '#ffffff', fontSize: '0.75rem' }}
          />
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {canEdit && onEditClick && (
              <IconButton size="small" onClick={(e) => onEditClick(p, e)}>
                <Edit size={16} color="#64748b" />
              </IconButton>
            )}
            {isAdmin && onDeleteClick && (
              <IconButton size="small" onClick={(e) => onDeleteClick(p.id, e)} sx={{ '&:hover': { color: '#ef4444' } }}>
                <Trash2 size={16} />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Name */}
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1.5, color: '#0f172a', lineHeight: 1.3 }}>
          {p.name}
        </Typography>

        {/* Metadata */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {p.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapPin size={15} color="#94a3b8" />
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500 }}>
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
              Hạn: {formatDate(p.startDate)} - {formatDate(p.plannedEndDate)}
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
