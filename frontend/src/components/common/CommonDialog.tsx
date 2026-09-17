import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
  SxProps,
  Theme,
} from '@mui/material';
import { X } from 'lucide-react';

export interface CommonDialogProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  contentDividers?: boolean;
  noPadding?: boolean;
  sx?: SxProps<Theme>;
}

const CommonDialogComponent: React.FC<CommonDialogProps> = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  contentDividers = false,
  noPadding = false,
  sx,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={isMobile}
      PaperProps={{
        sx: [
          {
            borderRadius: isMobile ? 0 : '8px !important',
            bgcolor: 'background.paper',
            border: isDark ? '1px solid #3e4042' : 'none',
            boxShadow: isDark
              ? '0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 10px 10px -5px rgba(0, 0, 0, 0.6)'
              : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ],
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          p: { xs: 2, sm: 2.5 },
          pb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, flex: 1, pr: 1 }}>
          {icon && (
            <Box sx={{ color: isDark ? '#2d88ff' : '#0284c7', display: 'flex', alignItems: 'center' }}>
              {icon}
            </Box>
          )}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            {typeof title === 'string' ? (
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  color: 'text.primary',
                  lineHeight: 1.3,
                }}
                noWrap
              >
                {title}
              </Typography>
            ) : (
              title
            )}
            {subtitle && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  display: 'block',
                  mt: 0.25,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            p: 0.75,
            borderRadius: '8px',
            '&:hover': {
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
              color: 'text.primary',
            },
          }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent
        dividers={contentDividers}
        sx={{
          p: noPadding ? 0 : { xs: 2, sm: 2.5 },
          bgcolor: 'background.paper',
          overflowY: 'auto',
        }}
      >
        {children}
      </DialogContent>

      {/* Dialog Actions / Footer */}
      {actions && (
        <DialogActions
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: isDark ? 'rgba(0, 0, 0, 0.2)' : '#f8fafc',
            gap: 1,
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export const CommonDialog = React.memo(CommonDialogComponent);
