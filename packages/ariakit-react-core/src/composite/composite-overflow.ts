import type { CSSProperties, FocusEvent } from "react";
import type { PopoverOptions } from "../popover/popover.js";
import { usePopover } from "../popover/popover.js";
import { useEvent } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { CompositeOverflowStore } from "./composite-overflow-store.js";

// Hiding the popover with `display: none` would prevent the hidden items to be
// focused, so we just make it transparent and disable pointer events.
const hiddenStyle: CSSProperties = {
  opacity: 0,
  pointerEvents: "none",
};

/**
 * Returns props to create a `CompositeOverflow` component.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const store = useCompositeOverflowStore();
 * const props = useCompositeOverflow({ store });
 * <Role {...props}>
 *   <CompositeItem>Item 3</CompositeItem>
 *   <CompositeItem>Item 4</CompositeItem>
 * </Role>
 * ```
 */
export const useCompositeOverflow = createHook<CompositeOverflowOptions>(
  ({
    store,
    backdropProps: backdropPropsProp,
    wrapperProps: wrapperPropsProp,
    portal = false,
    ...props
  }) => {
    const onFocusProp = props.onFocus;

    const onFocus = useEvent((event: FocusEvent<HTMLDivElement>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;
      store.show();
    });

    const mounted = store.useState("mounted");

    const getStyle = (styleProp?: CSSProperties) =>
      mounted ? styleProp : { ...hiddenStyle, ...styleProp };

    const backdropProps = {
      hidden: false,
      ...backdropPropsProp,
      style: getStyle(backdropPropsProp?.style),
    };

    const wrapperProps = {
      ...wrapperPropsProp,
      style: getStyle(wrapperPropsProp?.style),
    };

    props = {
      role: "presentation",
      hidden: false,
      focusable: false,
      ...props,
      onFocus,
    };

    props = usePopover({
      store,
      backdropProps,
      wrapperProps,
      portal,
      ...props,
    });

    return props;
  },
);

/**
 * Renders a popover that will contain the overflow items in a composite
 * collection.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const composite = useCompositeStore();
 * const overflow = useCompositeOverflowStore();
 * <Composite store={composite}>
 *   <CompositeItem>Item 1</CompositeItem>
 *   <CompositeItem>Item 2</CompositeItem>
 *   <CompositeOverflowDisclosure store={overflow}>
 *     +2 items
 *   </CompositeOverflowDisclosure>
 *   <CompositeOverflow store={overflow}>
 *     <CompositeItem>Item 3</CompositeItem>
 *     <CompositeItem>Item 4</CompositeItem>
 *   </CompositeOverflow>
 * </Composite>
 * ```
 */
export const CompositeOverflow = createComponent<CompositeOverflowOptions>(
  (props) => {
    const htmlProps = useCompositeOverflow(props);
    return createElement("div", htmlProps);
  },
);

if (process.env.NODE_ENV !== "production") {
  CompositeOverflow.displayName = "CompositeOverflow";
}

export interface CompositeOverflowOptions<T extends As = "div">
  extends PopoverOptions<T> {
  /**
   * Object returned by the `useCompositeOverflowStore` hook.
   */
  store: CompositeOverflowStore;
}

export type CompositeOverflowProps<T extends As = "div"> = Props<
  CompositeOverflowOptions<T>
>;
