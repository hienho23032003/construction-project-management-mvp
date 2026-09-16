import React from 'react';
import {
  Paper,
  Box,
  Typography,
  LinearProgress,
} from '@mui/material';
import { Filter } from 'lucide-react';
import { CommonDateRangePicker } from '../common/CommonDateRangePicker';
import { ScopeChip } from '../common/ScopeChip';

interface DashboardDateFilterProps {
  canViewAll?: boolean;
  canViewProject?: boolean;
  fromDate: Date | null;
  toDate: Date | null;
  filterLoading: boolean;
  onChangeRange: (from: Date | null, to: Date | null, presetId?: string) => void;
}

export const DashboardDateFilter: React.FC<DashboardDateFilterProps> = ({
  canViewAll = false,
  canViewProject = false,
  fromDate,
  toDate,
  filterLoading,
  onChangeRange,
}) => {
  return (
    <Paper
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        gap: 1.5,
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
      }}
    >
      {filterLoading && (
        <LinearProgress
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
          }}
        />
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            bgcolor: '#e0f2fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0284c7',
            flexShrink: 0,
          }}
        >
          <Filter size={18} />
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
          Bộ Lọc Thời Gian Dashboard
        </Typography>
        <ScopeChip canViewAll={canViewAll} canViewProject={canViewProject} />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', md: 'auto' } }}>
        <CommonDateRangePicker
          fromDate={fromDate}
          toDate={toDate}
          onChange={onChangeRange}
          placeholder="Chọn khoảng thời gian xem báo cáo..."
          minWidth={{ xs: '100%', md: 280 }}
          disabled={filterLoading}
        />
      </Box>
    </Paper>
  );
};
