import React from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateRight as RotateRightIcon,
} from '@mui/icons-material';

interface MediaViewerModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl?: string;
  fileName?: string;
  senderName?: string;
  createdAt?: string;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  open,
  onClose,
  imageUrl,
  fileName,
  senderName,
  createdAt,
}) => {
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  React.useEffect(() => {
    if (open) {
      setZoom(1);
      setRotation(0);
    }
  }, [open, imageUrl]);

  if (!imageUrl) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName || 'image.jpg';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          borderRadius: 3,
          color: '#fff',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        },
      }}
    >
      {/* Header Controls */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 1.5,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ maxWidth: 400 }}>
            {fileName || 'Xem chi tiết ảnh'}
          </Typography>
          {senderName && (
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Được gửi bởi {senderName} {createdAt ? `• ${new Date(createdAt).toLocaleString('vi-VN')}` : ''}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Thu nhỏ">
            <IconButton onClick={handleZoomOut} sx={{ color: '#fff' }}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', minWidth: 40, textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </Typography>
          <Tooltip title="Phóng to">
            <IconButton onClick={handleZoomIn} sx={{ color: '#fff' }}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xoay 90°">
            <IconButton onClick={handleRotate} sx={{ color: '#fff' }}>
              <RotateRightIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Tải xuống">
            <IconButton onClick={handleDownload} sx={{ color: '#38bdf8' }}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Đóng">
            <IconButton onClick={onClose} sx={{ color: 'rgba(255, 255, 255, 0.8)', ml: 1 }}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Image Body */}
      <DialogContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 500,
          maxHeight: '75vh',
          p: 2,
          overflow: 'auto',
          backgroundColor: '#090d16',
        }}
      >
        <Box
          component="img"
          src={imageUrl}
          alt={fileName || 'Image preview'}
          sx={{
            maxWidth: '100%',
            maxHeight: '70vh',
            objectFit: 'contain',
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 0.2s ease-in-out',
            borderRadius: 1,
            userSelect: 'none',
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
