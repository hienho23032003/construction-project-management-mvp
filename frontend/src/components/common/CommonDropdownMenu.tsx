import React, { useState } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  IconButton,
  Tooltip,
  SxProps,
  Theme,
  Box,
} from '@mui/material';
import { ChevronDown, MoreVertical } from 'lucide-react';

export interface DropdownMenuItem {
  id?: string;
  label: React.ReactNode | string;
  icon?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean; // Show divider after this item
  hidden?: boolean;
}

export interface CommonDropdownMenuProps {
  /** Trigger element (custom button/icon) or automatically renders a default trigger */
  trigger?: React.ReactNode | ((props: { isOpen: boolean; onClick: (e: React.MouseEvent<HTMLElement>) => void }) => React.ReactNode);
  /** Label for default button trigger */
  label?: string;
  /** Size for default button / icon button */
  size?: 'small' | 'medium';
  /** Variant for default button */
  variant?: 'contained' | 'outlined' | 'text';
  /** Color for default button */
  color?: 'primary' | 'secondary' | 'inherit' | 'error' | 'info' | 'success' | 'warning';
  /** Trigger as an IconButton (three dots) */
  iconOnly?: boolean;
  tooltip?: string;
  /** Menu items */
  items: DropdownMenuItem[];
  /** Menu alignment */
  align?: 'left' | 'right';
  /** Custom styles */
  buttonSx?: SxProps<Theme>;
  menuSx?: SxProps<Theme>;
  disabled?: boolean;
}

export const CommonDropdownMenu: React.FC<CommonDropdownMenuProps> = ({
  trigger,
  label = 'Tùy chọn',
  size = 'small',
  variant = 'outlined',
  color = 'inherit',
  iconOnly = false,
  tooltip,
  items,
  align = 'right',
  buttonSx,
  menuSx,
  disabled = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAnchorEl(null);
  };

  const visibleItems = items.filter((item) => !item.hidden);

  const renderTrigger = () => {
    if (typeof trigger === 'function') {
      return trigger({ isOpen: open, onClick: handleClick });
    }
    if (trigger) {
      return (
        <Box onClick={handleClick} sx={{ display: 'inline-flex' }}>
          {trigger}
        </Box>
      );
    }

    if (iconOnly) {
      const btn = (
        <IconButton
          size={size}
          disabled={disabled}
          onClick={handleClick}
          sx={{
            color: '#64748b',
            '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' },
            ...buttonSx,
          }}
        >
          <MoreVertical size={18} />
        </IconButton>
      );

      return tooltip ? <Tooltip title={tooltip}>{btn}</Tooltip> : btn;
    }

    return (
      <Button
        size={size}
        variant={variant}
        color={color}
        disabled={disabled}
        onClick={handleClick}
        endIcon={<ChevronDown size={16} />}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8125rem',
          borderRadius: '8px',
          borderColor: '#cbd5e1',
          ...buttonSx,
        }}
      >
        {label}
      </Button>
    );
  };

  return (
    <>
      {renderTrigger()}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => handleClose()}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{
          horizontal: align === 'right' ? 'right' : 'left',
          vertical: 'top',
        }}
        anchorOrigin={{
          horizontal: align === 'right' ? 'right' : 'left',
          vertical: 'bottom',
        }}
        PaperProps={{
          sx: {
            minWidth: 160,
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            py: 0.5,
            ...menuSx,
          },
        }}
      >
        {visibleItems.map((item, idx) => (
          <React.Fragment key={item.id || `menu-item-${idx}`}>
            <MenuItem
              disabled={item.disabled}
              onClick={(e) => {
                handleClose(e);
                if (item.onClick) item.onClick(e);
              }}
              sx={{
                fontSize: '0.825rem',
                fontWeight: 600,
                py: 1,
                px: 1.5,
                color: item.danger ? '#ef4444' : '#1e293b',
                '&:hover': {
                  bgcolor: item.danger ? '#fee2e2' : '#f8fafc',
                  color: item.danger ? '#b91c1c' : '#0284c7',
                },
              }}
            >
              {item.icon && (
                <ListItemIcon
                  sx={{
                    minWidth: 28,
                    color: item.danger ? 'inherit' : '#64748b',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
              )}
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: 'inherit',
                }}
              />
            </MenuItem>
            {item.divider && <Divider sx={{ my: 0.5, borderColor: '#f1f5f9' }} />}
          </React.Fragment>
        ))}
      </Menu>
    </>
  );
};
