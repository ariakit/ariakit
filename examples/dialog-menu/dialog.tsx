import * as React from "react";
import * as Ariakit from "@ariakit/react";

export interface DialogProps extends Omit<Ariakit.DialogProps, "store"> {
  open?: boolean;
  onClose?: () => void;
}

export const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  function Dialog({ open, onClose, ...props }, ref) {
    const dialog = Ariakit.useDialogStore({
      open,
      setOpen: (open) => !open && onClose?.(),
    });
    return (
      <Ariakit.Dialog
        ref={ref}
        backdrop={<div className="backdrop" />}
        {...props}
        store={dialog}
      />
    );
  },
);

export { DialogHeading, DialogDismiss } from "@ariakit/react";
