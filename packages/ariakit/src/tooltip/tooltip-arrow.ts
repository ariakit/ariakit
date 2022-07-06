import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  HovercardArrowOptions,
  useHovercardArrow,
} from "../hovercard/hovercard-arrow";
import { TooltipState } from "./tooltip-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an arrow inside a tooltip element.
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx
 * const state = useToolTipState();
 * const props = useTooltipArrow({ state });
 * <TooltipAnchor state={state}>Anchor</TooltipAnchor>
 * <Tooltip state={state}>
 *   <Role {...props} />
 *   Tooltip
 * </Tooltip>
 * ```
 */
export const useTooltipArrow = createHook<TooltipArrowOptions>(
  ({ state, size = 16, ...props }) => {
    props = useHovercardArrow({ state, size, ...props });
    return props;
  }
);

/**
 * A component that renders an arrow inside a `Tooltip` component.
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx
 * const tooltip = useTooltipState();
 * <TooltipAnchor state={tooltip}>Anchor</TooltipAnchor>
 * <Tooltip state={tooltip}>
 *   <TooltipArrow />
 *   Tooltip
 * </Tooltip>
 * ```
 */
export const TooltipArrow = createComponent<TooltipArrowOptions>((props) => {
  const htmlProps = useTooltipArrow(props);
  return createElement("div", htmlProps);
});

export type TooltipArrowOptions<T extends As = "div"> = Omit<
  HovercardArrowOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useTooltipState` hook. If not provided, the parent
   * `Tooltip` component's context will be used.
   */
  state?: TooltipState;
};

export type TooltipArrowProps<T extends As = "div"> = Props<
  TooltipArrowOptions<T>
>;
