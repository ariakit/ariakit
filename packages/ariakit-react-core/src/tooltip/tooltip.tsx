import type { HTMLAttributes } from "react";
import { useEffect } from "react";
import { addGlobalEventListener } from "@ariakit/core/utils/events";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { DisclosureContentOptions } from "../disclosure/disclosure-content.js";
import { useDisclosureContent } from "../disclosure/disclosure-content.js";
import type { PortalOptions } from "../portal/portal.js";
import { usePortal } from "../portal/portal.js";
import {
  useBooleanEvent,
  useSafeLayoutEffect,
  useWrapElement,
} from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { TooltipContext } from "./tooltip-context.js";
import type { TooltipStore } from "./tooltip-store.js";

/**
 * Returns props to create a `Tooltip` component.
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx
 * const store = useToolTipStore();
 * const props = useTooltip({ store });
 * <TooltipAnchor store={store}>Anchor</TooltipAnchor>
 * <Role {...props}>Tooltip</Role>
 * ```
 */
export const useTooltip = createHook<TooltipOptions>(
  ({
    store,
    portal = true,
    hideOnEscape = true,
    hideOnControl = false,
    wrapperProps,
    ...props
  }) => {
    const popoverElement = store.useState("popoverElement");
    const contentElement = store.useState("contentElement");

    // Makes sure the wrapper element that's passed to popper has the same
    // z-index as the popover element so users only need to set the z-index
    // once.
    useSafeLayoutEffect(() => {
      const wrapper = popoverElement;
      const popover = contentElement;
      if (!wrapper) return;
      if (!popover) return;
      wrapper.style.zIndex = getComputedStyle(popover).zIndex;
    }, [popoverElement, contentElement]);

    const hideOnEscapeProp = useBooleanEvent(hideOnEscape);
    const hideOnControlProp = useBooleanEvent(hideOnControl);

    const open = store.useState("open");

    // Hide on Escape/Control. Popover already handles this, but only when the
    // dialog, the backdrop or the disclosure elements are focused. Since the
    // tooltip, by default, does not receive focus when it's shown, we need to
    // handle this globally here.
    useEffect(() => {
      if (!open) return;
      return addGlobalEventListener("keydown", (event) => {
        if (event.defaultPrevented) return;
        const isEscape = event.key === "Escape" && hideOnEscapeProp(event);
        const isControl = event.key === "Control" && hideOnControlProp(event);
        if (isEscape || isControl) {
          store.hide();
        }
      });
    }, [store, open, hideOnEscapeProp, hideOnControlProp]);

    const position = store.useState((state) =>
      state.fixed ? "fixed" : "absolute"
    );

    // Wrap our element in a div that will be used to position the popover.
    // This way the user doesn't need to override the popper's position to
    // create animations.
    props = useWrapElement(
      props,
      (element) => (
        <div
          role="presentation"
          {...wrapperProps}
          style={{
            position,
            top: 0,
            left: 0,
            ...wrapperProps?.style,
          }}
          ref={store.setPopoverElement}
        >
          {element}
        </div>
      ),
      [store, position, wrapperProps]
    );

    props = useWrapElement(
      props,
      (element) => (
        <TooltipContext.Provider value={store}>
          {element}
        </TooltipContext.Provider>
      ),
      [store]
    );

    props = {
      role: "tooltip",
      ...props,
    };

    props = useDisclosureContent({ store, ...props });
    props = usePortal({ portal, ...props, preserveTabOrder: false });

    return props;
  }
);

/**
 * Renders a tooltip element.
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx
 * const tooltip = useTooltipStore();
 * <TooltipAnchor store={tooltip}>Anchor</TooltipAnchor>
 * <Tooltip store={tooltip}>Tooltip</Tooltip>
 * ```
 */
export const Tooltip = createComponent<TooltipOptions>((props) => {
  const htmlProps = useTooltip(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  Tooltip.displayName = "Tooltip";
}

export interface TooltipOptions<T extends As = "div">
  extends DisclosureContentOptions<T>,
    Omit<PortalOptions<T>, "preserveTabOrder"> {
  /**
   * Object returned by the `useTooltipStore` hook.
   */
  store: TooltipStore;
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
   * Props that will be passed to the popover wrapper element. This element
   * will be used to position the popover.
   */
  wrapperProps?: HTMLAttributes<HTMLDivElement>;
}

export type TooltipProps<T extends As = "div"> = Props<TooltipOptions<T>>;
