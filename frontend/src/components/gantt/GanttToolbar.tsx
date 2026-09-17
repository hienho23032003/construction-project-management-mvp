import React from 'react';
import {
  Box,
  IconButton,
  Button,
  ButtonGroup,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Calendar,
  PanelLeftClose,
  PanelLeftOpen,
  Download,
} from 'lucide-react';

export type ViewMode = 'Day' | 'Week' | 'Month';

interface GanttToolbarProps {
  filterBar?: React.ReactNode;
  isLeftCollapsed: boolean;
  onToggleLeftPanel: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onExportGantt: () => void;
  exporting: boolean;
  onScrollToToday: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const GanttToolbar: React.FC<GanttToolbarProps> = React.memo(({
  filterBar,
  isLeftCollapsed,
  onToggleLeftPanel,
  onExpandAll,
  onCollapseAll,
  onExportGantt,
  exporting,
  onScrollToToday,
  viewMode,
  onViewModeChange,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        py: { xs: 1, lg: 0.75 },
        px: { xs: 1, sm: 1.5 },
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        alignItems: { xs: 'stretch', lg: 'center' },
        justifyContent: 'space-between',
        flexWrap: { xs: 'wrap', lg: 'nowrap' },
        overflowX: { xs: 'visible', lg: 'auto' },
        gap: 1,
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: isDark ? '#242526' : '#f8fafc',
        flexShrink: 0,
        '&::-webkit-scrollbar': { height: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: isDark ? '#3e4042' : '#cbd5e1', borderRadius: 4 },
      }}
    >
      {/* Left: Filter Controls */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          flexWrap: { xs: 'wrap', lg: 'nowrap' },
          flexShrink: { xs: 1, lg: 0 },
          width: { xs: '100%', lg: 'auto' },
        }}
      >
        {filterBar}
      </Box>

      {/* Right: Actions & View Mode Switcher */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'space-between', lg: 'flex-end' },
          gap: 0.75,
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          flexShrink: 0,
          width: { xs: '100%', lg: 'auto' },
        }}
      >
        <Tooltip title={isLeftCollapsed ? 'Hiện cột danh sách công việc' : 'Ẩn bớt cột danh sách công việc'}>
          <IconButton
            size="small"
            onClick={onToggleLeftPanel}
            sx={{
              width: 30,
              height: 30,
              borderRadius: '6px',
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#ffffff',
              border: `1px solid ${theme.palette.divider}`,
              color: isDark ? '#2d88ff' : '#0284c7',
              '&:hover': {
                bgcolor: isDark ? 'rgba(45, 136, 255, 0.15)' : '#f0f9ff',
                borderColor: isDark ? '#2d88ff' : '#bae6fd',
              },
            }}
          >
            {isLeftCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </IconButton>
        </Tooltip>

        <ButtonGroup size="small" variant="outlined">
          <Button
            onClick={onExpandAll}
            title="Mở rộng toàn bộ cây công việc"
            sx={{
              height: 30,
              px: 1,
              fontSize: '0.75rem',
              fontWeight: 600,
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
              borderColor: theme.palette.divider,
              color: 'text.primary',
              textTransform: 'none',
              whiteSpace: 'nowrap',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#f8fafc',
                borderColor: isDark ? '#3e4042' : '#cbd5e1',
              },
            }}
          >
            Mở Rộng Hết
          </Button>
          <Button
            onClick={onCollapseAll}
            title="Thu gọn danh sách công việc"
            sx={{
              height: 30,
              px: 1,
              fontSize: '0.75rem',
              fontWeight: 600,
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
              borderColor: theme.palette.divider,
              color: 'text.primary',
              textTransform: 'none',
              whiteSpace: 'nowrap',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#f8fafc',
                borderColor: isDark ? '#3e4042' : '#cbd5e1',
              },
            }}
          >
            Thu Gọn Hết
          </Button>
        </ButtonGroup>

        <Button
          size="small"
          variant="outlined"
          startIcon={<Download size={13} />}
          onClick={onExportGantt}
          disabled={exporting}
          sx={{
            height: 30,
            px: 1.25,
            fontSize: '0.75rem',
            fontWeight: 700,
            bgcolor: isDark ? 'rgba(52, 211, 153, 0.1)' : '#ffffff',
            color: isDark ? '#34d399' : '#059669',
            borderColor: isDark ? 'rgba(52, 211, 153, 0.35)' : '#bbf7d0',
            textTransform: 'none',
            whiteSpace: 'nowrap',
            '&:hover': {
              bgcolor: isDark ? 'rgba(52, 211, 153, 0.2)' : '#f0fdf4',
              borderColor: isDark ? '#34d399' : '#86efac',
            },
          }}
        >
          {exporting ? 'Đang xuất...' : 'Xuất Excel / CSV'}
        </Button>

        <Button
          size="small"
          variant="outlined"
          startIcon={<Calendar size={13} />}
          onClick={onScrollToToday}
          sx={{
            height: 30,
            px: 1.25,
            fontSize: '0.75rem',
            fontWeight: 600,
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
            borderColor: theme.palette.divider,
            color: 'text.primary',
            textTransform: 'none',
            whiteSpace: 'nowrap',
            '&:hover': {
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#f8fafc',
              borderColor: isDark ? '#3e4042' : '#cbd5e1',
            },
          }}
        >
          Hôm Nay
        </Button>

        {/* View Mode Toggle: Day / Week / Month */}
        <ButtonGroup size="small" variant="outlined" sx={{ bgcolor: isDark ? '#3a3b3c' : '#f1f5f9', p: 0.25, borderRadius: '8px', flexShrink: 0 }}>
          {(['Day', 'Week', 'Month'] as ViewMode[]).map((mode) => {
            const active = viewMode === mode;
            const label = mode === 'Day' ? 'Ngày' : mode === 'Week' ? 'Tuần' : 'Tháng';
            return (
              <Button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                sx={{
                  height: 26,
                  px: 1.25,
                  fontSize: '0.75rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? (isDark ? '#2d88ff' : '#0284c7') : 'transparent',
                  color: active ? '#ffffff' : (isDark ? 'text.secondary' : '#475569'),
                  border: 'none !important',
                  borderRadius: '6px !important',
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    bgcolor: active
                      ? (isDark ? '#1877f2' : '#0369a1')
                      : isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0,0,0,0.06)',
                    color: active ? '#ffffff' : (isDark ? 'text.primary' : '#0f172a'),
                  },
                }}
              >
                {label}
              </Button>
            );
          })}
        </ButtonGroup>
      </Box>
    </Box>
  );
});

GanttToolbar.displayName = 'GanttToolbar';
