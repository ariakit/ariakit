import * as React from "react";
import * as Ariakit from "@ariakit/react";

export interface DialogProps extends Omit<Ariakit.DialogProps, "store"> {
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
  const dialog = Ariakit.useDialogStore({
    open,
    setOpen: (open) => !open && onClose?.(),
    animated,
  });
  const mounted = dialog.useState((state) => (unmount ? state.mounted : true));
  if (!mounted) return null;
  const dataAnimated = animated ? "" : undefined;
  return (
    <Ariakit.Dialog
      backdrop={<div data-animated={dataAnimated} className="backdrop" />}
      className="dialog"
      data-animated={dataAnimated}
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
