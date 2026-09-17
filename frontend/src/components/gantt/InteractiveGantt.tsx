import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  format,
  addDays,
  differenceInDays,
  eachDayOfInterval,
  isToday,
  parseISO,
} from 'date-fns';
import { GanttTask, GanttLink } from '../../types';
import { reportApi } from '../../services/api/endpoints';
import { useToast } from '../../contexts/ToastContext';
import { getVietnameseStatus } from '../common/StatusChip';
import { GanttToolbar, ViewMode } from './GanttToolbar';
import { GanttLeftTree, GanttTreeItem } from './GanttLeftTree';
import { GanttTimelineHeader } from './GanttTimelineHeader';
import { GanttTaskBarItem } from './GanttTaskBarItem';
import { GanttTooltip } from './GanttTooltip';

export type { GanttTreeItem, ViewMode };

const getDayOfWeekText = (date: Date, mode: ViewMode): string => {
  const day = date.getDay();
  if (mode === 'Week') {
    switch (day) {
      case 0: return 'CN';
      case 1: return 'T2';
      case 2: return 'T3';
      case 3: return 'T4';
      case 4: return 'T5';
      case 5: return 'T6';
      case 6: return 'T7';
      default: return '';
    }
  }
  switch (day) {
    case 0: return 'CN';
    case 1: return 'Thứ 2';
    case 2: return 'Thứ 3';
    case 3: return 'Thứ 4';
    case 4: return 'Thứ 5';
    case 5: return 'Thứ 6';
    case 6: return 'Thứ 7';
    default: return '';
  }
};

const getTaskColor = (task: GanttTask, isDark: boolean = false) => {
  if (task.isOverdue) return { bar: '#f87171', fill: '#dc2626', bg: isDark ? 'rgba(239, 68, 68, 0.28)' : '#fee2e2' };
  if (task.status === 'Completed') return { bar: isDark ? '#34d399' : '#10b981', fill: '#059669', bg: isDark ? 'rgba(16, 185, 129, 0.28)' : '#d1fae5' };
  if (task.status === 'InProgress') return { bar: isDark ? '#38bdf8' : '#0284c7', fill: '#0369a1', bg: isDark ? 'rgba(2, 132, 199, 0.28)' : '#e0f2fe' };
  if (task.status === 'OnHold') return { bar: isDark ? '#fbbf24' : '#f59e0b', fill: '#d97706', bg: isDark ? 'rgba(245, 158, 11, 0.28)' : '#fef3c7' };
  return { bar: '#94a3b8', fill: '#64748b', bg: isDark ? 'rgba(100, 116, 139, 0.28)' : '#f1f5f9' };
};

interface InteractiveGanttProps {
  tasks: GanttTask[];
  links?: GanttLink[];
  onTaskUpdated?: () => void;
  onTaskClick?: (task: GanttTask) => void;
  canEdit?: boolean;
  filterBar?: React.ReactNode;
}

export const InteractiveGantt: React.FC<InteractiveGanttProps> = React.memo(({
  tasks,
  onTaskClick,
  filterBar,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('Day');
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  // Resizable left panel state
  const [leftWidth, setLeftWidth] = useState<number>(320);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState<boolean>(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState<boolean>(false);
  const prevLeftWidth = useRef<number>(320);

  // Right timeline pan (grab-to-scroll) ref state
  const isPanningRef = useRef<boolean>(false);
  const inertiaRafRef = useRef<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const isSyncingLeftScroll = useRef(false);
  const isSyncingRightScroll = useRef(false);
  const leftScrollRaf = useRef<number | null>(null);
  const rightScrollRaf = useRef<number | null>(null);
  const isInitialScrollDone = useRef<boolean>(false);
  const prevMinDateRef = useRef<Date | null>(null);
  const scrollPosRef = useRef<{ top: number; left: number }>({ top: 0, left: 0 });

  // Floating Tooltip DOM Refs
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipTitleRef = useRef<HTMLDivElement>(null);
  const tooltipDatesRef = useRef<HTMLSpanElement>(null);
  const tooltipProgressRef = useRef<HTMLElement>(null);
  const tooltipStatusRef = useRef<HTMLDivElement>(null);
  const tooltipAssigneeRef = useRef<HTMLDivElement>(null);
  const tooltipAssigneeTextRef = useRef<HTMLElement>(null);

  const { showSuccess, showError } = useToast();
  const [exporting, setExporting] = useState(false);

  const handleExportGantt = React.useCallback(async () => {
    try {
      setExporting(true);
      await reportApi.downloadReportCsv('tasks', {}, `Gantt_TienDoThiCong_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
      showSuccess('Xuất dữ liệu tiến độ Gantt thành công!');
    } catch (err) {
      console.error('Export Gantt error:', err);
      showError('Có lỗi xảy ra khi xuất dữ liệu Gantt.');
    } finally {
      setExporting(false);
    }
  }, [showSuccess, showError]);

  const isSyncingScroll = useRef(false);

  const handleLeftScroll = () => {
    if (isSyncingScroll.current) return;
    if (leftPanelRef.current && containerRef.current) {
      isSyncingScroll.current = true;
      const top = leftPanelRef.current.scrollTop;
      containerRef.current.scrollTop = top;
      scrollPosRef.current.top = top;
      requestAnimationFrame(() => {
        isSyncingScroll.current = false;
      });
    }
  };

  const handleRightScroll = () => {
    if (isSyncingScroll.current) return;
    if (leftPanelRef.current && containerRef.current) {
      isSyncingScroll.current = true;
      const top = containerRef.current.scrollTop;
      leftPanelRef.current.scrollTop = top;
      scrollPosRef.current.top = top;
      scrollPosRef.current.left = containerRef.current.scrollLeft;
      requestAnimationFrame(() => {
        isSyncingScroll.current = false;
      });
    }
  };

  // Determine timeline boundary
  const { minDate, maxDate } = useMemo(() => {
    if (!tasks.length) {
      const now = new Date();
      return { minDate: addDays(now, -10), maxDate: addDays(now, 30) };
    }

    let min = new Date(tasks[0].start);
    let max = new Date(tasks[0].end);

    tasks.forEach((t) => {
      const s = new Date(t.start);
      const e = new Date(t.end);
      if (s < min) min = s;
      if (e > max) max = e;
    });

    const paddedMin = addDays(min, -7);
    const paddedMax = addDays(max, 14);

    return { minDate: paddedMin, maxDate: paddedMax };
  }, [tasks]);

  const columnWidth = useMemo(() => {
    switch (viewMode) {
      case 'Day':
        return 52;
      case 'Week':
        return 38;
      case 'Month':
        return 20;
      default:
        return 52;
    }
  }, [viewMode]);

  const timelineDays = useMemo(() => {
    return eachDayOfInterval({ start: minDate, end: maxDate });
  }, [minDate, maxDate]);

  const monthGroups = useMemo(() => {
    if (!timelineDays.length) return [];
    const groups: { monthStr: string; yearMonth: string; daysCount: number; startDate: Date }[] = [];

    let currentKey = '';
    let currentCount = 0;
    let currentStart = timelineDays[0];

    timelineDays.forEach((d) => {
      const ym = format(d, 'yyyy-MM');
      if (ym !== currentKey) {
        if (currentKey) {
          groups.push({
            monthStr: format(currentStart, 'MM/yyyy'),
            yearMonth: currentKey,
            daysCount: currentCount,
            startDate: currentStart,
          });
        }
        currentKey = ym;
        currentCount = 1;
        currentStart = d;
      } else {
        currentCount++;
      }
    });

    if (currentCount > 0) {
      groups.push({
        monthStr: format(currentStart, 'MM/yyyy'),
        yearMonth: currentKey,
        daysCount: currentCount,
        startDate: currentStart,
      });
    }

    return groups;
  }, [timelineDays]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const userActionsRef = useRef<Map<string, 'collapsed' | 'expanded'>>(new Map());

  const toggleCollapse = React.useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        userActionsRef.current.set(id, 'expanded');
      } else {
        next.add(id);
        userActionsRef.current.set(id, 'collapsed');
      }
      return next;
    });
  }, []);

  const collapseAll = React.useCallback(() => {
    const parentIds = new Set<string>();
    tasks.forEach((t) => {
      if (t.type === 'project' || t.type === 'phase' || tasks.some((c) => c.parentId === t.id)) {
        parentIds.add(t.id);
        userActionsRef.current.set(t.id, 'collapsed');
      }
    });
    setCollapsedIds(parentIds);
  }, [tasks]);

  const expandAll = React.useCallback(() => {
    tasks.forEach((t) => {
      userActionsRef.current.set(t.id, 'expanded');
    });
    setCollapsedIds(new Set());
  }, [tasks]);

  useEffect(() => {
    if (tasks.length > 0) {
      setCollapsedIds((prev) => {
        const next = new Set<string>();
        tasks.forEach((t) => {
          const hasChildren =
            t.type === 'project' ||
            t.type === 'phase' ||
            tasks.some((c) => c.parentId === t.id);

          if (hasChildren) {
            const userAction = userActionsRef.current.get(t.id);
            if (userAction === 'expanded') {
              // Keep expanded
            } else if (userAction === 'collapsed') {
              next.add(t.id);
            } else if (prev.has(t.id)) {
              next.add(t.id);
            }
          }
        });
        return next;
      });
    }
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    if (!tasks.length) return [];

    const childrenMap = new Map<string, GanttTask[]>();
    const allIds = new Set<string>(tasks.map((t) => t.id));
    const rootTasks: GanttTask[] = [];

    tasks.forEach((t) => {
      if (!t.parentId || !allIds.has(t.parentId)) {
        rootTasks.push(t);
      } else {
        const list = childrenMap.get(t.parentId) || [];
        list.push(t);
        childrenMap.set(t.parentId, list);
      }
    });

    const result: GanttTreeItem[] = [];

    const traverse = (node: GanttTask, depth: number) => {
      const children = childrenMap.get(node.id) || [];
      const hasChildren = children.length > 0;
      result.push({
        ...node,
        depth,
        hasChildren,
      });

      if (hasChildren && !collapsedIds.has(node.id)) {
        children.forEach((child) => {
          traverse(child, depth + 1);
        });
      }
    };

    rootTasks.forEach((root) => {
      traverse(root, 0);
    });

    return result;
  }, [tasks, collapsedIds]);

  const scrollToToday = React.useCallback(() => {
    const todayIdx = timelineDays.findIndex((d) => isToday(d));
    if (todayIdx >= 0 && containerRef.current) {
      const targetLeft = Math.max(0, todayIdx * columnWidth - 250);
      containerRef.current.scrollLeft = targetLeft;
      scrollPosRef.current.left = targetLeft;
    }
  }, [timelineDays, columnWidth]);

  useEffect(() => {
    if (!isInitialScrollDone.current && tasks.length > 0 && timelineDays.length > 0) {
      scrollToToday();
      isInitialScrollDone.current = true;
      prevMinDateRef.current = minDate;
    }
  }, [tasks.length, timelineDays, scrollToToday, minDate]);

  useEffect(() => {
    if (isInitialScrollDone.current && containerRef.current) {
      if (prevMinDateRef.current && minDate) {
        const diff = differenceInDays(minDate, prevMinDateRef.current);
        if (diff !== 0) {
          scrollPosRef.current.left = Math.max(0, scrollPosRef.current.left - diff * columnWidth);
        }
      }
      prevMinDateRef.current = minDate;

      containerRef.current.scrollLeft = scrollPosRef.current.left;
      containerRef.current.scrollTop = 0;
      scrollPosRef.current.top = 0;
      if (leftPanelRef.current) {
        leftPanelRef.current.scrollTop = 0;
      }
    }
  }, [tasks, minDate, columnWidth]);

  // Tooltip functions
  const showTooltip = React.useCallback((task: GanttTask, clientX: number, clientY: number) => {
    if (isPanningRef.current || !tooltipRef.current) return;
    const el = tooltipRef.current;
    const s = parseISO(task.start);
    const en = parseISO(task.end);
    const isDark = theme.palette.mode === 'dark';
    const colors = getTaskColor(task, isDark);
    const statusText = getVietnameseStatus(task.status);

    if (tooltipTitleRef.current) tooltipTitleRef.current.textContent = task.name;
    if (tooltipDatesRef.current) {
      tooltipDatesRef.current.textContent = `${format(s, 'dd/MM/yyyy')} — ${format(en, 'dd/MM/yyyy')}`;
    }
    if (tooltipProgressRef.current) {
      tooltipProgressRef.current.textContent = `${task.progress}%`;
    }
    if (tooltipStatusRef.current) {
      tooltipStatusRef.current.textContent = statusText;
      tooltipStatusRef.current.style.backgroundColor = colors.bg;
      tooltipStatusRef.current.style.color = colors.bar;
      tooltipStatusRef.current.style.borderColor = colors.bar;
    }
    if (tooltipAssigneeRef.current) {
      if (task.assigneeNames && task.assigneeNames.length > 0) {
        tooltipAssigneeRef.current.style.display = 'flex';
        if (tooltipAssigneeTextRef.current) {
          tooltipAssigneeTextRef.current.textContent = task.assigneeNames.join(', ');
        }
      } else {
        tooltipAssigneeRef.current.style.display = 'none';
      }
    }

    const posX = Math.min(clientX + 16, window.innerWidth - 320);
    const posY = Math.min(clientY + 16, window.innerHeight - 180);
    el.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
    el.style.display = 'block';
  }, [theme.palette.mode]);

  const moveTooltip = React.useCallback((clientX: number, clientY: number) => {
    if (isPanningRef.current || !tooltipRef.current || tooltipRef.current.style.display === 'none') return;
    const posX = Math.min(clientX + 16, window.innerWidth - 320);
    const posY = Math.min(clientY + 16, window.innerHeight - 180);
    tooltipRef.current.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
  }, []);

  const hideTooltip = React.useCallback(() => {
    if (tooltipRef.current) {
      tooltipRef.current.style.display = 'none';
    }
  }, []);

  const handleSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSplitter(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const startX = e.clientX;
    const startWidth = isLeftCollapsed ? 0 : leftWidth;
    let rafId: number | null = null;
    let latestWidth = startWidth;

    const handleSplitterMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      latestWidth = Math.min(Math.max(startWidth + delta, 180), 750);

      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          setIsLeftCollapsed(false);
          setLeftWidth(latestWidth);
          rafId = null;
        });
      }
    };

    const handleSplitterMouseUp = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      setIsDraggingSplitter(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleSplitterMouseMove);
      window.removeEventListener('mouseup', handleSplitterMouseUp);
    };

    window.addEventListener('mousemove', handleSplitterMouseMove);
    window.addEventListener('mouseup', handleSplitterMouseUp);
  };

  const toggleLeftPanel = React.useCallback(() => {
    if (isLeftCollapsed) {
      setIsLeftCollapsed(false);
      setLeftWidth(prevLeftWidth.current || 360);
    } else {
      prevLeftWidth.current = leftWidth;
      setIsLeftCollapsed(true);
    }
  }, [isLeftCollapsed, leftWidth]);

  useEffect(() => {
    return () => {
      if (inertiaRafRef.current !== null) {
        cancelAnimationFrame(inertiaRafRef.current);
      }
    };
  }, []);

  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if (isDraggingSplitter) return;

    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('a') ||
      target.closest('.MuiIconButton-root') ||
      target.closest('.MuiButton-root')
    ) {
      return;
    }

    if (!containerRef.current) return;
    e.preventDefault();

    if (inertiaRafRef.current !== null) {
      cancelAnimationFrame(inertiaRafRef.current);
      inertiaRafRef.current = null;
    }

    hideTooltip();

    const container = containerRef.current;
    const startX = e.clientX;
    const startY = e.clientY;
    const startScrollLeft = container.scrollLeft;
    const startScrollTop = container.scrollTop;

    let lastX = startX;
    let lastY = startY;
    let lastTime = performance.now();
    let velocityX = 0;
    let velocityY = 0;

    isPanningRef.current = true;
    container.style.cursor = 'grabbing';
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';

    let targetLeft = startScrollLeft;
    let targetTop = startScrollTop;
    let rafId: number | null = null;

    const renderPan = () => {
      if (containerRef.current) {
        containerRef.current.scrollLeft = targetLeft;
        containerRef.current.scrollTop = targetTop;
        scrollPosRef.current.left = targetLeft;
        scrollPosRef.current.top = targetTop;
      }
      if (leftPanelRef.current) {
        isSyncingLeftScroll.current = true;
        leftPanelRef.current.scrollTop = targetTop;
      }
      rafId = null;
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const currentX = moveEvent.clientX;
      const currentY = moveEvent.clientY;
      const currentTime = performance.now();

      const deltaX = currentX - startX;
      const deltaY = currentY - startY;

      const timeElapsed = currentTime - lastTime;
      if (timeElapsed > 8) {
        velocityX = (currentX - lastX) / timeElapsed;
        velocityY = (currentY - lastY) / timeElapsed;
        lastX = currentX;
        lastY = currentY;
        lastTime = currentTime;
      }

      targetLeft = startScrollLeft - deltaX;
      targetTop = startScrollTop - deltaY;

      if (rafId === null) {
        rafId = requestAnimationFrame(renderPan);
      }
    };

    const handleMouseUp = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      isPanningRef.current = false;
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grab';
      }
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      if (Math.abs(velocityX) > 0.08 || Math.abs(velocityY) > 0.08) {
        let currentVx = velocityX * 14;
        let currentVy = velocityY * 14;
        const friction = 0.92;

        const stepInertia = () => {
          if (!containerRef.current) return;
          if (Math.abs(currentVx) < 0.25 && Math.abs(currentVy) < 0.25) {
            inertiaRafRef.current = null;
            return;
          }

          containerRef.current.scrollLeft -= currentVx;
          containerRef.current.scrollTop -= currentVy;
          scrollPosRef.current.left = containerRef.current.scrollLeft;
          scrollPosRef.current.top = containerRef.current.scrollTop;

          if (leftPanelRef.current) {
            isSyncingLeftScroll.current = true;
            leftPanelRef.current.scrollTop = containerRef.current.scrollTop;
          }

          currentVx *= friction;
          currentVy *= friction;

          inertiaRafRef.current = requestAnimationFrame(stepInertia);
        };

        inertiaRafRef.current = requestAnimationFrame(stepInertia);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);
  };

  const effectiveLeftWidth = isLeftCollapsed ? 0 : (isSmall ? 200 : (isMobile ? 260 : leftWidth));
  const todayIndex = timelineDays.findIndex((d) => isToday(d));

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '8px',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexGrow: 1,
        minHeight: 0,
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 4px 20px -2px rgba(0, 0, 0, 0.4)'
            : '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Top Toolbar */}
      <GanttToolbar
        filterBar={filterBar}
        isLeftCollapsed={isLeftCollapsed}
        onToggleLeftPanel={toggleLeftPanel}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        onExportGantt={handleExportGantt}
        exporting={exporting}
        onScrollToToday={scrollToToday}
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          setViewMode(mode);
          setTimeout(() => scrollToToday(), 50);
        }}
      />

      {/* Gantt View Area (Left Table + Resizable Splitter + Right Timeline) */}
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          flexGrow: 1,
          minHeight: 0,
          overflow: 'hidden',
          userSelect: isDraggingSplitter ? 'none' : 'auto',
        }}
      >
        {/* Left Side: Task Hierarchy List */}
        {!isLeftCollapsed && (
          <GanttLeftTree
            leftPanelRef={leftPanelRef}
            onScroll={handleLeftScroll}
            width={effectiveLeftWidth}
            isSmall={Boolean(isSmall)}
            visibleTasks={visibleTasks}
            collapsedIds={collapsedIds}
            onToggleCollapse={toggleCollapse}
            onTaskClick={onTaskClick}
          />
        )}

        {/* Draggable Resizer / Splitter Handle */}
        <Box
          onMouseDown={handleSplitterMouseDown}
          title="Kéo sang trái / phải để điều chỉnh kích thước khung nhìn"
          sx={{
            width: 8,
            flexShrink: 0,
            cursor: 'col-resize',
            bgcolor: (theme) =>
              isDraggingSplitter
                ? theme.palette.primary.main
                : theme.palette.background.paper,
            borderLeft: '1px solid',
            borderRight: '1px solid',
            borderColor: 'divider',
            position: 'relative',
            zIndex: 25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            '&:hover': {
              bgcolor: 'primary.main',
              '& .splitter-line': {
                bgcolor: '#ffffff',
              },
            },
          }}
        >
          <Box
            className="splitter-line"
            sx={{
              width: 2,
              height: 28,
              borderRadius: 1,
              bgcolor: isDraggingSplitter ? '#ffffff' : 'text.secondary',
            }}
          />
        </Box>

        {/* Right Side: Timeline Canvas */}
        <Box
          ref={containerRef}
          onScroll={handleRightScroll}
          onMouseDown={handleTimelineMouseDown}
          sx={{
            flexGrow: 1,
            overflowX: 'auto',
            overflowY: 'auto',
            height: '100%',
            position: 'relative',
            bgcolor: 'background.default',
            cursor: 'grab',
            userSelect: 'none',
            pointerEvents: isDraggingSplitter ? 'none' : 'auto',
            scrollBehavior: 'auto',
            willChange: 'scroll-position',
            overscrollBehavior: 'contain',
          }}
        >
          <Box
            sx={{
              width: timelineDays.length * columnWidth,
              minWidth: '100%',
              position: 'relative',
              backgroundImage: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px)'
                  : 'linear-gradient(to right, #f1f5f9 1px, transparent 1px)',
              backgroundSize: `${columnWidth}px 100%`,
              backgroundRepeat: 'repeat-x',
            }}
          >
            {/* 2-Tier Timeline Header */}
            <GanttTimelineHeader
              monthGroups={monthGroups}
              timelineDays={timelineDays}
              columnWidth={columnWidth}
              viewMode={viewMode}
              getDayOfWeekText={getDayOfWeekText}
            />

            {/* Today Column Highlight */}
            {todayIndex >= 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: todayIndex * columnWidth,
                  width: columnWidth,
                  bgcolor: 'rgba(224, 242, 254, 0.45)',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />
            )}

            {/* Today Line Indicator */}
            {todayIndex >= 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: todayIndex * columnWidth + columnWidth / 2,
                  width: '2px',
                  bgcolor: '#ef4444',
                  zIndex: 8,
                  pointerEvents: 'none',
                  '&::after': {
                    content: '"Hôm nay"',
                    position: 'absolute',
                    top: 66,
                    left: -24,
                    bgcolor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 1,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  },
                }}
              />
            )}

            {/* Timeline Rows */}
            <Box sx={{ position: 'relative' }}>
              {visibleTasks.map((task) => (
                <GanttTaskBarItem
                  key={task.id}
                  task={task}
                  minDate={minDate}
                  columnWidth={columnWidth}
                  onMouseEnter={(t, e) => showTooltip(t, e.clientX, e.clientY)}
                  onMouseMove={(e) => moveTooltip(e.clientX, e.clientY)}
                  onMouseLeave={hideTooltip}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Floating Tooltip */}
      <GanttTooltip
        tooltipRef={tooltipRef}
        tooltipTitleRef={tooltipTitleRef}
        tooltipDatesRef={tooltipDatesRef}
        tooltipProgressRef={tooltipProgressRef}
        tooltipStatusRef={tooltipStatusRef}
        tooltipAssigneeRef={tooltipAssigneeRef}
        tooltipAssigneeTextRef={tooltipAssigneeTextRef}
      />
    </Paper>
  );
});

InteractiveGantt.displayName = 'InteractiveGantt';
