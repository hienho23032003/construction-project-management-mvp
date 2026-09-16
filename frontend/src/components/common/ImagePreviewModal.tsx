import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  Box,
  IconButton,
  Typography,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Download,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export interface ImagePreviewModalProps {
  open: boolean;
  imageUrl: string | null;
  fileName?: string;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  open,
  imageUrl,
  fileName,
  onClose,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const posStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Reset transform state when modal opens or image changes
  useEffect(() => {
    if (open) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [open, imageUrl]);

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale((prev) => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale((prev) => {
      const next = Math.max(prev - 0.25, 0.5);
      if (next <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleReset = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleRotate = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scale === 1) {
      setScale(2);
    } else {
      handleReset();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(prev + 0.15, 4));
    } else {
      setScale((prev) => {
        const next = Math.max(prev - 0.15, 0.5);
        if (next <= 1) {
          setPosition({ x: 0, y: 0 });
        }
        return next;
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    posStartRef.current = { ...position };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPosition({
      x: posStartRef.current.x + dx,
      y: posStartRef.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || imageUrl.split('/').pop() || 'image_preview.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = fileName || 'image_preview.jpg';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!open || !imageUrl) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      TransitionComponent={Fade}
      transitionDuration={200}
      PaperProps={{
        sx: {
          bgcolor: 'transparent',
          boxShadow: 'none',
          overflow: 'hidden',
          p: 0,
          m: 0,
          width: '100vw',
          height: '100vh',
          maxWidth: '100vw',
          maxHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}
      BackdropProps={{
        sx: {
          bgcolor: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(8px)',
        },
      }}
    >
      {/* Top Floating Bar */}
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: 'absolute',
          top: { xs: 12, sm: 20 },
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 0.75, sm: 1.25 },
          px: { xs: 1.5, sm: 2 },
          py: 0.75,
          bgcolor: 'rgba(30, 41, 59, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          maxWidth: '92vw',
        }}
      >
        {fileName && (
          <Typography
            variant="caption"
            sx={{
              color: '#e2e8f0',
              fontWeight: 600,
              maxWidth: { xs: 120, sm: 220 },
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              mr: 1,
              display: { xs: 'none', sm: 'block' },
            }}
            title={fileName}
          >
            {fileName}
          </Typography>
        )}

        {/* Zoom Out */}
        <Tooltip title="Thu nhỏ (Zoom out)">
          <span>
            <IconButton
              size="small"
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              sx={{
                color: '#ffffff',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
                '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' },
              }}
            >
              <ZoomOut size={18} />
            </IconButton>
          </span>
        </Tooltip>

        {/* Zoom Percentage / Reset */}
        <Tooltip title="Đặt lại kích thước gốc (100%)">
          <Typography
            onClick={handleReset}
            variant="caption"
            sx={{
              color: '#38bdf8',
              fontWeight: 700,
              cursor: 'pointer',
              px: 1,
              py: 0.25,
              borderRadius: '4px',
              bgcolor: 'rgba(56, 189, 248, 0.12)',
              fontSize: '0.78rem',
              userSelect: 'none',
              '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.25)' },
            }}
          >
            {Math.round(scale * 100)}%
          </Typography>
        </Tooltip>

        {/* Zoom In */}
        <Tooltip title="Phóng to (Zoom in)">
          <span>
            <IconButton
              size="small"
              onClick={handleZoomIn}
              disabled={scale >= 4}
              sx={{
                color: '#ffffff',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
                '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' },
              }}
            >
              <ZoomIn size={18} />
            </IconButton>
          </span>
        </Tooltip>

        {/* Rotate */}
        <Tooltip title="Xoay 90°">
          <IconButton
            size="small"
            onClick={handleRotate}
            sx={{
              color: '#ffffff',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
            }}
          >
            <RotateCw size={18} />
          </IconButton>
        </Tooltip>

        {/* Download */}
        <Tooltip title="Tải xuống ảnh">
          <IconButton
            size="small"
            onClick={handleDownload}
            sx={{
              color: '#10b981',
              bgcolor: 'rgba(16, 185, 129, 0.15)',
              '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.3)' },
            }}
          >
            <Download size={18} />
          </IconButton>
        </Tooltip>

        {/* Divider */}
        <Box sx={{ width: '1px', height: 20, bgcolor: 'rgba(255,255,255,0.2)', mx: 0.5 }} />

        {/* Close */}
        <Tooltip title="Đóng (Esc)">
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: '#f87171',
              bgcolor: 'rgba(239, 68, 68, 0.15)',
              '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.3)' },
            }}
          >
            <X size={18} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Image Viewer Area */}
      <Box
        onClick={onClose}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          userSelect: 'none',
          p: { xs: 2, sm: 4 },
        }}
      >
        <Box
          component="img"
          src={imageUrl}
          alt={fileName || 'Preview'}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={handleDoubleClick}
          draggable={false}
          sx={{
            maxWidth: '90vw',
            maxHeight: '85vh',
            objectFit: 'contain',
            borderRadius: '8px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
            pointerEvents: 'auto',
          }}
        />
      </Box>
    </Dialog>
  );
};
