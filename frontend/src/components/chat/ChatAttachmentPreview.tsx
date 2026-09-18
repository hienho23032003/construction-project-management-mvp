import React from 'react';
import { Box, Chip, useTheme } from '@mui/material';
import {
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';

interface ChatAttachmentPreviewProps {
  files: File[];
  onRemoveFile: (index: number) => void;
}

export const ChatAttachmentPreview: React.FC<ChatAttachmentPreviewProps> = ({
  files,
  onRemoveFile,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (files.length === 0) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        mb: 1,
        px: 0.5,
        maxHeight: 120,
        overflowY: 'auto',
      }}
    >
      {files.map((file, idx) => {
        const isImage = file.type.startsWith('image/');
        return (
          <Chip
            key={`${file.name}-${idx}`}
            icon={
              isImage ? (
                <ImageIcon fontSize="small" sx={{ color: '#a855f7 !important' }} />
              ) : (
                <FileIcon fontSize="small" sx={{ color: '#a855f7 !important' }} />
              )
            }
            label={file.name}
            onDelete={() => onRemoveFile(idx)}
            size="small"
            sx={{
              maxWidth: 200,
              bgcolor: isDark ? '#3a3b3c' : '#f0f2f5',
              borderRadius: '8px',
              fontSize: '0.8rem',
              '& .MuiChip-label': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }}
          />
        );
      })}
    </Box>
  );
};
