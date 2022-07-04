import { HTMLAttributes, forwardRef } from "react";
import {
  Dialog as BaseDialog,
  DialogProps as BaseDialogProps,
  DialogDismiss,
  DialogHeading,
  useDialogState,
} from "ariakit/dialog";
import useIsomorphicLayoutEffect from "use-isomorphic-layout-effect";

export type DialogProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  animated?: boolean;
  open?: boolean;
  backdrop?: boolean;
  onClose?: () => void;
  onUnmount?: () => void;
  initialFocusRef?: BaseDialogProps["initialFocusRef"];
  finalFocusRef?: BaseDialogProps["finalFocusRef"];
};

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  ({ title, animated, open, onClose, onUnmount, ...props }, ref) => {
    const dialog = useDialogState({
      animated,
      open,
      setOpen: (open) => {
        if (dialog.open !== open && !open) {
          onClose?.();
        }
      },
    });

    useIsomorphicLayoutEffect(() => {
      if (!dialog.mounted) {
        onUnmount?.();
      }
    }, [dialog.mounted]);

    return (
      <BaseDialog
        state={dialog}
        ref={ref}
        data-animated={animated ? "" : undefined}
        className="dialog"
        {...props}
      >
        <header className="header">
          <DialogHeading className="heading">{title}</DialogHeading>
          <DialogDismiss className="button dismiss" />
        </header>
        {props.children}
      </BaseDialog>
    );
  }
);
