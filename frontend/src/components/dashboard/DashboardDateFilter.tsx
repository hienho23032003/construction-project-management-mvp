import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Chip,
  ButtonGroup,
  Button,
  LinearProgress,
} from '@mui/material';
import { Filter, RotateCcw } from 'lucide-react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export type DatePreset = 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

interface DashboardDateFilterProps {
  selectedPreset: DatePreset;
  appliedLabel: string;
  isFiltered: boolean;
  fromDate: Date | null;
  toDate: Date | null;
  filterLoading: boolean;
  onSelectPreset: (preset: DatePreset) => void;
  onFromDateChange: (val: Date | null) => void;
  onToDateChange: (val: Date | null) => void;
  onApplyCustom: () => void;
  onResetFilter: () => void;
}

export const DashboardDateFilter: React.FC<DashboardDateFilterProps> = ({
  selectedPreset,
  appliedLabel,
  isFiltered,
  fromDate,
  toDate,
  filterLoading,
  onSelectPreset,
  onFromDateChange,
  onToDateChange,
  onApplyCustom,
  onResetFilter,
}) => {
  return (
    <Paper
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
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

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, width: '100%' }}>
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
          <Chip
            label={appliedLabel}
            size="small"
            color={isFiltered ? 'primary' : 'default'}
            sx={{ fontWeight: 600, height: 24, fontSize: '0.72rem' }}
          />
        </Box>

        {/* Quick Presets */}
        <Box
          sx={{
            display: 'flex',
            bgcolor: '#f1f5f9',
            p: '3px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            gap: '3px',
            flexWrap: 'wrap',
            maxWidth: '100%',
          }}
        >
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'today', label: 'Hôm nay' },
            { id: 'week', label: 'Tuần này' },
            { id: 'month', label: 'Tháng này' },
            { id: 'quarter', label: 'Quý này' },
            { id: 'year', label: 'Năm nay' },
          ].map((item) => {
            const isActive = selectedPreset === item.id;
            return (
              <Button
                key={item.id}
                size="small"
                onClick={() => onSelectPreset(item.id as DatePreset)}
                sx={{
                  textTransform: 'none',
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  fontWeight: isActive ? 700 : 500,
                  py: '4px',
                  px: { xs: 1, sm: 1.5 },
                  minWidth: { xs: 52, sm: 65 },
                  borderRadius: '6px',
                  bgcolor: isActive ? '#0284c7 !important' : 'transparent',
                  color: isActive ? '#ffffff !important' : '#475569',
                  boxShadow: isActive ? '0 1px 3px rgba(2, 132, 199, 0.3)' : 'none',
                  border: 'none',
                  '&:hover': {
                    bgcolor: isActive ? '#0369a1 !important' : '#e2e8f0',
                    color: isActive ? '#ffffff' : '#0f172a',
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>
      </Box>

      {/* Custom Date Range Selector */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
          pt: 1,
          borderTop: '1px dashed #f1f5f9',
          width: '100%',
        }}
      >
        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.8125rem' }}>
          Khoảng ngày tùy chọn:
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
          <DatePicker
            label="Từ ngày"
            value={fromDate}
            onChange={onFromDateChange}
            slotProps={{
              textField: {
                size: 'small',
                sx: { width: { xs: 'calc(50% - 4px)', sm: 155 } },
              },
            }}
          />
          <DatePicker
            label="Đến ngày"
            value={toDate}
            onChange={onToDateChange}
            slotProps={{
              textField: {
                size: 'small',
                sx: { width: { xs: 'calc(50% - 4px)', sm: 155 } },
              },
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="small"
            onClick={onApplyCustom}
            disabled={filterLoading || (!fromDate && !toDate)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#0284c7',
              '&:hover': { bgcolor: '#0369a1' },
              '&.Mui-disabled': {
                bgcolor: '#e2e8f0 !important',
                color: '#94a3b8 !important',
                cursor: 'not-allowed',
              },
            }}
          >
            Áp Dụng Lọc
          </Button>
          {(isFiltered || selectedPreset !== 'all') && (
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              startIcon={<RotateCcw size={14} />}
              onClick={onResetFilter}
              disabled={filterLoading}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Đặt Lại
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};
