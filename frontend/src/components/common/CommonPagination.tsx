import React from 'react';
import { Box, Typography, Select, MenuItem, IconButton, Button } from '@mui/material';
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

export const CommonPagination: React.FC<CommonPaginationProps> = ({
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 20, 50, 100],
  isZeroIndexed = true,
}) => {
  const currentPage = isZeroIndexed ? page + 1 : page;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  const from = totalCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const to = Math.min(currentPage * rowsPerPage, totalCount);

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(isZeroIndexed ? page - 1 : page - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(isZeroIndexed ? page + 1 : page + 1);
    }
  };

  const handlePageClick = (p: number) => {
    onPageChange(isZeroIndexed ? p - 1 : p);
  };

  const getPageNumbers = (current: number, total: number): (number | string)[] => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }

    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  const pageItems = getPageNumbers(currentPage, totalPages);

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
        bgcolor: '#ffffff',
      }}
    >
      {/* Left side: Rows per page & count */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
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
            color: '#0f172a',
            bgcolor: '#f8fafc',
            borderRadius: '8px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#cbd5e1',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0284c7',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0284c7',
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
        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
          dòng / trang • Tổng số <strong>{totalCount}</strong> kết quả ({from} - {to})
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
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            width: 30,
            height: 30,
            color: '#475569',
            '&:disabled': { borderColor: '#f1f5f9', color: '#cbd5e1' },
            '&:hover': { bgcolor: '#f0f9ff', borderColor: '#38bdf8', color: '#0284c7' },
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
                  color: '#94a3b8',
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
                bgcolor: isActive ? '#0284c7' : '#ffffff',
                color: isActive ? '#ffffff !important' : '#334155',
                border: isActive ? '1px solid #0284c7' : '1px solid #e2e8f0',
                boxShadow: isActive ? '0 1px 3px rgba(2, 132, 199, 0.3)' : 'none',
                '&:hover': {
                  bgcolor: isActive ? '#0369a1' : '#f0f9ff',
                  borderColor: isActive ? '#0369a1' : '#38bdf8',
                  color: isActive ? '#ffffff' : '#0284c7',
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
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            width: 30,
            height: 30,
            color: '#475569',
            '&:disabled': { borderColor: '#f1f5f9', color: '#cbd5e1' },
            '&:hover': { bgcolor: '#f0f9ff', borderColor: '#38bdf8', color: '#0284c7' },
          }}
        >
          <ChevronRight size={16} />
        </IconButton>
      </Box>
    </Box>
  );
};
