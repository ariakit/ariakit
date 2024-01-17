import type { ElementType } from "react";
import type { PopoverDismissOptions } from "../popover/popover-dismiss.js";
import { usePopoverDismiss } from "../popover/popover-dismiss.js";
import { createElement, createHook, forwardRef } from "../utils/system.js";
import type { Props } from "../utils/types.js";
import { useHovercardScopedContext } from "./hovercard-context.js";
import type { HovercardStore } from "./hovercard-store.js";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;

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
export const useHovercardDismiss = createHook<TagName, HovercardDismissOptions>(
  function useHovercardDismiss({ store, ...props }) {
    const context = useHovercardScopedContext();
    store = store || context;
    props = usePopoverDismiss({ store, ...props });
    return props;
  },
);

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
  return createElement(TagName, htmlProps);
});

export interface HovercardDismissOptions<T extends ElementType = TagName>
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

export type HovercardDismissProps<T extends ElementType = TagName> = Props<
  T,
  HovercardDismissOptions<T>
>;
