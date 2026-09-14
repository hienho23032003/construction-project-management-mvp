import React, { useMemo } from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  Box,
  Typography,
  Skeleton,
  Checkbox,
  Tooltip,
  SxProps,
  Theme,
} from '@mui/material';
import { Inbox } from 'lucide-react';
import { CommonPagination } from './CommonPagination';

export type TableAlign = 'inherit' | 'left' | 'center' | 'right' | 'justify';
export type TableDensity = 'compact' | 'standard' | 'comfortable';
export type ResponsiveWidth =
  | number
  | string
  | {
      xs?: number | string;
      sm?: number | string;
      md?: number | string;
      lg?: number | string;
      xl?: number | string;
    };

export interface ColumnDef<T> {
  /** Unique ID for the column */
  id?: string;
  /** Header title or custom header render function */
  header: React.ReactNode | ((context: { column: ColumnDef<T> }) => React.ReactNode);
  /** Key of row data to access */
  accessorKey?: keyof T;
  /** Function to compute/extract cell value from row */
  accessorFn?: (row: T, index: number) => any;
  /** Custom cell renderer */
  cell?: (context: {
    row: T;
    value: any;
    index: number;
    data: T[];
  }) => React.ReactNode;
  /** Column alignment */
  align?: TableAlign;
  /** Column fixed/minimum/maximum width */
  width?: ResponsiveWidth;
  minWidth?: ResponsiveWidth;
  maxWidth?: ResponsiveWidth;
  /** Whether the column can be sorted */
  sortable?: boolean;
  /** Field name used for sorting (defaults to accessorKey or id) */
  sortField?: string;
  /** Custom styles for header cell */
  headerSx?: SxProps<Theme>;
  /** Custom styles for body cell */
  cellSx?: SxProps<Theme> | ((row: T, index: number) => SxProps<Theme>);
  /** Hide column conditionally */
  hidden?: boolean;
  /** Auto truncate with tooltip */
  ellipsis?: boolean;
}

export interface STTConfig {
  title?: string;
  width?: ResponsiveWidth;
  align?: TableAlign;
  page?: number;
  rowsPerPage?: number;
  headerSx?: SxProps<Theme>;
  cellSx?: SxProps<Theme>;
}

export interface TablePaginationConfig {
  page: number; // 0-indexed or 1-indexed based on isZeroIndexed
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
  isZeroIndexed?: boolean;
}

export interface CommonTableProps<T> {
  /** Table column definitions */
  columns: ColumnDef<T>[];
  /** Array of data items */
  data: T[];
  /** Loading indicator */
  loading?: boolean;
  /** Number of skeleton rows when loading */
  skeletonRows?: number;
  /** Row unique key extractor */
  rowKey?: keyof T | ((row: T, index: number) => string | number);
  /** Whether to show auto Serial Number (STT) column */
  showSTT?: boolean;
  /** Configuration for STT column */
  sttConfig?: STTConfig;
  /** Active sort column field name */
  sortBy?: string;
  /** Sort direction */
  isDescending?: boolean;
  sortDirection?: 'asc' | 'desc';
  /** Sort change handler */
  onSort?: (field: string) => void;
  /** Row click handler */
  onRowClick?: (row: T, index: number, event: React.MouseEvent) => void;
  /** Custom row styling */
  rowSx?: SxProps<Theme> | ((row: T, index: number) => SxProps<Theme>);
  /** Enable hover effect on rows */
  hover?: boolean;
  /** Sticky header */
  stickyHeader?: boolean;
  /** Max height for scrolling */
  maxHeight?: number | string;
  /** Minimum width of the table */
  minWidth?: ResponsiveWidth;
  /** Custom empty state message */
  emptyMessage?: React.ReactNode;
  /** Custom empty state icon */
  emptyIcon?: React.ReactNode;
  /** Custom empty state actions (e.g. Create Button) */
  emptyAction?: React.ReactNode;
  /** Completely custom empty state component */
  emptyContent?: React.ReactNode;
  /** Pagination configuration */
  pagination?: TablePaginationConfig;
  /** Density / padding of table rows */
  density?: TableDensity;
  /** Checkbox selection */
  selectable?: boolean;
  selectedRowKeys?: (string | number)[];
  onSelectRow?: (row: T, isSelected: boolean) => void;
  onSelectAll?: (isSelected: boolean) => void;
  /** Expandable sub-row renderer */
  renderSubRow?: (row: T, index: number) => React.ReactNode;
  isRowExpanded?: (row: T, index: number) => boolean;
  /** Table CSS table-layout property ('fixed' | 'auto', default 'fixed') */
  tableLayout?: 'fixed' | 'auto';
  /** Container / wrapper styles */
  containerSx?: SxProps<Theme>;
  tableSx?: SxProps<Theme>;
  headerRowSx?: SxProps<Theme>;
  /** Bordered styling */
  bordered?: boolean;
}

const densityPaddingMap: Record<TableDensity, { py: number; px: number }> = {
  compact: { py: 0.75, px: 1.25 },
  standard: { py: 1.25, px: 2 },
  comfortable: { py: 1.75, px: 2.5 },
};

export function CommonTable<T = any>({
  columns,
  data,
  loading = false,
  skeletonRows = 5,
  rowKey,
  showSTT = false,
  sttConfig,
  sortBy,
  isDescending,
  sortDirection,
  onSort,
  onRowClick,
  rowSx,
  hover = true,
  stickyHeader = true,
  maxHeight = 'calc(100vh - 270px)',
  minWidth = { xs: 720, md: '100%' },
  emptyMessage = 'Không có dữ liệu hiển thị',
  emptyIcon,
  emptyAction,
  emptyContent,
  pagination,
  density = 'standard',
  selectable = false,
  selectedRowKeys = [],
  onSelectRow,
  onSelectAll,
  renderSubRow,
  isRowExpanded,
  tableLayout = 'fixed',
  containerSx,
  tableSx,
  headerRowSx,
  bordered = false,
}: CommonTableProps<T>) {
  // Filter active (non-hidden) columns
  const visibleColumns = useMemo(
    () => columns.filter((col) => !col.hidden),
    [columns]
  );

  // Normalize sort direction
  const activeSortDirection =
    sortDirection || (isDescending !== undefined ? (isDescending ? 'desc' : 'asc') : undefined);

  // Helper to extract row key
  const getRowKey = (row: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(row, index);
    }
    if (rowKey && (row as any)[rowKey] !== undefined) {
      return (row as any)[rowKey];
    }
    if ((row as any)?.id !== undefined) return (row as any).id;
    if ((row as any)?._id !== undefined) return (row as any)._id;
    return index;
  };

  // Selection states
  const allRowsSelected =
    data.length > 0 &&
    data.every((row, idx) => selectedRowKeys.includes(getRowKey(row, idx)));
  const isIndeterminate =
    data.some((row, idx) => selectedRowKeys.includes(getRowKey(row, idx))) &&
    !allRowsSelected;

  // Calculate total columns for colSpan
  const totalColumnCount =
    visibleColumns.length + (showSTT ? 1 : 0) + (selectable ? 1 : 0);

  // Cell padding based on density
  const cellPadding = densityPaddingMap[density];

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#ffffff',
        borderRadius: '8px',
        border: bordered ? '1px solid #e2e8f0' : 'none',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        ...containerSx,
      }}
    >
      <TableContainer
        sx={{
          overflow: 'auto',
          maxHeight,
          width: '100%',
        }}
      >
        <Table
          stickyHeader={stickyHeader}
          sx={{
            minWidth: minWidth as any,
            tableLayout,
            borderCollapse: 'separate',
            ...tableSx,
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                bgcolor: '#f8fafc',
                '& th': {
                  bgcolor: '#f8fafc',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  letterSpacing: '0.01em',
                  borderBottom: '1px solid #e2e8f0',
                  py: cellPadding.py,
                  px: cellPadding.px,
                  whiteSpace: 'nowrap',
                },
                ...headerRowSx,
              }}
            >
              {/* Select All Checkbox Column */}
              {selectable && (
                <TableCell
                  padding="checkbox"
                  sx={{
                    width: 48,
                    textAlign: 'center',
                  }}
                >
                  <Checkbox
                    size="small"
                    indeterminate={isIndeterminate}
                    checked={allRowsSelected}
                    onChange={(e) => onSelectAll && onSelectAll(e.target.checked)}
                    disabled={data.length === 0 || loading}
                    sx={{
                      p: 0.5,
                      color: '#94a3b8',
                      '&.Mui-checked, &.MuiCheckbox-indeterminate': {
                        color: '#0284c7',
                      },
                    }}
                  />
                </TableCell>
              )}

              {/* Serial Number (STT) Header */}
              {showSTT && (
                <TableCell
                  align={sttConfig?.align || 'center'}
                  sx={{
                    width: (sttConfig?.width as any) || 56,
                    minWidth: (sttConfig?.width as any) || 56,
                    ...sttConfig?.headerSx,
                  }}
                >
                  {sttConfig?.title || 'STT'}
                </TableCell>
              )}

              {/* Dynamic Header Columns */}
              {visibleColumns.map((col, colIdx) => {
                const colKey = col.id || (col.accessorKey as string) || `col-${colIdx}`;
                const sortKey = col.sortField || (col.accessorKey as string) || col.id;
                const isSortActive = Boolean(sortBy && sortKey && sortBy === sortKey);

                return (
                  <TableCell
                    key={colKey}
                    align={col.align || 'left'}
                    sx={{
                      width: col.width as any,
                      minWidth: col.minWidth as any,
                      maxWidth: col.maxWidth as any,
                      ...col.headerSx,
                    }}
                  >
                    {col.sortable && sortKey && onSort ? (
                      <TableSortLabel
                        active={isSortActive}
                        direction={isSortActive ? activeSortDirection : 'asc'}
                        onClick={() => onSort(sortKey)}
                        sx={{
                          fontWeight: 'inherit',
                          fontSize: 'inherit',
                          color: 'inherit',
                          '&.Mui-active': {
                            color: '#0284c7',
                          },
                          '& .MuiTableSortLabel-icon': {
                            color: '#0284c7 !important',
                          },
                        }}
                      >
                        {typeof col.header === 'function'
                          ? col.header({ column: col })
                          : col.header}
                      </TableSortLabel>
                    ) : typeof col.header === 'function' ? (
                      col.header({ column: col })
                    ) : (
                      col.header
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {/* Loading State Skeleton */}
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, rIdx) => (
                <TableRow key={`skeleton-row-${rIdx}`} sx={{ '&:hover': { bgcolor: 'transparent' } }}>
                  {selectable && (
                    <TableCell
                      padding="checkbox"
                      align="center"
                      sx={{
                        width: 48,
                        py: cellPadding.py,
                        px: cellPadding.px,
                        borderBottom: '1px solid #f1f5f9',
                      }}
                    >
                      <Skeleton variant="rounded" width={18} height={18} sx={{ mx: 'auto', borderRadius: 0.5 }} />
                    </TableCell>
                  )}
                  {showSTT && (
                    <TableCell
                      align={sttConfig?.align || 'center'}
                      sx={{
                        py: cellPadding.py,
                        px: cellPadding.px,
                        width: (sttConfig?.width as any) || 56,
                        minWidth: (sttConfig?.width as any) || 56,
                        borderBottom: '1px solid #f1f5f9',
                        ...sttConfig?.cellSx,
                      }}
                    >
                      <Skeleton variant="text" width={22} height={20} sx={{ mx: 'auto' }} />
                    </TableCell>
                  )}
                  {visibleColumns.map((col, cIdx) => (
                    <TableCell
                      key={`skeleton-cell-${cIdx}`}
                      align={col.align || 'left'}
                      sx={{
                        py: cellPadding.py,
                        px: cellPadding.px,
                        fontSize: '0.8125rem',
                        whiteSpace: 'nowrap',
                        width: col.width as any,
                        minWidth: col.minWidth as any,
                        maxWidth: col.maxWidth as any,
                        borderBottom: '1px solid #f1f5f9',
                        ...(typeof col.cellSx === 'object' ? col.cellSx : {}),
                      }}
                    >
                      <Skeleton
                        variant={cIdx % 3 === 1 ? 'rounded' : 'text'}
                        width={cIdx === 0 ? '75%' : cIdx % 2 === 0 ? '55%' : '85%'}
                        height={cIdx % 3 === 1 ? 22 : 20}
                        sx={{
                          borderRadius: cIdx % 3 === 1 ? 1 : 0.5,
                          mx: col.align === 'center' ? 'auto' : col.align === 'right' ? '0 0 0 auto' : 0,
                        }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              /* Empty State */
              <TableRow>
                <TableCell
                  colSpan={totalColumnCount}
                  align="center"
                  sx={{
                    py: 8,
                    borderBottom: 'none',
                  }}
                >
                  {emptyContent ? (
                    emptyContent
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1.5,
                      }}
                    >
                      {emptyIcon || <Inbox size={42} color="#94a3b8" strokeWidth={1.5} />}
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#64748b',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                        }}
                      >
                        {emptyMessage}
                      </Typography>
                      {emptyAction && <Box sx={{ mt: 1 }}>{emptyAction}</Box>}
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              /* Data Rows */
              data.map((row, rowIdx) => {
                const key = getRowKey(row, rowIdx);
                const isSelected = selectedRowKeys.includes(key);
                const isExpanded = isRowExpanded ? isRowExpanded(row, rowIdx) : false;

                const rowCustomSx =
                  typeof rowSx === 'function'
                    ? (rowSx as (r: T, i: number) => SxProps<Theme>)(row, rowIdx)
                    : rowSx;

                // Calculate STT number
                const page = sttConfig?.page ?? 0;
                const rowsPerPage = sttConfig?.rowsPerPage ?? 0;
                const sttNumber =
                  rowsPerPage > 0 ? page * rowsPerPage + rowIdx + 1 : rowIdx + 1;

                return (
                  <React.Fragment key={key}>
                    <TableRow
                      hover={hover}
                      onClick={(e) => onRowClick && onRowClick(row, rowIdx, e)}
                      selected={isSelected}
                      sx={{
                        cursor: onRowClick ? 'pointer' : 'default',
                        transition: 'background-color 0.15s ease',
                        '&:hover': hover
                          ? {
                              bgcolor: '#f8fafc !important',
                            }
                          : undefined,
                        '&.Mui-selected': {
                          bgcolor: 'rgba(2, 132, 199, 0.08) !important',
                          '&:hover': {
                            bgcolor: 'rgba(2, 132, 199, 0.12) !important',
                          },
                        },
                        ...rowCustomSx,
                      }}
                    >
                      {/* Selectable Checkbox */}
                      {selectable && (
                        <TableCell
                          padding="checkbox"
                          onClick={(e) => e.stopPropagation()}
                          sx={{
                            width: 48,
                            textAlign: 'center',
                            py: cellPadding.py,
                            px: cellPadding.px,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={(e) =>
                              onSelectRow && onSelectRow(row, e.target.checked)
                            }
                            sx={{
                              p: 0.5,
                              color: '#cbd5e1',
                              '&.Mui-checked': {
                                color: '#0284c7',
                              },
                            }}
                          />
                        </TableCell>
                      )}

                      {/* STT Body Cell */}
                      {showSTT && (
                        <TableCell
                          align={sttConfig?.align || 'center'}
                          sx={{
                            fontWeight: 600,
                            color: '#64748b',
                            fontSize: '0.8125rem',
                            whiteSpace: 'nowrap',
                            py: cellPadding.py,
                            px: cellPadding.px,
                            ...sttConfig?.cellSx,
                          }}
                        >
                          {sttNumber}
                        </TableCell>
                      )}

                      {/* Column Cells */}
                      {visibleColumns.map((col, colIdx) => {
                        const cellKey =
                          col.id || (col.accessorKey as string) || `cell-${colIdx}`;

                        // Extract value
                        let cellValue: any = undefined;
                        if (col.accessorFn) {
                          cellValue = col.accessorFn(row, rowIdx);
                        } else if (col.accessorKey) {
                          cellValue = row[col.accessorKey];
                        }

                        const customCellSx =
                          typeof col.cellSx === 'function'
                            ? (col.cellSx as (r: T, i: number) => SxProps<Theme>)(row, rowIdx)
                            : col.cellSx;

                        // Render cell content
                        let content: React.ReactNode;
                        if (col.cell) {
                          content = col.cell({
                            row,
                            value: cellValue,
                            index: rowIdx,
                            data,
                          });
                        } else if (cellValue === null || cellValue === undefined) {
                          content = '-';
                        } else {
                          content = cellValue;
                        }

                        // Text auto truncation & tooltip title
                        let finalCellContent: React.ReactNode = content;
                        if (typeof content === 'string' || typeof content === 'number') {
                          const strVal = String(content);
                          finalCellContent = (
                            <Box
                              component="span"
                              title={strVal}
                              sx={{
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '100%',
                                fontSize: 'inherit',
                                fontWeight: 'inherit',
                                color: 'inherit',
                              }}
                            >
                              {strVal}
                            </Box>
                          );
                        } else if (col.ellipsis) {
                          const titleVal =
                            typeof cellValue === 'string' || typeof cellValue === 'number'
                              ? String(cellValue)
                              : undefined;
                          finalCellContent = (
                            <Box
                              component="div"
                              title={titleVal}
                              sx={{
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '100%',
                              }}
                            >
                              {content}
                            </Box>
                          );
                        }

                        return (
                          <TableCell
                            key={cellKey}
                            align={col.align || 'left'}
                            sx={{
                              py: cellPadding.py,
                              px: cellPadding.px,
                              fontSize: '0.8125rem',
                              color: '#1e293b',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              width: col.width as any,
                              minWidth: col.minWidth as any,
                              maxWidth: col.maxWidth as any,
                              borderBottom: '1px solid #f1f5f9',
                              ...customCellSx,
                            }}
                          >
                            {finalCellContent}
                          </TableCell>
                        );
                      })}
                    </TableRow>

                    {/* Expandable Sub-Row */}
                    {isExpanded && renderSubRow && (
                      <TableRow>
                        <TableCell
                          colSpan={totalColumnCount}
                          sx={{
                            p: 0,
                            bgcolor: '#f8fafc',
                            borderBottom: '1px solid #e2e8f0',
                          }}
                        >
                          {renderSubRow(row, rowIdx)}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Built-in Pagination */}
      {pagination && (
        <CommonPagination
          page={pagination.page}
          rowsPerPage={pagination.rowsPerPage}
          totalCount={pagination.totalCount}
          onPageChange={pagination.onPageChange}
          onRowsPerPageChange={pagination.onRowsPerPageChange}
          rowsPerPageOptions={pagination.rowsPerPageOptions}
          isZeroIndexed={pagination.isZeroIndexed}
        />
      )}
    </Box>
  );
}
