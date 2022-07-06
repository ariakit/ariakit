import { HTMLAttributes } from "react";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, BooleanOrCallback, Props } from "ariakit-utils/types";
import { HovercardOptions, useHovercard } from "ariakit/hovercard";
import { TooltipState } from "./tooltip-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a tooltip element.
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx
 * const state = useToolTipState();
 * const props = useTooltip({ state });
 * <TooltipAnchor state={state}>Anchor</TooltipAnchor>
 * <Role {...props}>Tooltip</Role>
 * ```
 */
export const useTooltip = createHook<TooltipOptions>(
  ({ state, portal = true, ...props }) => {
    props = {
      role: "tooltip",
      ...props,
    };

    // TODO: Disable other props.
    props = useHovercard({
      state,
      portal,
      ...props,
      preserveTabOrder: false,
    });

    return props;
  }
);

/**
 * A component that renders a tooltip element.
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx
 * const tooltip = useTooltipState();
 * <TooltipAnchor state={tooltip}>Anchor</TooltipAnchor>
 * <Tooltip state={tooltip}>Tooltip</Tooltip>
 * ```
 */
export const Tooltip = createComponent<TooltipOptions>((props) => {
  const htmlProps = useTooltip(props);
  return createElement("div", htmlProps);
});

export type TooltipOptions<T extends As = "div"> = Omit<
  HovercardOptions<T>,
  "state" | "preserveTabOrder"
> & {
  /**
   * Object returned by the `useTooltipState` hook.
   */
  state: TooltipState;
  /**
   * Determines whether the tooltip will be hidden when the user presses the
   * Escape key.
   * @default true
   */
  hideOnEscape?: BooleanOrCallback<KeyboardEvent>;
  /**
   * Determines whether the tooltip will be hidden when the user presses the
   * Control key. This has been proposed as an alternative to the Escape key,
   * which may introduce some issues, especially when tooltips are used within
   * dialogs that also hide on Escape. See
   * https://github.com/w3c/aria-practices/issues/1506
   * @default false
   */
  hideOnControl?: BooleanOrCallback<KeyboardEvent>;
  /**
   * Props that will be passed to the popover wrapper element. This element will
   * be used to position the popover.
   */
  wrapperProps?: HTMLAttributes<HTMLDivElement>;
};

export type TooltipProps<T extends As = "div"> = Props<TooltipOptions<T>>;
