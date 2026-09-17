import React from 'react';
import { Box, Typography, Select, MenuItem, IconButton, Button, useTheme } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CommonPaginationProps {
  page: number; // 0-indexed or 1-indexed depending on standard
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
  isZeroIndexed?: boolean; // Default true (MUI standard 0-indexed)
}

export const CommonPagination: React.FC<CommonPaginationProps> = React.memo(({
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 20, 50, 100],
  isZeroIndexed = true,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const currentPage = isZeroIndexed ? page + 1 : page;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  const from = totalCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const to = Math.min(currentPage * rowsPerPage, totalCount);

  const handlePrev = React.useCallback(() => {
    if (currentPage > 1) {
      onPageChange(isZeroIndexed ? page - 1 : page - 1);
    }
  }, [currentPage, isZeroIndexed, page, onPageChange]);

  const handleNext = React.useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(isZeroIndexed ? page + 1 : page + 1);
    }
  }, [currentPage, totalPages, isZeroIndexed, page, onPageChange]);

  const handlePageClick = React.useCallback((p: number) => {
    onPageChange(isZeroIndexed ? p - 1 : p);
  }, [isZeroIndexed, onPageChange]);

  const pageItems = React.useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }, [currentPage, totalPages]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
        px: 2,
        py: 1.2,
        bgcolor: 'background.paper',
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Left side: Rows per page & count */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
          Hiển thị
        </Typography>
        <Select
          size="small"
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          sx={{
            minWidth: 68,
            height: 30,
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'text.primary',
            bgcolor: isDark ? '#18191a' : '#f8fafc',
            borderRadius: '8px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#3a3b3c' : '#cbd5e1',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#2d88ff' : '#0284c7',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#2d88ff' : '#0284c7',
            },
            '& .MuiSelect-select': {
              py: '4px !important',
              pl: '10px !important',
              pr: '28px !important',
            },
          }}
        >
          {rowsPerPageOptions.map((opt) => (
            <MenuItem key={opt} value={opt} sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              {opt}
            </MenuItem>
          ))}
        </Select>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
          dòng / trang • Tổng số <strong style={{ color: isDark ? '#e4e6eb' : '#0f172a' }}>{totalCount}</strong> kết quả ({from} - {to})
        </Typography>
      </Box>

      {/* Right side: Page navigation (1 ... 4 5 6 ... 9) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
        <IconButton
          size="small"
          onClick={handlePrev}
          disabled={currentPage <= 1}
          title="Trang trước"
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '8px',
            width: 30,
            height: 30,
            color: 'text.secondary',
            bgcolor: isDark ? '#242526' : 'transparent',
            '&:disabled': { borderColor: theme.palette.divider, color: isDark ? '#71767b' : '#cbd5e1' },
            '&:hover': {
              bgcolor: isDark ? 'rgba(45, 136, 255, 0.12)' : '#f0f9ff',
              borderColor: isDark ? '#2d88ff' : '#0284c7',
              color: isDark ? '#2d88ff' : '#0284c7',
            },
          }}
        >
          <ChevronLeft size={16} />
        </IconButton>

        {pageItems.map((item, idx) => {
          if (typeof item === 'string') {
            return (
              <Box
                key={`ellipsis-${idx}`}
                sx={{
                  width: 26,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDark ? '#b0b3b8' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                ...
              </Box>
            );
          }

          const isActive = item === currentPage;

          return (
            <Button
              key={item}
              size="small"
              onClick={() => handlePageClick(item)}
              sx={{
                minWidth: 32,
                height: 30,
                px: 1,
                fontSize: '0.8125rem',
                fontWeight: isActive ? 800 : 600,
                borderRadius: '8px',
                bgcolor: isActive ? '#0284c7' : isDark ? '#242526' : '#ffffff',
                color: isActive ? '#ffffff !important' : isDark ? '#b0b3b8' : '#334155',
                border: isActive ? '1px solid #0284c7' : `1px solid ${theme.palette.divider}`,
                boxShadow: isActive ? '0 1px 3px rgba(2, 132, 199, 0.3)' : 'none',
                '&:hover': {
                  bgcolor: isActive ? '#0369a1' : isDark ? 'rgba(45, 136, 255, 0.12)' : '#f0f9ff',
                  borderColor: isActive ? '#0369a1' : isDark ? '#2d88ff' : '#0284c7',
                  color: isActive ? '#ffffff' : isDark ? '#2d88ff' : '#0284c7',
                },
              }}
            >
              {item}
            </Button>
          );
        })}

        <IconButton
          size="small"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          title="Trang kế tiếp"
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '8px',
            width: 30,
            height: 30,
            color: 'text.secondary',
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
            '&:disabled': { borderColor: theme.palette.divider, color: isDark ? '#475569' : '#cbd5e1' },
            '&:hover': {
              bgcolor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#f0f9ff',
              borderColor: isDark ? '#38bdf8' : '#0284c7',
              color: isDark ? '#38bdf8' : '#0284c7',
            },
          }}
        >
          <ChevronRight size={16} />
        </IconButton>
      </Box>
    </Box>
  );
});

CommonPagination.displayName = 'CommonPagination';
