import type { DialogDismissOptions } from "../dialog/dialog-dismiss.js";
import { useDialogDismiss } from "../dialog/dialog-dismiss.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { usePopoverScopedContext } from "./popover-context.js";
import type { PopoverStore } from "./popover-store.js";

/**
 * Returns props to create a `PopoverDismiss` component.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const store = usePopoverStore();
 * const props = usePopoverDismiss({ store });
 * <Popover store={store}>
 *   <Role {...props} />
 * </Popover>
 * ```
 */
export const usePopoverDismiss = createHook<PopoverDismissOptions>(
  ({ store, ...props }) => {
    const context = usePopoverScopedContext();
    store = store || context;
    props = useDialogDismiss({ store, ...props });
    return props;
  },
);

/**
 * Renders a button that hides a
 * [`Popover`](https://ariakit.org/reference/popover) component when clicked.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * <PopoverProvider>
 *   <Popover>
 *     <PopoverDismiss />
 *   </Popover>
 * </PopoverProvider>
 * ```
 */
export const PopoverDismiss = createComponent<PopoverDismissOptions>(
  (props) => {
    const htmlProps = usePopoverDismiss(props);
    return createElement("button", htmlProps);
  },
);

if (process.env.NODE_ENV !== "production") {
  PopoverDismiss.displayName = "PopoverDismiss";
}

export interface PopoverDismissOptions<T extends As = "button">
  extends DialogDismissOptions<T> {
  /**
   * Object returned by the
   * [`usePopoverStore`](https://ariakit.org/reference/use-popover-store) hook.
   * If not provided, the closest
   * [`Popover`](https://ariakit.org/reference/popover) or
   * [`PopoverProvider`](https://ariakit.org/reference/popover-provider)
   * components' context will be used.
   */
  store?: PopoverStore;
}

export type PopoverDismissProps<T extends As = "button"> = Props<
  PopoverDismissOptions<T>
>;
