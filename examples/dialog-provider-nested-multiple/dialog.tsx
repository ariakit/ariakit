import * as React from "react";
import * as Ariakit from "@ariakit/react";
import { DialogProvider } from "@ariakit/react-core/dialog/dialog-provider";

export interface DialogProps extends Ariakit.DialogProps {
  open?: boolean;
  onClose?: () => void;
  unmount?: boolean;
  animated?: boolean;
}

export function Dialog({
  open,
  onClose,
  unmount,
  animated,
  ...props
}: DialogProps) {
  const dialog = Ariakit.useDialogStore();
  const mounted = dialog.useState((state) => (unmount ? state.mounted : true));
  const dataAnimated = animated ? "" : undefined;
  return (
    <DialogProvider
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
          backdrop={<div data-animated={dataAnimated} className="backdrop" />}
          className="dialog"
          data-animated={dataAnimated}
          {...props}
          store={dialog}
        />
      )}
    </DialogProvider>
  );
}

export function DialogHeading(props: React.ComponentPropsWithoutRef<"h1">) {
  return <Ariakit.DialogHeading className="heading" {...props} />;
}

export function DialogDismiss(props: React.ComponentPropsWithoutRef<"button">) {
  return <Ariakit.DialogDismiss className="button" {...props} />;
}

export function Button(props: React.ComponentPropsWithoutRef<"button">) {
  return <Ariakit.Button className="button" {...props} />;
}
