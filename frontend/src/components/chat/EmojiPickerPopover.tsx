import React from 'react';
import {
  Popover,
  Box,
  Typography,
  IconButton,
  useTheme,
} from '@mui/material';
import { QUICK_EMOJIS } from '../../constants/chat.constants';

interface EmojiPickerPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
}

export const EmojiPickerPopover: React.FC<EmojiPickerPopoverProps> = ({
  open,
  anchorEl,
  onClose,
  onSelectEmoji,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      slotProps={{
        paper: {
          sx: {
            p: 1.5,
            width: 260,
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            bgcolor: 'background.paper',
          },
        },
      }}
    >
      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1, px: 0.5 }}>
        Biểu tượng cảm xúc
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {QUICK_EMOJIS.map((emoji) => (
          <IconButton
            key={emoji}
            size="small"
            onClick={() => onSelectEmoji(emoji)}
            sx={{
              fontSize: '1.25rem',
              p: 0.75,
              borderRadius: '8px',
              transition: 'transform 0.12s ease',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                transform: 'scale(1.2)',
              },
            }}
          >
            {emoji}
          </IconButton>
        ))}
      </Box>
    </Popover>
  );
};
