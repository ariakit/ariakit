import type { ReactNode } from "react";
import * as Ariakit from "@ariakit/react";
import { DialogProvider } from "@ariakit/react-core/dialog/dialog-provider";

export interface ConfirmDialogProps {
  title?: ReactNode;
  description?: ReactNode;
  cancelLabel?: ReactNode;
  confirmLabel?: ReactNode;
  danger?: boolean;
  open?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function ConfirmDialog({
  title = "Confirm",
  description = "Are you sure?",
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  danger,
  open,
  onClose,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <DialogProvider
      open={open}
      setOpen={(open) => {
        if (!open) {
          onClose?.();
        }
      }}
    >
      <Ariakit.Dialog
        backdrop={<div className="backdrop" />}
        className="dialog"
      >
        {title && (
          <Ariakit.DialogHeading className="heading">
            {title}
          </Ariakit.DialogHeading>
        )}
        {description && (
          <Ariakit.DialogDescription className="description">
            {description}
          </Ariakit.DialogDescription>
        )}
        <div className="buttons">
          {confirmLabel && (
            <Ariakit.DialogDismiss
              className={`button${danger ? " danger" : ""}`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Ariakit.DialogDismiss>
          )}
          {cancelLabel && (
            <Ariakit.DialogDismiss
              className="button secondary"
              onClick={onCancel}
              autoFocus
            >
              {cancelLabel}
            </Ariakit.DialogDismiss>
          )}
        </div>
      </Ariakit.Dialog>
    </DialogProvider>
  );
}
