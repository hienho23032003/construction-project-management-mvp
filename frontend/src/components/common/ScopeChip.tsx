import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { SCOPE_CONFIGS, getViewScope, ViewScope } from '../../constants/scope';

export interface ScopeChipProps extends Omit<ChipProps, 'label' | 'color'> {
  canViewAll?: boolean;
  canViewProject?: boolean;
  scope?: ViewScope;
  short?: boolean;
}

export const ScopeChip: React.FC<ScopeChipProps> = ({
  canViewAll = false,
  canViewProject = false,
  scope,
  short = false,
  sx,
  ...rest
}) => {
  const resolvedScope = scope || getViewScope(canViewAll, canViewProject);
  const config = SCOPE_CONFIGS[resolvedScope];

  return (
    <Chip
      size="small"
      variant="outlined"
      label={short ? config.shortLabel : config.label}
      sx={{
        fontWeight: 700,
        height: 24,
        fontSize: '0.72rem',
        bgcolor: config.bgColor,
        color: config.color,
        borderColor: config.borderColor,
        ...sx,
      }}
      {...rest}
    />
  );
};
