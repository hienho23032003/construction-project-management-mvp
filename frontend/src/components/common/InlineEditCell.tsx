import React, { useState, useEffect, memo } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Popover,
  Button,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { Check, X, Edit2 } from 'lucide-react';

export interface InlineEditCellProps {
  value: string;
  onSave: (newValue: string) => void | Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  subtitle?: string;
  typographyVariant?: 'body1' | 'body2' | 'subtitle2' | 'caption';
  fontSize?: string | number;
  fontWeight?: string | number;
  maxWidth?: string | number;
  modalTitle?: string;
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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [currentValue, setCurrentValue] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleStartEdit = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    e.stopPropagation();
    setCurrentValue(value);
    setAnchorEl(e.currentTarget);
  };

  const handleSave = async (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    const trimmed = currentValue.trim();
    if (!trimmed) {
      setCurrentValue(value);
      setAnchorEl(null);
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
    setAnchorEl(null);
  };

  const handleCancel = (e?: React.SyntheticEvent | object) => {
    if (e && 'stopPropagation' in e && typeof (e as React.SyntheticEvent).stopPropagation === 'function') {
      (e as React.SyntheticEvent).stopPropagation();
    }
    setCurrentValue(value);
    setAnchorEl(null);
  };

  const isOpen = Boolean(anchorEl);

  return (
    <>
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
          bgcolor: isOpen ? 'action.selected' : 'transparent',
          outline: isOpen ? '1px solid' : 'none',
          outlineColor: 'primary.main',
          transition: 'all 0.15s ease',
          '&:hover': {
            bgcolor: disabled ? 'transparent' : 'action.hover',
            '& .inline-edit-icon': { opacity: 1 },
          },
        }}
        title={disabled ? value : `${value} (Nhấp để chỉnh sửa nhanh)`}
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
              opacity: isOpen ? 1 : 0,
              color: isOpen ? '#3b82f6' : '#64748b',
              flexShrink: 0,
              transition: 'opacity 0.15s ease',
            }}
          />
        )}
      </Box>

      {/* Floating Popover directly attached to the cell */}
      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={saving ? undefined : () => handleCancel()}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              p: 1.25,
              width: { xs: 'calc(100vw - 32px)', sm: 380 },
              maxWidth: 450,
              borderRadius: '10px',
              bgcolor: 'background.paper',
              backgroundImage: 'none',
              boxShadow: isDark
                ? '0 12px 32px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.12)'
                : '0 10px 28px rgba(0, 0, 0, 0.14), 0 0 0 1px rgba(0, 0, 0, 0.08)',
            },
          },
        }}
      >
        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
              mb: 1,
              px: 0.5,
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            {subtitle}
          </Typography>
        )}

        <TextField
          autoFocus
          multiline
          minRows={2}
          maxRows={6}
          fullWidth
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onFocus={(e) => {
            const val = e.target.value;
            e.target.setSelectionRange(val.length, val.length);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleSave(e);
            } else if (e.key === 'Escape') {
              e.preventDefault();
              handleCancel(e);
            }
          }}
          placeholder={placeholder}
          variant="outlined"
          disabled={saving}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              p: 1.2,
              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              },
            },
          }}
        />

        {/* Footer actions & shortcut hint */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 1,
            pt: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.72rem',
              userSelect: 'none',
              pl: 0.5,
            }}
          >
            Ctrl+Enter để lưu • Esc để hủy
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <IconButton
              size="small"
              onClick={handleCancel}
              disabled={saving}
              sx={{
                p: 0.5,
                color: 'text.secondary',
                '&:hover': { bgcolor: 'action.hover', color: 'error.main' },
              }}
              title="Hủy (Esc)"
            >
              <X size={16} />
            </IconButton>
            <Button
              size="small"
              variant="contained"
              onClick={handleSave}
              disabled={saving || !currentValue.trim()}
              startIcon={saving ? <CircularProgress size={13} color="inherit" /> : <Check size={14} />}
              sx={{
                borderRadius: '6px',
                textTransform: 'none',
                fontSize: '0.8rem',
                py: 0.4,
                px: 1.5,
                fontWeight: 600,
                minWidth: 70,
              }}
            >
              {saving ? 'Đang lưu' : 'Lưu'}
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
});

InlineEditCell.displayName = 'InlineEditCell';
