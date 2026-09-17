import React from 'react';
import { Typography } from '@mui/material';
import { CommonDialog } from './CommonDialog';
import { CommonButton } from './CommonButton';
import { AlertTriangle, Info } from 'lucide-react';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'error' | 'primary' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
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
  loading = false,
}) => {
  const getButtonVariant = () => {
    if (confirmColor === 'error') return 'danger';
    if (confirmColor === 'warning') return 'primary';
    return 'primary';
  };

  const isWarningOrDanger = confirmColor === 'error' || confirmColor === 'warning';

  return (
    <CommonDialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      title={title}
      icon={
        isWarningOrDanger ? (
          <AlertTriangle size={20} color={confirmColor === 'error' ? '#ef4444' : '#f59e0b'} />
        ) : (
          <Info size={20} color="#2d88ff" />
        )
      }
      actions={
        <>
          <CommonButton variant="outline" onClick={onCancel} disabled={loading}>
            {cancelText}
          </CommonButton>
          <CommonButton
            variant={getButtonVariant()}
            onClick={onConfirm}
            loading={loading}
            autoFocus
          >
            {confirmText}
          </CommonButton>
        </>
      }
    >
      <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6, py: 1 }}>
        {message}
      </Typography>
    </CommonDialog>
  );
};

