import type { PopoverDismissOptions } from "../popover/popover-dismiss.js";
import { usePopoverDismiss } from "../popover/popover-dismiss.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
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
export const useHovercardDismiss = createHook<HovercardDismissOptions>(
  (props) => {
    props = usePopoverDismiss(props);
    return props;
  }
);

/**
 * Renders a button that hides a hovercard.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * const hovercard = useHovercardStore();
 * <Hovercard store={hovercard}>
 *   <HovercardDismiss />
 * </Hovercard>
 * ```
 */
export const HovercardDismiss = createComponent<HovercardDismissOptions>(
  (props) => {
    const htmlProps = useHovercardDismiss(props);
    return createElement("button", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  HovercardDismiss.displayName = "HovercardDismiss";
}

export interface HovercardDismissOptions<T extends As = "button">
  extends PopoverDismissOptions<T> {
  /**
   * Object returned by the `useHovercardStore` hook. If not provided, the
   * parent `Hovercard` component's context will be used.
   */
  store?: HovercardStore;
}

export type HovercardDismissProps<T extends As = "button"> = Props<
  HovercardDismissOptions<T>
>;
