import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'error' | 'primary' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  confirmColor = 'error',
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          fontWeight: 700,
          pb: 1,
          px: 3,
          pt: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>
          {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onCancel}
          size="small"
          sx={{
            color: '#94a3b8',
            '&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' },
          }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: '#475569' }}>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} variant="outlined" color="inherit">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColor} autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
