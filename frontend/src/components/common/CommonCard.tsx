import React from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme,
  SxProps,
  Theme,
} from '@mui/material';

export interface CommonCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  headerIcon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'outlined' | 'flat';
  sx?: SxProps<Theme>;
  headerSx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
}

const CommonCardComponent: React.FC<CommonCardProps> = ({
  title,
  subtitle,
  action,
  headerIcon,
  children,
  footer,
  noPadding = false,
  hoverable = false,
  onClick,
  variant = 'default',
  sx,
  headerSx,
  contentSx,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const hasHeader = Boolean(title || subtitle || action || headerIcon);

  return (
    <Paper
      onClick={onClick}
      elevation={0}
      sx={[
        {
          borderRadius: '8px',
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: variant === 'flat' ? (isDark ? '#18191a' : '#f8fafc') : 'background.paper',
          boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
          ...(hoverable && {
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: isDark
                ? '0 8px 24px rgba(0, 0, 0, 0.6)'
                : '0 8px 20px rgba(0, 0, 0, 0.08)',
              borderColor: isDark ? '#3a3b3c' : '#cbd5e1',
            },
          }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {hasHeader && (
        <Box
          sx={{
            p: { xs: 1.5, sm: 2 },
            pb: noPadding ? { xs: 1.5, sm: 2 } : 1,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1.5,
            borderBottom: noPadding ? `1px solid ${theme.palette.divider}` : 'none',
            ...headerSx,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, flex: 1 }}>
            {headerIcon && (
              <Box sx={{ color: isDark ? '#2d88ff' : '#0284c7', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {headerIcon}
              </Box>
            )}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              {typeof title === 'string' ? (
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
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
          {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
        </Box>
      )}

      <Box
        sx={{
          p: noPadding ? 0 : { xs: 1.5, sm: 2 },
          pt: hasHeader && !noPadding ? 1 : { xs: 1.5, sm: 2 },
          flexGrow: 1,
          ...contentSx,
        }}
      >
        {children}
      </Box>

      {footer && (
        <Box
          sx={{
            p: { xs: 1.5, sm: 2 },
            pt: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: isDark ? 'rgba(0, 0, 0, 0.15)' : '#fafafa',
          }}
        >
          {footer}
        </Box>
      )}
    </Paper>
  );
};

export const CommonCard = React.memo(CommonCardComponent);
