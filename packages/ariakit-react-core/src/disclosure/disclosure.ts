import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { ButtonOptions } from "../button/button.js";
import { useButton } from "../button/button.js";
import {
  useBooleanEvent,
  useEvent,
  useMergeRefs,
  useMetadataProps,
} from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useDisclosureProviderContext } from "./disclosure-context.js";
import type { DisclosureStore } from "./disclosure-store.js";

const symbol = Symbol("disclosure");

/**
 * Returns props to create a `Disclosure` component.
 * @see https://ariakit.org/components/disclosure
 * @example
 * ```jsx
 * const store = useDisclosureStore();
 * const props = useDisclosure({ store });
 * <Role {...props}>Disclosure</Role>
 * <DisclosureContent store={store}>Content</DisclosureContent>
 * ```
 */
export const useDisclosure = createHook<DisclosureOptions>(
  ({ store, toggleOnClick = true, ...props }) => {
    const context = useDisclosureProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "Disclosure must receive a `store` prop or be wrapped in a DisclosureProvider component.",
    );

    const ref = useRef<HTMLButtonElement>(null);
    const [expanded, setExpanded] = useState(false);
    const disclosureElement = store.useState("disclosureElement");
    const open = store.useState("open");

    // Assigns the disclosure element whenever it's undefined or disconnected
    // from the DOM. If the current element is the disclosure element, it will
    // get the `aria-expanded` attribute set to `true` when the disclosure
    // content is open.
    useEffect(() => {
      let isCurrentDisclosure = disclosureElement === ref.current;
      if (!disclosureElement?.isConnected) {
        store?.setDisclosureElement(ref.current);
        isCurrentDisclosure = true;
      }
      setExpanded(open && isCurrentDisclosure);
    }, [store, disclosureElement, open]);

    const onMouseDownProp = props.onMouseDown;

    const onMouseDown = useEvent((event: MouseEvent<HTMLButtonElement>) => {
      store?.setDisclosureElement(event.currentTarget);
      onMouseDownProp?.(event);
    });

    const onClickProp = props.onClick;
    const toggleOnClickProp = useBooleanEvent(toggleOnClick);
    const [isDuplicate, metadataProps] = useMetadataProps(props, symbol, true);

    const onClick = useEvent((event: MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      if (isDuplicate) return;
      if (!toggleOnClickProp(event)) return;
      store?.setDisclosureElement(event.currentTarget);
      store?.toggle();
    });

    const contentElement = store.useState("contentElement");

    props = {
      "aria-expanded": expanded,
      "aria-controls": contentElement?.id,
      ...metadataProps,
      ...props,
      ref: useMergeRefs(ref, props.ref),
      onMouseDown,
      onClick,
    };

    props = useButton(props);

    return props;
  },
);

/**
 * Renders an element that controls the visibility of a disclosure content
 * element.
 * @see https://ariakit.org/components/disclosure
 * @example
 * ```jsx
 * <DisclosureProvider>
 *   <Disclosure>Disclosure</Disclosure>
 *   <DisclosureContent>Content</DisclosureContent>
 * </DisclosureProvider>
 * ```
 */
export const Disclosure = createComponent<DisclosureOptions>((props) => {
  const htmlProps = useDisclosure(props);
  return createElement("button", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  Disclosure.displayName = "Disclosure";
}

export interface DisclosureOptions<T extends As = "button">
  extends ButtonOptions<T> {
  /**
   * Object returned by the
   * [`useDisclosureStore`](https://ariakit.org/reference/use-disclosure-store)
   * hook. If not provided, the closest
   * [`DisclosureProvider`](https://ariakit.org/reference/disclosure-provider)
   * component's context will be used.
   */
  store?: DisclosureStore;
  /**
   * Determines whether
   * [`toggle`](https://ariakit.org/reference/use-disclosure-store#toggle) will
   * be called on click. This is useful if you want to handle the toggle logic
   * yourself.
   * @default true
   */
  toggleOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
}

export type DisclosureProps<T extends As = "button"> = Props<
  DisclosureOptions<T>
>;
