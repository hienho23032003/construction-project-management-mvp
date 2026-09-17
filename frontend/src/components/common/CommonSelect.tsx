import React, { useMemo } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Typography,
  Chip,
  Checkbox,
  ListItemText,
  ListItemIcon,
  IconButton,
  InputAdornment,
  ListSubheader,
  SelectChangeEvent,
  SxProps,
  Theme,
} from '@mui/material';
import { X, ChevronDown } from 'lucide-react';

export interface DropdownOption<V = string | number> {
  value: V;
  label: React.ReactNode | string;
  icon?: React.ReactNode;
  description?: string;
  color?: string; // Color dot or chip background
  disabled?: boolean;
  group?: string; // Grouping label
}

export type RawOption<V = string | number> = DropdownOption<V> | V;

export interface CommonSelectProps<V = string | number, Multiple extends boolean = false> {
  /** Unique ID or name for the form control */
  id?: string;
  name?: string;
  /** Label for floating input label */
  label?: string;
  /** Placeholder when no item is selected */
  placeholder?: string;
  /** Array of options (supports objects or primitive values) */
  options: RawOption<V>[];
  /** Currently selected value (single or array for multi-select) */
  value?: Multiple extends true ? V[] : V | '';
  /** Change event handler */
  onChange?: (
    value: Multiple extends true ? V[] : V,
    selectedOption?: Multiple extends true ? DropdownOption<V>[] : DropdownOption<V>
  ) => void;
  /** Multi-select mode */
  multiple?: Multiple;
  /** Disabled state */
  disabled?: boolean;
  /** Required validation indicator */
  required?: boolean;
  /** Error state */
  error?: boolean;
  /** Helper text or error message below input */
  helperText?: React.ReactNode;
  /** Size variant */
  size?: 'small' | 'medium';
  /** Width of the dropdown */
  width?: number | string | { xs?: number | string; sm?: number | string; md?: number | string; lg?: number | string };
  /** Minimum width for toolbar filter controls */
  minWidth?: number | string | { xs?: number | string; sm?: number | string; md?: number | string; lg?: number | string };
  /** Maximum width */
  maxWidth?: number | string | { xs?: number | string; sm?: number | string; md?: number | string; lg?: number | string };
  /** Full width stretching (default: false) */
  fullWidth?: boolean;
  /** Adds a top "All / Tất cả" option for quick filter bars */
  allOption?: boolean | { label?: string; value?: V };
  /** Show clear (X) button */
  clearable?: boolean;
  /** Icon or adornment at start of select */
  startAdornment?: React.ReactNode;
  /** Custom render for dropdown menu items */
  renderOption?: (option: DropdownOption<V>, isSelected: boolean) => React.ReactNode;
  /** Custom render for selected display value */
  renderValue?: (selected: Multiple extends true ? V[] : V) => React.ReactNode;
  /** Display multiple selections as styled Chips */
  renderChips?: boolean;
  /** Custom styles */
  sx?: SxProps<Theme>;
  formControlSx?: SxProps<Theme>;
  selectSx?: SxProps<Theme>;
  menuSx?: SxProps<Theme>;
  variant?: 'outlined' | 'filled' | 'standard';
}

export function CommonSelect<V extends string | number = string, Multiple extends boolean = false>({
  id,
  name,
  label,
  placeholder,
  options,
  value,
  onChange,
  multiple = false as Multiple,
  disabled = false,
  required = false,
  error = false,
  helperText,
  size = 'small',
  width,
  minWidth,
  maxWidth,
  fullWidth = false,
  allOption,
  clearable = false,
  startAdornment,
  renderOption,
  renderValue,
  renderChips = true,
  sx,
  formControlSx,
  selectSx,
  menuSx,
  variant = 'outlined',
}: CommonSelectProps<V, Multiple>) {
  // Normalize raw options into structured DropdownOption objects
  const normalizedOptions: DropdownOption<V>[] = useMemo(() => {
    const list: DropdownOption<V>[] = [];

    // Prepend "All" option if enabled
    if (allOption) {
      const allLabel = typeof allOption === 'object' && allOption.label ? allOption.label : 'Tất cả';
      const allVal = (typeof allOption === 'object' && allOption.value !== undefined ? allOption.value : ('ALL' as unknown)) as V;
      list.push({
        value: allVal,
        label: allLabel,
      });
    }

    options.forEach((opt) => {
      if (typeof opt === 'object' && opt !== null && 'value' in opt) {
        list.push(opt as DropdownOption<V>);
      } else {
        list.push({
          value: opt as V,
          label: String(opt),
        });
      }
    });

    return list;
  }, [options, allOption]);

  // Lookup map for fast value-to-option resolution
  const optionMap = useMemo(() => {
    const map = new Map<V, DropdownOption<V>>();
    normalizedOptions.forEach((opt) => {
      map.set(opt.value, opt);
    });
    return map;
  }, [normalizedOptions]);

  // Handle change event
  const handleChange = (e: SelectChangeEvent<any>) => {
    const nextVal = e.target.value;
    if (onChange) {
      if (multiple && Array.isArray(nextVal)) {
        const selectedOpts = nextVal.map((v) => optionMap.get(v)).filter(Boolean) as DropdownOption<V>[];
        onChange(nextVal as any, selectedOpts as any);
      } else {
        const selectedOpt = optionMap.get(nextVal);
        onChange(nextVal as any, selectedOpt as any);
      }
    }
  };

  // Clear handler
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange) {
      if (multiple) {
        onChange([] as any, [] as any);
      } else {
        onChange('' as any, undefined);
      }
    }
  };

  // Group options if group property is present
  const groupedOptions = useMemo(() => {
    const hasGroups = normalizedOptions.some((opt) => Boolean(opt.group));
    if (!hasGroups) return null;

    const groups: { name: string; items: DropdownOption<V>[] }[] = [];
    const groupMap = new Map<string, DropdownOption<V>[]>();

    normalizedOptions.forEach((opt) => {
      const gName = opt.group || 'Khác';
      let gList = groupMap.get(gName);
      if (!gList) {
        gList = [];
        groupMap.set(gName, gList);
        groups.push({ name: gName, items: gList });
      }
      gList.push(opt);
    });

    return groups;
  }, [normalizedOptions]);

  // Default render for selected value
  const defaultRenderValue = (selected: any) => {
    if (selected === '' || selected === undefined || selected === null || (Array.isArray(selected) && selected.length === 0)) {
      if (placeholder) {
        return (
          <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            {placeholder}
          </Typography>
        );
      }
      return '';
    }

    // Multi-select rendering
    if (multiple && Array.isArray(selected)) {
      if (renderChips) {
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((val) => {
              const opt = optionMap.get(val);
              const label = opt ? (typeof opt.label === 'string' ? opt.label : val) : val;
              return (
                <Chip
                  key={String(val)}
                  label={label}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.75rem',
                    bgcolor: opt?.color || '#e0f2fe',
                    color: opt?.color ? '#ffffff' : '#0369a1',
                    fontWeight: 600,
                  }}
                />
              );
            })}
          </Box>
        );
      }
      return selected
        .map((val) => {
          const opt = optionMap.get(val);
          return opt ? (typeof opt.label === 'string' ? opt.label : val) : val;
        })
        .join(', ');
    }

    // Single select rendering
    const opt = optionMap.get(selected);
    if (!opt) return String(selected);

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
        {opt.icon && <Box sx={{ display: 'flex', alignItems: 'center', color: '#64748b' }}>{opt.icon}</Box>}
        {opt.color && (
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: opt.color,
              flexShrink: 0,
            }}
          />
        )}
        <Typography
          variant="body2"
          noWrap
          sx={{
            fontWeight: 600,
            fontSize: '0.85rem',
            color: 'text.primary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {opt.label}
        </Typography>
      </Box>
    );
  };

  const hasValue =
    value !== undefined &&
    value !== null &&
    value !== '' &&
    (!Array.isArray(value) || value.length > 0);

  const inputLabelId = id ? `${id}-label` : undefined;

  return (
    <FormControl
      fullWidth={fullWidth}
      size={size}
      error={error}
      disabled={disabled}
      required={required}
      variant={variant}
      sx={[
        ...(width !== undefined ? [{ width }] : []),
        ...(minWidth !== undefined ? [{ minWidth }] : !fullWidth && width === undefined ? [{ minWidth: 140 }] : []),
        ...(maxWidth !== undefined ? [{ maxWidth }] : []),
        ...(Array.isArray(formControlSx) ? formControlSx : formControlSx ? [formControlSx] : []),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {label && <InputLabel id={inputLabelId}>{label}</InputLabel>}
      <Select
        labelId={inputLabelId}
        id={id}
        name={name}
        value={value ?? (multiple ? ([] as any) : '')}
        label={label}
        multiple={multiple}
        onChange={handleChange}
        displayEmpty={Boolean(placeholder)}
        renderValue={renderValue ? (renderValue as any) : defaultRenderValue}
        startAdornment={
          startAdornment ? (
            <InputAdornment position="start" sx={{ mr: 0.5 }}>
              {startAdornment}
            </InputAdornment>
          ) : undefined
        }
        endAdornment={
          clearable && hasValue && !disabled ? (
            <InputAdornment position="end" sx={{ mr: 1 }}>
              <IconButton size="small" onClick={handleClear} sx={{ p: 0.25, color: '#94a3b8' }}>
                <X size={14} />
              </IconButton>
            </InputAdornment>
          ) : undefined
        }
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: 320,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              mt: 0.5,
              ...menuSx,
            },
          },
        }}
        sx={{
          borderRadius: '8px',
          bgcolor: 'background.paper',
          fontSize: '0.85rem',
          fontWeight: 600,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: (theme: any) => theme.palette.mode === 'dark' ? '#3a3b3c' : '#cbd5e1',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#0284c7',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#0284c7',
          },
          '& .MuiSelect-select': {
            py: size === 'small' ? '7.5px' : '10.5px',
          },
          ...selectSx,
        }}
      >
        {groupedOptions
          ? groupedOptions.map((group) => [
              <ListSubheader
                key={`subheader-${group.name}`}
                sx={{
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#18191a' : '#f8fafc',
                  color: 'text.secondary',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  lineHeight: '28px',
                }}
              >
                {group.name}
              </ListSubheader>,
              ...group.items.map((opt) => {
                const isSelected = multiple
                  ? Array.isArray(value) && value.includes(opt.value)
                  : value === opt.value;

                return (
                  <MenuItem
                    key={String(opt.value)}
                    value={opt.value as any}
                    disabled={opt.disabled}
                    sx={{
                      fontSize: '0.825rem',
                      fontWeight: isSelected ? 700 : 500,
                      py: 1,
                      px: 1.5,
                      color: 'text.primary',
                      '&.Mui-selected': {
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(45, 136, 255, 0.16) !important' : 'rgba(2, 132, 199, 0.08) !important',
                        color: 'primary.main',
                      },
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    {renderOption ? (
                      renderOption(opt, isSelected)
                    ) : (
                      <>
                        {multiple && (
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            sx={{ p: 0.5, mr: 1, color: 'text.disabled', '&.Mui-checked': { color: 'primary.main' } }}
                          />
                        )}
                        {opt.icon && <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}>{opt.icon}</ListItemIcon>}
                        {opt.color && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: opt.color,
                              mr: 1,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <ListItemText
                          primary={opt.label}
                          secondary={opt.description}
                          primaryTypographyProps={{
                            fontSize: '0.825rem',
                            fontWeight: isSelected ? 700 : 500,
                            color: 'inherit',
                          }}
                          secondaryTypographyProps={{
                            fontSize: '0.725rem',
                            color: 'text.secondary',
                          }}
                        />
                      </>
                    )}
                  </MenuItem>
                );
              }),
            ])
          : normalizedOptions.map((opt) => {
              const isSelected = multiple
                ? Array.isArray(value) && value.includes(opt.value)
                : value === opt.value;

              return (
                <MenuItem
                  key={String(opt.value)}
                  value={opt.value as any}
                  disabled={opt.disabled}
                  sx={{
                    fontSize: '0.825rem',
                    fontWeight: isSelected ? 700 : 500,
                    py: 1,
                    px: 1.5,
                    color: 'text.primary',
                    '&.Mui-selected': {
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(45, 136, 255, 0.16) !important' : 'rgba(2, 132, 199, 0.08) !important',
                      color: 'primary.main',
                    },
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  {renderOption ? (
                    renderOption(opt, isSelected)
                  ) : (
                    <>
                      {multiple && (
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          sx={{ p: 0.5, mr: 1, color: 'text.disabled', '&.Mui-checked': { color: 'primary.main' } }}
                        />
                      )}
                      {opt.icon && <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}>{opt.icon}</ListItemIcon>}
                      {opt.color && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: opt.color,
                            mr: 1,
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <ListItemText
                        primary={opt.label}
                        secondary={opt.description}
                        primaryTypographyProps={{
                          fontSize: '0.825rem',
                          fontWeight: isSelected ? 700 : 500,
                          color: 'inherit',
                        }}
                        secondaryTypographyProps={{
                          fontSize: '0.725rem',
                          color: 'text.secondary',
                        }}
                      />
                    </>
                  )}
                </MenuItem>
              );
            })}
      </Select>
      {helperText && <FormHelperText sx={{ mx: 0.5 }}>{helperText}</FormHelperText>}
    </FormControl>
  );
}
