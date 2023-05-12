import { useEffect } from "react";
import type { FocusEvent } from "react";
import { isFalsyBooleanCallback } from "@ariakit/core/utils/misc";
import { createStore } from "@ariakit/core/utils/store";
import type { HovercardAnchorOptions } from "../hovercard/hovercard-anchor.js";
import { useHovercardAnchor } from "../hovercard/hovercard-anchor.js";
import { useEvent } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
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
    useEffect(() => {
      return store.sync(
        (state) => {
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
        },
        ["mounted", "skipTimeout"]
      );
    }, [store]);

    const onFocusVisibleProp = props.onFocusVisible;

    const onFocusVisible = useEvent((event: FocusEvent<HTMLDivElement>) => {
      onFocusVisibleProp?.(event);
      if (event.defaultPrevented) return;
      store.setAnchorElement(event.currentTarget);
      store.show();
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
      tabIndex: 0,
      "aria-labelledby": type === "label" ? contentId : undefined,
      "aria-describedby": type === "description" ? contentId : undefined,
      ...props,
      onFocusVisible,
      onBlur,
    };

    props = useHovercardAnchor({
      store,
      showOnHover: (event) => {
        if (isFalsyBooleanCallback(showOnHover, event)) return false;
        const { activeStore } = globalStore.getState();
        if (!activeStore) return true;
        // Show the tooltip immediately if the current tooltip is the active
        // tooltip instead of waiting for the showTimeout delay.
        store.show();
        return false;
      },
      ...props,
    });

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
  extends HovercardAnchorOptions<T> {
  /**
   * Object returned by the `useTooltipStore` hook.
   */
  store: TooltipStore;
}

export type TooltipAnchorProps<T extends As = "div"> = Props<
  TooltipAnchorOptions<T>
>;
