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
  canDelete?: boolean;
  isAdmin?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = memo(({
  project: p,
  onCardClick,
  onEditClick,
  onDeleteClick,
  canEdit = false,
  canDelete = false,
  isAdmin = false,
}) => {
  const showDelete = canDelete || isAdmin;
  const statusBorderColor = p.status === 'Completed'
    ? '#10b981'
    : p.isOverdue
    ? '#ef4444'
    : p.status === 'InProgress'
    ? '#0284c7'
    : p.status === 'OnHold'
    ? '#f59e0b'
    : '#94a3b8';

  return (
    <Card
      variant="outlined"
      onClick={() => onCardClick(p.id)}
      sx={{
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '10px',
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderLeft: `4px solid ${statusBorderColor} !important`,
        boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)',
        transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        boxSizing: 'border-box',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 12px 24px -4px rgba(15, 23, 42, 0.09), 0 4px 8px -2px rgba(15, 23, 42, 0.04)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header: Code & Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Chip
            label={p.code}
            size="small"
            sx={{
              fontWeight: 800,
              bgcolor: '#f0f9ff',
              color: '#0284c7',
              border: '1px solid #e0f2fe',
              borderRadius: '6px',
              fontSize: '0.72rem',
              height: 24,
            }}
          />
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {canEdit && onEditClick && (
              <IconButton size="small" onClick={(e) => onEditClick(p, e)}>
                <Edit size={16} color="#64748b" />
              </IconButton>
            )}
            {showDelete && onDeleteClick && (
              <IconButton size="small" onClick={(e) => onDeleteClick(p.id, e)} sx={{ '&:hover': { color: '#ef4444' } }}>
                <Trash2 size={16} color="#ef4444" />
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
              Quản lý (PM): <strong>{p.managerNames?.length ? p.managerNames.join(', ') : (p.managerName || 'Chưa gán')}</strong>
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
