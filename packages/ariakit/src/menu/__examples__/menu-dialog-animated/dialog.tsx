import { HTMLAttributes, forwardRef } from "react";
import {
  Dialog as BaseDialog,
  DialogProps as BaseDialogProps,
  DialogDismiss,
  DialogHeading,
  useDialogStore,
} from "ariakit/dialog/store";
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
    const dialog = useDialogStore({
      animated,
      open,
      setOpen: (open) => {
        if (dialog.getState().open !== open && !open) {
          onClose?.();
        }
      },
    });

    const mounted = dialog.useState("mounted");

    useIsomorphicLayoutEffect(() => {
      if (!mounted) {
        onUnmount?.();
      }
    }, [mounted]);

    return (
      <BaseDialog
        store={dialog}
        ref={ref}
        data-animated={animated ? "" : undefined}
        className="dialog"
        {...props}
      >
        <header className="header">
          <DialogHeading className="heading">{title}</DialogHeading>
          <DialogDismiss className="button secondary dismiss" />
        </header>
        {props.children}
      </BaseDialog>
    );
  }
);
