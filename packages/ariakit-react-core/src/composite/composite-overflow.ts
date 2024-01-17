import type { CSSProperties, ElementType, FocusEvent } from "react";
import type { PopoverOptions } from "../popover/popover.js";
import { usePopover } from "../popover/popover.js";
import { useEvent } from "../utils/hooks.js";
import { createElement, createHook, forwardRef } from "../utils/system.js";
import type { Props } from "../utils/types.js";
import type { CompositeOverflowStore } from "./composite-overflow-store.js";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

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
export const useCompositeOverflow = createHook<
  TagName,
  CompositeOverflowOptions
>(function useCompositeOverflow({
  store,
  wrapperProps: wrapperPropsProp,
  portal = false,
  ...props
}) {
  const onFocusProp = props.onFocus;

  const onFocus = useEvent((event: FocusEvent<HTMLType>) => {
    onFocusProp?.(event);
    if (event.defaultPrevented) return;
    store.show();
  });

  const mounted = store.useState("mounted");

  const getStyle = (styleProp?: CSSProperties) =>
    mounted ? styleProp : { ...hiddenStyle, ...styleProp };

  const wrapperProps = {
    ...wrapperPropsProp,
    style: getStyle(wrapperPropsProp?.style),
  };

  props = {
    role: "presentation",
    ...props,
    onFocus,
  };

  props = usePopover({
    store,
    focusable: false,
    alwaysVisible: true,
    wrapperProps,
    portal,
    ...props,
  });

  return props;
});

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
export const CompositeOverflow = forwardRef(function CompositeOverflow(
  props: CompositeOverflowProps,
) {
  const htmlProps = useCompositeOverflow(props);
  return createElement(TagName, htmlProps);
});

export interface CompositeOverflowOptions<T extends ElementType = TagName>
  extends PopoverOptions<T> {
  /**
   * Object returned by the `useCompositeOverflowStore` hook.
   */
  store: CompositeOverflowStore;
}

export type CompositeOverflowProps<T extends ElementType = TagName> = Props<
  T,
  CompositeOverflowOptions<T>
>;
