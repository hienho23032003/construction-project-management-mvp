import React, { memo } from 'react';
import { Card, CardContent, Box, Typography, Chip, IconButton } from '@mui/material';
import { MapPin, User, Calendar, Edit, Trash2 } from 'lucide-react';
import { Project } from '../../types';
import { StatusChip } from '../common/StatusChip';
import { PriorityBadge, ProgressBar } from '../common';
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
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: `4px solid ${statusBorderColor} !important`,
        boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        boxSizing: 'border-box',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 12px 24px -4px rgba(15, 23, 42, 0.09), 0 4px 8px -2px rgba(15, 23, 42, 0.04)',
        },
      }}
    >
      <CardContent sx={{ p: 1.5, pb: 1.25, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header: Code & Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Chip
            label={p.code}
            size="small"
            sx={{
              fontWeight: 800,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.15)' : '#f0f9ff'),
              color: (theme) => (theme.palette.mode === 'dark' ? '#38bdf8' : '#0284c7'),
              border: '1px solid',
              borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.3)' : '#e0f2fe'),
              borderRadius: '6px',
              fontSize: '0.7rem',
              height: 22,
            }}
          />
          <Box sx={{ display: 'flex', gap: 0.25 }}>
            {canEdit && onEditClick && (
              <IconButton size="small" onClick={(e) => onEditClick(p, e)} sx={{ p: 0.35 }}>
                <Edit size={14} color="#64748b" />
              </IconButton>
            )}
            {showDelete && onDeleteClick && (
              <IconButton size="small" onClick={(e) => onDeleteClick(p.id, e)} sx={{ p: 0.35, '&:hover': { color: '#ef4444' } }}>
                <Trash2 size={14} color="#ef4444" />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Name */}
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            mb: 1,
            color: 'text.primary',
            fontSize: '0.85rem',
            lineHeight: 1.3,
          }}
          noWrap
          title={p.name}
        >
          {p.name}
        </Typography>

        {/* Metadata */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.25 }}>
          {p.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
              <MapPin size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }} noWrap title={p.location}>
                {p.location}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            <User size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }} noWrap title={p.managerNames?.length ? p.managerNames.join(', ') : (p.managerName || 'Chưa gán')}>
              PM: <strong>{p.managerNames?.length ? p.managerNames.join(', ') : (p.managerName || 'Chưa gán')}</strong>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            <Calendar size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }} noWrap>
              {formatDate(p.startDate, 'dd/MM')} - {formatDate(p.plannedEndDate, 'dd/MM/yyyy')}
            </Typography>
          </Box>
        </Box>

        {/* Progress */}
        <Box sx={{ mt: 'auto', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.7rem' }}>
              Tiến Độ
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 700 }}>
              {p.progress}% ({p.completedTaskCount}/{p.taskCount})
            </Typography>
          </Box>
          <ProgressBar value={p.progress} height={6} showText={false} />
        </Box>
      </CardContent>
    </Card>
  );
});
