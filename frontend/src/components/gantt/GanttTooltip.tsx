import React from 'react';
import { Box, Typography } from '@mui/material';
import { Calendar, User } from 'lucide-react';

interface GanttTooltipProps {
  tooltipRef: React.RefObject<HTMLDivElement>;
  tooltipTitleRef: React.RefObject<HTMLDivElement>;
  tooltipDatesRef: React.RefObject<HTMLSpanElement>;
  tooltipProgressRef: React.RefObject<HTMLElement>;
  tooltipStatusRef: React.RefObject<HTMLDivElement>;
  tooltipAssigneeRef: React.RefObject<HTMLDivElement>;
  tooltipAssigneeTextRef: React.RefObject<HTMLElement>;
}

export const GanttTooltip: React.FC<GanttTooltipProps> = ({
  tooltipRef,
  tooltipTitleRef,
  tooltipDatesRef,
  tooltipProgressRef,
  tooltipStatusRef,
  tooltipAssigneeRef,
  tooltipAssigneeTextRef,
}) => {
  return (
    <Box
      ref={tooltipRef}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'none',
        zIndex: 99999,
        pointerEvents: 'none',
        bgcolor: '#0f172a',
        color: '#ffffff',
        p: 1.5,
        borderRadius: '8px',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.5), 0 4px 10px rgba(0, 0, 0, 0.3)',
        maxWidth: 320,
        width: 'max-content',
        willChange: 'transform',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <Typography
          ref={tooltipTitleRef}
          variant="subtitle2"
          sx={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.85rem', lineHeight: 1.3 }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Calendar size={13} color="#94a3b8" />
          <Typography
            ref={tooltipDatesRef}
            component="span"
            variant="caption"
            sx={{ color: '#f1f5f9', fontWeight: 600 }}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5, gap: 1.5 }}>
          <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
            Tiến độ: <strong ref={tooltipProgressRef} style={{ color: '#34d399' }}>0%</strong>
          </Typography>
          <Box
            ref={tooltipStatusRef}
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 700,
              px: 1,
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: '16px',
              border: '1px solid transparent',
            }}
          />
        </Box>
        <Box ref={tooltipAssigneeRef} sx={{ display: 'none', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <User size={13} color="#94a3b8" />
          <Typography variant="caption" sx={{ color: '#cbd5e1', lineHeight: 1.2 }}>
            Phụ trách: <strong ref={tooltipAssigneeTextRef} />
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
