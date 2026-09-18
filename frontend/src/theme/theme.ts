import { createTheme, ThemeOptions } from '@mui/material/styles';
import type {} from '@mui/x-date-pickers/themeAugmentation';

export const getStatusColors = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';
  return {
    Completed: {
      main: isDark ? '#34d399' : '#10b981',
      light: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ecfdf5',
      dark: '#047857',
      contrastText: '#ffffff',
      border: isDark ? 'rgba(52, 211, 153, 0.4)' : '#a7f3d0',
    },
    InProgress: {
      main: isDark ? '#38bdf8' : '#0284c7',
      light: isDark ? 'rgba(2, 132, 199, 0.2)' : '#f0f9ff',
      dark: '#0369a1',
      contrastText: '#ffffff',
      border: isDark ? 'rgba(56, 189, 248, 0.4)' : '#bae6fd',
    },
    NotStarted: {
      main: isDark ? '#94a3b8' : '#64748b',
      light: isDark ? 'rgba(100, 116, 139, 0.2)' : '#f8fafc',
      dark: '#334155',
      contrastText: '#ffffff',
      border: isDark ? 'rgba(148, 163, 184, 0.3)' : '#e2e8f0',
    },
    OnHold: {
      main: isDark ? '#fbbf24' : '#f59e0b',
      light: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fffbeb',
      dark: '#b45309',
      contrastText: '#ffffff',
      border: isDark ? 'rgba(251, 191, 36, 0.4)' : '#fde68a',
    },
    Overdue: {
      main: isDark ? '#f87171' : '#ef4444',
      light: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2',
      dark: '#b91c1c',
      contrastText: '#ffffff',
      border: isDark ? 'rgba(248, 113, 113, 0.4)' : '#fecaca',
    },
    Cancelled: {
      main: isDark ? '#64748b' : '#94a3b8',
      light: isDark ? 'rgba(71, 85, 105, 0.2)' : '#f1f5f9',
      dark: '#475569',
      contrastText: '#ffffff',
      border: isDark ? 'rgba(100, 116, 139, 0.3)' : '#cbd5e1',
    },
  };
};

export const statusColors = getStatusColors('light');

export const getPriorityColors = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';
  return {
    Low: {
      main: isDark ? '#94a3b8' : '#64748b',
      bg: isDark ? 'rgba(100, 116, 139, 0.18)' : '#f1f5f9',
      border: isDark ? 'rgba(148, 163, 184, 0.3)' : '#e2e8f0',
    },
    Medium: {
      main: isDark ? '#38bdf8' : '#0284c7',
      bg: isDark ? 'rgba(2, 132, 199, 0.18)' : '#e0f2fe',
      border: isDark ? 'rgba(56, 189, 248, 0.3)' : '#bae6fd',
    },
    High: {
      main: isDark ? '#fbbf24' : '#f59e0b',
      bg: isDark ? 'rgba(245, 158, 11, 0.18)' : '#fef3c7',
      border: isDark ? 'rgba(251, 191, 36, 0.3)' : '#fde68a',
    },
    Urgent: {
      main: isDark ? '#f87171' : '#ef4444',
      bg: isDark ? 'rgba(239, 68, 68, 0.18)' : '#fee2e2',
      border: isDark ? 'rgba(248, 113, 113, 0.3)' : '#fecaca',
    },
  };
};

export const priorityColors = getPriorityColors('light');

export const getAppTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: isDark ? '#2d88ff' : '#0284c7',
        light: isDark ? '#4599ff' : '#38bdf8',
        dark: isDark ? '#1877f2' : '#0369a1',
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDark ? '#2dd4bf' : '#0f766e',
        light: isDark ? '#5eead4' : '#14b8a6',
        dark: isDark ? '#0f766e' : '#115e59',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#18191a' : '#f8fafc',
        paper: isDark ? '#242526' : '#ffffff',
      },
      text: {
        primary: isDark ? '#e4e6eb' : '#0f172a',
        secondary: isDark ? '#b0b3b8' : '#475569',
        disabled: isDark ? '#71767b' : '#94a3b8',
      },
      divider: isDark ? '#3e4042' : '#e2e8f0',
      action: {
        hover: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        selected: isDark ? 'rgba(45, 136, 255, 0.16)' : 'rgba(2, 132, 199, 0.08)',
        disabled: isDark ? '#71767b' : '#94a3b8',
        disabledBackground: isDark ? '#3a3b3c' : '#e2e8f0',
      },
      success: {
        main: isDark ? '#34d399' : '#10b981',
        light: isDark ? '#6ee7b7' : '#34d399',
        dark: isDark ? '#059669' : '#059669',
      },
      warning: {
        main: isDark ? '#fbbf24' : '#f59e0b',
        light: isDark ? '#fcd34d' : '#fbbf24',
        dark: isDark ? '#d97706' : '#d97706',
      },
      error: {
        main: isDark ? '#f87171' : '#ef4444',
        light: isDark ? '#fca5a5' : '#f87171',
        dark: isDark ? '#dc2626' : '#dc2626',
      },
      info: {
        main: isDark ? '#2d88ff' : '#0284c7',
        light: isDark ? '#4599ff' : '#38bdf8',
        dark: isDark ? '#1877f2' : '#0369a1',
      },
    },
    typography: {
      fontFamily:
        '"Google Sans Flex", "Google Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.02em', color: isDark ? '#e4e6eb' : '#0f172a' },
      h2: { fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.02em', color: isDark ? '#e4e6eb' : '#0f172a' },
      h3: { fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.01em', color: isDark ? '#e4e6eb' : '#0f172a' },
      h4: { fontWeight: 600, fontSize: '1.125rem', color: isDark ? '#e4e6eb' : '#0f172a' },
      h5: { fontWeight: 600, fontSize: '1rem', color: isDark ? '#e4e6eb' : '#0f172a' },
      h6: { fontWeight: 600, fontSize: '0.875rem', color: isDark ? '#e4e6eb' : '#0f172a' },
      subtitle1: { fontSize: '0.9375rem', color: isDark ? '#b0b3b8' : '#475569' },
      subtitle2: { fontSize: '0.8125rem', fontWeight: 500, color: isDark ? '#b0b3b8' : '#64748b' },
      body1: { fontSize: '0.875rem', lineHeight: 1.6, color: isDark ? '#b0b3b8' : '#1e293b' },
      body2: { fontSize: '0.8125rem', lineHeight: 1.5, color: isDark ? '#b0b3b8' : '#475569' },
      caption: { fontSize: '0.75rem', color: isDark ? '#71767b' : '#64748b' },
      overline: { fontSize: '0.68rem', color: isDark ? '#71767b' : '#94a3b8' },
      button: { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' },
    },
    shape: {
      borderRadius: 8,
    },
    shadows: isDark
      ? ([
          'none',
          '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
          '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
          '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)',
          '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)',
          ...Array(20).fill('0 20px 25px -5px rgba(0, 0, 0, 0.6)'),
        ] as any)
      : ([
          'none',
          '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)',
          '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.08)',
          '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.08)',
          '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
          ...Array(19).fill('0 20px 25px -5px rgba(0, 0, 0, 0.08)'),
        ] as any),
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 18px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: isDark
                ? '0 2px 10px rgba(45, 136, 255, 0.25)'
                : '0 2px 6px rgba(2, 132, 199, 0.25)',
            },
            '&.Mui-disabled': {
              backgroundColor: isDark ? '#3a3b3c !important' : '#e2e8f0 !important',
              color: isDark ? '#71767b !important' : '#94a3b8 !important',
              cursor: 'not-allowed',
            },
          },
          containedPrimary: {
            backgroundColor: isDark ? '#2d88ff' : '#0284c7',
            backgroundImage: 'none',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: isDark ? '#1877f2' : '#0369a1',
            },
            '&.Mui-disabled': {
              backgroundColor: isDark ? '#3a3b3c !important' : '#e2e8f0 !important',
              color: isDark ? '#71767b !important' : '#94a3b8 !important',
            },
          },
          outlined: {
            borderColor: isDark ? '#3a3b3c' : '#e2e8f0',
            color: isDark ? '#e4e6eb' : 'inherit',
            '&:hover': {
              borderColor: isDark ? '#2d88ff' : '#0284c7',
              backgroundColor: isDark ? 'rgba(45, 136, 255, 0.08)' : 'rgba(2, 132, 199, 0.04)',
              color: isDark ? '#e4e6eb' : 'inherit',
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
              border: isDark ? '1px solid #3e4042' : '1px solid #e2e8f0',
              bgcolor: isDark ? '#242526' : '#ffffff',
              boxShadow: isDark
                ? '0 10px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
                : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
              overflowY: 'auto !important',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: isDark ? '#18191a' : '#f8fafc',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: isDark ? '#3a3b3c' : '#cbd5e1',
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
                border: isDark ? '1px solid #3e4042' : '1px solid #e2e8f0',
                bgcolor: isDark ? '#242526' : '#ffffff',
                boxShadow: isDark
                  ? '0 10px 25px -5px rgba(0, 0, 0, 0.7)'
                  : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                overflowY: 'auto !important',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: isDark ? '#18191a' : '#f8fafc',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: isDark ? '#3a3b3c' : '#cbd5e1',
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
            color: isDark ? '#b0b3b8' : '#0f172a',
            '&.Mui-selected': {
              backgroundColor: isDark ? 'rgba(45, 136, 255, 0.16) !important' : '#e0f2fe !important',
              color: isDark ? '#2d88ff' : '#0369a1',
              fontWeight: 700,
            },
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f0f9ff',
              color: isDark ? '#e4e6eb' : '#0f172a',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            border: isDark ? '1px solid #3a3b3c' : '1px solid #e2e8f0',
            backgroundColor: isDark ? '#242526' : '#ffffff',
            boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
            transition: 'box-shadow 0.15s ease, transform 0.15s ease',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 8,
            boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
            border: isDark ? '1px solid #3a3b3c' : '1px solid #e2e8f0',
            backgroundColor: isDark ? '#242526' : '#ffffff',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderRadius: '0 !important',
            borderLeft: 'none',
            borderRight: 'none',
            borderTop: 'none',
            boxShadow: 'none',
            backgroundColor: isDark ? '#242526' : '#ffffff',
            color: isDark ? '#e4e6eb' : '#0f172a',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
            backgroundColor: isDark ? '#242526' : '#ffffff',
            borderRight: isDark ? '1px solid #3a3b3c' : '1px solid #e2e8f0',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDark ? '#3e4042' : '#f1f5f9',
            marginTop: '0 !important',
            marginBottom: '0 !important',
            margin: '0 !important',
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            color: '#ffffff !important',
            backgroundColor: '#0284c7',
            fontWeight: 700,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: '8px',
          },
          avatar: {
            color: '#ffffff !important',
            backgroundColor: '#0284c7 !important',
            '& *': {
              color: '#ffffff !important',
            },
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            border: isDark ? '1px solid #3a3b3c' : '1px solid #e2e8f0',
            backgroundColor: isDark ? '#242526' : '#ffffff',
            boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#18191a' : '#0284c7',
            borderRadius: '8px 8px 0 0',
            '& .MuiTableCell-head': {
              backgroundColor: isDark ? '#18191a !important' : '#0284c7 !important',
              color: isDark ? '#e4e6eb !important' : '#ffffff !important',
              fontWeight: 700,
              borderBottom: isDark ? '1px solid #3e4042' : '1px solid #0369a1',
            },
            '& .MuiTableSortLabel-root': {
              color: isDark ? '#e4e6eb !important' : '#ffffff !important',
              '&:hover': {
                color: isDark ? '#2d88ff !important' : '#f0f9ff !important',
              },
              '&.Mui-active': {
                color: isDark ? '#2d88ff !important' : '#ffffff !important',
              },
              '& .MuiTableSortLabel-icon': {
                color: isDark ? '#2d88ff !important' : '#ffffff !important',
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
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04) !important' : '#f8fafc !important',
            },
            '&.Mui-selected': {
              backgroundColor: isDark ? 'rgba(45, 136, 255, 0.12) !important' : '#f0f9ff !important',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor: isDark ? '#18191a !important' : '#0284c7 !important',
            color: isDark ? '#e4e6eb !important' : '#ffffff !important',
            fontWeight: 700,
            fontSize: '0.8125rem',
            textTransform: 'none',
            letterSpacing: '0.01em',
            borderBottom: isDark ? '1px solid #3e4042' : '1px solid #0369a1',
            padding: '12px 16px',
          },
          root: {
            borderColor: isDark ? '#3e4042' : '#f1f5f9',
            padding: '12px 16px',
            color: isDark ? '#b0b3b8' : '#0f172a',
          },
        },
      },
      MuiTablePagination: {
        styleOverrides: {
          root: {
            borderTop: isDark ? '1px solid #3e4042' : '1px solid #e2e8f0',
            backgroundColor: isDark ? '#242526' : '#ffffff',
            color: isDark ? '#b0b3b8' : '#5a4f45',
          },
          toolbar: {
            minHeight: '46px !important',
            paddingLeft: '16px',
            paddingRight: '16px',
          },
          selectLabel: {
            fontSize: '0.825rem',
            color: isDark ? '#71767b' : '#6e6358',
            fontWeight: 600,
          },
          displayedRows: {
            fontSize: '0.825rem',
            color: isDark ? '#71767b' : '#6e6358',
            fontWeight: 600,
          },
          select: {
            fontSize: '0.825rem',
            fontWeight: 600,
            color: isDark ? '#e4e6eb' : 'inherit',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: '8px !important',
            backgroundColor: isDark ? '#242526' : '#ffffff',
            border: isDark ? '1px solid #3e4042' : 'none',
            boxShadow: isDark
              ? '0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 10px 10px -5px rgba(0, 0, 0, 0.6)'
              : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: {
            color: isDark ? '#71767b' : '#475569',
          },
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
            color: isDark ? '#71767b' : '#475569',
            transform: 'translate(14px, 11px) scale(1)',
            '&.MuiInputLabel-shrink': {
              transform: 'translate(14px, -9px) scale(0.75)',
            },
            '&.Mui-focused': {
              color: isDark ? '#2d88ff' : '#0284c7',
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
            backgroundColor: isDark ? '#3a3b3c' : 'transparent',
            color: isDark ? '#e4e6eb' : '#0f172a',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#3e4042' : '#e2e8f0',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#5a5b5c' : '#cbd5e1',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#2d88ff' : '#0284c7',
            },
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
            color: isDark ? '#e4e6eb' : '#0f172a',
            '&::placeholder': {
              color: isDark ? '#71767b' : '#94a3b8',
              opacity: 1,
            },
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
              paddingTop: '4px',
              paddingBottom: '4px',
              paddingLeft: '10px',
              paddingRight: '64px !important',
              minHeight: '44px',
              height: 'auto !important',
            },
            '& .MuiOutlinedInput-root.MuiInputBase-sizeSmall': {
              minHeight: '36px',
              height: 'auto !important',
              paddingTop: '2px',
              paddingBottom: '2px',
              paddingLeft: '10px',
              paddingRight: '60px !important',
            },
            '& .MuiOutlinedInput-root .MuiAutocomplete-input': {
              padding: '2px 4px !important',
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
            color: isDark ? '#71767b' : 'inherit',
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
            color: isDark ? '#e4e6eb' : '#0f172a',
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
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#0f172a',
            color: '#f8fafc',
            fontSize: '0.75rem',
            fontWeight: 500,
            borderRadius: '8px',
            padding: '8px 12px',
            boxShadow: isDark
              ? '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)'
              : '0 10px 25px -5px rgba(15, 23, 42, 0.3), 0 8px 10px -6px rgba(15, 23, 42, 0.2)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.15)',
          },
          arrow: {
            color: isDark ? '#1e293b' : '#0f172a',
          },
        },
      },
      MuiDateCalendar: {
        styleOverrides: {
          root: {
            height: 'auto',
            maxHeight: 'none',
            '& .MuiDayCalendar-slideTransition': {
              minHeight: '230px',
              overflowY: 'visible',
            },
            '& .MuiDayCalendar-weekDayLabel': {
              fontWeight: 700,
              fontSize: '0.75rem',
            },
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};

export const theme = getAppTheme('light');
export const darkTheme = getAppTheme('dark');
