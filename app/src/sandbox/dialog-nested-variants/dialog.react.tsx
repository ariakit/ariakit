import * as Ariakit from "@ariakit/react";
import * as React from "react";

export interface DialogProps extends Ariakit.DialogProps {
  animated?: boolean;
}

export const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  function Dialog({ animated, ...props }, ref) {
    const dialog = Ariakit.useDialogStore({ animated });
    const dataAnimated = animated ? "" : undefined;
    return (
      <Ariakit.Dialog
        ref={ref}
        backdrop={
          <div
            data-animated={dataAnimated}
            className="backdrop fixed inset-0 bg-black/20 data-[animated]:opacity-0 data-[animated]:transition-opacity data-[animated]:data-enter:opacity-100"
          />
        }
        className="dialog fixed inset-x-4 top-[10vh] z-50 mx-auto flex h-fit max-h-[80vh] max-w-md flex-col gap-4 overflow-auto rounded bg-white p-6 data-[animated]:opacity-0 data-[animated]:transition-opacity data-[animated]:data-enter:opacity-100"
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
