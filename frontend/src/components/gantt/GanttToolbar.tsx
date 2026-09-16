import React from 'react';
import {
  Box,
  IconButton,
  Button,
  ButtonGroup,
  Tooltip,
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

export const GanttToolbar: React.FC<GanttToolbarProps> = ({
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
  return (
    <Box
      sx={{
        p: { xs: 1.25, sm: 1.25 },
        px: { xs: 1.5, sm: 2 },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexWrap: 'wrap',
        gap: 1.5,
        borderBottom: '1px solid #e2e8f0',
        bgcolor: '#f8fafc',
        flexShrink: 0,
      }}
    >
      {/* Left: Filter Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', flexGrow: 1, minWidth: 0 }}>
        {filterBar}
      </Box>

      {/* Right: View & Export Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', lg: 'auto' }, justifyContent: { xs: 'flex-start', sm: 'flex-end' }, flexWrap: 'wrap' }}>
        <Tooltip title={isLeftCollapsed ? 'Hiện cột danh sách công việc' : 'Ẩn bớt cột danh sách công việc'}>
          <IconButton
            size="small"
            onClick={onToggleLeftPanel}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '6px',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#0284c7',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              '&:hover': { bgcolor: '#f0f9ff', borderColor: '#bae6fd' },
            }}
          >
            {isLeftCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </IconButton>
        </Tooltip>

        <ButtonGroup size="small" variant="outlined">
          <Button
            onClick={onExpandAll}
            title="Mở rộng toàn bộ cây công việc"
            sx={{
              height: 32,
              px: 1.25,
              fontSize: '0.78rem',
              fontWeight: 600,
              bgcolor: '#ffffff',
              borderColor: '#e2e8f0',
              color: '#334155',
              textTransform: 'none',
              '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
            }}
          >
            Mở Rộng Hết
          </Button>
          <Button
            onClick={onCollapseAll}
            title="Thu gọn các nhánh công việc con"
            sx={{
              height: 32,
              px: 1.25,
              fontSize: '0.78rem',
              fontWeight: 600,
              bgcolor: '#ffffff',
              borderColor: '#e2e8f0',
              color: '#334155',
              textTransform: 'none',
              '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
            }}
          >
            Thu Gọn Hết
          </Button>
        </ButtonGroup>

        <Button
          size="small"
          variant="outlined"
          startIcon={<Download size={14} />}
          onClick={onExportGantt}
          disabled={exporting}
          sx={{
            height: 32,
            px: 1.5,
            fontSize: '0.78rem',
            fontWeight: 600,
            bgcolor: '#ffffff',
            color: '#059669',
            borderColor: '#bbf7d0',
            borderRadius: '6px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            textTransform: 'none',
            '&:hover': { bgcolor: '#f0fdf4', borderColor: '#86efac' },
          }}
        >
          {exporting ? 'Đang xuất...' : 'Xuất Excel / CSV'}
        </Button>

        <Button
          size="small"
          variant="outlined"
          startIcon={<Calendar size={14} />}
          onClick={onScrollToToday}
          sx={{
            height: 32,
            px: 1.5,
            fontSize: '0.78rem',
            fontWeight: 600,
            bgcolor: '#ffffff',
            borderColor: '#e2e8f0',
            color: '#334155',
            borderRadius: '6px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            textTransform: 'none',
            '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
          }}
        >
          Hôm Nay
        </Button>

        {/* Segmented Control Pill Group for ViewMode */}
        <Box
          sx={{
            display: 'inline-flex',
            p: '3px',
            bgcolor: '#e2e8f0',
            borderRadius: '8px',
            gap: '3px',
          }}
        >
          {(['Day', 'Week', 'Month'] as ViewMode[]).map((mode) => {
            const isSelected = viewMode === mode;
            return (
              <Button
                key={mode}
                size="small"
                onClick={() => onViewModeChange(mode)}
                sx={{
                  height: 26,
                  px: 1.35,
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 700 : 500,
                  textTransform: 'none',
                  borderRadius: '6px',
                  minWidth: 'auto',
                  border: 'none',
                  bgcolor: isSelected ? '#ffffff' : 'transparent',
                  color: isSelected ? '#0284c7' : '#64748b',
                  boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                    color: isSelected ? '#0284c7' : '#0f172a',
                  },
                }}
              >
                {mode === 'Day' ? 'Ngày' : mode === 'Week' ? 'Tuần' : 'Tháng'}
              </Button>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};
