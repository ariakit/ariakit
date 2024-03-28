import type { ElementType, FocusEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { sync } from "@ariakit/core/utils/store";
import type { PopoverDisclosureOptions } from "../popover/popover-disclosure.tsx";
import { usePopoverDisclosure } from "../popover/popover-disclosure.tsx";
import { useEvent, useMergeRefs } from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import type { CompositeItemOptions } from "./composite-item.ts";
import { useCompositeItem } from "./composite-item.tsx";
import type { CompositeOverflowStore } from "./composite-overflow-store.ts";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `CompositeOverflowDisclosure` component. This hook
 * should be used in a component that's wrapped with a composite component.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * // This component should be wrapped with Composite
 * const props = useCompositeOverflowDisclosure();
 * <Role {...props}>+2 items</Role>
 * ```
 */
export const useCompositeOverflowDisclosure = createHook<
  TagName,
  CompositeOverflowDisclosureOptions
>(function useCompositeOverflowDisclosure({ store, ...props }) {
  const ref = useRef<HTMLType>(null);
  const [shouldRegisterItem, setShouldRegisterItem] = useState(false);

  useEffect(() => {
    return sync(store, ["disclosureElement"], () => {
      store.setDisclosureElement(ref.current);
    });
  }, [store]);

  const onFocusProp = props.onFocus;

  const onFocus = useEvent((event: FocusEvent<HTMLType>) => {
    onFocusProp?.(event);
    if (event.defaultPrevented) return;
    setShouldRegisterItem(true);
  });

  const onBlurProp = props.onBlur;

  const onBlur = useEvent((event: FocusEvent<HTMLType>) => {
    onBlurProp?.(event);
    if (event.defaultPrevented) return;
    setShouldRegisterItem(false);
  });

  props = {
    "aria-hidden": !shouldRegisterItem,
    ...props,
    ref: useMergeRefs(props.ref, ref),
    onFocus,
    onBlur,
  };

  props = useCompositeItem({ ...props, shouldRegisterItem });
  props = usePopoverDisclosure({ store, ...props });

  return props;
});

/**
 * Renders a disclosure button for the `CompositeOverflow` component. This
 * component should be wrapped with a composite component.
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
export const CompositeOverflowDisclosure = forwardRef(
  function CompositeOverflowDisclosure(
    props: CompositeOverflowDisclosureProps,
  ) {
    const htmlProps = useCompositeOverflowDisclosure(props);
    return createElement(TagName, htmlProps);
  },
);

export interface CompositeOverflowDisclosureOptions<
  T extends ElementType = TagName,
> extends Omit<CompositeItemOptions<T>, "store">,
    PopoverDisclosureOptions<T> {
  /**
   * Object returned by the `useCompositeOverflowStore` hook.
   */
  store: CompositeOverflowStore;
}

export type CompositeOverflowDisclosureProps<T extends ElementType = TagName> =
  Props<T, CompositeOverflowDisclosureOptions<T>>;
