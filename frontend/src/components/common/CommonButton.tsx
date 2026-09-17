import React from 'react';
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
  useTheme,
  SxProps,
  Theme,
} from '@mui/material';

export type CommonButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'danger'
  | 'dangerOutline'
  | 'success'
  | 'ghost';

export interface CommonButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: CommonButtonVariant;
  loading?: boolean;
  loadingText?: string;
  rounded?: boolean;
  sx?: SxProps<Theme>;
}

const CommonButtonComponent: React.FC<CommonButtonProps> = ({
  children,
  variant = 'primary',
  loading = false,
  loadingText,
  rounded = false,
  disabled,
  startIcon,
  endIcon,
  size = 'medium',
  sx,
  ...rest
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const getVariantStyles = (): SxProps<Theme> => {
    switch (variant) {
      case 'primary':
        return {
          bgcolor: isDark ? '#2d88ff' : '#0284c7',
          color: '#ffffff',
          border: '1px solid transparent',
          boxShadow: 'none',
          '&:hover': {
            bgcolor: isDark ? '#1877f2' : '#0369a1',
            boxShadow: isDark
              ? '0 2px 8px rgba(45, 136, 255, 0.3)'
              : '0 2px 6px rgba(2, 132, 199, 0.25)',
          },
          '&.Mui-disabled': {
            bgcolor: isDark ? '#3a3b3c !important' : '#e2e8f0 !important',
            color: isDark ? '#71767b !important' : '#94a3b8 !important',
          },
        };
      case 'secondary':
        return {
          bgcolor: isDark ? '#3a3b3c' : '#f1f5f9',
          color: isDark ? '#e4e6eb' : '#334155',
          border: `1px solid ${isDark ? '#3e4042' : '#e2e8f0'}`,
          boxShadow: 'none',
          '&:hover': {
            bgcolor: isDark ? '#4e4f50' : '#e2e8f0',
            color: isDark ? '#ffffff' : '#0f172a',
          },
          '&.Mui-disabled': {
            bgcolor: isDark ? '#3a3b3c !important' : '#f1f5f9 !important',
            color: isDark ? '#71767b !important' : '#cbd5e1 !important',
            borderColor: 'transparent',
          },
        };
      case 'outline':
        return {
          bgcolor: 'transparent',
          color: isDark ? '#e4e6eb' : '#0f172a',
          border: `1px solid ${isDark ? '#3a3b3c' : '#cbd5e1'}`,
          boxShadow: 'none',
          '&:hover': {
            bgcolor: isDark ? 'rgba(45, 136, 255, 0.08)' : 'rgba(2, 132, 199, 0.04)',
            borderColor: isDark ? '#2d88ff' : '#0284c7',
            color: isDark ? '#2d88ff' : '#0284c7',
          },
          '&.Mui-disabled': {
            borderColor: isDark ? '#3a3b3c !important' : '#e2e8f0 !important',
            color: isDark ? '#71767b !important' : '#94a3b8 !important',
          },
        };
      case 'danger':
        return {
          bgcolor: '#ef4444',
          color: '#ffffff',
          border: '1px solid transparent',
          boxShadow: 'none',
          '&:hover': {
            bgcolor: '#dc2626',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
          },
          '&.Mui-disabled': {
            bgcolor: isDark ? '#3a3b3c !important' : '#fee2e2 !important',
            color: isDark ? '#71767b !important' : '#fca5a5 !important',
          },
        };
      case 'dangerOutline':
        return {
          bgcolor: 'transparent',
          color: '#ef4444',
          border: '1px solid #ef4444',
          boxShadow: 'none',
          '&:hover': {
            bgcolor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2',
            borderColor: '#dc2626',
            color: '#dc2626',
          },
          '&.Mui-disabled': {
            borderColor: isDark ? '#3a3b3c !important' : '#fecaca !important',
            color: isDark ? '#71767b !important' : '#fca5a5 !important',
          },
        };
      case 'success':
        return {
          bgcolor: '#10b981',
          color: '#ffffff',
          border: '1px solid transparent',
          boxShadow: 'none',
          '&:hover': {
            bgcolor: '#059669',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
          },
          '&.Mui-disabled': {
            bgcolor: isDark ? '#3a3b3c !important' : '#e2e8f0 !important',
            color: isDark ? '#71767b !important' : '#94a3b8 !important',
          },
        };
      case 'ghost':
        return {
          bgcolor: 'transparent',
          color: isDark ? '#b0b3b8' : '#475569',
          border: '1px solid transparent',
          boxShadow: 'none',
          '&:hover': {
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            color: isDark ? '#e4e6eb' : '#0f172a',
          },
          '&.Mui-disabled': {
            color: isDark ? '#71767b !important' : '#cbd5e1 !important',
          },
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): SxProps<Theme> => {
    switch (size) {
      case 'small':
        return {
          height: 32,
          px: 1.5,
          fontSize: '0.8125rem',
          fontWeight: 600,
        };
      case 'large':
        return {
          height: 44,
          px: 2.5,
          fontSize: '0.9375rem',
          fontWeight: 700,
        };
      default:
        return {
          height: 38,
          px: 2,
          fontSize: '0.875rem',
          fontWeight: 600,
        };
    }
  };

  return (
    <MuiButton
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
      endIcon={!loading ? endIcon : undefined}
      sx={[
        {
          textTransform: 'none',
          borderRadius: rounded ? '999px' : '8px',
          whiteSpace: 'nowrap',
          transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
        },
        getSizeStyles() as any,
        getVariantStyles() as any,
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...rest}
    >
      {loading && loadingText ? loadingText : children}
    </MuiButton>
  );
};

export const CommonButton = React.memo(CommonButtonComponent);
