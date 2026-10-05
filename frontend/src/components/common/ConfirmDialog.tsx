import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from './Modal.js';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-[#1DCED8]/10 text-[#17B2BA]'}`}>
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-sm text-neutral-secondary">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-border">
          <button type="button" onClick={onClose} disabled={isLoading} className="btn-outline text-xs">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`text-xs ${isDestructive ? 'px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-btn font-medium' : 'btn-primary'}`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
