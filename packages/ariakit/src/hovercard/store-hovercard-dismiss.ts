import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import {
  PopoverDismissOptions,
  usePopoverDismiss,
} from "../popover/store-popover-dismiss";
import { HovercardStore } from "./store-hovercard-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a button that hides a hovercard.
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
 * A component that renders a button that hides a hovercard.
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

export type HovercardDismissOptions<T extends As = "button"> = Omit<
  PopoverDismissOptions<T>,
  "store"
> & {
  /**
   * Object returned by the `useHovercardStore` hook. If not provided, the
   * parent `Hovercard` component's context will be used.
   */
  store?: HovercardStore;
};

export type HovercardDismissProps<T extends As = "button"> = Props<
  HovercardDismissOptions<T>
>;
