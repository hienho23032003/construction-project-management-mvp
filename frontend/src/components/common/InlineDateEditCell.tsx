import React, { useState, useMemo, memo } from 'react';
import {
  Box,
  Typography,
  Popover,
  Button,
  IconButton,
  Divider,
  Chip,
  useTheme,
  TextField,
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Calendar as CalendarIcon,
  Check,
  X,
  Edit2,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { format, isValid, addDays, differenceInDays } from 'date-fns';
import { formatDate } from '../../utils/dateUtils';

export interface InlineDateEditCellProps {
  mode?: 'range' | 'single';
  startDate?: string | null;
  plannedEndDate?: string | null;
  value?: string | null; // Dùng cho single mode
  disabled?: boolean;
  onDatesChange?: (startDate: string, plannedEndDate: string) => void | Promise<void>;
  onDateChange?: (newDate: string) => void | Promise<void>;
  isOverdue?: boolean;
  overdueDays?: number;
  isCompletedLate?: boolean;
  completedLateDays?: number;
  fontSize?: string | number;
  fontWeight?: string | number;
}

export const InlineDateEditCell: React.FC<InlineDateEditCellProps> = memo(({
  mode = 'range',
  startDate,
  plannedEndDate,
  value,
  disabled = false,
  onDatesChange,
  onDateChange,
  isOverdue = false,
  overdueDays = 0,
  isCompletedLate = false,
  completedLateDays = 0,
  fontSize = '0.75rem',
  fontWeight = 600,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Anchor elements for Popovers
  const [rangeAnchorEl, setRangeAnchorEl] = useState<HTMLElement | null>(null);
  const [startAnchorEl, setStartAnchorEl] = useState<HTMLElement | null>(null);
  const [endAnchorEl, setEndAnchorEl] = useState<HTMLElement | null>(null);
  const [singleAnchorEl, setSingleAnchorEl] = useState<HTMLElement | null>(null);

  // Temporary edit states
  const [tempStart, setTempStart] = useState<Date | null>(null);
  const [tempEnd, setTempEnd] = useState<Date | null>(null);
  const [tempSingle, setTempSingle] = useState<Date | null>(null);
  const [activeRangeTab, setActiveRangeTab] = useState<'start' | 'end'>('start');
  const [saving, setSaving] = useState(false);

  // Open Handlers
  const handleOpenRange = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    e.stopPropagation();
    const s = startDate ? new Date(startDate) : new Date();
    const eDate = plannedEndDate ? new Date(plannedEndDate) : addDays(new Date(), 7);
    setTempStart(isValid(s) ? s : new Date());
    setTempEnd(isValid(eDate) ? eDate : addDays(new Date(), 7));
    setActiveRangeTab('start');
    setRangeAnchorEl(e.currentTarget);
  };

  const handleOpenStartOnly = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    e.stopPropagation();
    const s = startDate ? new Date(startDate) : new Date();
    setTempStart(isValid(s) ? s : new Date());
    setStartAnchorEl(e.currentTarget);
  };

  const handleOpenEndOnly = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    e.stopPropagation();
    const eDate = plannedEndDate ? new Date(plannedEndDate) : (value ? new Date(value) : new Date());
    setTempEnd(isValid(eDate) ? eDate : new Date());
    setEndAnchorEl(e.currentTarget);
  };

  const handleOpenSingle = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    e.stopPropagation();
    const targetVal = value || plannedEndDate || startDate;
    const d = targetVal ? new Date(targetVal) : new Date();
    setTempSingle(isValid(d) ? d : new Date());
    setSingleAnchorEl(e.currentTarget);
  };

  // Close Handlers
  const handleCloseAll = () => {
    setRangeAnchorEl(null);
    setStartAnchorEl(null);
    setEndAnchorEl(null);
    setSingleAnchorEl(null);
  };

  // Save Handlers
  const handleSaveRange = async (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    if (!tempStart || !tempEnd || !onDatesChange) {
      handleCloseAll();
      return;
    }
    const finalStart = tempStart <= tempEnd ? tempStart : tempEnd;
    const finalEnd = tempStart <= tempEnd ? tempEnd : tempStart;
    const startStr = format(finalStart, 'yyyy-MM-dd');
    const endStr = format(finalEnd, 'yyyy-MM-dd');

    setSaving(true);
    try {
      await onDatesChange(startStr, endStr);
    } finally {
      setSaving(false);
      handleCloseAll();
    }
  };

  const handleSaveStartOnly = async (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    if (!tempStart) {
      handleCloseAll();
      return;
    }
    const currentEnd = plannedEndDate ? new Date(plannedEndDate) : addDays(tempStart, 7);
    const finalEnd = tempStart > currentEnd ? tempStart : currentEnd;
    const startStr = format(tempStart, 'yyyy-MM-dd');
    const endStr = format(finalEnd, 'yyyy-MM-dd');

    setSaving(true);
    try {
      if (onDatesChange) {
        await onDatesChange(startStr, endStr);
      } else if (onDateChange) {
        await onDateChange(startStr);
      }
    } finally {
      setSaving(false);
      handleCloseAll();
    }
  };

  const handleSaveEndOnly = async (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    if (!tempEnd) {
      handleCloseAll();
      return;
    }
    const currentStart = startDate ? new Date(startDate) : tempEnd;
    const finalStart = tempEnd < currentStart ? tempEnd : currentStart;
    const startStr = format(finalStart, 'yyyy-MM-dd');
    const endStr = format(tempEnd, 'yyyy-MM-dd');

    setSaving(true);
    try {
      if (onDatesChange) {
        await onDatesChange(startStr, endStr);
      } else if (onDateChange) {
        await onDateChange(endStr);
      }
    } finally {
      setSaving(false);
      handleCloseAll();
    }
  };

  const handleSaveSingle = async (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    if (!tempSingle) {
      handleCloseAll();
      return;
    }
    const dateStr = format(tempSingle, 'yyyy-MM-dd');
    setSaving(true);
    try {
      if (onDateChange) {
        await onDateChange(dateStr);
      } else if (onDatesChange) {
        const curStart = startDate ? format(new Date(startDate), 'yyyy-MM-dd') : dateStr;
        await onDatesChange(curStart, dateStr);
      }
    } finally {
      setSaving(false);
      handleCloseAll();
    }
  };

  // Quick Preset Helper for Range
  const handleApplyPresetDays = (days: number) => {
    const base = tempStart || new Date();
    setTempEnd(addDays(base, days));
  };

  // Calculate duration in days
  const rangeDuration = useMemo(() => {
    if (tempStart && tempEnd) {
      return Math.max(1, differenceInDays(tempEnd, tempStart) + 1);
    }
    return 0;
  }, [tempStart, tempEnd]);

  // ==========================================
  // SINGLE DATE MODE
  // ==========================================
  if (mode === 'single') {
    const displayDate = value || plannedEndDate || startDate;
    const formatted = displayDate ? formatDate(displayDate, 'dd/MM/yyyy') : 'Chưa đặt hạn';

    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', minWidth: 0 }}>
        <Box
          onClick={handleOpenSingle}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: disabled ? 'default' : 'pointer',
            borderRadius: '4px',
            p: '2px 4px',
            ml: '-4px',
            transition: 'background-color 0.15s ease',
            '&:hover': {
              bgcolor: disabled ? 'transparent' : 'action.hover',
              '& .date-edit-icon': { opacity: 1 },
            },
          }}
          title={disabled ? formatted : `${formatted} (Nhấp để sửa hạn ngày)`}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight,
              fontSize,
              color: isOverdue || isCompletedLate ? (isDark ? '#f87171' : '#ef4444') : 'text.primary',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            {formatted}
            {isOverdue && ` (Trễ ${overdueDays} ngày)`}
            {isCompletedLate && ` (Trễ ${completedLateDays} ngày)`}
          </Typography>

          {!disabled && (
            <Edit2
              size={11}
              className="date-edit-icon"
              style={{
                opacity: 0,
                color: '#64748b',
                flexShrink: 0,
                transition: 'opacity 0.15s ease',
              }}
            />
          )}
        </Box>

        {/* Single Date Picker Popover */}
        <Popover
          open={Boolean(singleAnchorEl)}
          anchorEl={singleAnchorEl}
          onClose={handleCloseAll}
          onClick={(e) => e.stopPropagation()}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{
            paper: {
              sx: {
                borderRadius: '10px',
                boxShadow: isDark
                  ? '0 12px 36px rgba(0,0,0,0.55)'
                  : '0 10px 30px rgba(0,0,0,0.18)',
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                width: 320,
              },
            },
          }}
        >
          <Box sx={{ p: 1.5, pb: 1, bgcolor: isDark ? 'background.paper' : '#f8fafc', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <CalendarIcon size={16} color="#0284c7" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  Chọn Hạn Ngày
                </Typography>
              </Box>
              <IconButton size="small" onClick={handleCloseAll} sx={{ p: 0.25 }}>
                <X size={16} />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
            <DateCalendar
              value={tempSingle}
              onChange={(newVal) => setTempSingle(newVal)}
              sx={{
                width: '100%',
                maxHeight: 290,
                '& .MuiPickersCalendarHeader-root': {
                  pl: 1.5,
                  pr: 1,
                },
                '& .MuiDayCalendar-weekDayLabel': {
                  width: 34,
                  height: 34,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                },
                '& .MuiPickersDay-root': {
                  width: 34,
                  height: 34,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                },
              }}
            />
          </Box>

          {/* Quick options */}
          <Box sx={{ px: 1.5, pb: 1, display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            <Chip
              label="Hôm nay"
              size="small"
              onClick={() => setTempSingle(new Date())}
              sx={{ cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}
            />
            <Chip
              label="+3 ngày"
              size="small"
              onClick={() => setTempSingle(addDays(new Date(), 3))}
              sx={{ cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}
            />
            <Chip
              label="+7 ngày"
              size="small"
              onClick={() => setTempSingle(addDays(new Date(), 7))}
              sx={{ cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}
            />
            <Chip
              label="+14 ngày"
              size="small"
              onClick={() => setTempSingle(addDays(new Date(), 14))}
              sx={{ cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}
            />
          </Box>

          <Divider />

          <Box sx={{ p: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: isDark ? 'background.paper' : '#f8fafc' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              {tempSingle ? format(tempSingle, 'dd/MM/yyyy') : 'Chưa chọn'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" onClick={handleCloseAll} sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}>
                Hủy
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<Check size={14} />}
                onClick={handleSaveSingle}
                disabled={saving || !tempSingle}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  bgcolor: '#0284c7',
                  '&:hover': { bgcolor: '#0369a1' },
                }}
              >
                Lưu
              </Button>
            </Box>
          </Box>
        </Popover>
      </Box>
    );
  }

  // ==========================================
  // RANGE (TIMELINE) MODE
  // ==========================================
  const startFormatted = startDate ? formatDate(startDate, 'dd/MM') : '...';
  const endFormatted = plannedEndDate ? formatDate(plannedEndDate, 'dd/MM/yyyy') : '...';

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap' }}>
      {/* Clickable Start Date */}
      <Box
        component="span"
        onClick={handleOpenStartOnly}
        sx={{
          cursor: disabled ? 'default' : 'pointer',
          borderRadius: '4px',
          px: '3px',
          py: '1px',
          color: isDark ? '#93c5fd' : '#0369a1',
          fontWeight: 700,
          fontSize,
          transition: 'background-color 0.15s ease',
          '&:hover': {
            bgcolor: disabled ? 'transparent' : 'action.hover',
            textDecoration: disabled ? 'none' : 'underline',
          },
        }}
        title={disabled ? startFormatted : `${startFormatted} (Nhấp để sửa ngày bắt đầu)`}
      >
        {startFormatted}
      </Box>

      {/* Separator / Range Trigger */}
      <Box
        component="span"
        onClick={handleOpenRange}
        sx={{
          cursor: disabled ? 'default' : 'pointer',
          px: '2px',
          color: 'text.secondary',
          fontWeight: 600,
          fontSize,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.25,
          borderRadius: '4px',
          '&:hover': {
            bgcolor: disabled ? 'transparent' : 'action.hover',
            color: '#0284c7',
          },
        }}
        title={disabled ? undefined : 'Nhấp để chỉnh sửa dải thời gian'}
      >
        -
      </Box>

      {/* Clickable End Date */}
      <Box
        component="span"
        onClick={handleOpenEndOnly}
        sx={{
          cursor: disabled ? 'default' : 'pointer',
          borderRadius: '4px',
          px: '3px',
          py: '1px',
          color: isOverdue || isCompletedLate ? (isDark ? '#f87171' : '#ef4444') : 'text.primary',
          fontWeight: 700,
          fontSize,
          transition: 'background-color 0.15s ease',
          '&:hover': {
            bgcolor: disabled ? 'transparent' : 'action.hover',
            textDecoration: disabled ? 'none' : 'underline',
          },
        }}
        title={disabled ? endFormatted : `${endFormatted} (Nhấp để sửa hạn hoàn thành)`}
      >
        {endFormatted}
      </Box>

      {/* Edit Range Quick Button */}
      {!disabled && (
        <IconButton
          size="small"
          onClick={handleOpenRange}
          sx={{
            p: '2px',
            color: '#94a3b8',
            '&:hover': { color: '#0284c7', bgcolor: 'action.hover' },
          }}
          title="Chỉnh sửa toàn bộ khoảng thời gian (DateRange)"
        >
          <CalendarIcon size={12} />
        </IconButton>
      )}

      {/* 1. START DATE ONLY POPOVER */}
      <Popover
        open={Boolean(startAnchorEl)}
        anchorEl={startAnchorEl}
        onClose={handleCloseAll}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '10px',
              boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.55)' : '0 10px 30px rgba(0,0,0,0.18)',
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              width: 320,
            },
          },
        }}
      >
        <Box sx={{ p: 1.5, pb: 1, bgcolor: isDark ? 'background.paper' : '#f8fafc', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CalendarIcon size={16} color="#0284c7" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                Đổi Ngày Bắt Đầu
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleCloseAll} sx={{ p: 0.25 }}>
              <X size={16} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
          <DateCalendar
            value={tempStart}
            onChange={(newVal) => setTempStart(newVal)}
            sx={{
              width: '100%',
              maxHeight: 290,
              '& .MuiPickersCalendarHeader-root': { pl: 1.5, pr: 1 },
              '& .MuiDayCalendar-weekDayLabel': { width: 34, height: 34, fontSize: '0.75rem', fontWeight: 700 },
              '& .MuiPickersDay-root': { width: 34, height: 34, fontSize: '0.8rem', fontWeight: 600 },
            }}
          />
        </Box>

        <Divider />

        <Box sx={{ p: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: isDark ? 'background.paper' : '#f8fafc' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#0284c7' }}>
            {tempStart ? format(tempStart, 'dd/MM/yyyy') : 'Chưa chọn'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" onClick={handleCloseAll} sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}>
              Hủy
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Check size={14} />}
              onClick={handleSaveStartOnly}
              disabled={saving || !tempStart}
              sx={{
                textTransform: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                bgcolor: '#0284c7',
                '&:hover': { bgcolor: '#0369a1' },
              }}
            >
              Lưu
            </Button>
          </Box>
        </Box>
      </Popover>

      {/* 2. END DATE ONLY POPOVER */}
      <Popover
        open={Boolean(endAnchorEl)}
        anchorEl={endAnchorEl}
        onClose={handleCloseAll}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '10px',
              boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.55)' : '0 10px 30px rgba(0,0,0,0.18)',
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              width: 320,
            },
          },
        }}
      >
        <Box sx={{ p: 1.5, pb: 1, bgcolor: isDark ? 'background.paper' : '#f8fafc', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CalendarIcon size={16} color="#0284c7" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                Đổi Hạn Hoàn Thành
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleCloseAll} sx={{ p: 0.25 }}>
              <X size={16} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
          <DateCalendar
            value={tempEnd}
            onChange={(newVal) => setTempEnd(newVal)}
            sx={{
              width: '100%',
              maxHeight: 290,
              '& .MuiPickersCalendarHeader-root': { pl: 1.5, pr: 1 },
              '& .MuiDayCalendar-weekDayLabel': { width: 34, height: 34, fontSize: '0.75rem', fontWeight: 700 },
              '& .MuiPickersDay-root': { width: 34, height: 34, fontSize: '0.8rem', fontWeight: 600 },
            }}
          />
        </Box>

        <Divider />

        <Box sx={{ p: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: isDark ? 'background.paper' : '#f8fafc' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#0284c7' }}>
            {tempEnd ? format(tempEnd, 'dd/MM/yyyy') : 'Chưa chọn'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" onClick={handleCloseAll} sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}>
              Hủy
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Check size={14} />}
              onClick={handleSaveEndOnly}
              disabled={saving || !tempEnd}
              sx={{
                textTransform: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                bgcolor: '#0284c7',
                '&:hover': { bgcolor: '#0369a1' },
              }}
            >
              Lưu
            </Button>
          </Box>
        </Box>
      </Popover>

      {/* 3. FULL DATE RANGE PICKER POPOVER */}
      <Popover
        open={Boolean(rangeAnchorEl)}
        anchorEl={rangeAnchorEl}
        onClose={handleCloseAll}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '12px',
              boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.6)' : '0 12px 35px rgba(0,0,0,0.18)',
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              width: { xs: 340, sm: 380 },
            },
          },
        }}
      >
        <Box sx={{ p: 1.75, bgcolor: isDark ? 'background.paper' : '#f8fafc', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Clock size={18} color="#0284c7" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                Thời Gian Thực Hiện
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleCloseAll} sx={{ p: 0.25 }}>
              <X size={16} />
            </IconButton>
          </Box>

          {/* Start & End selector buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Box
              onClick={() => setActiveRangeTab('start')}
              sx={{
                flex: 1,
                p: '8px 12px',
                borderRadius: '8px',
                border: '1.5px solid',
                borderColor: activeRangeTab === 'start' ? '#0284c7' : 'divider',
                bgcolor: activeRangeTab === 'start' ? (isDark ? 'rgba(2, 132, 199, 0.15)' : '#e0f2fe') : 'background.paper',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.68rem', fontWeight: 600 }}>
                Ngày bắt đầu
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: activeRangeTab === 'start' ? '#0284c7' : 'text.primary' }}>
                {tempStart ? format(tempStart, 'dd/MM/yyyy') : 'Chọn ngày'}
              </Typography>
            </Box>

            <ArrowRight size={16} color="#94a3b8" />

            <Box
              onClick={() => setActiveRangeTab('end')}
              sx={{
                flex: 1,
                p: '8px 12px',
                borderRadius: '8px',
                border: '1.5px solid',
                borderColor: activeRangeTab === 'end' ? '#0284c7' : 'divider',
                bgcolor: activeRangeTab === 'end' ? (isDark ? 'rgba(2, 132, 199, 0.15)' : '#e0f2fe') : 'background.paper',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.68rem', fontWeight: 600 }}>
                Hạn hoàn thành
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: activeRangeTab === 'end' ? '#0284c7' : 'text.primary' }}>
                {tempEnd ? format(tempEnd, 'dd/MM/yyyy') : 'Chọn ngày'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Date Calendar Body */}
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
          <DateCalendar
            value={activeRangeTab === 'start' ? tempStart : tempEnd}
            onChange={(newVal) => {
              if (activeRangeTab === 'start') {
                setTempStart(newVal);
                if (newVal && tempEnd && newVal > tempEnd) {
                  setTempEnd(addDays(newVal, 1));
                }
              } else {
                setTempEnd(newVal);
                if (newVal && tempStart && newVal < tempStart) {
                  setTempStart(newVal);
                }
              }
            }}
            sx={{
              width: '100%',
              maxHeight: 285,
              '& .MuiPickersCalendarHeader-root': { pl: 1.5, pr: 1 },
              '& .MuiDayCalendar-weekDayLabel': { width: 36, height: 36, fontSize: '0.75rem', fontWeight: 700 },
              '& .MuiPickersDay-root': { width: 36, height: 36, fontSize: '0.8rem', fontWeight: 600 },
            }}
          />
        </Box>

        {/* Quick Range Presets */}
        <Box sx={{ px: 1.5, pb: 1, display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem' }}>
            Thời hạn:
          </Typography>
          <Chip label="3 ngày" size="small" onClick={() => handleApplyPresetDays(2)} sx={{ cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }} />
          <Chip label="7 ngày" size="small" onClick={() => handleApplyPresetDays(6)} sx={{ cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }} />
          <Chip label="14 ngày" size="small" onClick={() => handleApplyPresetDays(13)} sx={{ cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }} />
          <Chip label="30 ngày" size="small" onClick={() => handleApplyPresetDays(29)} sx={{ cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }} />
        </Box>

        <Divider />

        {/* Footer */}
        <Box sx={{ p: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: isDark ? 'background.paper' : '#f8fafc' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#0284c7' }}>
              {rangeDuration > 0 ? `Tổng ${rangeDuration} ngày` : ''}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" onClick={handleCloseAll} sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}>
              Hủy
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Check size={14} />}
              onClick={handleSaveRange}
              disabled={saving || !tempStart || !tempEnd}
              sx={{
                textTransform: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                bgcolor: '#0284c7',
                '&:hover': { bgcolor: '#0369a1' },
              }}
            >
              Lưu Thời Gian
            </Button>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
});

InlineDateEditCell.displayName = 'InlineDateEditCell';
