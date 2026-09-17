import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { isToday } from 'date-fns';
import { ViewMode } from './GanttToolbar';

interface MonthGroup {
  monthStr: string;
  yearMonth: string;
  daysCount: number;
  startDate: Date;
}

interface GanttTimelineHeaderProps {
  monthGroups: MonthGroup[];
  timelineDays: Date[];
  columnWidth: number;
  viewMode: ViewMode;
  getDayOfWeekText: (date: Date, mode: ViewMode) => string;
}

export const GanttTimelineHeader: React.FC<GanttTimelineHeaderProps> = React.memo(({
  monthGroups,
  timelineDays,
  columnWidth,
  viewMode,
  getDayOfWeekText,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 15,
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: isDark ? '0 2px 4px rgba(0,0,0,0.4)' : '0 2px 4px rgba(0,0,0,0.03)',
      }}
    >
      {/* Tier 1: Grouped Month Header */}
      <Box sx={{ height: 26, display: 'flex', borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: isDark ? '#18191a' : '#f1f5f9' }}>
        {monthGroups.map((mg, i) => (
          <Box
            key={i}
            sx={{
              width: mg.daysCount * columnWidth,
              minWidth: mg.daysCount * columnWidth,
              borderRight: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.75rem', color: isDark ? '#2d88ff' : '#0369a1' }}>
              Tháng {mg.monthStr}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Tier 2: Date Columns (Upper Line: Thứ, Lower Line: Ngày, Centered) */}
      <Box sx={{ height: 38, display: 'flex', bgcolor: isDark ? '#242526' : '#f8fafc' }}>
        {timelineDays.map((date, idx) => {
          const today = isToday(date);
          const dayOfWeek = date.getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const dayNum = date.getDate();
          const showLabel = viewMode !== 'Month' || dayNum === 1 || dayNum % 5 === 0;

          return (
            <Box
              key={idx}
              sx={{
                width: columnWidth,
                minWidth: columnWidth,
                borderRight: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                bgcolor: today
                  ? isDark
                    ? 'rgba(56, 189, 248, 0.18)'
                    : '#e0f2fe'
                  : isWeekend
                  ? isDark
                    ? 'rgba(255, 255, 255, 0.02)'
                    : '#f1f5f9'
                  : 'transparent',
                py: 0.25,
                overflow: 'hidden',
                userSelect: 'none',
              }}
            >
              {showLabel && (
                <>
                  {/* Upper Line: Day of week */}
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: today ? 800 : isWeekend ? 600 : 600,
                      fontSize: viewMode === 'Week' ? '0.62rem' : '0.65rem',
                      color: today ? (isDark ? '#38bdf8' : '#0284c7') : isWeekend ? '#ef4444' : 'text.secondary',
                      lineHeight: 1.1,
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      display: 'block',
                    }}
                  >
                    {viewMode === 'Month' ? `${dayNum}` : getDayOfWeekText(date, viewMode)}
                  </Typography>

                  {/* Lower Line: Day number (for Day & Week modes) */}
                  {viewMode !== 'Month' && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: today ? 800 : 700,
                        fontSize: '0.72rem',
                        color: today ? (isDark ? '#38bdf8' : '#0284c7') : isWeekend ? '#ef4444' : 'text.primary',
                        lineHeight: 1.1,
                        textAlign: 'center',
                        display: 'block',
                      }}
                    >
                      {dayNum}
                    </Typography>
                  )}
                </>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
});

GanttTimelineHeader.displayName = 'GanttTimelineHeader';
