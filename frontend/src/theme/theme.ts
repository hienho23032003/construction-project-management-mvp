import { createTheme } from '@mui/material/styles';

export const statusColors = {
  Completed: { main: '#10b981', light: '#ecfdf5', dark: '#047857', contrastText: '#ffffff' },
  InProgress: { main: '#0284c7', light: '#f0f9ff', dark: '#0369a1', contrastText: '#ffffff' },
  NotStarted: { main: '#64748b', light: '#f8fafc', dark: '#334155', contrastText: '#ffffff' },
  OnHold: { main: '#f59e0b', light: '#fffbeb', dark: '#b45309', contrastText: '#ffffff' },
  Overdue: { main: '#ef4444', light: '#fef2f2', dark: '#b91c1c', contrastText: '#ffffff' },
  Cancelled: { main: '#94a3b8', light: '#f1f5f9', dark: '#475569', contrastText: '#ffffff' },
};

export const priorityColors = {
  Low: { main: '#64748b', bg: '#f1f5f9' },
  Medium: { main: '#0284c7', bg: '#e0f2fe' },
  High: { main: '#f59e0b', bg: '#fef3c7' },
  Urgent: { main: '#ef4444', bg: '#fee2e2' },
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0284c7',
      light: '#38bdf8',
      dark: '#0369a1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0f766e',
      light: '#14b8a6',
      dark: '#115e59',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      disabled: '#94a3b8',
    },
    divider: '#e2e8f0',
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#0284c7',
      light: '#38bdf8',
      dark: '#0369a1',
    },
  },
  typography: {
    fontFamily: '"Inter", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.02em', color: '#0f172a' },
    h2: { fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.02em', color: '#0f172a' },
    h3: { fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.01em', color: '#0f172a' },
    h4: { fontWeight: 600, fontSize: '1.125rem', color: '#0f172a' },
    h5: { fontWeight: 600, fontSize: '1rem', color: '#0f172a' },
    h6: { fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' },
    subtitle1: { fontSize: '0.9375rem', color: '#475569' },
    subtitle2: { fontSize: '0.8125rem', fontWeight: 500, color: '#64748b' },
    body1: { fontSize: '0.875rem', lineHeight: 1.6, color: '#1e293b' },
    body2: { fontSize: '0.8125rem', lineHeight: 1.5, color: '#475569' },
    button: { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.08)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.08)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
    ...Array(19).fill('0 20px 25px -5px rgba(0, 0, 0, 0.08)')
  ] as any,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 18px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
          },
          '&.Mui-disabled': {
            backgroundColor: '#e2e8f0 !important',
            color: '#94a3b8 !important',
            cursor: 'not-allowed',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #0369a1 0%, #075985 100%)',
          },
          '&.Mui-disabled': {
            background: '#e2e8f0 !important',
            color: '#94a3b8 !important',
          },
        },
      },
    },
    MuiMenu: {
      defaultProps: {
        PaperProps: {
          sx: {
            maxHeight: 280,
            borderRadius: '8px !important',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            overflowY: 'auto !important',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f8fafc',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#cbd5e1',
              borderRadius: '3px',
            },
            '& .MuiMenu-list': {
              maxHeight: 'none !important',
              overflowY: 'visible !important',
              paddingTop: '4px',
              paddingBottom: '4px',
            },
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        MenuProps: {
          PaperProps: {
            sx: {
              maxHeight: 280,
              borderRadius: '8px !important',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              overflowY: 'auto !important',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f8fafc',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#cbd5e1',
                borderRadius: '3px',
              },
              '& .MuiMenu-list': {
                maxHeight: 'none !important',
                overflowY: 'visible !important',
                paddingTop: '4px',
                paddingBottom: '4px',
              },
            },
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.85rem',
          fontWeight: 500,
          borderRadius: '8px',
          margin: '2px 4px',
          padding: '6px 12px',
          '&.Mui-selected': {
            backgroundColor: '#e0f2fe !important',
            color: '#0369a1',
            fontWeight: 700,
          },
          '&:hover': {
            backgroundColor: '#f0f9ff',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: '8px',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#0284c7',
          borderRadius: '8px 8px 0 0',
          '& .MuiTableCell-head': {
            backgroundColor: '#0284c7 !important',
            color: '#ffffff !important',
            fontWeight: 700,
            borderBottom: '1px solid #0369a1',
          },
          '& .MuiTableSortLabel-root': {
            color: '#ffffff !important',
            '&:hover': {
              color: '#f0f9ff !important',
            },
            '&.Mui-active': {
              color: '#ffffff !important',
            },
            '& .MuiTableSortLabel-icon': {
              color: '#ffffff !important',
              opacity: '0.9 !important',
            },
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f8fafc !important',
          },
          '&.Mui-selected': {
            backgroundColor: '#f0f9ff !important',
          },
        },
      },
    },
    MuiTableSortLabel: {
      styleOverrides: {
        root: {
          color: '#ffffff !important',
          fontWeight: 700,
          '&:hover': {
            color: '#f0f9ff !important',
          },
          '&.Mui-active': {
            color: '#ffffff !important',
          },
          '& .MuiTableSortLabel-icon': {
            color: '#ffffff !important',
            opacity: '0.9 !important',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#0284c7 !important',
          color: '#ffffff !important',
          fontWeight: 700,
          fontSize: '0.8125rem',
          textTransform: 'none',
          letterSpacing: '0.01em',
          borderBottom: '1px solid #0369a1',
          padding: '12px 16px',
        },
        root: {
          borderColor: '#f1f5f9',
          padding: '12px 16px',
          color: '#0f172a',
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          borderTop: '1px solid #ede2d4',
          backgroundColor: '#ffffff',
          color: '#5a4f45',
        },
        toolbar: {
          minHeight: '46px !important',
          paddingLeft: '16px',
          paddingRight: '16px',
        },
        selectLabel: {
          fontSize: '0.825rem',
          color: '#6e6358',
          fontWeight: 600,
        },
        displayedRows: {
          fontSize: '0.825rem',
          color: '#6e6358',
          fontWeight: 600,
        },
        select: {
          fontSize: '0.825rem',
          fontWeight: 600,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '8px !important',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        asterisk: {
          color: '#ef4444 !important',
          fontWeight: 700,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          transform: 'translate(14px, 11px) scale(1)',
          '&.MuiInputLabel-shrink': {
            transform: 'translate(14px, -9px) scale(0.75)',
          },
        },
        asterisk: {
          color: '#ef4444 !important',
          fontWeight: 700,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '8px !important',
          fontSize: '0.875rem',
          '&:not(.MuiInputBase-multiline)': {
            height: '44px',
          },
          '&.MuiInputBase-sizeSmall:not(.MuiInputBase-multiline)': {
            height: '36px',
          },
          '&.MuiInputBase-multiline': {
            padding: '10px 14px',
          },
          '&.MuiInputBase-sizeSmall.MuiInputBase-multiline': {
            padding: '6px 10px',
          },
        },
        input: {
          padding: '10px 14px',
          boxSizing: 'border-box',
          '&.MuiInputBase-inputSizeSmall': {
            padding: '6px 10px',
          },
          '&.MuiInputBase-inputMultiline': {
            padding: 0,
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            paddingTop: '3px',
            paddingBottom: '3px',
            paddingLeft: '10px',
            paddingRight: '64px !important',
            height: '44px',
          },
          '& .MuiOutlinedInput-root.MuiInputBase-sizeSmall': {
            height: '36px',
            paddingTop: '1px',
            paddingBottom: '1px',
            paddingLeft: '10px',
            paddingRight: '60px !important',
          },
          '& .MuiOutlinedInput-root .MuiAutocomplete-input': {
            padding: '2px 4px !important',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          },
          '& .MuiAutocomplete-endAdornment': {
            right: '8px',
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: '4px',
          marginTop: '4px',
          fontSize: '0.75rem',
          fontWeight: 500,
          '&.Mui-error': {
            color: '#ef4444',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '8px !important',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '20px 24px 12px 24px',
          fontWeight: 700,
          fontSize: '1.15rem',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '20px 24px !important',
          '&.MuiDialogContent-root': {
            paddingTop: '20px !important',
          },
        },
      },
    },
  },
});
