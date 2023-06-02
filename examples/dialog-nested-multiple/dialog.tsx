import * as React from "react";
import * as Ariakit from "@ariakit/react";

export interface DialogProps extends Omit<Ariakit.DialogProps, "store"> {
  open?: boolean;
  onClose?: () => void;
  unmount?: boolean;
}

export function Dialog({ open, onClose, unmount, ...props }: DialogProps) {
  const dialog = Ariakit.useDialogStore({
    open,
    setOpen: (open) => !open && onClose?.(),
  });
  const mounted = dialog.useState((state) => (unmount ? state.mounted : true));
  if (!mounted) return null;
  return (
    <Ariakit.Dialog
      backdrop={<div className="backdrop" />}
      className="dialog"
      {...props}
      store={dialog}
    />
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
