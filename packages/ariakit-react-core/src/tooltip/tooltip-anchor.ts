import { useEffect, useRef } from "react";
import type { FocusEvent, MouseEvent } from "react";
import { invariant, isFalsyBooleanCallback } from "@ariakit/core/utils/misc";
import { createStore, sync } from "@ariakit/core/utils/store";
import type { HovercardAnchorOptions } from "../hovercard/hovercard-anchor.js";
import { useHovercardAnchor } from "../hovercard/hovercard-anchor.js";
import { useEvent } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useTooltipProviderContext } from "./tooltip-context.js";
import type { TooltipStore } from "./tooltip-store.js";

// Create a global store to keep track of the active tooltip store so we can
// show other tooltips without a delay when there's already an active tooltip.
const globalStore = createStore<{ activeStore: TooltipStore | null }>({
  activeStore: null,
});

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
  ({ store, showOnHover = true, ...props }) => {
    const context = useTooltipProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "TooltipAnchor must receive a `store` prop or be wrapped in a TooltipProvider component.",
    );

    // Imagine the scenario: the user hovers over an anchor, which shows a
    // tooltip, then presses escape to close the tooltip. We don't want to show
    // the tooltip again while the anchor is still hovered. So we keep this flag
    // that's set to true on mouse enter.
    const canShowOnHoverRef = useRef(false);

    useEffect(() => {
      return sync(store, ["mounted"], (state) => {
        if (state.mounted) return;
        canShowOnHoverRef.current = false;
      });
    }, [store]);

    useEffect(() => {
      return sync(store, ["mounted", "skipTimeout"], (state) => {
        if (!store) return;
        // If the current tooltip is open, we should immediately hide the
        // active one and set the current one as the active tooltip.
        if (state.mounted) {
          const { activeStore } = globalStore.getState();
          if (activeStore !== store) {
            activeStore?.hide();
          }
          return globalStore.setState("activeStore", store);
        }
        // Otherwise, if the current tooltip is closed, we should set a
        // timeout to hide the active tooltip in the global store. This is so
        // we can show other tooltips without a delay when there's already an
        // active tooltip (see the showOnHover method below).
        const id = setTimeout(() => {
          const { activeStore } = globalStore.getState();
          if (activeStore !== store) return;
          globalStore.setState("activeStore", null);
        }, state.skipTimeout);
        return () => clearTimeout(id);
      });
    }, [store]);

    const onMouseEnterProp = props.onMouseEnter;

    const onMouseEnter = useEvent((event: MouseEvent<HTMLDivElement>) => {
      onMouseEnterProp?.(event);
      canShowOnHoverRef.current = true;
    });

    const onFocusVisibleProp = props.onFocusVisible;

    const onFocusVisible = useEvent((event: FocusEvent<HTMLDivElement>) => {
      onFocusVisibleProp?.(event);
      if (event.defaultPrevented) return;
      store?.setAnchorElement(event.currentTarget);
      store?.show();
    });

    const onBlurProp = props.onBlur;

    const onBlur = useEvent((event: FocusEvent<HTMLDivElement>) => {
      onBlurProp?.(event);
      if (event.defaultPrevented) return;
      const { activeStore } = globalStore.getState();
      // If the current tooltip is the active tooltip and the anchor loses focus
      // (for example, if the anchor is a menu button, clicking on the menu
      // button will automatically focus on the menu), we don't want to show
      // subsequent tooltips without a delay. So we set the active tooltip to
      // null.
      if (activeStore === store) {
        globalStore.setState("activeStore", null);
      }
    });

    const type = store.useState("type");
    const contentId = store.useState((state) => state.contentElement?.id);

    props = {
      "aria-labelledby": type === "label" ? contentId : undefined,
      "aria-describedby": type === "description" ? contentId : undefined,
      ...props,
      onMouseEnter,
      onFocusVisible,
      onBlur,
    };

    props = useHovercardAnchor({
      store,
      showOnHover: (event) => {
        if (!canShowOnHoverRef.current) return false;
        if (isFalsyBooleanCallback(showOnHover, event)) return false;
        const { activeStore } = globalStore.getState();
        if (!activeStore) return true;
        // Show the tooltip immediately if the current tooltip is the active
        // tooltip instead of waiting for the showTimeout delay.
        store?.show();
        return false;
      },
      ...props,
    });

    return props;
  },
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
  extends HovercardAnchorOptions<T> {
  /**
   * Object returned by the `useTooltipStore` hook.
   */
  store?: TooltipStore;
}

export type TooltipAnchorProps<T extends As = "div"> = Props<
  TooltipAnchorOptions<T>
>;
