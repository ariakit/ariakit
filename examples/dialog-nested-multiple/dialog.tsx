import * as React from "react";
import * as Ariakit from "@ariakit/react";

export interface DialogProps extends Ariakit.DialogProps {
  open?: boolean;
  onClose?: () => void;
  unmount?: boolean;
  animated?: boolean;
}

export const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  function Dialog({ open, onClose, unmount, animated, ...props }, ref) {
    const dialog = Ariakit.useDialogStore({
      open,
      setOpen: (open) => !open && onClose?.(),
      animated,
    });
    const mounted = dialog.useState((state) =>
      unmount ? state.mounted : true,
    );
    if (!mounted) return null;
    const dataAnimated = animated ? "" : undefined;
    return (
      <Ariakit.Dialog
        ref={ref}
        backdrop={<div data-animated={dataAnimated} className="backdrop" />}
        className="dialog"
        data-animated={dataAnimated}
        {...props}
        store={dialog}
      />
    );
  },
);

export const DialogHeading = React.forwardRef<
  HTMLHeadingElement,
  Ariakit.DialogHeadingProps
>(function DialogHeading(props, ref) {
  return <Ariakit.DialogHeading ref={ref} className="heading" {...props} />;
});

export const DialogDismiss = React.forwardRef<
  HTMLButtonElement,
  Ariakit.DialogDismissProps
>(function DialogDismiss(props, ref) {
  return <Ariakit.DialogDismiss ref={ref} className="button" {...props} />;
});

export const Button = React.forwardRef<HTMLButtonElement, Ariakit.ButtonProps>(
  function Button(props, ref) {
    return <Ariakit.Button ref={ref} className="button" {...props} />;
  },
);
