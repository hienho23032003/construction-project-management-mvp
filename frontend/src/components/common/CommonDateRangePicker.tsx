import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  Popover,
  Typography,
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  Check,
} from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subDays,
  isSameDay,
  isToday,
  isBefore,
  isAfter,
  startOfDay,
  eachDayOfInterval,
  getDay,
} from 'date-fns';

export interface DateRangePreset {
  id: string;
  label: string;
  getRange: () => { from: Date | null; to: Date | null };
}

export const DEFAULT_DATE_PRESETS: DateRangePreset[] = [
  {
    id: 'all',
    label: 'Tất cả thời gian',
    getRange: () => ({ from: null, to: null }),
  },
  {
    id: 'today',
    label: 'Hôm nay',
    getRange: () => {
      const now = new Date();
      return { from: startOfDay(now), to: startOfDay(now) };
    },
  },
  {
    id: 'yesterday',
    label: 'Hôm qua',
    getRange: () => {
      const y = subDays(new Date(), 1);
      return { from: startOfDay(y), to: startOfDay(y) };
    },
  },
  {
    id: 'last7days',
    label: '7 ngày qua',
    getRange: () => {
      const now = new Date();
      return { from: startOfDay(subDays(now, 6)), to: startOfDay(now) };
    },
  },
  {
    id: 'thisWeek',
    label: 'Tuần này',
    getRange: () => {
      const now = new Date();
      return {
        from: startOfDay(startOfWeek(now, { weekStartsOn: 1 })),
        to: startOfDay(endOfWeek(now, { weekStartsOn: 1 })),
      };
    },
  },
  {
    id: 'thisMonth',
    label: 'Tháng này',
    getRange: () => {
      const now = new Date();
      return {
        from: startOfDay(startOfMonth(now)),
        to: startOfDay(endOfMonth(now)),
      };
    },
  },
  {
    id: 'lastMonth',
    label: 'Tháng trước',
    getRange: () => {
      const lastM = subMonths(new Date(), 1);
      return {
        from: startOfDay(startOfMonth(lastM)),
        to: startOfDay(endOfMonth(lastM)),
      };
    },
  },
  {
    id: 'thisQuarter',
    label: 'Quý này',
    getRange: () => {
      const now = new Date();
      return {
        from: startOfDay(startOfQuarter(now)),
        to: startOfDay(endOfQuarter(now)),
      };
    },
  },
  {
    id: 'thisYear',
    label: 'Năm nay',
    getRange: () => {
      const now = new Date();
      return {
        from: startOfDay(startOfYear(now)),
        to: startOfDay(endOfYear(now)),
      };
    },
  },
];

export interface CommonDateRangePickerProps {
  fromDate: Date | null;
  toDate: Date | null;
  onChange: (fromDate: Date | null, toDate: Date | null, presetId?: string) => void;
  label?: string;
  placeholder?: string;
  size?: 'small' | 'medium';
  minWidth?: any;
  maxWidth?: any;
  fullWidth?: boolean;
  disabled?: boolean;
  customPresets?: DateRangePreset[];
  sx?: any;
}

const WEEK_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export const CommonDateRangePicker: React.FC<CommonDateRangePickerProps> = ({
  fromDate,
  toDate,
  onChange,
  label,
  placeholder = 'Chọn khoảng thời gian...',
  size = 'small',
  minWidth = 240,
  maxWidth,
  fullWidth = false,
  disabled = false,
  customPresets = DEFAULT_DATE_PRESETS,
  sx,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  // Temporary local state while picker popover is open
  const [tempFromDate, setTempFromDate] = useState<Date | null>(fromDate);
  const [tempToDate, setTempToDate] = useState<Date | null>(toDate);
  const [activePresetId, setActivePresetId] = useState<string>('custom');

  // Base month for dual calendar (left month)
  const [baseMonth, setBaseMonth] = useState<Date>(() => {
    return fromDate ? startOfMonth(fromDate) : startOfMonth(new Date());
  });

  // Right month is baseMonth + 1 month
  const nextMonth = useMemo(() => addMonths(baseMonth, 1), [baseMonth]);

  // Detect matching preset
  const detectPreset = (from: Date | null, to: Date | null): string => {
    if (!from && !to) return 'all';
    for (const preset of customPresets) {
      if (preset.id === 'all') continue;
      const range = preset.getRange();
      if (
        range.from &&
        range.to &&
        from &&
        to &&
        isSameDay(range.from, from) &&
        isSameDay(range.to, to)
      ) {
        return preset.id;
      }
    }
    return 'custom';
  };

  // Sync temp dates when popover opens
  useEffect(() => {
    if (open) {
      setTempFromDate(fromDate);
      setTempToDate(toDate);
      setActivePresetId(detectPreset(fromDate, toDate));
      if (fromDate) {
        setBaseMonth(startOfMonth(fromDate));
      } else {
        setBaseMonth(startOfMonth(new Date()));
      }
    }
  }, [open, fromDate, toDate]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectPreset = (preset: DateRangePreset) => {
    setActivePresetId(preset.id);
    const range = preset.getRange();
    setTempFromDate(range.from);
    setTempToDate(range.to);
    if (range.from) {
      setBaseMonth(startOfMonth(range.from));
    }
  };

  const handleDateClick = (day: Date) => {
    const clicked = startOfDay(day);

    if (!tempFromDate || (tempFromDate && tempToDate)) {
      // Start a new selection range
      setTempFromDate(clicked);
      setTempToDate(null);
      setActivePresetId('custom');
    } else if (tempFromDate && !tempToDate) {
      // Selecting the end date
      if (isBefore(clicked, tempFromDate)) {
        // If clicked before start date, make it the new start date
        setTempFromDate(clicked);
        setTempToDate(null);
      } else {
        setTempToDate(clicked);
        setActivePresetId('custom');
      }
    }
  };

  const handlePrevMonth = () => {
    setBaseMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setBaseMonth((prev) => addMonths(prev, 1));
  };

  const handleApply = () => {
    onChange(tempFromDate, tempToDate, activePresetId);
    handleClose();
  };

  const handleReset = () => {
    setTempFromDate(null);
    setTempToDate(null);
    setActivePresetId('all');
    onChange(null, null, 'all');
    handleClose();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null, null, 'all');
  };

  // Formatted display text on trigger button
  const displayLabel = useMemo(() => {
    if (!fromDate && !toDate) {
      return null;
    }

    const matchedPreset = customPresets.find((p) => {
      if (p.id === 'all') return false;
      const r = p.getRange();
      return (
        r.from &&
        r.to &&
        fromDate &&
        toDate &&
        isSameDay(r.from, fromDate) &&
        isSameDay(r.to, toDate)
      );
    });

    if (fromDate && toDate) {
      if (isSameDay(fromDate, toDate)) {
        return matchedPreset ? `${matchedPreset.label} (${format(fromDate, 'dd/MM/yyyy')})` : format(fromDate, 'dd/MM/yyyy');
      }
      const rangeStr = `${format(fromDate, 'dd/MM/yyyy')} - ${format(toDate, 'dd/MM/yyyy')}`;
      return matchedPreset ? `${rangeStr} (${matchedPreset.label})` : rangeStr;
    }

    if (fromDate) {
      return `Từ ${format(fromDate, 'dd/MM/yyyy')}`;
    }

    if (toDate) {
      return `Đến ${format(toDate, 'dd/MM/yyyy')}`;
    }

    return null;
  }, [fromDate, toDate, customPresets]);

  const hasValue = Boolean(fromDate || toDate);

  // Effective range computed for calendar display
  const effectiveRange = useMemo(() => {
    if (tempFromDate && tempToDate) {
      return {
        from: tempFromDate,
        to: tempToDate,
      };
    }
    if (tempFromDate) {
      return { from: tempFromDate, to: tempFromDate };
    }
    return { from: null, to: null };
  }, [tempFromDate, tempToDate]);

  // Render month calendar grid
  const renderMonthCalendar = (monthDate: Date, showPrevArrow: boolean, showNextArrow: boolean) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDayOfWeek = getDay(monthStart); // 0 = Sunday, 1 = Monday, ...

    return (
      <Box sx={{ width: { xs: '100%', sm: 270 }, p: 1 }}>
        {/* Month Header in Vietnamese */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, px: 0.5 }}>
          {showPrevArrow ? (
            <IconButton
              size="small"
              onClick={handlePrevMonth}
              sx={{
                p: 0.5,
                color: '#64748b',
                borderRadius: '6px',
                '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' },
              }}
            >
              <ChevronLeft size={18} />
            </IconButton>
          ) : (
            <Box sx={{ width: 28 }} />
          )}

          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
            {`Tháng ${format(monthDate, 'M, yyyy')}`}
          </Typography>

          {showNextArrow ? (
            <IconButton
              size="small"
              onClick={handleNextMonth}
              sx={{
                p: 0.5,
                color: '#64748b',
                borderRadius: '6px',
                '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' },
              }}
            >
              <ChevronRight size={18} />
            </IconButton>
          ) : (
            <Box sx={{ width: 28 }} />
          )}
        </Box>

        {/* Days of week header */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 1, textAlign: 'center' }}>
          {WEEK_DAYS.map((wd, idx) => (
            <Typography
              key={idx}
              sx={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: idx === 0 ? '#ef4444' : '#64748b',
                py: 0.25,
              }}
            >
              {wd}
            </Typography>
          ))}
        </Box>

        {/* Calendar Day Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '3px' }}>
          {/* Leading empty slots */}
          {Array.from({ length: startDayOfWeek }).map((_, idx) => (
            <Box key={`empty-${idx}`} sx={{ height: 34 }} />
          ))}

          {/* Days */}
          {daysInMonth.map((day) => {
            const dayNormalized = startOfDay(day);
            const isStart = tempFromDate && isSameDay(dayNormalized, tempFromDate);
            const isEnd = tempToDate && isSameDay(dayNormalized, tempToDate);

            const inRange =
              effectiveRange.from &&
              effectiveRange.to &&
              isAfter(dayNormalized, effectiveRange.from) &&
              isBefore(dayNormalized, effectiveRange.to);

            const isRangeStart = effectiveRange.from && isSameDay(dayNormalized, effectiveRange.from);
            const isRangeEnd = effectiveRange.to && isSameDay(dayNormalized, effectiveRange.to);
            const isRangeActive = effectiveRange.from && effectiveRange.to && !isSameDay(effectiveRange.from, effectiveRange.to);

            const isCurrentDay = isToday(dayNormalized);
            const dayOfWeek = getDay(dayNormalized);

            return (
              <Box
                key={day.toISOString()}
                onClick={() => handleDateClick(dayNormalized)}
                sx={{
                  height: 34,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  // Range background strip
                  ...(isRangeActive && (inRange || isRangeStart || isRangeEnd)
                    ? {
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 2,
                          bottom: 2,
                          left: isRangeStart ? '50%' : 0,
                          right: isRangeEnd ? '50%' : 0,
                          bgcolor: '#e0f2fe',
                          zIndex: 0,
                          borderRadius:
                            isRangeStart && isRangeEnd
                              ? '50%'
                              : isRangeStart
                              ? '17px 0 0 17px'
                              : isRangeEnd
                              ? '0 17px 17px 0'
                              : dayOfWeek === 0
                              ? '17px 0 0 17px'
                              : dayOfWeek === 6
                              ? '0 17px 17px 0'
                              : 0,
                        },
                      }
                    : {}),
                }}
              >
                {/* Day circle button */}
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 1,
                    fontSize: '0.8125rem',
                    fontWeight: isStart || isEnd || isRangeStart || isRangeEnd ? 700 : inRange ? 600 : 500,
                    color:
                      isStart || isEnd || isRangeStart || isRangeEnd
                        ? '#ffffff'
                        : inRange
                        ? '#0369a1'
                        : dayOfWeek === 0
                        ? '#ef4444'
                        : '#1e293b',
                    bgcolor:
                      isStart || isEnd || isRangeStart || isRangeEnd
                        ? '#0284c7'
                        : 'transparent',
                    border:
                      isCurrentDay && !isStart && !isEnd && !isRangeStart && !isRangeEnd
                        ? '1.5px solid #0284c7'
                        : 'none',
                  }}
                >
                  {format(day, 'd')}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        flexDirection: 'column',
        width: fullWidth ? '100%' : 'auto',
        minWidth: minWidth,
        maxWidth: maxWidth,
        ...sx,
      }}
    >
      {label && (
        <Typography
          variant="caption"
          sx={{
            color: '#64748b',
            fontWeight: 600,
            mb: 0.5,
            fontSize: '0.75rem',
          }}
        >
          {label}
        </Typography>
      )}

      {/* Trigger Button Input Box */}
      <Paper
        onClick={handleOpen}
        variant="outlined"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: size === 'small' ? '7px' : '9px',
          borderRadius: '8px',
          borderColor: open ? '#38bdf8' : hasValue ? '#93c5fd' : '#cbd5e1',
          bgcolor: open ? '#f0f9ff' : hasValue ? '#f8fafc' : '#ffffff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'all 0.2s ease-in-out',
          boxShadow: open
            ? '0 0 0 3px rgba(56, 189, 248, 0.15)'
            : '0 1px 2px rgba(0,0,0,0.03)',
          '&:hover': {
            borderColor: disabled ? '#cbd5e1' : '#0284c7',
            bgcolor: disabled ? '#ffffff' : '#f8fafc',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, overflow: 'hidden' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: hasValue ? '#0284c7' : '#64748b',
              flexShrink: 0,
            }}
          >
            <CalendarIcon size={size === 'small' ? 16 : 18} />
          </Box>

          <Typography
            noWrap
            sx={{
              fontSize: size === 'small' ? '0.8125rem' : '0.875rem',
              fontWeight: hasValue ? 600 : 400,
              color: hasValue ? '#0f172a' : '#64748b',
            }}
          >
            {displayLabel || placeholder}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, ml: 1 }}>
          {hasValue && !disabled && (
            <IconButton
              size="small"
              onClick={handleClear}
              sx={{
                p: 0.25,
                color: '#94a3b8',
                '&:hover': { color: '#ef4444', bgcolor: '#fee2e2' },
              }}
              title="Xóa bộ lọc ngày"
            >
              <X size={14} />
            </IconButton>
          )}
          <ChevronDown
            size={16}
            style={{
              color: '#94a3b8',
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          />
        </Box>
      </Paper>

      {/* Modern Popover with Dual-Month Calendar View */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: '12px',
            boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            maxWidth: { xs: '95vw', sm: 760 },
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Preset Sidebar */}
          <Box
            sx={{
              width: { xs: '100%', md: 160 },
              bgcolor: '#f8fafc',
              borderRight: { xs: 'none', md: '1px solid #e2e8f0' },
              borderBottom: { xs: '1px solid #e2e8f0', md: 'none' },
              p: 1.5,
              display: 'flex',
              flexDirection: { xs: 'row', md: 'column' },
              gap: 0.5,
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              overflowX: 'auto',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                px: 1,
                py: 0.5,
                display: { xs: 'none', md: 'block' },
                fontSize: '0.7rem',
              }}
            >
              Mẫu thời gian
            </Typography>

            {customPresets.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <Button
                  key={preset.id}
                  size="small"
                  onClick={() => handleSelectPreset(preset)}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: isSelected ? 700 : 500,
                    px: 1.25,
                    py: 0.6,
                    borderRadius: '6px',
                    bgcolor: isSelected ? '#0284c7 !important' : 'transparent',
                    color: isSelected ? '#ffffff !important' : '#475569',
                    '&:hover': {
                      bgcolor: isSelected ? '#0369a1 !important' : '#e2e8f0',
                    },
                  }}
                >
                  {preset.label}
                </Button>
              );
            })}

            <Button
              size="small"
              onClick={() => setActivePresetId('custom')}
              sx={{
                justifyContent: 'flex-start',
                textTransform: 'none',
                fontSize: '0.8125rem',
                fontWeight: activePresetId === 'custom' ? 700 : 500,
                px: 1.25,
                py: 0.6,
                borderRadius: '6px',
                bgcolor: activePresetId === 'custom' ? '#0284c7 !important' : 'transparent',
                color: activePresetId === 'custom' ? '#ffffff !important' : '#475569',
                '&:hover': {
                  bgcolor: activePresetId === 'custom' ? '#0369a1 !important' : '#e2e8f0',
                },
              }}
            >
              Tùy chọn
            </Button>
          </Box>

          {/* Main Content Area */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
            {/* Header: Title */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
                pb: 1,
                mb: 1,
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                  Chọn khoảng thời gian bắt đầu & kết thúc
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Nhấp ngày bắt đầu, sau đó nhấp ngày kết thúc trên lịch
                </Typography>
              </Box>
            </Box>

            {/* Dual Month Calendar Display */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                justifyContent: 'center',
                alignItems: { xs: 'center', sm: 'flex-start' },
              }}
            >
              {/* Left Month Calendar */}
              {renderMonthCalendar(baseMonth, true, false)}

              {/* Center Divider for Desktop */}
              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: 'none', sm: 'block' }, borderColor: '#f1f5f9' }}
              />

              {/* Right Month Calendar */}
              {renderMonthCalendar(nextMonth, false, true)}
            </Box>

            {/* Bottom Actions Bar */}
            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="text"
                  size="small"
                  color="inherit"
                  startIcon={<RotateCcw size={13} />}
                  onClick={handleReset}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    color: '#64748b',
                    height: 34,
                    minHeight: 34,
                    fontSize: '0.75rem',
                    px: 1,
                  }}
                >
                  Đặt lại
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, bgcolor: '#f1f5f9', px: 1.25, py: 0.35, borderRadius: '6px' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>
                    Đang chọn:
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 700, fontSize: '0.75rem' }}>
                    {tempFromDate || tempToDate
                      ? `${tempFromDate ? format(tempFromDate, 'dd/MM/yyyy') : '...'} - ${
                          tempToDate ? format(tempToDate, 'dd/MM/yyyy') : '...'
                        }`
                      : 'Tất cả thời gian'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Check size={13} />}
                  onClick={handleApply}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    height: 34,
                    minHeight: 34,
                    fontSize: '0.75rem',
                    px: 1.5,
                    py: 0,
                    bgcolor: '#0284c7',
                    '&:hover': { bgcolor: '#0369a1' },
                  }}
                >
                  Áp dụng
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};
