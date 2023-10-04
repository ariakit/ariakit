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
    const dialog = Ariakit.useDialogStore();
    const mounted = dialog.useState((state) =>
      unmount ? state.mounted : true,
    );
    const dataAnimated = animated ? "" : undefined;
    return (
      <Ariakit.DialogProvider
        store={dialog}
        animated={animated}
        open={open}
        setOpen={(open) => {
          if (!open) {
            onClose?.();
          }
        }}
      >
        {mounted && (
          <Ariakit.Dialog
            ref={ref}
            backdrop={<div data-animated={dataAnimated} className="backdrop" />}
            className="dialog"
            data-animated={dataAnimated}
            {...props}
            store={dialog}
          />
        )}
      </Ariakit.DialogProvider>
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
