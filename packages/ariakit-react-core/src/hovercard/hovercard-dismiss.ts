import type { PopoverDismissOptions } from "../popover/popover-dismiss.js";
import { usePopoverDismiss } from "../popover/popover-dismiss.js";
import { createElement, createHook2 } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useHovercardScopedContext } from "./hovercard-context.js";
import type { HovercardStore } from "./hovercard-store.js";

/**
 * Returns props to create a `HovercardDismiss` component.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * const store = useHovercardStore();
 * const props = useHovercardDismiss({ store });
 * <Hovercard store={store}>
 *   <Role {...props} />
 * </Hovercard>
 * ```
 */
export const useHovercardDismiss = createHook2<
  TagName,
  HovercardDismissOptions
>(({ store, ...props }) => {
  const context = useHovercardScopedContext();
  store = store || context;
  props = usePopoverDismiss({ store, ...props });
  return props;
});

/**
 * Renders a button that hides a
 * [`Hovercard`](https://ariakit.org/reference/hovercard) when clicked.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx {3}
 * <HovercardProvider>
 *   <Hovercard>
 *     <HovercardDismiss />
 *   </Hovercard>
 * </HovercardProvider>
 * ```
 */
export const HovercardDismiss = forwardRef(function HovercardDismiss(
  props: HovercardDismissProps,
) {
  const htmlProps = useHovercardDismiss(props);
  return createElement("button", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  HovercardDismiss.displayName = "HovercardDismiss";
}

export interface HovercardDismissOptions<T extends As = "button">
  extends PopoverDismissOptions<T> {
  /**
   * Object returned by the
   * [`useHovercardStore`](https://ariakit.org/reference/use-hovercard-store)
   * hook. If not provided, the closest
   * [`Hovercard`](https://ariakit.org/reference/hovercard) or
   * [`HovercardProvider`](https://ariakit.org/reference/hovercard-provider)
   * components' context will be used.
   */
  store?: HovercardStore;
}

export type HovercardDismissProps<T extends As = "button"> = Props<
  HovercardDismissOptions<T>
>;
