import React, { useState } from 'react';
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  IconButton,
  useTheme,
} from '@mui/material';
import { Eye, EyeOff, Search, X } from 'lucide-react';

export type CommonInputProps = Omit<TextFieldProps, 'error'> & {
  error?: boolean | string;
  isPassword?: boolean;
  isSearch?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  startIcon?: React.ReactNode;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
};

export const CommonInput = React.forwardRef<HTMLInputElement, CommonInputProps>(
  (
    {
      label,
      required = false,
      error,
      helperText,
      isPassword = false,
      isSearch = false,
      clearable = false,
      onClear,
      startIcon,
      startAdornment,
      endAdornment,
      value,
      onChange,
      type = 'text',
      size = 'small',
      disabled,
      placeholder,
      InputProps,
      sx,
      ...rest
    },
    ref
  ) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [showPassword, setShowPassword] = useState(false);

    const hasError = Boolean(error);
    const errorMessage = typeof error === 'string' ? error : undefined;
    const finalHelperText = errorMessage || helperText;

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const renderStartAdornment = () => {
      if (startAdornment) {
        return startAdornment;
      }
      if (startIcon) {
        return (
          <InputAdornment position="start" sx={{ color: isDark ? '#b0b3b8' : '#64748b' }}>
            {startIcon}
          </InputAdornment>
        );
      }
      if (isSearch) {
        return (
          <InputAdornment position="start" sx={{ color: isDark ? '#b0b3b8' : '#64748b' }}>
            <Search size={16} />
          </InputAdornment>
        );
      }
      return InputProps?.startAdornment;
    };

    const renderEndAdornment = () => {
      const elements: React.ReactNode[] = [];

      if (clearable && value && !disabled && onClear) {
        elements.push(
          <IconButton
            key="clear-btn"
            size="small"
            onClick={onClear}
            sx={{
              p: 0.5,
              color: isDark ? '#b0b3b8' : '#94a3b8',
              '&:hover': { color: isDark ? '#e4e6eb' : '#0f172a' },
            }}
          >
            <X size={15} />
          </IconButton>
        );
      }

      if (isPassword) {
        elements.push(
          <IconButton
            key="pwd-toggle"
            size="small"
            onClick={() => setShowPassword(!showPassword)}
            edge="end"
            sx={{
              p: 0.5,
              color: isDark ? '#b0b3b8' : '#94a3b8',
              '&:hover': { color: isDark ? '#e4e6eb' : '#0f172a' },
            }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </IconButton>
        );
      }

      if (endAdornment) {
        elements.push(
          React.isValidElement(endAdornment)
            ? React.cloneElement(endAdornment, { key: 'custom-top-end' })
            : endAdornment
        );
      }

      if (InputProps?.endAdornment) {
        elements.push(
          React.isValidElement(InputProps.endAdornment)
            ? React.cloneElement(InputProps.endAdornment, { key: 'custom-end' })
            : InputProps.endAdornment
        );
      }

      if (elements.length === 0) return undefined;

      return (
        <InputAdornment position="end" sx={{ gap: 0.5 }}>
          {elements}
        </InputAdornment>
      );
    };

    return (
      <TextField
        ref={ref}
        label={label}
        required={required}
        type={inputType}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        size={size}
        error={hasError}
        helperText={finalHelperText}
        InputProps={{
          ...InputProps,
          startAdornment: renderStartAdornment(),
          endAdornment: renderEndAdornment(),
        }}
        sx={[
          {
            width: '100%',
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              bgcolor: isDark ? '#242526' : '#ffffff',
              color: isDark ? '#e4e6eb' : '#0f172a',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: hasError
                  ? '#ef4444 !important'
                  : isDark
                  ? '#3e4042'
                  : '#cbd5e1',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: hasError
                  ? '#ef4444 !important'
                  : isDark
                  ? '#5a5b5c'
                  : '#94a3b8',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: hasError
                  ? '#ef4444 !important'
                  : isDark
                  ? '#2d88ff'
                  : '#0284c7',
                borderWidth: '1.5px',
              },
              '&.Mui-disabled': {
                bgcolor: isDark ? '#1e1f20' : '#f1f5f9',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? '#3a3b3c' : '#e2e8f0',
                },
              },
              '& .MuiOutlinedInput-input': {
                color: isDark ? '#e4e6eb' : '#0f172a',
                '&::placeholder': {
                  color: isDark ? '#71767b' : '#94a3b8',
                  opacity: 1,
                },
              },
            },
            '& .MuiInputLabel-root': {
              color: isDark ? '#b0b3b8' : '#64748b',
              '&.Mui-focused': {
                color: hasError ? '#ef4444' : isDark ? '#2d88ff' : '#0284c7',
              },
            },
            '& .MuiFormHelperText-root': {
              fontSize: '0.75rem',
              color: hasError ? '#ef4444' : isDark ? '#71767b' : '#64748b',
            },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...rest}
      />
    );
  }
);

CommonInput.displayName = 'CommonInput';
