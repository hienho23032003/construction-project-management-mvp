import React from 'react';
import {
  Chip as MuiChip,
  ChipProps as MuiChipProps,
  Box,
  useTheme,
  SxProps,
  Theme,
} from '@mui/material';

export type CommonChipColorVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

export interface CommonChipProps extends Omit<MuiChipProps, 'color'> {
  colorVariant?: CommonChipColorVariant;
  dot?: boolean;
  sx?: SxProps<Theme>;
}

const CommonChipComponent: React.FC<CommonChipProps> = ({
  label,
  colorVariant = 'neutral',
  dot = false,
  size = 'small',
  icon,
  sx,
  ...rest
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const getColorStyles = (): { bg: string; color: string; border: string; dotColor: string } => {
    switch (colorVariant) {
      case 'primary':
        return {
          bg: isDark ? 'rgba(45, 136, 255, 0.16)' : '#e0f2fe',
          color: isDark ? '#2d88ff' : '#0369a1',
          border: isDark ? 'rgba(45, 136, 255, 0.35)' : '#bae6fd',
          dotColor: isDark ? '#2d88ff' : '#0284c7',
        };
      case 'success':
        return {
          bg: isDark ? 'rgba(52, 211, 153, 0.16)' : '#ecfdf5',
          color: isDark ? '#34d399' : '#047857',
          border: isDark ? 'rgba(52, 211, 153, 0.35)' : '#a7f3d0',
          dotColor: isDark ? '#34d399' : '#10b981',
        };
      case 'warning':
        return {
          bg: isDark ? 'rgba(251, 191, 36, 0.16)' : '#fffbeb',
          color: isDark ? '#fbbf24' : '#b45309',
          border: isDark ? 'rgba(251, 191, 36, 0.35)' : '#fde68a',
          dotColor: isDark ? '#fbbf24' : '#f59e0b',
        };
      case 'danger':
        return {
          bg: isDark ? 'rgba(248, 113, 113, 0.16)' : '#fef2f2',
          color: isDark ? '#f87171' : '#b91c1c',
          border: isDark ? 'rgba(248, 113, 113, 0.35)' : '#fecaca',
          dotColor: isDark ? '#f87171' : '#ef4444',
        };
      case 'info':
        return {
          bg: isDark ? 'rgba(56, 189, 248, 0.16)' : '#f0f9ff',
          color: isDark ? '#38bdf8' : '#0369a1',
          border: isDark ? 'rgba(56, 189, 248, 0.35)' : '#bae6fd',
          dotColor: isDark ? '#38bdf8' : '#0284c7',
        };
      case 'secondary':
        return {
          bg: isDark ? 'rgba(45, 212, 191, 0.16)' : '#f0fdfa',
          color: isDark ? '#2dd4bf' : '#0f766e',
          border: isDark ? 'rgba(45, 212, 191, 0.35)' : '#99f6e4',
          dotColor: isDark ? '#2dd4bf' : '#14b8a6',
        };
      case 'neutral':
      default:
        return {
          bg: isDark ? '#3a3b3c' : '#f1f5f9',
          color: isDark ? '#e4e6eb' : '#475569',
          border: isDark ? '#3e4042' : '#e2e8f0',
          dotColor: isDark ? '#b0b3b8' : '#94a3b8',
        };
    }
  };

  const styleConfig = getColorStyles();

  return (
    <MuiChip
      label={
        dot ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: styleConfig.dotColor,
                flexShrink: 0,
              }}
            />
            {label}
          </Box>
        ) : (
          label
        )
      }
      size={size}
      icon={icon}
      sx={[
        {
          fontWeight: 600,
          fontSize: size === 'small' ? '0.75rem' : '0.8125rem',
          height: size === 'small' ? 24 : 30,
          borderRadius: '6px',
          bgcolor: styleConfig.bg,
          color: styleConfig.color,
          border: `1px solid ${styleConfig.border}`,
          '& .MuiChip-label': {
            px: 1,
          },
          '& .MuiChip-icon': {
            color: 'inherit',
            ml: 0.75,
          },
          '& .MuiChip-deleteIcon': {
            color: 'inherit',
            opacity: 0.7,
            '&:hover': {
              opacity: 1,
            },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...rest}
    />
  );
};

export const CommonChip = React.memo(CommonChipComponent);
