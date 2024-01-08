import type { MouseEvent } from "react";
import { useMemo } from "react";
import type { ButtonOptions } from "../button/button.js";
import { useButton } from "../button/button.js";
import { useEvent } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useDialogScopedContext } from "./dialog-context.js";
import type { DialogStore } from "./dialog-store.js";

/**
 * Returns props to create a `DialogDismiss` component.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * const store = useDialogStore();
 * const props = useDialogDismiss({ store });
 * <Dialog store={store}>
 *   <Role {...props} />
 * </Dialog>
 * ```
 */
export const useDialogDismiss = createHook<DialogDismissOptions>(
  ({ store, ...props }) => {
    const context = useDialogScopedContext();
    store = store || context;

    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      store?.hide();
    });

    const children = useMemo(
      () => (
        <svg
          aria-label="Dismiss popup"
          display="block"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5pt"
          viewBox="0 0 16 16"
          height="1em"
          width="1em"
        >
          <line x1="4" y1="4" x2="12" y2="12" />
          <line x1="4" y1="12" x2="12" y2="4" />
        </svg>
      ),
      [],
    );

    props = {
      "data-dialog-dismiss": "",
      children,
      ...props,
      onClick,
    };

    props = useButton(props);

    return props;
  },
);

/**
 * Renders a button that hides a
 * [`Dialog`](https://ariakit.org/reference/dialog) when clicked.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx {4}
 * const [open, setOpen] = useState(false);
 *
 * <Dialog open={open} onClose={() => setOpen(false)}>
 *   <DialogDismiss />
 * </Dialog>
 * ```
 */
export const DialogDismiss = createComponent<DialogDismissOptions>((props) => {
  const htmlProps = useDialogDismiss(props);
  return createElement("button", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  DialogDismiss.displayName = "DialogDismiss";
}

export interface DialogDismissOptions<T extends As = "button">
  extends ButtonOptions<T> {
  /**
   * Object returned by the
   * [`useDialogStore`](https://ariakit.org/reference/use-dialog-store) hook. If
   * not provided, the closest [`Dialog`](https://ariakit.org/reference/dialog)
   * component's context will be used.
   */
  store?: DialogStore;
}

export type DialogDismissProps<T extends As = "button"> = Props<
  DialogDismissOptions<T>
>;
