import type { FocusEvent, MouseEvent } from "react";
import type { PopoverAnchorOptions } from "../popover/popover-anchor.js";
import { usePopoverAnchor } from "../popover/popover-anchor.js";
import { useEvent } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { TooltipStore } from "./tooltip-store.js";

/**
 * Returns props to create a `TooltipAnchor` component.
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx
 * const store = useToolTipStore();
 * const props = useTooltipAnchor({ store });
 * <Role {...props}>Anchor</Role>
 * <Tooltip store={store}>Tooltip</Tooltip>
 * ```
 */
export const useTooltipAnchor = createHook<TooltipAnchorOptions>(
  ({ store, described, ...props }) => {
    const onFocusProp = props.onFocus;

    const onFocus = useEvent((event: FocusEvent<HTMLDivElement>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;
      store.setAnchorElement(event.currentTarget);
      store.show();
    });

    const onBlurProp = props.onBlur;

    const onBlur = useEvent((event: FocusEvent<HTMLDivElement>) => {
      onBlurProp?.(event);
      if (event.defaultPrevented) return;
      store.hide();
    });

    const onMouseEnterProp = props.onMouseEnter;

    const onMouseEnter = useEvent((event: MouseEvent<HTMLDivElement>) => {
      onMouseEnterProp?.(event);
      if (event.defaultPrevented) return;
      store.setAnchorElement(event.currentTarget);
      store.show();
    });

    const onMouseLeaveProp = props.onMouseLeave;

    const onMouseLeave = useEvent((event: MouseEvent<HTMLDivElement>) => {
      onMouseLeaveProp?.(event);
      if (event.defaultPrevented) return;
      store.hide();
    });

    const contentElement = store.useState("contentElement");

    props = {
      tabIndex: 0,
      "aria-labelledby": !described ? contentElement?.id : undefined,
      "aria-describedby": described ? contentElement?.id : undefined,
      ...props,
      onFocus,
      onBlur,
      onMouseEnter,
      onMouseLeave,
    };

    props = usePopoverAnchor({ store, ...props });

    return props;
  }
);

/**
 * Renders an element that will be labelled or described by a `Tooltip`
 * component. This component will also be used as the reference to position the
 * tooltip on the screen.
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx
 * const tooltip = useTooltipStore();
 * <TooltipAnchor store={tooltip}>Anchor</TooltipAnchor>
 * <Tooltip store={tooltip}>Tooltip</Tooltip>
 * ```
 */
export const TooltipAnchor = createComponent<TooltipAnchorOptions>((props) => {
  const htmlProps = useTooltipAnchor(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  TooltipAnchor.displayName = "TooltipAnchor";
}

export interface TooltipAnchorOptions<T extends As = "div">
  extends PopoverAnchorOptions<T> {
  /**
   * Object returned by the `useTooltipStore` hook.
   */
  store: TooltipStore;
  /**
   * Determines wether the tooltip anchor is described or labelled by the
   * tooltip. If `true`, the tooltip id will be set as the `aria-describedby`
   * attribute on the anchor element, and not as the `aria-labelledby`
   * attribute.
   * @default false
   * @example
   * ```jsx
   * const tooltip = useTooltipStore();
   * <TooltipAnchor store={tooltip} described>
   *   This is an element with a visible label.
   * </TooltipAnchor>
   * <Tooltip store={tooltip}>Description</Tooltip>
   * ```
   */
  described?: boolean;
}

export type TooltipAnchorProps<T extends As = "div"> = Props<
  TooltipAnchorOptions<T>
>;
