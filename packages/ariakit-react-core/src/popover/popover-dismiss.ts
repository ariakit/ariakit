import type { DialogDismissOptions } from "../dialog/dialog-dismiss.js";
import { useDialogDismiss } from "../dialog/dialog-dismiss.js";
import { createElement, createHook2 } from "../utils/system.js";
import type { Props2 } from "../utils/types.js";
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
export const usePopoverDismiss = createHook2<TagName, PopoverDismissOptions>(
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
 * ```jsx {3}
 * <PopoverProvider>
 *   <Popover>
 *     <PopoverDismiss />
 *   </Popover>
 * </PopoverProvider>
 * ```
 */
export const PopoverDismiss = forwardRef(function PopoverDismiss(
  props: PopoverDismissProps,
) {
  const htmlProps = usePopoverDismiss(props);
  return createElement(TagName, htmlProps);
});

export interface PopoverDismissOptions<T extends ElementType = TagName>
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

export type PopoverDismissProps<T extends ElementType = TagName> = Props2<
  T,
  PopoverDismissOptions<T>
>;
