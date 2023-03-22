import { FocusEvent, useEffect, useRef, useState } from "react";
import {
  PopoverDisclosureOptions,
  usePopoverDisclosure,
} from "../popover/popover-disclosure.jsx";
import { useEvent, useForkRef } from "../utils/hooks.js";
import {
  createComponent,
  createElement,
  createHook,
} from "../utils/system.jsx";
import { As, Props } from "../utils/types.js";
import { CompositeItemOptions, useCompositeItem } from "./composite-item.jsx";
import { CompositeOverflowStore } from "./composite-overflow-store.js";

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
export const useCompositeOverflowDisclosure =
  createHook<CompositeOverflowDisclosureOptions>(({ store, ...props }) => {
    const ref = useRef<HTMLButtonElement>(null);
    const [shouldRegisterItem, setShouldRegisterItem] = useState(false);

    useEffect(() => {
      return store.sync(() => {
        store.setDisclosureElement(ref.current);
      }, ["disclosureElement"]);
    }, [store]);

    const onFocusProp = props.onFocus;

    const onFocus = useEvent((event: FocusEvent<HTMLButtonElement>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;
      setShouldRegisterItem(true);
    });

    const onBlurProp = props.onBlur;

    const onBlur = useEvent((event: FocusEvent<HTMLButtonElement>) => {
      onBlurProp?.(event);
      if (event.defaultPrevented) return;
      setShouldRegisterItem(false);
    });

    props = {
      "aria-hidden": !shouldRegisterItem,
      ...props,
      ref: useForkRef(props.ref, ref),
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
export const CompositeOverflowDisclosure =
  createComponent<CompositeOverflowDisclosureOptions>((props) => {
    const htmlProps = useCompositeOverflowDisclosure(props);
    return createElement("button", htmlProps);
  });

if (process.env.NODE_ENV !== "production") {
  CompositeOverflowDisclosure.displayName = "CompositeOverflowDisclosure";
}

export interface CompositeOverflowDisclosureOptions<T extends As = "button">
  extends Omit<CompositeItemOptions<T>, "store">,
    PopoverDisclosureOptions<T> {
  /**
   * Object returned by the `useCompositeOverflowStore` hook.
   */
  store: CompositeOverflowStore;
}

export type CompositeOverflowDisclosureProps<T extends As = "button"> = Props<
  CompositeOverflowDisclosureOptions<T>
>;
