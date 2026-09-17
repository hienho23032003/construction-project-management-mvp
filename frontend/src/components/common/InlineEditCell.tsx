import React, { useState, useEffect, memo } from 'react';
import { Box, Typography, TextField, IconButton } from '@mui/material';
import { Check, X, Edit2 } from 'lucide-react';

interface InlineEditCellProps {
  value: string;
  onSave: (newValue: string) => void | Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  subtitle?: string;
  typographyVariant?: 'body1' | 'body2' | 'subtitle2' | 'caption';
  fontSize?: string | number;
  fontWeight?: string | number;
  maxWidth?: string | number;
}

export const InlineEditCell: React.FC<InlineEditCellProps> = memo(({
  value,
  onSave,
  disabled = false,
  placeholder = 'Nhập nội dung...',
  subtitle,
  typographyVariant = 'body2',
  fontSize = '0.875rem',
  fontWeight = 600,
  maxWidth = '100%',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleStartEdit = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = async (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    const trimmed = currentValue.trim();
    if (!trimmed) {
      setCurrentValue(value);
      setIsEditing(false);
      return;
    }
    if (trimmed !== value) {
      setSaving(true);
      try {
        await onSave(trimmed);
      } finally {
        setSaving(false);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setCurrentValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave(e);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel(e);
    }
  };

  if (isEditing) {
    return (
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          width: '100%',
          maxWidth,
        }}
      >
        <TextField
          size="small"
          autoFocus
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          disabled={saving}
          placeholder={placeholder}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '6px',
              bgcolor: 'background.paper',
              '& input': {
                py: 0.5,
                px: 1,
                fontSize,
                fontWeight,
              },
            },
          }}
        />
        <IconButton
          size="small"
          onMouseDown={(e) => {
            e.preventDefault();
            handleSave(e);
          }}
          disabled={saving}
          sx={{ color: '#10b981', p: 0.4 }}
          title="Lưu (Enter)"
        >
          <Check size={15} />
        </IconButton>
        <IconButton
          size="small"
          onMouseDown={(e) => {
            e.preventDefault();
            handleCancel(e);
          }}
          disabled={saving}
          sx={{ color: '#ef4444', p: 0.4 }}
          title="Hủy (Esc)"
        >
          <X size={15} />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      onClick={handleStartEdit}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        maxWidth,
        cursor: disabled ? 'default' : 'pointer',
        borderRadius: '4px',
        p: '2px 4px',
        ml: '-4px',
        transition: 'background-color 0.15s ease',
        '&:hover': {
          bgcolor: disabled ? 'transparent' : 'action.hover',
          '& .inline-edit-icon': { opacity: 1 },
        },
      }}
      title={disabled ? value : `${value} (Nhấp để sửa nhanh)`}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant={typographyVariant}
          sx={{
            fontWeight,
            fontSize,
            color: 'text.primary',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {value || placeholder}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              whiteSpace: 'nowrap',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {!disabled && (
        <Edit2
          size={12}
          className="inline-edit-icon"
          style={{
            opacity: 0,
            color: '#64748b',
            flexShrink: 0,
            transition: 'opacity 0.15s ease',
          }}
        />
      )}
    </Box>
  );
});

InlineEditCell.displayName = 'InlineEditCell';
