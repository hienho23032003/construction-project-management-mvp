import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  ButtonGroup,
  Tooltip,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Calendar,
  Layers,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Download,
} from 'lucide-react';
import {
  format,
  addDays,
  differenceInDays,
  eachDayOfInterval,
  isToday,
  parseISO,
} from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import { GanttTask, GanttLink } from '../../types';
import { taskApi, reportApi } from '../../services/api/endpoints';
import { useToast } from '../../contexts/ToastContext';
import { getVietnameseStatus } from '../common/StatusChip';

type ViewMode = 'Day' | 'Week' | 'Month';

export interface GanttTreeItem extends GanttTask {
  depth: number;
  hasChildren: boolean;
}

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

interface InteractiveGanttProps {
  tasks: GanttTask[];
  links?: GanttLink[];
  onTaskUpdated?: () => void;
  onTaskClick?: (task: GanttTask) => void;
  canEdit?: boolean;
  filterBar?: React.ReactNode;
}

export const InteractiveGantt: React.FC<InteractiveGanttProps> = ({
  tasks,
  links = [],
  onTaskUpdated,
  onTaskClick,
  canEdit = true,
  filterBar,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('Day');
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  // Resizable left panel state
  const [leftWidth, setLeftWidth] = useState<number>(360);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState<boolean>(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState<boolean>(false);
  const prevLeftWidth = useRef<number>(360);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const isSyncingLeftScroll = useRef(false);
  const isSyncingRightScroll = useRef(false);
  const isInitialScrollDone = useRef<boolean>(false);
  const prevMinDateRef = useRef<Date | null>(null);
  const scrollPosRef = useRef<{ top: number; left: number }>({ top: 0, left: 0 });

  const { showSuccess, showError } = useToast();
  const [exporting, setExporting] = useState(false);

  const handleExportGantt = async () => {
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
  };

  const handleLeftScroll = () => {
    if (isSyncingLeftScroll.current) {
      isSyncingLeftScroll.current = false;
      return;
    }
    if (leftPanelRef.current && containerRef.current) {
      isSyncingRightScroll.current = true;
      containerRef.current.scrollTop = leftPanelRef.current.scrollTop;
      scrollPosRef.current.top = leftPanelRef.current.scrollTop;
    }
  };

  const handleRightScroll = () => {
    if (isSyncingRightScroll.current) {
      isSyncingRightScroll.current = false;
      return;
    }
    if (leftPanelRef.current && containerRef.current) {
      isSyncingLeftScroll.current = true;
      leftPanelRef.current.scrollTop = containerRef.current.scrollTop;
      scrollPosRef.current.top = containerRef.current.scrollTop;
      scrollPosRef.current.left = containerRef.current.scrollLeft;
    }
  };

  // Determine timeline boundary
  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (!tasks.length) {
      const now = new Date();
      return { minDate: addDays(now, -10), maxDate: addDays(now, 30), totalDays: 40 };
    }

    let min = new Date(tasks[0].start);
    let max = new Date(tasks[0].end);

    tasks.forEach((t) => {
      const s = new Date(t.start);
      const e = new Date(t.end);
      if (s < min) min = s;
      if (e > max) max = e;
    });

    // Add padding days around timeline
    const paddedMin = addDays(min, -7);
    const paddedMax = addDays(max, 14);
    const days = Math.max(differenceInDays(paddedMax, paddedMin) + 1, 30);

    return { minDate: paddedMin, maxDate: paddedMax, totalDays: days };
  }, [tasks]);

  // Column width according to viewMode
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

  // Pre-calculate Month Header Groups to prevent any text squishing / overlapping
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

  // Track user explicit actions: 'collapsed' | 'expanded'
  const userActionsRef = useRef<Map<string, 'collapsed' | 'expanded'>>(new Map());
  const hasInitializedCollapse = useRef(false);

  // Expand / collapse subtasks
  const toggleCollapse = (id: string, e: React.MouseEvent) => {
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
  };

  const collapseAll = () => {
    const parentIds = new Set<string>();
    tasks.forEach((t) => {
      if (t.type === 'project' || t.type === 'phase' || tasks.some((c) => c.parentId === t.id)) {
        parentIds.add(t.id);
        userActionsRef.current.set(t.id, 'collapsed');
      }
    });
    setCollapsedIds(parentIds);
  };

  const expandAll = () => {
    tasks.forEach((t) => {
      userActionsRef.current.set(t.id, 'expanded');
    });
    setCollapsedIds(new Set());
  };

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
              // User explicitly expanded this node -> Keep expanded
            } else if (userAction === 'collapsed') {
              // User explicitly collapsed this node -> Keep collapsed
              next.add(t.id);
            } else if (prev.has(t.id)) {
              // Node was already collapsed in state -> Keep collapsed
              next.add(t.id);
            } else if (!hasInitializedCollapse.current) {
              // Default on initial load: collapse branches
              next.add(t.id);
            }
          }
        });
        hasInitializedCollapse.current = true;
        return next;
      });
    }
  }, [tasks]);

  // Build hierarchical DFS tree ensuring all children are always placed directly under their parent
  const visibleTasks = useMemo(() => {
    if (!tasks.length) return [];

    // Map children by parentId
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

  // Scroll to Today
  const scrollToToday = () => {
    const todayIndex = timelineDays.findIndex((d) => isToday(d));
    if (todayIndex >= 0 && containerRef.current) {
      const targetLeft = Math.max(0, todayIndex * columnWidth - 250);
      containerRef.current.scrollLeft = targetLeft;
      scrollPosRef.current.left = targetLeft;
    }
  };

  // Only run scrollToToday on initial mount/first data load
  useEffect(() => {
    if (!isInitialScrollDone.current && tasks.length > 0 && timelineDays.length > 0) {
      scrollToToday();
      isInitialScrollDone.current = true;
      prevMinDateRef.current = minDate;
    }
  }, [tasks.length, timelineDays]);

  // When tasks data updates (e.g. after saving task, editing assignees, status), PRESERVE scroll position!
  useEffect(() => {
    if (isInitialScrollDone.current && containerRef.current) {
      // Compensate if minDate shifted due to date adjustment
      if (prevMinDateRef.current && minDate) {
        const diff = differenceInDays(minDate, prevMinDateRef.current);
        if (diff !== 0) {
          scrollPosRef.current.left = Math.max(0, scrollPosRef.current.left - diff * columnWidth);
        }
      }
      prevMinDateRef.current = minDate;

      // Restore exact scroll positions
      containerRef.current.scrollLeft = scrollPosRef.current.left;
      containerRef.current.scrollTop = scrollPosRef.current.top;
      if (leftPanelRef.current) {
        leftPanelRef.current.scrollTop = scrollPosRef.current.top;
      }
    }
  }, [tasks, minDate, columnWidth]);

  // Date calculation utilities
  const getTaskCoords = (start: Date, end: Date) => {
    const startDiff = differenceInDays(start, minDate);
    const duration = Math.max(differenceInDays(end, start) + 1, 1);
    const left = startDiff * columnWidth;
    const width = duration * columnWidth;
    return { left, width };
  };

  // Handle Splitter Dragging (Left/Right resize) with requestAnimationFrame for 60fps smooth performance
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

  const toggleLeftPanel = () => {
    if (isLeftCollapsed) {
      setIsLeftCollapsed(false);
      setLeftWidth(prevLeftWidth.current || 360);
    } else {
      prevLeftWidth.current = leftWidth;
      setIsLeftCollapsed(true);
    }
  };

  // Colors per status
  const getTaskColor = (task: GanttTask) => {
    if (task.isOverdue) return { bar: '#ef4444', fill: '#dc2626', bg: '#fee2e2' };
    if (task.status === 'Completed') return { bar: '#10b981', fill: '#059669', bg: '#d1fae5' };
    if (task.status === 'InProgress') return { bar: '#0284c7', fill: '#0369a1', bg: '#e0f2fe' };
    if (task.status === 'OnHold') return { bar: '#f59e0b', fill: '#d97706', bg: '#fef3c7' };
    return { bar: '#94a3b8', fill: '#64748b', bg: '#f1f5f9' };
  };

  const effectiveLeftWidth = isLeftCollapsed ? 0 : (isSmall ? 200 : (isMobile ? 260 : leftWidth));

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'hidden',
        bgcolor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexGrow: 1,
        minHeight: 0,
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Top Toolbar */}
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
              onClick={toggleLeftPanel}
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
              onClick={expandAll}
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
              onClick={collapseAll}
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
            onClick={handleExportGantt}
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
            onClick={scrollToToday}
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
                  onClick={() => {
                    setViewMode(mode);
                    setTimeout(() => scrollToToday(), 50);
                  }}
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

      {/* Gantt View Area (Left Table + Resizable Splitter + Right Timeline) */}
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          flexGrow: 1,
          minHeight: 0,
          height: 'calc(100% - 56px)',
          overflow: 'hidden',
          userSelect: isDraggingSplitter ? 'none' : 'auto',
        }}
      >
        {/* Left Side: Task Hierarchy List */}
        {!isLeftCollapsed && (
          <Box
            ref={leftPanelRef}
            onScroll={handleLeftScroll}
            sx={{
              width: effectiveLeftWidth,
              minWidth: isSmall ? 160 : 180,
              maxWidth: 750,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: '#ffffff',
              height: '100%',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            {/* Left Table Header (matching 64px height) */}
            <Box
              sx={{
                height: 64,
                minHeight: 64,
                px: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: '#f8fafc',
                borderBottom: '1px solid #cbd5e1',
                position: 'sticky',
                top: 0,
                zIndex: 20,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase', fontSize: '0.78rem' }}
              >
                Hạng Mục / Công Việc
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                Tiến độ
              </Typography>
            </Box>

            {/* Rows */}
            {visibleTasks.map((task) => {
              const hasChildren = task.hasChildren;
              const isCollapsed = collapsedIds.has(task.id);
              const isProject = task.type === 'project';
              const isPhase = task.type === 'phase';
              const indent = (task.depth || 0) * 16;

              const handleRowClick = (e: React.MouseEvent) => {
                if (hasChildren || isProject || isPhase) {
                  toggleCollapse(task.id, e);
                } else if (onTaskClick) {
                  onTaskClick(task);
                }
              };

              return (
                <Box
                  key={task.id}
                  onClick={handleRowClick}
                  sx={{
                    height: 44,
                    minHeight: 44,
                    px: 1.5,
                    pl: `${8 + indent}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #f1f5f9',
                    bgcolor: isProject ? '#f1f5f9' : isPhase ? '#f8fafc' : '#ffffff',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'background-color 0.15s',
                    '&:hover': { bgcolor: '#f0f9ff' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, pr: 1 }}>
                    {hasChildren ? (
                      <IconButton
                        size="small"
                        onClick={(e) => toggleCollapse(task.id, e)}
                        sx={{ p: 0.25, color: '#64748b' }}
                      >
                        {isCollapsed ? <ChevronRightIcon size={16} /> : <ChevronDown size={16} />}
                      </IconButton>
                    ) : (
                      <Box sx={{ width: 24 }} />
                    )}

                    <Typography
                      variant="body2"
                      noWrap
                      title={task.name}
                      sx={{
                        fontWeight: isProject ? 700 : isPhase ? 600 : 500,
                        fontSize: isProject ? '0.875rem' : '0.8125rem',
                        color: isProject ? '#0f172a' : isPhase ? '#1e293b' : '#334155',
                      }}
                    >
                      {task.name}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: task.progress >= 100 ? '#10b981' : task.progress > 0 ? '#0284c7' : '#94a3b8',
                      }}
                    >
                      {task.progress}%
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Draggable Resizer / Splitter Handle */}
        <Box
          onMouseDown={handleSplitterMouseDown}
          title="Kéo sang trái / phải để điều chỉnh kích thước khung nhìn"
          sx={{
            width: 8,
            flexShrink: 0,
            cursor: 'col-resize',
            bgcolor: isDraggingSplitter ? '#0284c7' : '#f1f5f9',
            borderLeft: '1px solid #e2e8f0',
            borderRight: '1px solid #e2e8f0',
            position: 'relative',
            zIndex: 25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: isDraggingSplitter ? 'none' : 'background-color 0.2s',
            userSelect: 'none',
            '&:hover': {
              bgcolor: '#0284c7',
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
              bgcolor: isDraggingSplitter ? '#ffffff' : '#94a3b8',
              transition: 'background-color 0.2s',
            }}
          />
        </Box>

        {/* Right Side: Timeline Canvas */}
        <Box
          ref={containerRef}
          onScroll={handleRightScroll}
          sx={{
            flexGrow: 1,
            overflowX: 'auto',
            overflowY: 'auto',
            height: '100%',
            position: 'relative',
            bgcolor: '#fafafa',
            pointerEvents: isDraggingSplitter ? 'none' : 'auto',
          }}
        >
          <Box sx={{ width: timelineDays.length * columnWidth, minWidth: '100%', position: 'relative' }}>
            {/* 2-Tier Timeline Header (Tier 1: Month Groups, Tier 2: Date Grid) */}
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 15,
                bgcolor: '#ffffff',
                borderBottom: '1px solid #cbd5e1',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              }}
            >
              {/* Tier 1: Grouped Month Header */}
              <Box sx={{ height: 26, display: 'flex', borderBottom: '1px solid #e2e8f0', bgcolor: '#f1f5f9' }}>
                {monthGroups.map((mg, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: mg.daysCount * columnWidth,
                      minWidth: mg.daysCount * columnWidth,
                      borderRight: '1px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.75rem', color: '#0369a1' }}>
                      Tháng {mg.monthStr}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Tier 2: Date Columns (Upper Line: Thứ, Lower Line: Ngày, Centered) */}
              <Box sx={{ height: 38, display: 'flex', bgcolor: '#f8fafc' }}>
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
                        borderRight: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        bgcolor: today ? '#e0f2fe' : isWeekend ? '#f1f5f9' : 'transparent',
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
                              color: today ? '#0284c7' : isWeekend ? '#ef4444' : '#64748b',
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
                                color: today ? '#0284c7' : isWeekend ? '#ef4444' : '#0f172a',
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

            {/* Today Line Indicator */}
            {timelineDays.some((d) => isToday(d)) && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: timelineDays.findIndex((d) => isToday(d)) * columnWidth + columnWidth / 2,
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
              {visibleTasks.map((task) => {
                const s = parseISO(task.start);
                const en = parseISO(task.end);
                const { left, width } = getTaskCoords(s, en);
                const colors = getTaskColor(task);
                const isProject = task.type === 'project';
                const isPhase = task.type === 'phase';

                return (
                  <Box
                    key={task.id}
                    sx={{
                      height: 44,
                      position: 'relative',
                      borderBottom: '1px solid #f1f5f9',
                      bgcolor: isProject ? '#f8fafc' : '#ffffff',
                    }}
                  >
                    {/* Background Grid Lines */}
                    {timelineDays.map((d, i) => (
                      <Box
                        key={i}
                        sx={{
                          position: 'absolute',
                          left: i * columnWidth,
                          top: 0,
                          bottom: 0,
                          width: columnWidth,
                          borderRight: '1px solid #f1f5f9',
                          bgcolor: isToday(d) ? 'rgba(239, 246, 255, 0.4)' : d.getDay() === 0 || d.getDay() === 6 ? 'rgba(241, 245, 249, 0.35)' : 'transparent',
                          pointerEvents: 'none',
                        }}
                      />
                    ))}

                    {/* Task Bar */}
                    <Tooltip
                      followCursor
                      enterDelay={60}
                      leaveDelay={0}
                      slotProps={{
                        popper: {
                          sx: {
                            zIndex: 9999,
                            pointerEvents: 'none',
                          },
                        },
                        tooltip: {
                          sx: {
                            bgcolor: '#0f172a',
                            color: '#ffffff',
                            p: 1.75,
                            borderRadius: '8px',
                            border: '1px solid rgba(56, 189, 248, 0.4)',
                            boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.45)',
                            maxWidth: 320,
                          },
                        },
                      }}
                      title={
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.85rem' }}>
                            {task.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Calendar size={13} color="#94a3b8" />
                            <Typography variant="caption" sx={{ color: '#f1f5f9', fontWeight: 600 }}>
                              {format(s, 'dd/MM/yyyy')} — {format(en, 'dd/MM/yyyy')}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                            <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                              Tiến độ: <strong style={{ color: '#34d399' }}>{task.progress}%</strong>
                            </Typography>
                            <Chip
                              label={getVietnameseStatus(task.status)}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                bgcolor: colors.bg,
                                color: colors.bar,
                                border: `1px solid ${colors.bar}`,
                              }}
                            />
                          </Box>
                          {task.assigneeNames.length > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <User size={13} color="#94a3b8" />
                              <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                                Phụ trách: <strong>{task.assigneeNames.join(', ')}</strong>
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                    >
                      <Box
                        onClick={() => onTaskClick && onTaskClick(task)}
                        sx={{
                          position: 'absolute',
                          top: isProject ? 6 : isPhase ? 7 : 7,
                          height: isProject ? 32 : isPhase ? 30 : 30,
                          left: `${left}px`,
                          width: `${Math.max(width, 16)}px`,
                          bgcolor: colors.bg,
                          border: `1.5px solid ${colors.bar}`,
                          borderRadius: isProject ? '4px' : '6px',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          overflow: 'hidden',
                          zIndex: 5,
                          userSelect: 'none',
                        }}
                      >
                        {/* Progress Fill inside task */}
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${task.progress}%`,
                            bgcolor: colors.fill,
                            opacity: 0.85,
                            borderRadius: '4px 0 0 4px',
                          }}
                        />

                        {/* Title text on bar if width is enough */}
                        {width > 60 && (
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{
                              position: 'relative',
                              zIndex: 3,
                              px: 1,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: '#ffffff',
                              textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.9)',
                              letterSpacing: '0.01em',
                              display: 'block',
                            }}
                          >
                            {task.name} ({task.progress}%)
                          </Typography>
                        )}
                      </Box>
                    </Tooltip>

                    {/* Task Title beside bar if width <= 60px */}
                    {width <= 60 && (
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{
                          position: 'absolute',
                          left: `${left + Math.max(width, 16) + 6}px`,
                          top: isProject ? 11 : isPhase ? 12 : 12,
                          zIndex: 4,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          pointerEvents: 'none',
                        }}
                      >
                        {task.name} ({task.progress}%)
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};
