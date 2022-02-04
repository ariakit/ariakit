import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  PopoverDismissOptions,
  usePopoverDismiss,
} from "../popover/popover-dismiss";
import { HovercardState } from "./hovercard-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a button that hides a hovercard.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * const state = useHovercardState();
 * const props = useHovercardDismiss({ state });
 * <Hovercard state={state}>
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
 * const hovercard = useHovercardState();
 * <Hovercard state={hovercard}>
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

export type HovercardDismissOptions<T extends As = "button"> = Omit<
  PopoverDismissOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useHovercardState` hook. If not provided, the
   * parent `Hovercard` component's context will be used.
   */
  state?: HovercardState;
};

export type HovercardDismissProps<T extends As = "button"> = Props<
  HovercardDismissOptions<T>
>;
