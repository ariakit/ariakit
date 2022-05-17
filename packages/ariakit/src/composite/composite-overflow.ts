import { CSSProperties, FocusEvent } from "react";
import { useEvent } from "ariakit-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { PopoverOptions, usePopover } from "../popover/popover";
import { CompositeOverflowState } from "./composite-overflow-state";

// Hiding the popover with `display: none` would prevent the hidden items to
// be focused, so we just make it transparent and disable pointer events.
const hiddenStyle: CSSProperties = {
  opacity: 0,
  pointerEvents: "none",
};

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a popover that will contain the overflow items in a
 * composite collection.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const state = useCompositeOverflowState();
 * const props = useCompositeOverflow({ state });
 * <Role {...props}>
 *   <CompositeItem>Item 3</CompositeItem>
 *   <CompositeItem>Item 4</CompositeItem>
 * </Role>
 * ```
 */
export const useCompositeOverflow = createHook<CompositeOverflowOptions>(
  ({
    state,
    backdropProps: backdropPropsProp,
    wrapperProps: wrapperPropsProp,
    portal = false,
    ...props
  }) => {
    const onFocusProp = props.onFocus;

    const onFocus = useEvent((event: FocusEvent<HTMLDivElement>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;
      state.show();
    });

    const getStyle = (styleProp?: CSSProperties) =>
      state.mounted ? styleProp : { ...hiddenStyle, ...styleProp };

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
      state,
      backdropProps,
      wrapperProps,
      portal,
      ...props,
    });

    return props;
  }
);

/**
 * A component that renders a popover that will contain the overflow items in a
 * composite collection.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const composite = useCompositeState();
 * const overflow = useCompositeOverflowState();
 * <Composite state={composite}>
 *   <CompositeItem>Item 1</CompositeItem>
 *   <CompositeItem>Item 2</CompositeItem>
 *   <CompositeOverflowDisclosure state={overflow}>
 *     +2 items
 *   </CompositeOverflowDisclosure>
 *   <CompositeOverflow state={overflow}>
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
  }
);

export type CompositeOverflowOptions<T extends As = "div"> = Omit<
  PopoverOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useCompositeOverflowState` hook.
   */
  state: CompositeOverflowState;
};

export type CompositeOverflowProps<T extends As = "div"> = Props<
  CompositeOverflowOptions<T>
>;
