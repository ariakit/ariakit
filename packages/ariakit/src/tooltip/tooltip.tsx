import { HTMLAttributes, RefObject, useEffect, useState } from "react";
import { addGlobalEventListener } from "ariakit-utils/events";
import {
  useBooleanEventCallback,
  useForkRef,
  useSafeLayoutEffect,
  useWrapElement,
} from "ariakit-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, BooleanOrCallback, Props } from "ariakit-utils/types";
import {
  DisclosureContentOptions,
  useDisclosureContent,
} from "../disclosure/disclosure-content";
import { PortalOptions, usePortal } from "../portal";
import { TooltipContext } from "./__utils";
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
  ({
    state,
    portal = true,
    hideOnEscape = true,
    hideOnControl = false,
    wrapperProps,
    ...props
  }) => {
    const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
    const portalRef = useForkRef(setPortalNode, props.portalRef);
    const popoverRef = state.popoverRef as RefObject<HTMLDivElement>;

    // When the tooltip is rendered within a portal, we need to wait for the
    // portalNode to be created so we can update the tooltip position.
    useSafeLayoutEffect(() => {
      if (!portalNode) return;
      if (!state.mounted) return;
      state.render();
    }, [portalNode, state.mounted, state.render]);

    // Makes sure the wrapper element that's passed to popper has the same
    // z-index as the popover element so users only need to set the z-index
    // once.
    useSafeLayoutEffect(() => {
      const wrapper = popoverRef.current;
      const tooltip = state.contentElement;
      if (!wrapper) return;
      if (!tooltip) return;
      wrapper.style.zIndex = getComputedStyle(tooltip).zIndex;
    }, [popoverRef, state.contentElement]);

    const hideOnEscapeProp = useBooleanEventCallback(hideOnEscape);
    const hideOnControlProp = useBooleanEventCallback(hideOnControl);

    // Hide on Escape/Control
    useEffect(() => {
      if (!state.visible) return;
      return addGlobalEventListener("keydown", (event) => {
        if (event.defaultPrevented) return;
        const isEscape = event.key === "Escape" && hideOnEscapeProp(event);
        const isControl = event.key === "Control" && hideOnControlProp(event);
        if (isEscape || isControl) {
          state.hide();
        }
      });
    }, [state.visible, hideOnEscapeProp, hideOnControlProp, state.hide]);

    props = useWrapElement(
      props,
      (element) => (
        <div
          role="presentation"
          {...wrapperProps}
          // Avoid the wrapper from taking space when used within a flexbox
          // container with the gap property.
          style={{ position: "fixed", ...wrapperProps?.style }}
          ref={popoverRef}
        >
          {element}
        </div>
      ),
      [popoverRef, wrapperProps]
    );

    props = useWrapElement(
      props,
      (element) => (
        <TooltipContext.Provider value={state}>
          {element}
        </TooltipContext.Provider>
      ),
      [state]
    );

    props = {
      role: "tooltip",
      ...props,
    };

    props = useDisclosureContent({ state, ...props });
    props = usePortal({ portal, ...props, portalRef, preserveTabOrder: false });

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
  DisclosureContentOptions<T>,
  "state"
> &
  Omit<PortalOptions<T>, "preserveTabOrder"> & {
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
