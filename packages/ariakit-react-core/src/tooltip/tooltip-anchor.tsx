import {
  chain,
  invariant,
  isFalsyBooleanCallback,
} from "@ariakit/core/utils/misc";
import { createStore, sync } from "@ariakit/core/utils/store";
import type { ElementType, FocusEvent, MouseEvent } from "react";
import { useEffect, useRef } from "react";
import type { HovercardAnchorOptions } from "../hovercard/hovercard-anchor.tsx";
import { useHovercardAnchor } from "../hovercard/hovercard-anchor.tsx";
import { useEvent } from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useTooltipProviderContext } from "./tooltip-context.tsx";
import type { TooltipStore } from "./tooltip-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

// Create a global store to keep track of the active tooltip store so we can
// show other tooltips without a delay when there's already an active tooltip.
const globalStore = createStore<{ activeStore: TooltipStore | null }>({
  activeStore: null,
});

function createRemoveStoreCallback(store: TooltipStore) {
  return () => {
    const { activeStore } = globalStore.getState();
    if (activeStore !== store) return;
    globalStore.setState("activeStore", null);
  };
}

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
export const useTooltipAnchor = createHook<TagName, TooltipAnchorOptions>(
  function useTooltipAnchor({ store, showOnHover = true, ...props }) {
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
      if (!store) return;
      return chain(
        // Immediately remove the current store from the global store when
        // the component unmounts. This is useful, for example, to avoid
        // showing tooltips immediately on serial tests.
        createRemoveStoreCallback(store),
        sync(store, ["mounted", "skipTimeout"], (state) => {
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
          const id = setTimeout(
            createRemoveStoreCallback(store),
            state.skipTimeout,
          );
          return () => clearTimeout(id);
        }),
      );
    }, [store]);

    const onMouseEnterProp = props.onMouseEnter;

    const onMouseEnter = useEvent((event: MouseEvent<HTMLType>) => {
      onMouseEnterProp?.(event);
      canShowOnHoverRef.current = true;
    });

    const onFocusVisibleProp = props.onFocusVisible;

    const onFocusVisible = useEvent((event: FocusEvent<HTMLType>) => {
      onFocusVisibleProp?.(event);
      if (event.defaultPrevented) return;
      store?.setAnchorElement(event.currentTarget);
      store?.show();
    });

    const onBlurProp = props.onBlur;

    const onBlur = useEvent((event: FocusEvent<HTMLType>) => {
      onBlurProp?.(event);
      if (event.defaultPrevented) return;
      const { activeStore } = globalStore.getState();
      // Sets canShowOnHover to false so moving the mouse over the anchor after
      // it loses focus (for example, clicking on a menu button) doesn't show
      // the tooltip until the mouse leaves and re-enters the anchor.
      canShowOnHoverRef.current = false;
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
      ...props,
      onMouseEnter,
      onFocusVisible,
      onBlur,
    };

    props = useHovercardAnchor<TagName>({
      store,
      showOnHover(event) {
        if (!canShowOnHoverRef.current) return false;
        if (isFalsyBooleanCallback(showOnHover, event)) return false;
        const { activeStore } = globalStore.getState();
        if (!activeStore) return true;
        // Show the tooltip immediately if there's an active tooltip instead of
        // waiting for the showTimeout delay.
        store?.show();
        return false;
      },
      ...props,
    });

    return props;
  },
);

/**
 * Renders a reference element for a
 * [`Tooltip`](https://ariakit.org/reference/tooltip), which is triggered by
 * focusing or hovering over the anchor.
 *
 * The tooltip is strictly for visual purposes. It's your responsibility to
 * ensure the anchor element has an accessible name. See [Tooltip anchors must
 * have accessible
 * names](https://ariakit.org/components/tooltip#tooltip-anchors-must-have-accessible-names)
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx {2}
 * <TooltipProvider>
 *   <TooltipAnchor>Anchor</TooltipAnchor>
 *   <Tooltip>Tooltip</Tooltip>
 * </TooltipProvider>
 * ```
 */
export const TooltipAnchor = forwardRef(function TooltipAnchor(
  props: TooltipAnchorProps,
) {
  const htmlProps = useTooltipAnchor(props);
  return createElement(TagName, htmlProps);
});

export interface TooltipAnchorOptions<T extends ElementType = TagName>
  extends HovercardAnchorOptions<T> {
  /**
   * Object returned by the
   * [`useTooltipStore`](https://ariakit.org/reference/use-tooltip-store) hook.
   * If not provided, the closest
   * [`TooltipProvider`](https://ariakit.org/reference/tooltip-provider)
   * component's context will be used.
   */
  store?: TooltipStore;
}

export type TooltipAnchorProps<T extends ElementType = TagName> = Props<
  T,
  TooltipAnchorOptions<T>
>;
