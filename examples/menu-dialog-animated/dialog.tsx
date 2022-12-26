import { HTMLAttributes, forwardRef } from "react";
import * as Ariakit from "@ariakit/react";
import useIsomorphicLayoutEffect from "use-isomorphic-layout-effect";

export type DialogProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  animated?: boolean;
  open?: boolean;
  backdrop?: boolean;
  onClose?: () => void;
  onUnmount?: () => void;
  initialFocusRef?: Ariakit.DialogProps["initialFocusRef"];
  finalFocusRef?: Ariakit.DialogProps["finalFocusRef"];
};

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  ({ title, animated, open, onClose, onUnmount, ...props }, ref) => {
    const dialog = Ariakit.useDialogStore({
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
      <Ariakit.Dialog
        store={dialog}
        ref={ref}
        data-animated={animated ? "" : undefined}
        className="dialog"
        {...props}
      >
        <header className="header">
          <Ariakit.DialogHeading className="heading">
            {title}
          </Ariakit.DialogHeading>
          <Ariakit.DialogDismiss className="button secondary dismiss" />
        </header>
        {props.children}
      </Ariakit.Dialog>
    );
  }
);
