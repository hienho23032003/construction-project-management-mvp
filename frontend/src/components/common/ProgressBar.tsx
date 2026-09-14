import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

interface ProgressBarProps {
  value: number;
  height?: number;
  showText?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, height = 8, showText = true }) => {
  const clamped = Math.min(100, Math.max(0, value));

  let color = '#0284c7';
  if (clamped >= 100) color = '#10b981';
  else if (clamped < 30) color = '#f59e0b';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
      <Box sx={{ width: '100%' }}>
        <LinearProgress
          variant="determinate"
          value={clamped}
          sx={{
            height,
            borderRadius: height / 2,
            backgroundColor: '#e2e8f0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
              borderRadius: height / 2,
            },
          }}
        />
      </Box>
      {showText && (
        <Typography variant="body2" sx={{ minWidth: 40, fontWeight: 600, fontSize: '0.8rem', color: '#334155' }}>
          {clamped}%
        </Typography>
      )}
    </Box>
  );
};

export default ProgressBar;
