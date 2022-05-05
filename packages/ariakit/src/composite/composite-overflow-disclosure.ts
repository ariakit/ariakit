import { FocusEvent, useCallback, useRef, useState } from "react";
import { useEvent, useForkRef, useSafeLayoutEffect } from "ariakit-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  PopoverDisclosureOptions,
  usePopoverDisclosure,
} from "../popover/popover-disclosure";
import { CompositeItemOptions, useCompositeItem } from "./composite-item";
import { CompositeOverflowState } from "./composite-overflow-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a disclosure button for the `CompositeOverflow`
 * component. This hook should be used in a component that's wrapped with
 * a composite component.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * // This component should be wrapped with Composite
 * const props = useCompositeOverflowDisclosure();
 * <Role {...props}>+2 items</Role>
 * ```
 */
export const useCompositeOverflowDisclosure =
  createHook<CompositeOverflowDisclosureOptions>(({ state, ...props }) => {
    const ref = useRef<HTMLButtonElement>(null);
    const [shouldRegisterItem, setShouldRegisterItem] = useState(false);

    useSafeLayoutEffect(() => {
      state.disclosureRef.current = ref.current;
    });

    const onFocusProp = useEvent(props.onFocus);

    const onFocus = useCallback(
      (event: FocusEvent<HTMLButtonElement>) => {
        onFocusProp(event);
        if (event.defaultPrevented) return;
        setShouldRegisterItem(true);
      },
      [onFocusProp]
    );

    const onBlurProp = useEvent(props.onBlur);

    const onBlur = useCallback(
      (event: FocusEvent<HTMLButtonElement>) => {
        onBlurProp(event);
        if (event.defaultPrevented) return;
        setShouldRegisterItem(false);
      },
      [onBlurProp]
    );

    props = {
      "aria-hidden": !shouldRegisterItem,
      ...props,
      ref: useForkRef(props.ref, ref),
      onFocus,
      onBlur,
    };

    props = useCompositeItem({ ...props, shouldRegisterItem });
    props = usePopoverDisclosure({ state, ...props });

    return props;
  });

/**
 * A component that renders a disclosure button for the `CompositeOverflow`
 * component. This component should be wrapped with a composite component.
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
export const CompositeOverflowDisclosure =
  createComponent<CompositeOverflowDisclosureOptions>((props) => {
    const htmlProps = useCompositeOverflowDisclosure(props);
    return createElement("button", htmlProps);
  });

export type CompositeOverflowDisclosureOptions<T extends As = "button"> = Omit<
  PopoverDisclosureOptions<T>,
  "state"
> &
  Omit<CompositeItemOptions<T>, "state"> & {
    /**
     * Object returned by the `useCompositeOverflowState` hook.
     */
    state: CompositeOverflowState;
  };

export type CompositeOverflowDisclosureProps<T extends As = "button"> = Props<
  CompositeOverflowDisclosureOptions<T>
>;
