import React, { useState, useEffect, memo } from 'react';
import { Box, Slider, Typography, useTheme } from '@mui/material';

export interface TaskProgressSliderProps {
  value: number;
  onChange: (newValue: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export const TaskProgressSlider: React.FC<TaskProgressSliderProps> = memo(({
  value,
  onChange,
  disabled = false,
  min = 0,
  max = 100,
  step = 5,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (_: Event, val: number | number[]) => {
    setLocalValue(val as number);
  };

  const handleChangeCommitted = (_: Event | React.SyntheticEvent, val: number | number[]) => {
    const nextVal = val as number;
    if (nextVal !== value) {
      onChange(nextVal);
    }
  };

  const isCompleted = localValue >= 100;
  const activeColor = isCompleted
    ? (isDark ? '#34d399' : '#10b981')
    : (isDark ? '#38bdf8' : '#0284c7');

  return (
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        width: '100%',
        userSelect: 'none',
      }}
    >
      <Slider
        size="small"
        value={localValue}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        sx={{
          flex: 1,
          width: '100%',
          py: 1,
          color: activeColor,
          transition: 'color 0.2s ease',
          '& .MuiSlider-thumb': {
            width: 14,
            height: 14,
            transition: 'box-shadow 0.15s ease, transform 0.1s ease',
            '&:hover, &.Mui-focusVisible': {
              boxShadow: `0 0 0 6px ${isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(2, 132, 199, 0.2)'}`,
            },
            '&.Mui-active': {
              transform: 'scale(1.25)',
            },
          },
          '& .MuiSlider-track': {
            height: 5,
            borderRadius: 3,
          },
          '& .MuiSlider-rail': {
            height: 5,
            borderRadius: 3,
            opacity: isDark ? 0.3 : 0.25,
            bgcolor: isDark ? '#64748b' : '#94a3b8',
          },
        }}
      />
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          minWidth: 36,
          textAlign: 'right',
          whiteSpace: 'nowrap',
          color: isCompleted ? (isDark ? '#34d399' : '#10b981') : 'text.primary',
          fontSize: '0.78rem',
        }}
      >
        {localValue}%
      </Typography>
    </Box>
  );
});

TaskProgressSlider.displayName = 'TaskProgressSlider';
