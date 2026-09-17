import React, { useState, memo } from 'react';
import { Box, Checkbox, IconButton, Typography, TextField } from '@mui/material';
import { Trash2, Edit2, Check, X } from 'lucide-react';

export interface ChecklistItemData {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
}

interface ChecklistItemProps {
  item: ChecklistItemData;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = memo(({
  item,
  onToggle,
  onDelete,
  onUpdateTitle,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);

  const handleSave = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== item.title) {
      onUpdateTitle(item.id, trimmed);
    } else {
      setEditTitle(item.title);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(item.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 0.75,
        px: 1.25,
        borderRadius: '8px',
        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1f2022' : '#f8fafc',
        border: '1px solid',
        borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
        transition: 'border-color 0.15s ease',
        '&:hover': {
          borderColor: '#0284c7',
          '& .item-actions': { opacity: 1 },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
        <Checkbox
          size="small"
          checked={item.isCompleted}
          onChange={() => onToggle(item.id)}
          sx={{
            p: 0.5,
            color: '#94a3b8',
            '&.Mui-checked': {
              color: '#10b981',
            },
          }}
        />

        {isEditing ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, mr: 1 }}>
            <TextField
              size="small"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              fullWidth
              sx={{
                '& .MuiOutlinedInput-input': {
                  py: 0.5,
                  px: 1,
                  fontSize: '0.875rem',
                },
              }}
            />
            <IconButton size="small" onClick={handleSave} sx={{ color: '#10b981', p: 0.5 }}>
              <Check size={16} />
            </IconButton>
            <IconButton size="small" onClick={handleCancel} sx={{ color: '#ef4444', p: 0.5 }}>
              <X size={16} />
            </IconButton>
          </Box>
        ) : (
          <Typography
            variant="body2"
            onClick={() => onToggle(item.id)}
            sx={{
              cursor: 'pointer',
              color: item.isCompleted ? 'text.disabled' : 'text.primary',
              textDecoration: item.isCompleted ? 'line-through' : 'none',
              fontWeight: item.isCompleted ? 400 : 500,
              fontSize: '0.875rem',
              userSelect: 'none',
              wordBreak: 'break-word',
              flex: 1,
            }}
          >
            {item.title}
          </Typography>
        )}
      </Box>

      {!isEditing && (
        <Box
          className="item-actions"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.25,
            opacity: { xs: 1, sm: 0 },
            transition: 'opacity 0.15s ease',
          }}
        >
          <IconButton
            size="small"
            onClick={() => setIsEditing(true)}
            sx={{ color: 'text.secondary', p: 0.5, '&:hover': { color: '#0284c7' } }}
            title="Sửa tiêu chí"
          >
            <Edit2 size={14} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete(item.id)}
            sx={{ color: 'text.secondary', p: 0.5, '&:hover': { color: '#ef4444' } }}
            title="Xóa tiêu chí"
          >
            <Trash2 size={14} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
});

ChecklistItem.displayName = 'ChecklistItem';
